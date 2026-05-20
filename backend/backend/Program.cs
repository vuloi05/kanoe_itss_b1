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

// ---- AUTO-MIGRATE & DATABASE HEALTH CHECK ----
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

            // Log pending migrations before applying
            var pending = (await context.Database.GetPendingMigrationsAsync()).ToList();
            var applied = (await context.Database.GetAppliedMigrationsAsync()).ToList();

            logger.LogInformation("Database migration check: {Applied} applied, {Pending} pending",
                applied.Count, pending.Count);

            if (pending.Count > 0)
            {
                logger.LogInformation("Applying {Count} pending migration(s): {Migrations}",
                    pending.Count, string.Join(", ", pending));
            }

            // Apply pending migrations (creates tables for fresh DB, adds columns for existing DB)
            // Safe: EF Core only runs new migrations — never drops tables or deletes data
            await context.Database.MigrateAsync();

            Console.WriteLine("==================================================");
            Console.WriteLine("🎉 KẾT NỐI DATABASE POSTGRESQL THÀNH CÔNG! 🎉");
            Console.WriteLine($"📦 Migrations: {applied.Count} applied, {pending.Count} newly applied.");
            Console.WriteLine("==================================================");

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
                context.SaveChanges();

                var learnerProfile = new backend.Models.LearnerProfile
                {
                    UserId = user.UserId,
                    NativeLanguage = "ja",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                context.LearnerProfiles.Add(learnerProfile);
                context.SaveChanges();

                Console.WriteLine($"🌱 Seeded learner account: {sampleLearnerEmail}");
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
                context.SaveChanges();

                var partnerProfile = new backend.Models.PartnerProfile
                {
                    UserId = partnerUser.UserId,
                    Bio = "Tài khoản đối tác demo",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                context.PartnerProfiles.Add(partnerProfile);
                context.SaveChanges();

                Console.WriteLine($"🌱 Seeded partner account: {samplePartnerEmail}");
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
                context.SaveChanges();
                Console.WriteLine($"🌱 Seeded conversation between {learner.Email} and {partner.Email} (ID: {conversation.ConversationId})");
            }

            // Migration succeeded — break out of retry loop
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
