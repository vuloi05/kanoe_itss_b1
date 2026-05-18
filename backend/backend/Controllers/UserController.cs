using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;

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
    private readonly IConfiguration _configuration;

    public UserController(
        VietImmerseDbContext db,
        IPhotoService photoService,
        IConfiguration configuration,
        ILogger<UserController> logger)
    {
        _db = db;
        _photoService = photoService;
        _configuration = configuration;
        _logger = logger;
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

        // Broadcast to Supabase
        var supabaseUrl = _configuration["Supabase:Url"];
        var supabaseKey = _configuration["Supabase:ServiceRoleKey"];
        
        if (!string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey))
        {
            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("apikey", supabaseKey);

                var payload = new
                {
                    messages = new[]
                    {
                        new
                        {
                            topic = "global-presence",
                            @event = dto.IsOnline ? "USER_ONLINE" : "USER_OFFLINE",
                            payload = new { userId = user.UserId, role = user.Role, lastSeen = user.LastSeen }
                        }
                    }
                };

                var url = $"{supabaseUrl.TrimEnd('/')}/realtime/v1/api/broadcast";
                await client.PostAsJsonAsync(url, payload);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to broadcast presence for user {UserId}", userId);
            }
        }

        return Ok(new { isOnline = user.IsOnline, lastSeen = user.LastSeen });
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Invalid token.");
        return Guid.Parse(claim.Value);
    }
}
