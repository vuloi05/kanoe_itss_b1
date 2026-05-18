namespace backend.DTOs.Message;

public class MessageDto
{
    public Guid MessageId { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ContentTranslated { get; set; }
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
}
