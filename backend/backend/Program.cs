using System.Text;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// Load .env before building configuration
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
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
    });
builder.Services.AddAuthorization();

// DI: Application services
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

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

// ---- AUTO-MIGRATE & KIỂM TRA KẾT NỐI DATABASE ----
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<VietImmerseDbContext>();

        // Apply pending migrations on startup (creates tables in fresh Docker DB)
        context.Database.Migrate();

        Console.WriteLine("==================================================");
        Console.WriteLine("🎉 KẾT NỐI DATABASE POSTGRESQL THÀNH CÔNG! 🎉");
        Console.WriteLine("📦 Migrations applied successfully.");
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
    }
    catch (Exception ex)
    {
        Console.WriteLine("==================================================");
        Console.WriteLine($"❌ ĐÃ XẢY RA LỖI KHI KẾT NỐI DATABASE: {ex.Message}");
        Console.WriteLine("==================================================");
    }
}
// ---------------------------------------------

app.MapControllers();

app.Run();
