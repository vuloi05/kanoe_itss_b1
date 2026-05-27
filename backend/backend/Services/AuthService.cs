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
            user.LearnerProfile = learnerProfile;
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
        var user = await _db.Users
            .Include(u => u.LearnerProfile)
            .FirstOrDefaultAsync(u => u.Email == email && u.DeletedAt == null);

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

        // Clean up any old requests for this email to be clean
        var oldResets = await _db.PasswordResets.Where(r => r.Email == email).ToListAsync();
        if (oldResets.Any())
        {
            _db.PasswordResets.RemoveRange(oldResets);
        }

        var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        var passwordReset = new PasswordReset
        {
            Email = email,
            OtpCode = otpCode,
            OtpExpiresAt = DateTime.UtcNow.AddMinutes(5), // 5 minutes expiration
            CreatedAt = DateTime.UtcNow
        };

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            _db.PasswordResets.Add(passwordReset);
            await _db.SaveChangesAsync();

            var htmlBody = BuildOtpForgotPasswordEmail(user.DisplayName, otpCode);
            await _email.SendEmailAsync(email, "VietImmerse - Mã xác thực OTP đặt lại mật khẩu", htmlBody);

            await transaction.CommitAsync();
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to send OTP email to {Email}.", email);
            throw new InvalidOperationException("Lỗi hệ thống: Không thể gửi email xác thực vào lúc này.", ex);
        }
    }

    public async Task<string> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var otp = request.Otp.Trim();

        var record = await _db.PasswordResets
            .Where(r => r.Email == email && r.OtpCode == otp && r.ResetToken == null)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        if (record is null)
            throw new UnauthorizedAccessException("Mã OTP không chính xác.");

        if (record.OtpExpiresAt < DateTime.UtcNow)
        {
            _db.PasswordResets.Remove(record);
            await _db.SaveChangesAsync();
            throw new UnauthorizedAccessException("Mã OTP đã hết hạn.");
        }

        // Generate reset token
        var resetToken = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32));

        record.ResetToken = resetToken;
        record.TokenExpiresAt = DateTime.UtcNow.AddMinutes(10); // Token valid for 10 minutes
        await _db.SaveChangesAsync();

        return resetToken;
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var token = request.Token.Trim();
        var record = await _db.PasswordResets
            .Where(r => r.ResetToken == token)
            .FirstOrDefaultAsync();

        if (record is null)
            throw new UnauthorizedAccessException("Mã khôi phục không hợp lệ hoặc đã hết hạn.");

        if (record.TokenExpiresAt < DateTime.UtcNow)
        {
            _db.PasswordResets.Remove(record);
            await _db.SaveChangesAsync();
            throw new UnauthorizedAccessException("Phiên khôi phục đã hết hạn. Vui lòng thực hiện lại từ đầu.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == record.Email && u.DeletedAt == null);
        if (user is null)
            throw new KeyNotFoundException("Không tìm thấy tài khoản tương ứng.");

        // Validate that new password is not the same as the old password
        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            throw new InvalidOperationException("Mật khẩu mới không được trùng với mật khẩu hiện tại của tài khoản.");

        // Hash and update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordChangedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        // Remove the reset record
        _db.PasswordResets.Remove(record);
        await _db.SaveChangesAsync();
    }

    private static string BuildOtpForgotPasswordEmail(string displayName, string otpCode)
    {
        return
            "<div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#faf9f6;border-radius:12px\">" +
            "<div style=\"text-align:center;margin-bottom:24px\">" +
            "<h1 style=\"color:#1a6b4a;font-size:22px;margin:0\">VietImmerse</h1>" +
            "</div>" +
            $"<p style=\"color:#333;font-size:15px\">Xin chào <strong>{displayName}</strong>,</p>" +
            "<p style=\"color:#333;font-size:15px\">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Dưới đây là mã xác thực OTP của bạn:</p>" +
            "<div style=\"background:#e8f5e9;border:1px dashed #1a6b4a;border-radius:8px;text-align:center;padding:16px;margin:24px 0\">" +
            $"<span style=\"font-size:32px;font-weight:bold;letter-spacing:6px;color:#1a6b4a\">{otpCode}</span>" +
            "</div>" +
            "<p style=\"color:#c62828;font-weight:bold;font-size:14px\">Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút và chỉ được sử dụng một lần.</p>" +
            "<p style=\"color:#333;font-size:15px\">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này để giữ an toàn cho tài khoản.</p>" +
            "<hr style=\"border:none;border-top:1px solid #e0e0e0;margin:24px 0\" />" +
            "<p style=\"color:#999;font-size:12px;text-align:center\">Đây là email tự động, vui lòng không trả lời thư này.<br/>\u00a9 2026 VietImmerse</p>" +
            "</div>";
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không chính xác.");

        // Validate that new password is not the same as the old password
        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            throw new InvalidOperationException("Mật khẩu mới không được trùng với mật khẩu hiện tại.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordChangedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<UserProfileResponse> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .Include(u => u.LearnerProfile)
            .FirstOrDefaultAsync(u => u.UserId == userId && u.DeletedAt == null)
            ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");

        return new UserProfileResponse(
            UserId: user.UserId.ToString(),
            Email: user.Email,
            DisplayName: user.DisplayName,
            Role: user.Role,
            AvatarUrl: user.AvatarUrl,
            Level: user.LearnerProfile?.Goals,
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
            , Level: user.LearnerProfile?.Goals
        );
    }
}
