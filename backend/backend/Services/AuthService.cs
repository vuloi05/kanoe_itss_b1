using System.Security.Cryptography;
using backend.DTOs.Auth;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly VietImmerseDbContext _db;
    private readonly IJwtService _jwt;
    private readonly IEmailService _email;
    private readonly ILogger<AuthService> _logger;

    public AuthService(VietImmerseDbContext db, IJwtService jwt, IEmailService email, ILogger<AuthService> logger)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterLearnerAsync(RegisterLearnerRequest request)
    {
        await EnsureEmailNotTaken(request.Email);

        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            DisplayName = request.DisplayName.Trim(),
            Role = "learner",
            AccountStatus = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        // Map V1-V5 level string to learner_level enum value
        var levelMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["v1"] = "basic",
            ["v2"] = "basic",
            ["v3"] = "intermediate",
            ["v4"] = "advanced",
            ["v5"] = "advanced",
        };

        var learnerProfile = new LearnerProfile
        {
            UserId = user.UserId,
            NativeLanguage = "ja",
            Goals = request.Level is not null && levelMap.TryGetValue(request.Level, out var _)
                ? request.Level
                : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            learnerProfile.UserId = user.UserId;
            _db.LearnerProfiles.Add(learnerProfile);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> RegisterPartnerAsync(RegisterPartnerRequest request)
    {
        await EnsureEmailNotTaken(request.Email);

        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            DisplayName = request.DisplayName.Trim(),
            Phone = request.Phone?.Trim(),
            Role = "partner",
            AccountStatus = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var partnerProfile = new PartnerProfile
        {
            UserId = user.UserId,
            Bio = request.Bio?.Trim(),
            AgeRange = request.AgeRange?.Trim(),
            Job = request.Job?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            partnerProfile.UserId = user.UserId;
            _db.PartnerProfiles.Add(partnerProfile);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.DeletedAt == null);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");

        if (user.AccountStatus == "suspended")
            throw new UnauthorizedAccessException("Tài khoản đã bị tạm khóa.");

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return BuildAuthResponse(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.DeletedAt == null);

        if (user is null)
            throw new KeyNotFoundException("Email không tồn tại trên hệ thống.");

        var tempPassword = GenerateTemporaryPassword(8);

        // Wrap in transaction so password is rolled back if email delivery fails
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
            user.PasswordChangedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var htmlBody = BuildForgotPasswordEmail(user.DisplayName, tempPassword);
            await _email.SendEmailAsync(email, "VietImmerse - Mật khẩu tạm thời", htmlBody);

            await transaction.CommitAsync();
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to send password reset email to {Email}.", email);
            throw new InvalidOperationException("Lỗi hệ thống: Không thể gửi email vào lúc này.", ex);
        }
    }

    /// <summary>
    /// Cryptographically secure random password with uppercase, lowercase, and digits.
    /// </summary>
    private static string GenerateTemporaryPassword(int length)
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghjkmnpqrstuvwxyz";
        const string digits = "23456789";
        var all = upper + lower + digits;

        // Guarantee at least one char from each category
        Span<char> password = stackalloc char[length];
        password[0] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
        password[1] = lower[RandomNumberGenerator.GetInt32(lower.Length)];
        password[2] = digits[RandomNumberGenerator.GetInt32(digits.Length)];

        for (var i = 3; i < length; i++)
            password[i] = all[RandomNumberGenerator.GetInt32(all.Length)];

        // Shuffle to avoid predictable positions
        for (var i = password.Length - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }

    private static string BuildForgotPasswordEmail(string displayName, string tempPassword)
    {
        return
            "<div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#faf9f6;border-radius:12px\">" +
            "<div style=\"text-align:center;margin-bottom:24px\">" +
            "<h1 style=\"color:#1a6b4a;font-size:22px;margin:0\">VietImmerse</h1>" +
            "</div>" +
            $"<p style=\"color:#333;font-size:15px\">Xin chào <strong>{displayName}</strong>,</p>" +
            "<p style=\"color:#333;font-size:15px\">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Dưới đây là mật khẩu tạm thời:</p>" +
            "<div style=\"background:#e8f5e9;border:1px dashed #1a6b4a;border-radius:8px;text-align:center;padding:16px;margin:24px 0\">" +
            $"<span style=\"font-size:28px;font-weight:bold;letter-spacing:4px;color:#1a6b4a\">{tempPassword}</span>" +
            "</div>" +
            "<p style=\"color:#333;font-size:15px\">Vui lòng đăng nhập bằng mật khẩu này và <strong>đổi mật khẩu ngay</strong> sau khi đăng nhập để bảo mật tài khoản.</p>" +
            "<hr style=\"border:none;border-top:1px solid #e0e0e0;margin:24px 0\" />" +
            "<p style=\"color:#999;font-size:12px;text-align:center\">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.<br/>\u00a9 2024 VietImmerse</p>" +
            "</div>";
    }

    public Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        // Placeholder: in production, validate token from DB and update password
        Console.WriteLine($"⚠️ ResetPassword called with token: {request.Token} (not yet implemented with DB token storage)");
        return Task.CompletedTask;
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không chính xác.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordChangedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<UserProfileResponse> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId && u.DeletedAt == null)
            ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");

        return new UserProfileResponse(
            UserId: user.UserId.ToString(),
            Email: user.Email,
            DisplayName: user.DisplayName,
            Role: user.Role,
            AvatarUrl: user.AvatarUrl,
            Phone: user.Phone,
            LanguagePref: user.LanguagePref,
            CreatedAt: user.CreatedAt,
            LastLoginAt: user.LastLoginAt,
            PasswordChangedAt: user.PasswordChangedAt
        );
    }

    private async Task EnsureEmailNotTaken(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email == normalizedEmail && u.DeletedAt == null);
        if (exists)
            throw new InvalidOperationException("Email này đã được sử dụng.");
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        return new AuthResponse(
            Token: _jwt.GenerateToken(user),
            UserId: user.UserId.ToString(),
            Email: user.Email,
            DisplayName: user.DisplayName,
            Role: user.Role,
            AvatarUrl: user.AvatarUrl
        );
    }
}
