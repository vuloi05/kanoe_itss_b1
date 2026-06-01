using backend.DTOs.Message;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class MessageService : IMessageService
{
    private readonly VietImmerseDbContext _context;
    private readonly ILogger<MessageService> _logger;
    private readonly ITranslationService _translationService;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessageService(
        VietImmerseDbContext context, 
        ILogger<MessageService> logger, 
        ITranslationService translationService,
        IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _translationService = translationService;
        _hubContext = hubContext;
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
                PartnerAvatarUrl = c.Partner.AvatarUrl,
                LearnerAvatarUrl = c.Learner.AvatarUrl,
                CreatedAt = c.CreatedAt,
                LastMessage = _context.Messages
                    .Where(m => m.ConversationId == c.ConversationId)
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefault(),
                UnreadCount = _context.Messages
                    .Count(m => m.ConversationId == c.ConversationId && m.SenderId != userId && m.IsRead == false)
            })
            .ToListAsync();

        // Determine which side the current user is on and get the other person's avatar
        return conversations.Select(c => new ConversationDto
        {
            ConversationId = c.ConversationId,
            PartnerId = (Guid)c.PartnerId!,
            LearnerId = (Guid)c.LearnerId!,
            PartnerName = c.PartnerName,
            LearnerName = c.LearnerName,
            PartnerAvatarUrl = c.PartnerId == userId
                ? c.LearnerAvatarUrl
                : c.PartnerAvatarUrl,
            LastMessage = string.IsNullOrEmpty(c.LastMessage?.Content)
                ? c.LastMessage?.MessageType switch
                {
                    "LESSON_REQUEST" => "Yêu cầu học thử",
                    "BOOKING_CONFIRMED" => "Đã xác nhận lịch",
                    "BOOKING_DECLINED" => "Đã từ chối lịch",
                    "BOOKING_CANCELLED" => "Đã hủy lịch",
                    _ => null
                }
                : c.LastMessage?.Content,
            LastMessageType = c.LastMessage?.MessageType,
            LastMessageTime = c.LastMessage?.SentAt,
            UnreadCount = c.UnreadCount,
            CreatedAt = c.CreatedAt
        }).OrderByDescending(c => c.LastMessageTime ?? c.CreatedAt);
    }

    public async Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid conversationId, int page, int pageSize)
    {
        var hanoiTz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        // Materialize first so timezone conversion runs in-memory, not in SQL
        var rawMessages = await _context.Messages
            .Include(m => m.Booking)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return rawMessages.Select(m =>
        {
            DateTime? startHanoi = m.Booking != null
                ? TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(m.Booking.StartTime, DateTimeKind.Utc), hanoiTz)
                : null;
            DateTime? endHanoi = m.Booking != null
                ? TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(m.Booking.EndTime, DateTimeKind.Utc), hanoiTz)
                : null;

            return new MessageDto
            {
                MessageId = m.MessageId,
                ConversationId = (Guid)m.ConversationId!,
                SenderId = (Guid)m.SenderId!,
                Type = m.MessageType ?? "TEXT",
                Content = m.Content ?? string.Empty,
                ContentTranslated = m.ContentTranslated,
                IsRead = m.IsRead ?? false,
                Timestamp = m.SentAt,
                LessonRequestId = m.BookingId,
                LessonDate = startHanoi?.ToString("yyyy-MM-dd"),
                LessonStartTime = startHanoi?.ToString("HH:mm"),
                LessonEndTime = endHanoi?.ToString("HH:mm"),
                LessonDuration = m.Booking != null ? (int)(m.Booking.EndTime - m.Booking.StartTime).TotalMinutes : null,
                LessonStatus = m.Booking != null ? m.Booking.Status.ToUpper() : null,
                MeetingUrl = m.Booking?.MeetingUrl
            };
        }).ToList();
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
            MessageType = "TEXT",
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
            Type = "TEXT",
            Content = message.Content,
            ContentTranslated = message.ContentTranslated,
            IsRead = (bool)message.IsRead!,
            Timestamp = (DateTime)message.SentAt!
        };

        // Broadcast via SignalR to conversation group
        try
        {
            await _hubContext.Clients
                .Group($"conversation-{conversationId}")
                .SendAsync("ReceiveMessage", messageDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast message via SignalR.");
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
