using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Lightweight health check — no DB query, no auth.
/// Used by cron-job services and frontend warm-up pings to prevent Render cold starts.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Ping() => Ok(new { status = "ok", timestamp = DateTime.UtcNow });
}
