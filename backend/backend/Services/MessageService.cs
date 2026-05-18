using backend.DTOs.Message;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Supabase;

namespace backend.Services;

public class MessageService : IMessageService
{
    private readonly VietImmerseDbContext _context;
    private readonly ILogger<MessageService> _logger;
    private readonly ITranslationService _translationService;
    private readonly string _supabaseUrl;
    private readonly string _supabaseKey;

    public MessageService(
        VietImmerseDbContext context, 
        ILogger<MessageService> logger, 
        IConfiguration configuration,
        ITranslationService translationService)
    {
        _context = context;
        _logger = logger;
        _translationService = translationService;
        _supabaseUrl = Environment.GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL") ?? configuration["Supabase:Url"] ?? "";
        _supabaseKey = Environment.GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? configuration["Supabase:Key"] ?? "";
    }

    public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId)
    {
        var conversations = await _context.Conversations
            .Include(c => c.Partner)
            .Include(c => c.Learner)
            .Where(c => c.PartnerId == userId || c.LearnerId == userId)
            .Select(c => new
            {
                c.ConversationId,
                c.PartnerId,
                c.LearnerId,
                PartnerName = c.Partner.DisplayName,
                LearnerName = c.Learner.DisplayName,
                CreatedAt = c.CreatedAt,
                LastMessage = _context.Messages
                    .Where(m => m.ConversationId == c.ConversationId)
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefault(),
                UnreadCount = _context.Messages
                    .Count(m => m.ConversationId == c.ConversationId && m.SenderId != userId && m.IsRead == false)
            })
            .ToListAsync();

        return conversations.Select(c => new ConversationDto
        {
            ConversationId = c.ConversationId,
            PartnerId = (Guid)c.PartnerId!,
            LearnerId = (Guid)c.LearnerId!,
            PartnerName = c.PartnerName,
            LearnerName = c.LearnerName,
            LastMessage = c.LastMessage?.Content,
            LastMessageTime = c.LastMessage?.SentAt,
            UnreadCount = c.UnreadCount,
            CreatedAt = c.CreatedAt
        }).OrderByDescending(c => c.LastMessageTime ?? c.CreatedAt);
    }

    public async Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid conversationId, int page, int pageSize)
    {
        return await _context.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MessageDto
            {
                MessageId = m.MessageId,
                ConversationId = (Guid)m.ConversationId!,
                SenderId = (Guid)m.SenderId!,
                Content = m.Content ?? string.Empty,
                ContentTranslated = m.ContentTranslated,
                IsRead = m.IsRead ?? false,
                SentAt = m.SentAt
            })
            .ToListAsync();
    }

    public async Task<MessageDto> SendMessageAsync(Guid senderId, Guid conversationId, string text)
    {
        var conversation = await _context.Conversations.FindAsync(conversationId);
        if (conversation == null)
            throw new Exception("Conversation not found");

        if (conversation.PartnerId != senderId && conversation.LearnerId != senderId)
            throw new Exception("User is not part of this conversation");

        // Perform translation (null if fails, per spec)
        var translatedText = await _translationService.TranslateAsync(text);

        var message = new backend.Models.Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Content = text,
            ContentTranslated = translatedText,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var messageDto = new MessageDto
        {
            MessageId = message.MessageId,
            ConversationId = (Guid)message.ConversationId!,
            SenderId = (Guid)message.SenderId!,
            Content = message.Content,
            ContentTranslated = message.ContentTranslated,
            IsRead = (bool)message.IsRead!,
            SentAt = (DateTime)message.SentAt!
        };

        // Broadcast to Supabase Realtime channel using HTTP API
        if (!string.IsNullOrEmpty(_supabaseUrl) && !string.IsNullOrEmpty(_supabaseKey))
        {
            try
            {
                var channelName = $"conversation-{conversationId}";
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("apikey", _supabaseKey);
                
                var payload = new
                {
                    messages = new[]
                    {
                        new
                        {
                            topic = channelName,
                            @event = "new_message",
                            payload = new { message = messageDto }
                        }
                    }
                };

                var url = $"{_supabaseUrl.TrimEnd('/')}/realtime/v1/api/broadcast";
                await client.PostAsJsonAsync(url, payload);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to broadcast message to Supabase Realtime.");
            }
        }

        return messageDto;
    }

    public async Task MarkAsReadAsync(Guid conversationId, Guid userId)
    {
        var messages = await _context.Messages
            .Where(m => m.ConversationId == conversationId && m.SenderId != userId && m.IsRead == false)
            .ToListAsync();

        foreach (var msg in messages)
        {
            msg.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }
}
