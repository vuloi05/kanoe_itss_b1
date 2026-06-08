using backend.DTOs.Matching;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class MatchingService : IMatchingService
{
    private const int ConnectionCost = 100;
    private const int PartnerShare  = 70;
    private const int PlatformFee   = 30;

    private readonly VietImmerseDbContext _context;
    private readonly ILogger<MatchingService> _logger;

    public MatchingService(VietImmerseDbContext context, ILogger<MatchingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ConnectResponse> ProcessMatchingTransactionAsync(Guid learnerId, Guid partnerId)
    {
        if (learnerId == partnerId)
            throw new ArgumentException("Cannot connect with yourself.");

        // Wrap the entire flow in a DB transaction for atomicity
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Lock the learner row with FOR UPDATE to prevent race conditions
            var learner = await _context.Users
                .FromSqlRaw("SELECT * FROM users WHERE user_id = {0} FOR UPDATE", learnerId)
                .FirstOrDefaultAsync()
                ?? throw new ArgumentException("Learner not found.");

            if (learner.Role != "learner")
                throw new InvalidOperationException("Only learners can initiate paid connections.");

            // Validate partner exists
            var partner = await _context.Users
                .FromSqlRaw("SELECT * FROM users WHERE user_id = {0} FOR UPDATE", partnerId)
                .FirstOrDefaultAsync()
                ?? throw new ArgumentException("Partner not found.");

            if (partner.Role != "partner")
                throw new InvalidOperationException("Target user is not a partner.");

            // Check for existing conversation — skip payment if already connected
            var existingConversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.LearnerId == learnerId && c.PartnerId == partnerId);

            if (existingConversation != null)
            {
                await transaction.CommitAsync();
                return new ConnectResponse
                {
                    ConversationId = existingConversation.ConversationId,
                    IsNew = false,
                    RemainingBalance = learner.TokenBalance,
                    AmountCharged = 0
                };
            }

            // Check for duplicate completed transaction (idempotency guard)
            var existingTransaction = await _context.TokenTransactions
                .AnyAsync(t => t.LearnerId == learnerId && t.PartnerId == partnerId && t.Status == "completed");

            if (existingTransaction)
                throw new InvalidOperationException("A connection transaction already exists for this pair.");

            // Validate sufficient balance
            if (learner.TokenBalance < ConnectionCost)
                throw new InvalidOperationException("Insufficient token balance.");

            // Deduct from learner, credit to partner
            learner.TokenBalance -= ConnectionCost;
            partner.TokenBalance += PartnerShare;

            // Create conversation
            var conversation = new Conversation
            {
                ConversationId = Guid.NewGuid(),
                LearnerId = learnerId,
                PartnerId = partnerId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Conversations.Add(conversation);

            // Record the transaction for audit trail
            var tokenTx = new TokenTransaction
            {
                Id = Guid.NewGuid(),
                LearnerId = learnerId,
                PartnerId = partnerId,
                AmountPaid = ConnectionCost,
                PartnerReceived = PartnerShare,
                PlatformFee = PlatformFee,
                ConversationId = conversation.ConversationId,
                Status = "completed",
                CreatedAt = DateTime.UtcNow
            };
            _context.TokenTransactions.Add(tokenTx);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Token transaction completed: Learner {LearnerId} → Partner {PartnerId}, " +
                "Amount: {Amount}, Partner received: {PartnerShare}, Conv: {ConvId}",
                learnerId, partnerId, ConnectionCost, PartnerShare, conversation.ConversationId);

            return new ConnectResponse
            {
                ConversationId = conversation.ConversationId,
                IsNew = true,
                RemainingBalance = learner.TokenBalance,
                AmountCharged = ConnectionCost
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<int> GetTokenBalanceAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new ArgumentException("User not found.");
        return user.TokenBalance;
    }

    public async Task<IEnumerable<TransactionHistoryDto>> GetTransactionHistoryAsync(Guid userId)
    {
        // Single query: fetch all transactions where user is either learner or partner
        var transactions = await _context.TokenTransactions
            .AsNoTracking()
            .Include(t => t.Learner)
            .Include(t => t.Partner)
            .Where(t => t.LearnerId == userId || t.PartnerId == userId)
            .Where(t => t.Status == "completed")
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return transactions.Select(t =>
        {
            var isLearner = t.LearnerId == userId;
            return new TransactionHistoryDto
            {
                Id = t.Id,
                Type = isLearner ? "debit" : "credit",
                Amount = isLearner ? t.AmountPaid : t.PartnerReceived,
                CounterpartyName = isLearner ? t.Partner.DisplayName : t.Learner.DisplayName,
                CounterpartyAvatarUrl = isLearner ? t.Partner.AvatarUrl : t.Learner.AvatarUrl,
                CreatedAt = t.CreatedAt
            };
        });
    }
}
