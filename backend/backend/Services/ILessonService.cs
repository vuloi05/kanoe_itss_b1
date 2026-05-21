using backend.DTOs.Lesson;

namespace backend.Services;

public interface ILessonService
{
    Task<List<ChapterWithLessonsDto>> GetChaptersByLevelAsync(int levelId);
    Task<LessonDetailDto?> GetLessonByIdAsync(Guid lessonId);
}
