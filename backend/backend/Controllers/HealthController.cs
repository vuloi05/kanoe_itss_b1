using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Health check that also pings the database.
/// Used by cron-job services and frontend warm-up pings to prevent both Render backend and Database cold starts.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly VietImmerseDbContext _context;

    public HealthController(VietImmerseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Ping()
    {
        try
        {
            // Execute a lightweight command to keep the database awake
            bool isDbAlive = await _context.Database.CanConnectAsync();
            return Ok(new 
            { 
                status = "ok", 
                database = isDbAlive ? "connected" : "disconnected",
                timestamp = DateTime.UtcNow 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                status = "error", 
                message = ex.Message,
                timestamp = DateTime.UtcNow 
            });
        }
    }
}
