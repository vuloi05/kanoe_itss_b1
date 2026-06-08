using System.Text;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using PayOS;

// Load .env from project root (shared config for all services)
var rootEnvPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
if (File.Exists(rootEnvPath))
    DotNetEnv.Env.Load(rootEnvPath);

// Fallback: load local .env if exists (for dev-specific overrides)
if (File.Exists(".env"))
    DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContextPool<VietImmerseDbContext>(options =>
    options.UseNpgsql(connectionString)
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)), poolSize: 128);

// JWT Authentication
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? throw new InvalidOperationException("JWT_SECRET environment variable is not set");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "VietImmerse";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "VietImmerseApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero,
        };

        // Allow SignalR to receive JWT from query string (WebSocket doesn't support Authorization header)
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

// DI: Application services
builder.Services.AddHttpClient();
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IPhotoService, CloudinaryPhotoService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddSingleton<ITranslationService, TranslationService>();
builder.Services.AddScoped<ITtsService, FptTtsService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IMatchingService, MatchingService>();
builder.Services.AddSingleton<OpenAiWhisperService>();
builder.Services.AddSingleton<FptAsrService>();
builder.Services.AddScoped<IAsrService, FallbackAsrService>();
builder.Services.AddScoped<AzurePronunciationService>();
builder.Services.AddScoped<IVoiceScoringService, VoiceScoringService>();
builder.Services.AddHostedService<OtpCleanupBackgroundService>();

// SignalR (Realtime Messaging — replaces Supabase Realtime)
builder.Services.AddSignalR();

builder.Services.AddMemoryCache();

// PayOS setup
var payOSClientId = Environment.GetEnvironmentVariable("PAYOS_CLIENT_ID") ?? "";
var payOSApiKey = Environment.GetEnvironmentVariable("PAYOS_API_KEY") ?? "";
var payOSChecksumKey = Environment.GetEnvironmentVariable("PAYOS_CHECKSUM_KEY") ?? "";
var payOSOptions = new PayOSOptions
{
    ClientId = payOSClientId,
    ApiKey = payOSApiKey,
    ChecksumKey = payOSChecksumKey
};
builder.Services.AddSingleton(new PayOSClient(payOSOptions));

// CORS: read allowed origins from env var (comma-separated), fallback to localhost for dev
var corsOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS")
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? new[] { "http://localhost:3000", "http://localhost:3001" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddRateLimiter(options =>
{
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(new { error = "Bạn thao tác quá nhanh, vui lòng thử lại sau vài giây." }, cancellationToken: token);
    };

    options.AddPolicy("GlobalPolicy", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ =>
            new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            });
    });

    options.AddPolicy("VoiceLabPolicy", httpContext =>
    {
        var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var partitionKey = !string.IsNullOrEmpty(userId) ? userId : (httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
        
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ =>
            new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1)
            });
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Required for reverse proxies (Render, Azure, etc.) to forward original scheme/IP
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
                     | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto,
});

// Global error handler — ensures CORS headers are present even on unhandled exceptions
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = "Đã xảy ra lỗi máy chủ." });
    });
});

app.UseStaticFiles();

// CORS must run before auth so preflight OPTIONS requests get proper headers
app.UseCors("AllowFrontend");

// Only redirect in dev; reverse proxy (Render) already handles TLS termination
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

// ---- DATABASE HEALTH CHECK & SEED ----
// Schema is managed by schema.sql (applied by Supabase/Docker), NOT by EF Core Migrations.
const int maxRetries = 5;
const int retryDelayMs = 3000;

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            var context = services.GetRequiredService<VietImmerseDbContext>();

            // Verify database connectivity (no migration — schema.sql handles DDL)
            var canConnect = await context.Database.CanConnectAsync();
            if (!canConnect)
                throw new InvalidOperationException("Database is not reachable");

            Console.WriteLine("==================================================");
            Console.WriteLine("🎉 KẾT NỐI DATABASE POSTGRESQL THÀNH CÔNG! 🎉");
            Console.WriteLine("==================================================");

            // ── Seed data from SQL file (idempotent UPSERT — safe for existing data) ──
            await DatabaseSeeder.SeedAsync(context, logger);

            break;
        }
        catch (Exception ex) when (attempt < maxRetries)
        {
            Console.WriteLine($"⚠️  Database connection attempt {attempt}/{maxRetries} failed: {ex.Message}");
            Console.WriteLine($"    Retrying in {retryDelayMs}ms...");
            Thread.Sleep(retryDelayMs);
        }
        catch (Exception ex)
        {
            Console.WriteLine("==================================================");
            Console.WriteLine($"❌ ĐÃ XẢY RA LỖI KHI KẾT NỐI DATABASE: {ex.Message}");
            Console.WriteLine("==================================================");
        }
    }
}
// ---------------------------------------------

app.MapControllers().RequireRateLimiting("GlobalPolicy");
app.MapHub<ChatHub>("/chathub");

app.Run();