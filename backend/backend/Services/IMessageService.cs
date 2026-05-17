using backend.DTOs.Message;

namespace backend.Services;

public interface IMessageService
{
    Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId);
    Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid conversationId, int page, int pageSize);
    Task<MessageDto> SendMessageAsync(Guid senderId, Guid conversationId, string text);
    Task MarkAsReadAsync(Guid conversationId, Guid userId);
}
