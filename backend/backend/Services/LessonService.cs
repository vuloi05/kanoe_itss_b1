using backend.DTOs.Lesson;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class LessonService : ILessonService
{
    private readonly VietImmerseDbContext _db;

    public LessonService(VietImmerseDbContext db)
    {
        _db = db;
    }

    public async Task<List<ChapterWithLessonsDto>> GetChaptersByLevelAsync(int levelId)
    {
        var chapters = await _db.Chapters
            .Where(c => c.LevelId == levelId)
            .OrderBy(c => c.SortOrder)
            .Include(c => c.Lessons.OrderBy(l => l.SortOrder))
            .AsNoTracking()
            .ToListAsync();

        return chapters.Select(c => new ChapterWithLessonsDto(
            c.ChapterId,
            c.TitleVi,
            c.TitleJp,
            c.Icon,
            c.SortOrder,
            c.Lessons.Select(l => new LessonSummaryDto(
                l.LessonId,
                l.SceneLabel,
                l.SceneLabelJp,
                l.TitleVi,
                l.TitleJp,
                l.Tag,
                l.TagJp,
                l.DurationMinutes,
                l.IsLocked,
                l.SortOrder
            )).ToList()
        )).ToList();
    }

    public async Task<LessonDetailDto?> GetLessonByIdAsync(Guid lessonId)
    {
        var lesson = await _db.Lessons
            .Include(l => l.Dialogues.OrderBy(d => d.SortOrder))
            .Include(l => l.ToneNotes.OrderBy(t => t.SortOrder))
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.LessonId == lessonId);

        if (lesson == null) return null;

        return new LessonDetailDto(
            lesson.LessonId,
            lesson.SceneLabel,
            lesson.SceneLabelJp,
            lesson.TitleVi,
            lesson.TitleJp,
            lesson.SubtitleVi,
            lesson.SubtitleJp,
            lesson.Tag,
            lesson.TagJp,
            lesson.DurationMinutes,
            lesson.IsLocked,
            lesson.Dialogues.Select(d => new DialogueDto(
                d.Speaker,
                d.SpeakerJp,
                d.LineVi,
                d.LineJp,
                d.IsActive,
                d.HighlightWordsJson
            )).ToList(),
            lesson.ToneNotes.Select(t => new ToneNoteDto(
                t.Tone,
                t.DescVi,
                t.DescJp,
                t.Example,
                t.Color
            )).ToList()
        );
    }
}
