using backend.DTOs.Booking;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out Guid userId))
            return userId;
        throw new UnauthorizedAccessException("Invalid user token");
    }

    /// <summary>
    /// Partner creates a lesson request.
    /// POST /api/booking/request
    /// </summary>
    [HttpPost("request")]
    public async Task<IActionResult> CreateLessonRequest([FromBody] CreateBookingDto dto)
    {
        try
        {
            var partnerId = GetCurrentUserId();
            var result = await _bookingService.CreateLessonRequestAsync(partnerId, dto);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Learner accepts a lesson request.
    /// PATCH /api/booking/{bookingId}/accept
    /// </summary>
    [HttpPatch("{bookingId}/accept")]
    public async Task<IActionResult> AcceptLessonRequest(Guid bookingId)
    {
        try
        {
            var learnerId = GetCurrentUserId();
            var result = await _bookingService.AcceptLessonRequestAsync(bookingId, learnerId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Learner declines a lesson request.
    /// PATCH /api/booking/{bookingId}/decline
    /// </summary>
    [HttpPatch("{bookingId}/decline")]
    public async Task<IActionResult> DeclineLessonRequest(Guid bookingId)
    {
        try
        {
            var learnerId = GetCurrentUserId();
            var result = await _bookingService.DeclineLessonRequestAsync(bookingId, learnerId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cancel a lesson (by partner before learner responds, or by either party).
    /// DELETE /api/booking/{bookingId}
    /// </summary>
    [HttpDelete("{bookingId}")]
    public async Task<IActionResult> CancelLessonRequest(Guid bookingId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _bookingService.CancelLessonRequestAsync(bookingId, userId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all bookings for a conversation.
    /// GET /api/booking/conversation/{conversationId}
    /// </summary>
    [HttpGet("conversation/{conversationId}")]
    public async Task<IActionResult> GetBookingsForConversation(Guid conversationId)
    {
        var bookings = await _bookingService.GetBookingsForConversationAsync(conversationId);
        return Ok(bookings);
    }

    /// <summary>
    /// Get upcoming confirmed bookings for the Learner.
    /// GET /api/booking/upcoming
    /// </summary>
    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcomingBookings()
    {
        var learnerId = GetCurrentUserId();
        var bookings = await _bookingService.GetUpcomingBookingsAsync(learnerId);
        return Ok(bookings);
    }
}
