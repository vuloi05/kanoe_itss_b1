using backend.DTOs.Matching;

namespace backend.Services;

public interface IMatchingService
{
    /// <summary>
    /// Atomically processes a token-based connection between a learner and a partner.
    /// Deducts tokens from learner, credits partner, creates conversation, and logs the transaction.
    /// </summary>
    Task<ConnectResponse> ProcessMatchingTransactionAsync(Guid learnerId, Guid partnerId);

    /// <summary>
    /// Returns the current token balance for a user.
    /// </summary>
    Task<int> GetTokenBalanceAsync(Guid userId);

    /// <summary>
    /// Returns the transaction history for a user (as learner or partner), newest first.
    /// </summary>
    Task<IEnumerable<TransactionHistoryDto>> GetTransactionHistoryAsync(Guid userId);
}
