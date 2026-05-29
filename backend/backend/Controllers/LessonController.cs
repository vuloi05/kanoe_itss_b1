using backend.DTOs.Lesson;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonController : ControllerBase
{
    private readonly ILessonService _lessonService;

    public LessonController(ILessonService lessonService)
    {
        _lessonService = lessonService;
    }

    /// <summary>
    /// Get chapters with lesson summaries for a given level.
    /// Authenticated users get per-user progress (lock/complete state).
    /// Guests see first lesson unlocked, rest locked.
    /// </summary>
    [HttpGet("chapters")]
    public async Task<ActionResult<List<ChapterWithLessonsDto>>> GetChapters([FromQuery] int levelId = 1)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
        {
            var chapters = await _lessonService.GetChaptersByLevelForUserAsync(levelId, userId);
            return Ok(chapters);
        }

        // Fallback for unauthenticated requests
        var publicChapters = await _lessonService.GetChaptersByLevelAsync(levelId);
        return Ok(publicChapters);
    }

    /// <summary>
    /// Get full lesson detail including dialogues and tone notes.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LessonDetailDto>> GetLessonById(Guid id)
    {
        var lesson = await _lessonService.GetLessonByIdAsync(id);
        if (lesson == null)
            return NotFound(new { message = "Lesson not found." });

        return Ok(lesson);
    }

    /// <summary>
    /// Mark a lesson as completed for the authenticated user.
    /// </summary>
    [Authorize]
    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> CompleteLesson(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        await _lessonService.CompleteLessonAsync(userId, id);
        return Ok(new { message = "Lesson marked as completed." });
    }
}
