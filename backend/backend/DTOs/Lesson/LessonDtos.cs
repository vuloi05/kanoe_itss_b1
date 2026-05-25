namespace backend.DTOs.Lesson;

// ─── Response DTOs for Lesson List (chapters overview) ──────────────────────

public record ChapterWithLessonsDto(
    int ChapterId,
    string TitleVi,
    string TitleJp,
    string Icon,
    int SortOrder,
    List<LessonSummaryDto> Lessons
);

public record LessonSummaryDto(
    Guid LessonId,
    string SceneLabel,
    string SceneLabelJp,
    string TitleVi,
    string TitleJp,
    string? Tag,
    string? TagJp,
    int? DurationMinutes,
    bool IsLocked,
    bool IsCompleted,
    int Progress,
    int SortOrder
);

// ─── Response DTO for Lesson Detail ─────────────────────────────────────────

public record LessonDetailDto(
    Guid LessonId,
    string SceneLabel,
    string SceneLabelJp,
    string TitleVi,
    string TitleJp,
    string SubtitleVi,
    string SubtitleJp,
    string? Tag,
    string? TagJp,
    int? DurationMinutes,
    bool IsLocked,
    List<DialogueDto> Dialogues,
    List<ToneNoteDto> ToneNotes
);

public record DialogueDto(
    string Speaker,
    string SpeakerJp,
    string LineVi,
    string LineJp,
    bool IsActive,
    string? HighlightWordsJson
);

public record ToneNoteDto(
    string Tone,
    string DescVi,
    string DescJp,
    string Example,
    string Color
);
