using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Services;

public class LessonReminderBackgroundService : BackgroundService
{
    private readonly ILogger<LessonReminderBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHubContext<ChatHub> _hubContext;

    public LessonReminderBackgroundService(
        ILogger<LessonReminderBackgroundService> logger,
        IServiceProvider serviceProvider,
        IHubContext<ChatHub> hubContext)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Lesson Reminder Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing lesson reminders.");
            }

            // Run every 1 minute
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task ProcessRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<VietImmerseDbContext>();

        var now = DateTime.UtcNow;
        var targetTime = now.AddMinutes(30);
        var bufferTime = now.AddMinutes(31); // query range exactly 30 -> 31 mins ahead

        // Find all pending bookings starting in exactly ~30 mins
        var upcomingBookings = await context.Bookings
            .Include(b => b.Conversation)
            .Where(b => b.Status == "pending" && b.ConversationId != null 
                     && b.StartTime > targetTime && b.StartTime <= bufferTime)
            .ToListAsync();

        foreach (var booking in upcomingBookings)
        {
            var convId = booking.ConversationId.Value;
            
            // Anti-spam (Idempotency): Check if we already sent a reminder within the last hour for this booking
            var checkTime = now.AddHours(-1);
            var alreadySent = await context.Messages
                .AnyAsync(m => m.ConversationId == convId 
                            && m.BookingId == booking.BookingId 
                            && m.MessageType == "SYSTEM" 
                            && m.Content == "REMINDER_SENT"
                            && m.SentAt > checkTime);

            if (alreadySent) continue;

            // 1. Text message
            var textMsg = new Message
            {
                ConversationId = convId,
                SenderId = booking.PartnerId,
                MessageType = "TEXT",
                Content = "Nhắc nhở: Lịch học của bạn sẽ bắt đầu trong 30 phút nữa. Hãy chuẩn bị nhé!",
                SentAt = DateTime.UtcNow,
                IsRead = false,
                BookingId = booking.BookingId
            };
            
            // Hidden SYSTEM message to track idempotency reliably
            var systemMsg = new Message
            {
                ConversationId = convId,
                SenderId = booking.PartnerId,
                MessageType = "SYSTEM",
                Content = "REMINDER_SENT",
                SentAt = DateTime.UtcNow,
                BookingId = booking.BookingId
            };

            // 2. Action card message (LESSON_REQUEST)
            var actionMsg = new Message
            {
                ConversationId = convId,
                SenderId = booking.PartnerId,
                MessageType = "LESSON_REQUEST",
                BookingId = booking.BookingId,
                Content = "",
                SentAt = DateTime.UtcNow.AddSeconds(1), // Slight delay to order properly
                IsRead = false
            };

            context.Messages.Add(textMsg);
            context.Messages.Add(systemMsg);
            context.Messages.Add(actionMsg);
            await context.SaveChangesAsync();

            // Broadcast Text message via SignalR
            var textMsgDto = new backend.DTOs.Message.MessageDto
            {
                MessageId = textMsg.MessageId,
                ConversationId = textMsg.ConversationId,
                SenderId = textMsg.SenderId,
                Type = "TEXT",
                Content = textMsg.Content,
                IsRead = false,
                Timestamp = textMsg.SentAt
            };
            await _hubContext.Clients.Group($"conversation-{convId}").SendAsync("ReceiveMessage", textMsgDto);

            // Broadcast Action Card via SignalR
            var hanoiTz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var startHanoi = TimeZoneInfo.ConvertTimeFromUtc(booking.StartTime, hanoiTz);
            var endHanoi = TimeZoneInfo.ConvertTimeFromUtc(booking.EndTime, hanoiTz);

            var actionMsgDto = new backend.DTOs.Message.MessageDto
            {
                MessageId = actionMsg.MessageId,
                ConversationId = actionMsg.ConversationId,
                SenderId = actionMsg.SenderId,
                Type = "LESSON_REQUEST",
                Content = "",
                IsRead = false,
                Timestamp = actionMsg.SentAt,
                LessonRequestId = booking.BookingId,
                LessonDate = startHanoi.ToString("yyyy-MM-dd"),
                LessonStartTime = startHanoi.ToString("HH:mm"),
                LessonEndTime = endHanoi.ToString("HH:mm"),
                LessonDuration = (int)(booking.EndTime - booking.StartTime).TotalMinutes,
                LessonStatus = booking.Status.ToUpper(),
                MeetingUrl = booking.MeetingUrl
            };
            await _hubContext.Clients.Group($"conversation-{convId}").SendAsync("LessonRequestCreated", actionMsgDto);
            
            _logger.LogInformation("Sent automated reminder for Booking {BookingId} to Conversation {ConversationId}", booking.BookingId, convId);
        }
    }
}
