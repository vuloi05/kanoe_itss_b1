namespace backend.DTOs.Booking;

public class CreateBookingDto
{
    public Guid LearnerId { get; set; }
    public string Date { get; set; } = null!;        // "2025-05-18"
    public string StartTime { get; set; } = null!;    // "15:00"
    public int DurationMinutes { get; set; }           // 30, 45, 60, 75, 90, 105, 120
}

public class BookingDto
{
    public Guid BookingId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid PartnerId { get; set; }
    public string LearnerName { get; set; } = null!;
    public string PartnerName { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = null!;        // pending, confirmed, declined, cancelled
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
