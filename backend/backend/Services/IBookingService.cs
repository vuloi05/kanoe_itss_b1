using backend.DTOs.Booking;

namespace backend.Services;

public interface IBookingService
{
    Task<BookingDto> CreateLessonRequestAsync(Guid partnerId, CreateBookingDto dto);
    Task<BookingDto> AcceptLessonRequestAsync(Guid bookingId, Guid learnerId);
    Task<BookingDto> DeclineLessonRequestAsync(Guid bookingId, Guid learnerId);
    Task<BookingDto> CancelLessonRequestAsync(Guid bookingId, Guid userId);
    Task<IEnumerable<BookingDto>> GetBookingsForConversationAsync(Guid conversationId);
    Task<IEnumerable<BookingDto>> GetUpcomingBookingsAsync(Guid learnerId);
}
