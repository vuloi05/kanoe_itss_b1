const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let warmUpFired = false;

/**
 * Fire-and-forget ping to wake up the backend on Render free tier.
 * Runs once per browser session — subsequent calls are no-ops.
 * Uses the lightweight /api/health endpoint (no DB, no auth).
 */
export function warmUpBackend(): void {
  if (warmUpFired) return;
  warmUpFired = true;

  fetch(`${API_BASE_URL}/api/health`, { method: "GET", mode: "cors" }).catch(
    () => {
      // Silently ignore — this is a best-effort warm-up
    }
  );
}
