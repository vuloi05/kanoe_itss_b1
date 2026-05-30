using System.Security.Claims;
using backend.DTOs.User;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public class PresenceDto
{
    public bool IsOnline { get; set; }
}

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly VietImmerseDbContext _db;
    private readonly IPhotoService _photoService;
    private readonly ILogger<UserController> _logger;
    private readonly IHubContext<ChatHub> _hubContext;

    public UserController(
        VietImmerseDbContext db,
        IPhotoService photoService,
        IHubContext<ChatHub> hubContext,
        ILogger<UserController> logger)
    {
        _db = db;
        _photoService = photoService;
        _hubContext = hubContext;
        _logger = logger;
    }

    /// <summary>
    /// Update the authenticated user's display name and partner bio.
    /// Auto-creates PartnerProfile row if it doesn't exist yet.
    /// </summary>
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetCurrentUserId();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        // Update display name when provided
        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            user.DisplayName = dto.Name.Trim();
            user.UpdatedAt = DateTime.UtcNow;
        }

        // Upsert partner profile for bio
        var profile = await _db.PartnerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new PartnerProfile
            {
                UserId = userId,
                Bio = dto.Bio,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.PartnerProfiles.Add(profile);
        }
        else
        {
            profile.Bio = dto.Bio;
            profile.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated profile (name + bio)", userId);

        return Ok(new
        {
            message = "Profile updated successfully.",
            displayName = user.DisplayName,
            bio = profile.Bio,
        });
    }

    /// <summary>
    /// Upload or replace the authenticated user's avatar.
    /// </summary>
    [Authorize]
    [HttpPost("avatar")]
    [RequestSizeLimit(6 * 1024 * 1024)] // Slightly above 5MB to account for multipart overhead
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userId = GetCurrentUserId();

        try
        {
            // 1. Fetch user first to get the old avatar URL
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var oldAvatarUrl = user.AvatarUrl;

            // 2. Upload new avatar to Cloudinary
            var uploadResult = await _photoService.UploadAvatarAsync(file);

            // 3. Best-effort cleanup: delete old avatar from Cloudinary
            if (!string.IsNullOrEmpty(oldAvatarUrl))
            {
                var oldPublicId = CloudinaryPhotoService.ExtractPublicId(oldAvatarUrl);
                if (oldPublicId != null)
                {
                    try
                    {
                        await _photoService.DeletePhotoAsync(oldPublicId);
                    }
                    catch (Exception ex)
                    {
                        // Never block the new upload — just log the cleanup failure
                        _logger.LogWarning(ex, "Failed to delete old avatar {PublicId} for user {UserId}", oldPublicId, userId);
                    }
                }
            }

            // 4. Persist new URL
            user.AvatarUrl = uploadResult.SecureUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated avatar to {Url}", userId, uploadResult.SecureUrl);

            return Ok(new { avatarUrl = uploadResult.SecureUrl });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Avatar upload failed for user {UserId}", userId);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update user's online presence (Workflow 11)
    /// </summary>
    [Authorize]
    [HttpPost("presence")]
    public async Task<IActionResult> UpdatePresence([FromBody] PresenceDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        
        if (user == null)
            return NotFound(new { message = "User not found." });

        user.IsOnline = dto.IsOnline;
        user.LastSeen = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        // Broadcast presence via SignalR
        try
        {
            var eventName = dto.IsOnline ? "UserOnline" : "UserOffline";
            await _hubContext.Clients
                .Group("global-presence")
                .SendAsync(eventName, new { userId = user.UserId, role = user.Role, lastSeen = user.LastSeen });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast presence for user {UserId}", userId);
        }

        return Ok(new { isOnline = user.IsOnline, lastSeen = user.LastSeen });
    }

    /// <summary>
    /// Retrieve list of online users
    /// </summary>
    [Authorize]
    [HttpGet("presence")]
    public async Task<IActionResult> GetOnlineUsers()
    {
        // Get only the user IDs to minimize payload
        var onlineUserIds = await _db.Users
            .Where(u => u.IsOnline == true)
            .Select(u => u.UserId)
            .ToListAsync();
            
        return Ok(onlineUserIds);
    }

    /// <summary>
    /// Record a study activity and update the learner's streak.
    /// Called from Voice Lab when a learner passes a pronunciation exercise.
    /// </summary>
    [Authorize]
    [HttpPost("record-study")]
    public async Task<IActionResult> RecordStudy()
    {
        var userId = GetCurrentUserId();

        var profile = await _db.LearnerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
            return NotFound(new { message = "Learner profile not found." });

        var today = DateTime.UtcNow.Date;
        var lastDate = profile.LastStudyDate?.Date;

        if (lastDate == today)
        {
            // Already recorded for today — return current streak without changes
            return Ok(new { currentStreak = profile.CurrentStreak ?? 0 });
        }

        if (lastDate == null)
        {
            profile.CurrentStreak = 1;
        }
        else if (lastDate == today.AddDays(-1))
        {
            // Consecutive day — increment streak
            profile.CurrentStreak = (profile.CurrentStreak ?? 0) + 1;
        }
        else
        {
            // Missed one or more days — reset
            profile.CurrentStreak = 1;
        }

        // Track personal best
        if ((profile.CurrentStreak ?? 0) > (profile.LongestStreak ?? 0))
        {
            profile.LongestStreak = profile.CurrentStreak;
        }

        profile.LastStudyDate = DateTime.UtcNow;
        profile.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} recorded study activity — streak: {Streak}",
            userId, profile.CurrentStreak);

        return Ok(new { currentStreak = profile.CurrentStreak });
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Invalid token.");
        return Guid.Parse(claim.Value);
    }
}
