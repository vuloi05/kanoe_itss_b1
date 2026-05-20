using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;
using backend.Models;

namespace backend.Hubs;

/// <summary>
/// SignalR hub for real-time messaging, booking events, and user presence.
/// Tracks active connections to accurately determine online status.
/// </summary>
[Authorize]
public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<Guid, HashSet<string>> _userConnections = new();
    private readonly ILogger<ChatHub> _logger;
    private readonly IServiceProvider _serviceProvider;

    public ChatHub(ILogger<ChatHub> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public override async Task OnConnectedAsync()
    {
        var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdString, out Guid userId))
        {
            var connections = _userConnections.GetOrAdd(userId, _ => new HashSet<string>());
            
            bool isFirstConnection;
            lock (connections)
            {
                isFirstConnection = connections.Count == 0;
                connections.Add(Context.ConnectionId);
            }

            if (isFirstConnection)
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<VietImmerseDbContext>();
                var user = await db.Users.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = true;
                    user.LastSeen = DateTime.UtcNow;
                    await db.SaveChangesAsync();

                    await Clients.Group("global-presence").SendAsync("UserOnline", new { userId = user.UserId, role = user.Role, lastSeen = user.LastSeen });
                }
            }
        }
        
        _logger.LogInformation("Connection {ConnectionId} connected for user {UserId}", Context.ConnectionId, userIdString);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdString, out Guid userId))
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                bool isLastConnection;
                lock (connections)
                {
                    connections.Remove(Context.ConnectionId);
                    isLastConnection = connections.Count == 0;
                }

                if (isLastConnection)
                {
                    _userConnections.TryRemove(userId, out _);

                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<VietImmerseDbContext>();
                    var user = await db.Users.FindAsync(userId);
                    if (user != null)
                    {
                        user.IsOnline = false;
                        user.LastSeen = DateTime.UtcNow;
                        await db.SaveChangesAsync();

                        await Clients.Group("global-presence").SendAsync("UserOffline", new { userId = user.UserId, role = user.Role, lastSeen = user.LastSeen });
                    }
                }
            }
        }

        _logger.LogInformation("Connection {ConnectionId} disconnected", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Client joins a conversation group to receive real-time messages and booking events.
    /// </summary>
    public async Task JoinConversation(Guid conversationId)
    {
        var groupName = $"conversation-{conversationId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Connection {ConnectionId} joined group {Group}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Client leaves a conversation group.
    /// </summary>
    public async Task LeaveConversation(Guid conversationId)
    {
        var groupName = $"conversation-{conversationId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Connection {ConnectionId} left group {Group}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Client joins the global presence group to receive online/offline broadcasts.
    /// </summary>
    public async Task JoinPresence()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "global-presence");
    }

    /// <summary>
    /// Client leaves the global presence group.
    /// </summary>
    public async Task LeavePresence()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "global-presence");
    }
}
