using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace backend.Services;

public class OtpCleanupBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OtpCleanupBackgroundService> _logger;

    public OtpCleanupBackgroundService(IServiceProvider serviceProvider, ILogger<OtpCleanupBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OtpCleanupBackgroundService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<VietImmerseDbContext>();

                var now = DateTime.UtcNow;
                var expiredResets = await db.PasswordResets
                    .Where(o => (o.ResetToken == null && o.OtpExpiresAt < now) 
                             || (o.ResetToken != null && o.TokenExpiresAt < now))
                    .ToListAsync(stoppingToken);

                if (expiredResets.Count > 0)
                {
                    db.PasswordResets.RemoveRange(expiredResets);
                    await db.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Cleaned up {Count} expired OTP/token password reset records.", expiredResets.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing OTP cleanup background service.");
            }

            // Run cleanup every 1 minute
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }

        _logger.LogInformation("OtpCleanupBackgroundService is stopping.");
    }
}
