using backend.DTOs.Lesson;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class LessonService : ILessonService
{
    private readonly VietImmerseDbContext _db;

    // Map "v1"/"v2"/"v3" to level_id in content_levels table
    private static readonly Dictionary<string, int> LevelIdMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["v1"] = 1,
        ["v2"] = 2,
        ["v3"] = 3,
    };

    public LessonService(VietImmerseDbContext db)
    {
        _db = db;
    }

    // Lightweight container for per-lesson progress data loaded from DB
    private sealed record LessonProgressInfo(bool IsCompleted, int Progress);

    /// <summary>
    /// Public curriculum view — no user-specific progress (backward compat).
    /// First lesson per chapter unlocked, rest locked.
    /// </summary>
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
            c.Lessons.Select((l, idx) => new LessonSummaryDto(
                l.LessonId,
                l.SceneLabel,
                l.SceneLabelJp,
                l.TitleVi,
                l.TitleJp,
                l.Tag,
                l.TagJp,
                l.DurationMinutes,
                IsLocked: idx > 0, // Only first lesson unlocked for guests
                IsCompleted: false,
                Progress: 0,
                l.SortOrder
            )).ToList()
        )).ToList();
    }

    /// <summary>
    /// User-specific view: computes IsLocked and IsCompleted per lesson
    /// based on the user's lesson_progress records and registered level.
    /// </summary>
    public async Task<List<ChapterWithLessonsDto>> GetChaptersByLevelForUserAsync(int levelId, Guid userId)
    {
        // Determine user's registered level
        var profile = await _db.LearnerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        var userLevelStr = profile?.Goals ?? "v1";
        var userLevelId = LevelIdMap.TryGetValue(userLevelStr, out var lid) ? lid : 1;

        var chapters = await _db.Chapters
            .Where(c => c.LevelId == levelId)
            .OrderBy(c => c.SortOrder)
            .Include(c => c.Lessons.OrderBy(l => l.SortOrder))
            .AsNoTracking()
            .ToListAsync();

        // Bulk-load user progress for all lessons in this level
        var lessonIds = chapters.SelectMany(c => c.Lessons.Select(l => l.LessonId)).ToList();
        var progressMap = await _db.LessonProgresses
            .Where(p => p.UserId == userId && lessonIds.Contains(p.LessonId))
            .AsNoTracking()
            .ToDictionaryAsync(p => p.LessonId, p => new LessonProgressInfo(p.IsCompleted, p.Progress));

        return chapters.Select(c => new ChapterWithLessonsDto(
            c.ChapterId,
            c.TitleVi,
            c.TitleJp,
            c.Icon,
            c.SortOrder,
            BuildLessonDtos(c.Lessons.OrderBy(l => l.SortOrder).ToList(), progressMap, levelId, userLevelId)
        )).ToList();
    }

    /// <summary>
    /// Auto-completes lower-level lessons when the user has achieved a higher proficiency.
    /// Progress is derived from level comparison:
    ///   - User level &gt; lesson level → progress = 100 (auto-completed)
    ///   - User level == lesson level → progress = actual DB value
    ///   - User level &lt; lesson level → progress = 0 (locked)
    /// Within progressive unlock: first lesson open, subsequent unlock when previous is completed.
    /// </summary>
    private static List<LessonSummaryDto> BuildLessonDtos(
        List<Lesson> lessons, Dictionary<Guid, LessonProgressInfo> progressMap, int requestedLevelId, int userLevelId)
    {
        var result = new List<LessonSummaryDto>(lessons.Count);

        for (var i = 0; i < lessons.Count; i++)
        {
            var lesson = lessons[i];
            var hasProgress = progressMap.TryGetValue(lesson.LessonId, out var progressEntry);
            var dbCompleted = hasProgress && progressEntry!.IsCompleted;
            var dbProgress = hasProgress ? progressEntry!.Progress : 0;

            bool isLocked;
            bool isCompleted;
            int progress;

            if (requestedLevelId < userLevelId)
            {
                // Below user's level — auto-complete all lessons
                isLocked = false;
                isCompleted = true;
                progress = 100;
            }
            else if (requestedLevelId > userLevelId)
            {
                // Above user's level — everything locked
                isLocked = true;
                isCompleted = false;
                progress = 0;
            }
            else
            {
                // User's current level — progressive unlock within chapter
                isCompleted = dbCompleted;
                progress = dbCompleted ? 100 : dbProgress;

                if (i == 0)
                {
                    isLocked = false; // First lesson always unlocked
                }
                else
                {
                    // Unlock if previous lesson is completed
                    var prevLessonId = lessons[i - 1].LessonId;
                    var prevHasProgress = progressMap.TryGetValue(prevLessonId, out var prevEntry);
                    var prevCompleted = prevHasProgress && prevEntry!.IsCompleted;
                    isLocked = !prevCompleted;
                }
            }

            result.Add(new LessonSummaryDto(
                lesson.LessonId,
                lesson.SceneLabel,
                lesson.SceneLabelJp,
                lesson.TitleVi,
                lesson.TitleJp,
                lesson.Tag,
                lesson.TagJp,
                lesson.DurationMinutes,
                isLocked,
                isCompleted,
                progress,
                lesson.SortOrder
            ));
        }

        return result;
    }

    public async Task<LessonDetailDto?> GetLessonByIdAsync(Guid lessonId, Guid userId)
    {
        var lesson = await _db.Lessons
            .Include(l => l.Dialogues.OrderBy(d => d.SortOrder))
            .Include(l => l.ToneNotes.OrderBy(t => t.SortOrder))
            .Include(l => l.Chapter)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.LessonId == lessonId);

        if (lesson == null) return null;

        // Determine lesson's level ID via Chapter → LevelId
        var lessonLevelId = lesson.Chapter?.LevelId ?? 1;

        // Determine user's registered level
        var profile = await _db.LearnerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);
        var userLevelStr = profile?.Goals ?? "v1";
        var userLevelId = LevelIdMap.TryGetValue(userLevelStr, out var lid) ? lid : 1;

        bool isCompleted;
        int progressValue;

        if (lessonLevelId < userLevelId)
        {
            // Below user's level — auto-complete
            isCompleted = true;
            progressValue = 100;
        }
        else
        {
            // Load from DB
            var progress = await _db.LessonProgresses
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);
            isCompleted = progress?.IsCompleted ?? false;
            progressValue = progress?.Progress ?? 0;
        }

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
            isCompleted,
            progressValue,
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

    /// <summary>
    /// Mark a lesson as completed for the user. Upsert pattern.
    /// </summary>
    public async Task<string?> CompleteLessonAsync(Guid userId, Guid lessonId)
    {
        var existing = await _db.LessonProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

        if (existing != null)
        {
            if (!existing.IsCompleted)
            {
                existing.IsCompleted = true;
                existing.Progress = 100;
                existing.CompletedAt = DateTime.UtcNow;
            }
        }
        else
        {
            _db.LessonProgresses.Add(new LessonProgress
            {
                UserId = userId,
                LessonId = lessonId,
                IsCompleted = true,
                Progress = 100,
                CompletedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync();

        // Check if all lessons of the current level are completed
        var lesson = await _db.Lessons
            .Include(l => l.Chapter)
            .FirstOrDefaultAsync(l => l.LessonId == lessonId);

        if (lesson != null)
        {
            var completedLevelId = lesson.Chapter.LevelId;

            // Fetch all lesson IDs in this level
            var levelLessonIds = await _db.Lessons
                .Where(l => l.Chapter.LevelId == completedLevelId)
                .Select(l => l.LessonId)
                .ToListAsync();

            // Count completed lessons for this level
            var completedCount = await _db.LessonProgresses
                .CountAsync(p => p.UserId == userId && levelLessonIds.Contains(p.LessonId) && p.IsCompleted);

            // If all lessons in this level are completed, upgrade user's level
            if (completedCount == levelLessonIds.Count)
            {
                var nextLevelEntry = LevelIdMap.FirstOrDefault(kv => kv.Value == completedLevelId + 1);
                if (nextLevelEntry.Key != null)
                {
                    var profile = await _db.LearnerProfiles
                        .FirstOrDefaultAsync(p => p.UserId == userId);
                    if (profile != null)
                    {
                        var currentGoalsStr = profile.Goals ?? "v1";
                        var currentGoalsId = LevelIdMap.TryGetValue(currentGoalsStr, out var cid) ? cid : 1;
                        var nextLevelId = nextLevelEntry.Value;

                        if (nextLevelId > currentGoalsId)
                        {
                            var nextLevelStr = nextLevelEntry.Key.ToLower();
                            profile.Goals = nextLevelStr;
                            profile.UpdatedAt = DateTime.UtcNow;
                            await _db.SaveChangesAsync();

                            // Auto-complete lessons below the new level
                            await InitProgressForLevelAsync(userId, nextLevelStr);

                            return nextLevelStr;
                        }
                    }
                }
            }
        }

        return null;
    }

    /// <summary>
    /// Seeds lesson_progress when a user registers at a level above V1.
    /// All lessons in levels below the registered level are marked completed.
    /// </summary>
    public async Task InitProgressForLevelAsync(Guid userId, string level)
    {
        if (!LevelIdMap.TryGetValue(level, out var registeredLevelId) || registeredLevelId <= 1)
            return; // V1 or unknown — nothing to auto-complete

        // Find all levels below the registered level
        var lowerLevelIds = LevelIdMap
            .Where(kv => kv.Value < registeredLevelId)
            .Select(kv => kv.Value)
            .ToList();

        // Get all lessons belonging to those lower levels
        var lessonIds = await _db.Lessons
            .Where(l => lowerLevelIds.Contains(l.Chapter.LevelId))
            .Select(l => l.LessonId)
            .ToListAsync();

        if (lessonIds.Count == 0) return;

        // Check which ones already have progress records
        var existingLessonIds = await _db.LessonProgresses
            .Where(p => p.UserId == userId && lessonIds.Contains(p.LessonId))
            .Select(p => p.LessonId)
            .ToListAsync();

        var existingSet = existingLessonIds.ToHashSet();
        var now = DateTime.UtcNow;

        var newRecords = lessonIds
            .Where(id => !existingSet.Contains(id))
            .Select(id => new LessonProgress
            {
                UserId = userId,
                LessonId = id,
                IsCompleted = true,
                Progress = 100,
                CompletedAt = now,
                CreatedAt = now,
            })
            .ToList();

        if (newRecords.Count > 0)
        {
            _db.LessonProgresses.AddRange(newRecords);
            await _db.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Finds the best lesson for the user to continue studying.
    /// Priority: in-progress (partial) → next not-started → first lesson (new user).
    /// Returns null when every lesson across all levels is completed.
    /// </summary>
    public async Task<ContinueLessonDto?> GetContinueLessonAsync(Guid userId)
    {
        // Determine user's registered level
        var profile = await _db.LearnerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        var userLevelStr = profile?.Goals ?? "v1";
        var userLevelId = LevelIdMap.TryGetValue(userLevelStr, out var lid) ? lid : 1;

        // Load all lessons in the user's current level, ordered globally by chapter then lesson
        var orderedLessons = await _db.Lessons
            .Include(l => l.Chapter)
            .Where(l => l.Chapter.LevelId == userLevelId)
            .OrderBy(l => l.Chapter.SortOrder)
            .ThenBy(l => l.SortOrder)
            .AsNoTracking()
            .ToListAsync();

        if (orderedLessons.Count == 0)
            return null;

        var lessonIds = orderedLessons.Select(l => l.LessonId).ToList();

        var progressMap = await _db.LessonProgresses
            .Where(p => p.UserId == userId && lessonIds.Contains(p.LessonId))
            .AsNoTracking()
            .ToDictionaryAsync(p => p.LessonId);

        // Priority 1: Find the most recently touched in-progress (not completed) lesson
        var inProgressEntry = progressMap.Values
            .Where(p => !p.IsCompleted && p.Progress > 0)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefault();

        if (inProgressEntry != null)
        {
            var lesson = orderedLessons.First(l => l.LessonId == inProgressEntry.LessonId);
            return ToDto(lesson);
        }

        // Priority 2: Find the first not-yet-started lesson (no progress record, respecting unlock)
        foreach (var lesson in orderedLessons)
        {
            if (!progressMap.ContainsKey(lesson.LessonId))
                return ToDto(lesson);

            // Also return if there is a record but 0 progress and not completed
            var prog = progressMap[lesson.LessonId];
            if (!prog.IsCompleted && prog.Progress == 0)
                return ToDto(lesson);
        }

        // All completed — return null so UI can show "review" state
        return null;
    }

    private static ContinueLessonDto ToDto(Lesson lesson) => new(
        lesson.LessonId,
        lesson.SceneLabel,
        lesson.SceneLabelJp,
        lesson.TitleVi,
        lesson.TitleJp,
        lesson.Chapter.TitleVi,
        lesson.Chapter.TitleJp
    );
}
