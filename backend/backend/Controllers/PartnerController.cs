using System.Security.Claims;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

/// <summary>
/// Partner discovery & conversation creation for Learners.
/// Workflow: matching_workflow_vietimmerse.md §3
/// </summary>
[ApiController]
[Route("api/partners")]
public class PartnerController : ControllerBase
{
    private readonly VietImmerseDbContext _db;
    private readonly ILogger<PartnerController> _logger;

    public PartnerController(VietImmerseDbContext db, ILogger<PartnerController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/partners — List all active partners with conversation status for current learner.
    /// </summary>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetPartners()
    {
        var learnerId = GetCurrentUserId();

        // Get all active partners with their profiles
        var partners = await _db.Users
            .Where(u => u.Role == "partner" && u.AccountStatus == "active")
            .Join(
                _db.PartnerProfiles,
                u => u.UserId,
                pp => pp.UserId,
                (u, pp) => new { User = u, Profile = pp }
            )
            .AsNoTracking()
            .ToListAsync();

        // Get existing conversations for this learner
        var conversations = await _db.Conversations
            .AsNoTracking()
            .Where(c => c.LearnerId == learnerId)
            .ToDictionaryAsync(c => c.PartnerId, c => c.ConversationId);

        var result = partners.Select(p => new
        {
            userId = p.User.UserId,
            displayName = p.User.DisplayName,
            avatarUrl = p.User.AvatarUrl,
            bio = p.Profile.Bio,
            isOnline = p.User.IsOnline,
            lastSeen = p.User.LastSeen,
            ageRange = p.Profile.AgeRange,
            job = p.Profile.Job,
            gender = p.Profile.Gender,
            specialties = p.Profile.Specialties,
            hasConversation = conversations.ContainsKey(p.User.UserId),
            conversationId = conversations.ContainsKey(p.User.UserId)
                ? conversations[p.User.UserId]
                : (Guid?)null
        });

        return Ok(result);
    }

    /// <summary>
    /// POST /api/partners/{partnerId}/start-conversation — Create or return existing conversation.
    /// </summary>
    [Authorize]
    [HttpPost("{partnerId}/start-conversation")]
    public async Task<IActionResult> StartConversation(Guid partnerId)
    {
        var learnerId = GetCurrentUserId();

        // Validate partner exists and has correct role
        var partner = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == partnerId && u.Role == "partner");
        if (partner == null)
            return NotFound(new { message = "Partner not found." });

        // Check for existing conversation
        var existing = await _db.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.LearnerId == learnerId && c.PartnerId == partnerId);

        if (existing != null)
            return Ok(new { conversationId = existing.ConversationId, isNew = false });

        // Create new conversation
        var conversation = new Conversation
        {
            ConversationId = Guid.NewGuid(),
            LearnerId = learnerId,
            PartnerId = partnerId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Created conversation {ConvId} between learner {LearnerId} and partner {PartnerId}",
            conversation.ConversationId, learnerId, partnerId);

        return StatusCode(201, new { conversationId = conversation.ConversationId, isNew = true });
    }

    [Authorize]
    [HttpGet("me/stats")]
    public async Task<IActionResult> GetMyStats()
    {
        var partnerId = GetCurrentUserId();
        var now = DateTime.UtcNow;
        var firstDayOfThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var firstDayOfLastMonth = firstDayOfThisMonth.AddMonths(-1);

        var lastMonthBookings = await _db.Bookings
            .Where(b => b.PartnerId == partnerId && b.StartTime >= firstDayOfLastMonth && b.StartTime < firstDayOfThisMonth)
            .ToListAsync();

        var totalSessions = lastMonthBookings.Count;
        var completedSessions = lastMonthBookings.Count(b => b.Status == "confirmed" && b.EndTime < now);
        var cancelledSessions = lastMonthBookings.Count(b => b.Status == "cancelled");

        var profile = await _db.PartnerProfiles.FirstOrDefaultAsync(p => p.UserId == partnerId);
        var monthlyGoal = profile?.MonthlyGoal ?? 50;

        return Ok(new {
            lastMonthTotalSessions = totalSessions,
            lastMonthCompletedSessions = completedSessions,
            lastMonthCancelledSessions = cancelledSessions,
            monthlyGoal = monthlyGoal
        });
    }

    [Authorize]
    [HttpPut("me/goal")]
    public async Task<IActionResult> UpdateGoal([FromBody] UpdateGoalRequest request)
    {
        var partnerId = GetCurrentUserId();
        var profile = await _db.PartnerProfiles.FirstOrDefaultAsync(p => p.UserId == partnerId);
        if (profile == null) return NotFound(new { message = "Partner profile not found." });

        profile.MonthlyGoal = request.MonthlyGoal;
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Mục tiêu đã được cập nhật.", monthlyGoal = request.MonthlyGoal });
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Invalid token.");
        return Guid.Parse(claim.Value);
    }
}

public class UpdateGoalRequest
{
    public int MonthlyGoal { get; set; }
}
