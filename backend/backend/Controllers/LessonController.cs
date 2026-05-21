using backend.DTOs.Lesson;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

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
    /// No auth required — public curriculum data.
    /// </summary>
    [HttpGet("chapters")]
    public async Task<ActionResult<List<ChapterWithLessonsDto>>> GetChapters([FromQuery] int levelId = 1)
    {
        var chapters = await _lessonService.GetChaptersByLevelAsync(levelId);
        return Ok(chapters);
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
}
