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
    private readonly PresenceTracker _presence;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IMessageService messageService, PresenceTracker presence, ILogger<ChatHub> logger)
    {
        _messageService = messageService;
        _presence = presence;
        _logger = logger;
    }

    // ─── Presence Lifecycle ────────────────────────────────────────────────────

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null)
        {
            bool isFirstConnection = _presence.UserConnected(userId, Context.ConnectionId);

            if (isFirstConnection)
            {
                // Notify everyone else that this user just came online
                await Clients.Others.SendAsync("UserIsOnline", userId);
            }

            // Send the full online list to the caller so they can hydrate their UI
            var onlineIds = _presence.GetOnlineUserIds();
            await Clients.Caller.SendAsync("GetOnlineUsers", onlineIds);

            _logger.LogInformation(
                "SignalR connected: ConnectionId={ConnId} UserId={UserId} FirstConnection={First}",
                Context.ConnectionId, userId, isFirstConnection);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null)
        {
            bool wentOffline = _presence.UserDisconnected(userId, Context.ConnectionId);

            if (wentOffline)
            {
                // All tabs/devices for this user are gone — notify others
                await Clients.Others.SendAsync("UserIsOffline", userId);

                _logger.LogInformation(
                    "SignalR disconnected (fully offline): ConnectionId={ConnId} UserId={UserId}",
                    Context.ConnectionId, userId);
            }
            else
            {
                _logger.LogInformation(
                    "SignalR disconnected (still has other connections): ConnectionId={ConnId} UserId={UserId}",
                    Context.ConnectionId, userId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    // ─── Messaging ─────────────────────────────────────────────────────────────

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
}
