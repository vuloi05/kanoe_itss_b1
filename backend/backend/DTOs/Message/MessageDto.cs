namespace backend.DTOs.Message;

public class MessageDto
{
    public Guid MessageId { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Type { get; set; } = "TEXT";
    public string Content { get; set; } = string.Empty;
    public string? ContentTranslated { get; set; }
    public bool IsRead { get; set; }
    public DateTime Timestamp { get; set; }

    // Properties for LESSON_REQUEST type
    public Guid? LessonRequestId { get; set; }
    public string? LessonDate { get; set; }
    public string? LessonStartTime { get; set; }
    public string? LessonEndTime { get; set; }
    public int? LessonDuration { get; set; }
    public string? LessonStatus { get; set; }
}
