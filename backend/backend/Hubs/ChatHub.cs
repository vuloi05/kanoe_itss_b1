using System.Security.Claims;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

/// <summary>
/// Real-time chat hub. Clients connect via WebSocket with a JWT in the
/// "access_token" query parameter (configured in Program.cs).
/// </summary>
[Authorize]
public class ChatHub : Hub
{
    private readonly IMessageService _messageService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IMessageService messageService, ILogger<ChatHub> logger)
    {
        _messageService = messageService;
        _logger = logger;
    }

    /// <summary>
    /// Called by the client to send a message to another user.
    /// Persists to DB via IMessageService, then pushes to the receiver's
    /// SignalR connection(s) using the UserProvider (NameIdentifier claim).
    /// </summary>
    /// <param name="receiverId">The target user's UserId (Guid as string).</param>
    /// <param name="content">Plain-text message body.</param>
    public async Task SendMessageAsync(Guid receiverId, string content)
    {
        // NameIdentifier is populated by JwtService — matches UserId in DB
        var senderIdString = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(senderIdString, out var senderId))
        {
            // Should never happen because [Authorize] guards the hub,
            // but guard defensively to avoid a NullReference crash.
            throw new HubException("Invalid sender identity.");
        }

        // Resolve the conversation between sender and receiver.
        // TODO: If a direct "find or create conversation" use-case is needed,
        // add a FindOrCreateConversationAsync method to IMessageService.
        var conversations = await _messageService.GetConversationsAsync(senderId);
        var conversation = conversations.FirstOrDefault(c =>
            (c.LearnerId == senderId && c.PartnerId == receiverId) ||
            (c.PartnerId == senderId && c.LearnerId == receiverId));

        if (conversation == null)
        {
            throw new HubException($"No conversation found between {senderId} and {receiverId}.");
        }

        // Persist to PostgreSQL via EF Core (translation also happens here)
        var messageDto = await _messageService.SendMessageAsync(senderId, conversation.ConversationId, content);

        _logger.LogInformation(
            "Message {MsgId} sent from {Sender} to {Receiver} in conversation {Conv}",
            messageDto.MessageId, senderId, receiverId, conversation.ConversationId);

        // Push to receiver — SignalR matches by the NameIdentifier claim value,
        // which is the string form of UserId set by JwtService.
        await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", messageDto);

        // Optionally echo back to the sender's other tabs/devices
        await Clients.Caller.SendAsync("MessageSent", messageDto);
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        _logger.LogInformation("SignalR connected: ConnectionId={ConnId} UserId={UserId}",
            Context.ConnectionId, userId ?? "anonymous");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        _logger.LogInformation("SignalR disconnected: ConnectionId={ConnId} UserId={UserId}",
            Context.ConnectionId, userId ?? "anonymous");
        await base.OnDisconnectedAsync(exception);
    }
}
