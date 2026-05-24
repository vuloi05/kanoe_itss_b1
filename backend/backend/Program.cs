using System.Text;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;

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
builder.Services.AddDbContext<VietImmerseDbContext>(options =>
    options.UseNpgsql(connectionString)
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

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
builder.Services.AddScoped<IAsrService, OpenAiWhisperService>();
builder.Services.AddSingleton<IVoiceScoringService, VoiceScoringService>();

// SignalR (Realtime Messaging — replaces Supabase Realtime)
builder.Services.AddSignalR();

// CORS: allow frontend dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

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

app.MapControllers();
app.MapHub<ChatHub>("/chathub");

app.Run();
