using backend.DTOs.Booking;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class BookingService : IBookingService
{
    private readonly VietImmerseDbContext _context;
    private readonly ILogger<BookingService> _logger;
    private readonly IHubContext<ChatHub> _hubContext;

    public BookingService(
        VietImmerseDbContext context,
        ILogger<BookingService> logger,
        IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task<BookingDto> CreateLessonRequestAsync(Guid partnerId, CreateBookingDto dto)
    {
        // Parse date and time → UTC
        if (!DateOnly.TryParse(dto.Date, out var date))
            throw new ArgumentException("Invalid date format. Use yyyy-MM-dd.");

        if (!TimeOnly.TryParse(dto.StartTime, out var time))
            throw new ArgumentException("Invalid time format. Use HH:mm.");

        // Validate duration (30-120 in steps of 15)
        var validDurations = new[] { 30, 45, 60, 75, 90, 105, 120 };
        if (!validDurations.Contains(dto.DurationMinutes))
            throw new ArgumentException("Duration must be 30, 45, 60, 75, 90, 105, or 120 minutes.");

        // Build UTC start/end (input is assumed GMT+7 — Hanoi Time)
        var startLocal = date.ToDateTime(time);
        var startUtc = DateTime.SpecifyKind(startLocal.AddHours(-7), DateTimeKind.Utc); // Convert Hanoi → UTC
        var endUtc = startUtc.AddMinutes(dto.DurationMinutes);

        // Validate not in the past
        if (startUtc < DateTime.UtcNow.AddMinutes(-5))
            throw new ArgumentException("Cannot create a lesson in the past.");

        // Check learner exists
        var learner = await _context.Users.FindAsync(dto.LearnerId)
            ?? throw new ArgumentException("Learner not found.");

        // Check for schedule conflict (same partner or learner, overlapping time)
        var hasConflict = await _context.Bookings.AnyAsync(b =>
            b.Status != "cancelled" && b.Status != "declined" &&
            (b.PartnerId == partnerId || b.LearnerId == dto.LearnerId) &&
            b.StartTime < endUtc && b.EndTime > startUtc);

        if (hasConflict)
            throw new InvalidOperationException("Schedule conflict with an existing lesson.");

        // Find conversation between partner and learner
        var conversation = await _context.Conversations.FirstOrDefaultAsync(c =>
            c.PartnerId == partnerId && c.LearnerId == dto.LearnerId);

        var booking = new Booking
        {
            PartnerId = partnerId,
            LearnerId = dto.LearnerId,
            StartTime = startUtc,
            EndTime = endUtc,
            Status = "pending",
            ConversationId = conversation?.ConversationId,
            Notes = dto.Notes,
            MeetingUrl = dto.MeetingUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.Bookings.Add(booking);

        backend.DTOs.Message.MessageDto? messageDto = null;
        if (conversation != null)
        {
            var message = new backend.Models.Message
            {
                ConversationId = conversation.ConversationId,
                SenderId = partnerId,
                MessageType = "LESSON_REQUEST",
                Booking = booking,
                Content = "",
                SentAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Convert UTC back to Hanoi Time (GMT+7) for display strings
            var hanoiTz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var startHanoi = TimeZoneInfo.ConvertTimeFromUtc(booking.StartTime, hanoiTz);
            var endHanoi = TimeZoneInfo.ConvertTimeFromUtc(booking.EndTime, hanoiTz);

            messageDto = new backend.DTOs.Message.MessageDto
            {
                MessageId = message.MessageId,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                Type = "LESSON_REQUEST",
                Content = "",
                IsRead = false,
                Timestamp = message.SentAt,
                LessonRequestId = booking.BookingId,
                LessonDate = startHanoi.ToString("yyyy-MM-dd"),
                LessonStartTime = startHanoi.ToString("HH:mm"),
                LessonEndTime = endHanoi.ToString("HH:mm"),
                LessonDuration = (int)(booking.EndTime - booking.StartTime).TotalMinutes,
                LessonStatus = booking.Status.ToUpper(),
                MeetingUrl = booking.MeetingUrl
            };
        }
        else
        {
            await _context.SaveChangesAsync();
        }

        var result = await MapToDtoAsync(booking);

        // Broadcast via SignalR
        if (conversation != null && messageDto != null)
        {
            await BroadcastLessonEventAsync(conversation.ConversationId, "LessonRequestCreated", messageDto);
        }

        return result;
    }

    public async Task<BookingDto> AcceptLessonRequestAsync(Guid bookingId, Guid learnerId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId)
            ?? throw new ArgumentException("Booking not found.");

        if (booking.LearnerId != learnerId)
            throw new UnauthorizedAccessException("Only the learner can accept this lesson request.");

        if (booking.Status != "pending")
            throw new InvalidOperationException($"Cannot accept a booking with status '{booking.Status}'.");

        booking.Status = "confirmed";
        booking.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await MapToDtoAsync(booking);

        if (booking.ConversationId.HasValue)
        {
            await BroadcastLessonEventAsync(booking.ConversationId.Value, "LessonAccepted", new { lesson_request_id = booking.BookingId, new_status = "ACCEPTED" });
        }

        return result;
    }

    public async Task<BookingDto> DeclineLessonRequestAsync(Guid bookingId, Guid learnerId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId)
            ?? throw new ArgumentException("Booking not found.");

        if (booking.LearnerId != learnerId)
            throw new UnauthorizedAccessException("Only the learner can decline this lesson request.");

        if (booking.Status != "pending")
            throw new InvalidOperationException($"Cannot decline a booking with status '{booking.Status}'.");

        booking.Status = "declined";
        booking.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await MapToDtoAsync(booking);

        if (booking.ConversationId.HasValue)
        {
            await BroadcastLessonEventAsync(booking.ConversationId.Value, "LessonDeclined", new { lesson_request_id = booking.BookingId, new_status = "DECLINED" });
        }

        return result;
    }

    public async Task<BookingDto> CancelLessonRequestAsync(Guid bookingId, Guid userId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId)
            ?? throw new ArgumentException("Booking not found.");

        if (booking.PartnerId != userId && booking.LearnerId != userId)
            throw new UnauthorizedAccessException("You are not part of this booking.");

        if (booking.Status == "cancelled" || booking.Status == "declined")
            throw new InvalidOperationException($"Cannot cancel a booking with status '{booking.Status}'.");

        booking.Status = "cancelled";
        booking.CancelledBy = userId;
        booking.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await MapToDtoAsync(booking);

        if (booking.ConversationId.HasValue)
        {
            await BroadcastLessonEventAsync(booking.ConversationId.Value, "LessonCancelled", new { lesson_request_id = booking.BookingId, new_status = "CANCELLED" });
        }

        return result;
    }

    public async Task<IEnumerable<BookingDto>> GetBookingsForConversationAsync(Guid conversationId)
    {
        var bookings = await _context.Bookings
            .Include(b => b.Learner)
            .Include(b => b.Partner)
            .Where(b => b.ConversationId == conversationId && b.Status != "declined")
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bookings.Select(b => new BookingDto
        {
            BookingId = b.BookingId,
            LearnerId = b.LearnerId,
            PartnerId = b.PartnerId,
            LearnerName = b.Learner.DisplayName,
            PartnerName = b.Partner.DisplayName,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            DurationMinutes = (int)(b.EndTime - b.StartTime).TotalMinutes,
            Status = b.Status,
            MeetingUrl = b.MeetingUrl,
            Notes = b.Notes,
            CreatedAt = b.CreatedAt,
        });
    }

    public async Task<IEnumerable<BookingDto>> GetUpcomingBookingsAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        // Support both partner and learner viewing upcoming lessons
        var bookings = await _context.Bookings
            .Include(b => b.Learner)
            .Include(b => b.Partner)
            .Where(b => (b.LearnerId == userId || b.PartnerId == userId)
                        && b.Status == "confirmed" && b.StartTime > now)
            .OrderBy(b => b.StartTime)
            .Take(3)
            .ToListAsync();

        return bookings.Select(b => new BookingDto
        {
            BookingId = b.BookingId,
            LearnerId = b.LearnerId,
            PartnerId = b.PartnerId,
            LearnerName = b.Learner.DisplayName,
            PartnerName = b.Partner.DisplayName,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            DurationMinutes = (int)(b.EndTime - b.StartTime).TotalMinutes,
            Status = b.Status,
            MeetingUrl = b.MeetingUrl,
            Notes = b.Notes,
            CreatedAt = b.CreatedAt,
        });
    }

    // ─── Helpers ──────────────────────────────────────────────

    private async Task<BookingDto> MapToDtoAsync(Booking booking)
    {
        // Eagerly load related users if not already loaded
        if (booking.Learner == null)
            await _context.Entry(booking).Reference(b => b.Learner).LoadAsync();
        if (booking.Partner == null)
            await _context.Entry(booking).Reference(b => b.Partner).LoadAsync();

        return new BookingDto
        {
            BookingId = booking.BookingId,
            LearnerId = booking.LearnerId,
            PartnerId = booking.PartnerId,
            LearnerName = booking.Learner?.DisplayName ?? "",
            PartnerName = booking.Partner?.DisplayName ?? "",
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            DurationMinutes = (int)(booking.EndTime - booking.StartTime).TotalMinutes,
            Status = booking.Status,
            MeetingUrl = booking.MeetingUrl,
            Notes = booking.Notes,
            CreatedAt = booking.CreatedAt,
        };
    }

    private async Task BroadcastLessonEventAsync(Guid conversationId, string eventType, object payloadObj)
    {
        try
        {
            await _hubContext.Clients
                .Group($"conversation-{conversationId}")
                .SendAsync(eventType, payloadObj);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast {EventType} via SignalR.", eventType);
        }
    }
}
