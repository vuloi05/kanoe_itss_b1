using backend.DTOs.Lesson;

namespace backend.Services;

public interface ILessonService
{
    Task<List<ChapterWithLessonsDto>> GetChaptersByLevelAsync(int levelId);
    Task<List<ChapterWithLessonsDto>> GetChaptersByLevelForUserAsync(int levelId, Guid userId);
    Task<LessonDetailDto?> GetLessonByIdAsync(Guid lessonId, Guid userId);
    Task<string?> CompleteLessonAsync(Guid userId, Guid lessonId);
    Task InitProgressForLevelAsync(Guid userId, string level);
    Task<ContinueLessonDto?> GetContinueLessonAsync(Guid userId);
    Task UpdateProgressAsync(Guid userId, Guid lessonId, int progress);
}
