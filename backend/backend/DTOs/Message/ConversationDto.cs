namespace backend.DTOs.Message;

public class ConversationDto
{
    public Guid ConversationId { get; set; }
    public Guid PartnerId { get; set; }
    public Guid LearnerId { get; set; }
    public string PartnerName { get; set; } = string.Empty;
    public string LearnerName { get; set; } = string.Empty;
    public string? PartnerAvatarUrl { get; set; }
    public string? LastMessage { get; set; }
    public string? LastMessageType { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
