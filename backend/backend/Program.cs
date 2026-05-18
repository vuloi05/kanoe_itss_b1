using System.Text;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// Load .env from project root (shared config for all services)
var rootEnvPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
if (File.Exists(rootEnvPath))
    DotNetEnv.Env.Load(rootEnvPath);

// Fallback: load local .env if exists (for dev-specific overrides)
if (File.Exists(".env"))
    DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Reads ConnectionStrings__DefaultConnection from env (Docker/Supabase) or appsettings.json fallback
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<VietImmerseDbContext>(options =>
    options.UseNpgsql(connectionString));

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

        // SignalR WebSocket transports cannot send custom HTTP headers after the
        // initial upgrade, so the client appends ?access_token=<jwt> to the URL.
        // This event reads it and places it into the Authorization context.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/chathub"))
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

// SignalR — registers the hub infrastructure and WebSocket support
builder.Services.AddSignalR();
// Singleton presence tracker: shared across all ChatHub instances
builder.Services.AddSingleton<backend.Hubs.PresenceTracker>();
builder.Services.AddSingleton<ITranslationService, TranslationService>();

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

// ---- SAFE AUTO-MIGRATE ON STARTUP ----
// MigrateAsync() only applies migrations not yet in __EFMigrationsHistory.
// It NEVER drops columns or tables — existing data is always preserved.
await using (var scope = app.Services.CreateAsyncScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<VietImmerseDbContext>();

        logger.LogInformation("Đang kiểm tra và cập nhật Database...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Database đã được cập nhật thành công.");

        // Seed sample learner account (idempotent – skips if already exists)
        const string sampleLearnerEmail = "abc@gmail.com";
        if (!context.Users.Any(u => u.Email == sampleLearnerEmail))
        {
            var user = new backend.Models.User
            {
                Email = sampleLearnerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234567890"),
                DisplayName = "Học viên Demo",
                Role = "learner",
                AccountStatus = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var learnerProfile = new backend.Models.LearnerProfile
            {
                UserId = user.UserId,
                NativeLanguage = "ja",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            context.LearnerProfiles.Add(learnerProfile);
            await context.SaveChangesAsync();

            logger.LogInformation("Seeded learner account: {Email}", sampleLearnerEmail);
        }

        // Seed sample partner account (idempotent – skips if already exists)
        const string samplePartnerEmail = "doitac@gmail.com";
        if (!context.Users.Any(u => u.Email == samplePartnerEmail))
        {
            var partnerUser = new backend.Models.User
            {
                Email = samplePartnerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234567890"),
                DisplayName = "Đối tác Demo",
                Role = "partner",
                AccountStatus = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            context.Users.Add(partnerUser);
            await context.SaveChangesAsync();

            var partnerProfile = new backend.Models.PartnerProfile
            {
                UserId = partnerUser.UserId,
                Bio = "Tài khoản đối tác demo",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            context.PartnerProfiles.Add(partnerProfile);
            await context.SaveChangesAsync();

            logger.LogInformation("Seeded partner account: {Email}", samplePartnerEmail);
        }

        // Seed sample conversation between learner and partner
        var learner = context.Users.FirstOrDefault(u => u.Email == "abc@gmail.com");
        var partner = context.Users.FirstOrDefault(u => u.Email == "doitac@gmail.com");

        if (learner != null && partner != null && !context.Conversations.Any(c => c.LearnerId == learner.UserId && c.PartnerId == partner.UserId))
        {
            var conversation = new backend.Models.Conversation
            {
                LearnerId = learner.UserId,
                PartnerId = partner.UserId,
                CreatedAt = DateTime.UtcNow
            };
            context.Conversations.Add(conversation);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded conversation between {Learner} and {Partner} (ID: {Id})",
                learner.Email, partner.Email, conversation.ConversationId);
        }
    }
    catch (Exception ex)
    {
        // Log full exception chain to console for easy Docker log debugging
        var logger2 = services.GetRequiredService<ILogger<Program>>();
        logger2.LogError(ex, "FATAL: Database migration or seeding failed. Application will exit.");
        throw; // Re-throw so the container exits with non-zero code and is visible in orchestrators
    }
}
// -----------------------------------------------

app.MapControllers();

// Map the SignalR hub endpoint
app.MapHub<ChatHub>("/chathub");

app.Run();
