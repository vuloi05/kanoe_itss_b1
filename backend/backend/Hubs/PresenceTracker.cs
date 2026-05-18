using System.Collections.Concurrent;

namespace backend.Hubs;

/// <summary>
/// Tracks which SignalR ConnectionIds belong to each UserId.
/// Registered as a Singleton so all hub instances share the same in-memory state.
/// Thread-safe via ConcurrentDictionary + lock on the inner HashSet.
/// </summary>
public sealed class PresenceTracker
{
    // Key: UserId (string), Value: set of active ConnectionIds for that user
    private readonly ConcurrentDictionary<string, HashSet<string>> _connections =
        new(StringComparer.Ordinal);

    /// <summary>
    /// Adds a connection for the given user.
    /// Returns true if this is the user's FIRST connection (was offline before).
    /// </summary>
    public bool UserConnected(string userId, string connectionId)
    {
        lock (_connections)
        {
            if (!_connections.TryGetValue(userId, out var ids))
            {
                ids = new HashSet<string>(StringComparer.Ordinal);
                _connections[userId] = ids;
            }

            bool wasOffline = ids.Count == 0;
            ids.Add(connectionId);
            return wasOffline;
        }
    }

    /// <summary>
    /// Removes a connection for the given user.
    /// Returns true if the user now has NO remaining connections (went offline).
    /// </summary>
    public bool UserDisconnected(string userId, string connectionId)
    {
        lock (_connections)
        {
            if (!_connections.TryGetValue(userId, out var ids))
                return false;

            ids.Remove(connectionId);

            if (ids.Count == 0)
            {
                _connections.TryRemove(userId, out _);
                return true; // user is now fully offline
            }

            return false;
        }
    }

    /// <summary>Returns a snapshot list of all currently online UserIds.</summary>
    public IReadOnlyList<string> GetOnlineUserIds()
    {
        lock (_connections)
        {
            return _connections.Keys.ToList();
        }
    }
}
