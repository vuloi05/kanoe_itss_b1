import * as signalR from "@microsoft/signalr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let connection: signalR.HubConnection | null = null;

/**
 * Singleton SignalR connection to /chathub.
 * Lazily created on first call, auto-reconnects with exponential backoff.
 * JWT token is sent via query string (WebSocket doesn't support Authorization header).
 */
export function getSignalRConnection(): signalR.HubConnection {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/chathub`, {
      accessTokenFactory: () => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("auth_token") || "";
      },
    })
    .withAutomaticReconnect([0, 1000, 3000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

/**
 * Start the SignalR connection if not already connected.
 * Safe to call multiple times — idempotent.
 */
export async function ensureConnected(): Promise<signalR.HubConnection> {
  const conn = getSignalRConnection();

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
      console.log("[SignalR] Connected");
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
    }
  }

  return conn;
}

/**
 * Stop the SignalR connection entirely.
 */
export async function stopConnection(): Promise<void> {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    await connection.stop();
    console.log("[SignalR] Disconnected");
  }
}
