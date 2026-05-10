using backend.DTOs.Auth;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly VietImmerseDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(VietImmerseDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
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

        // Prevent cross-role login (e.g. partner account logging in as learner)
        var requestedRole = request.Role.Trim().ToLowerInvariant();
        if (!string.Equals(user.Role, requestedRole, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException(
                $"Tài khoản này không phải là {(requestedRole == "learner" ? "học viên" : "đối tác")}. Vui lòng chọn đúng vai trò.");

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

        // Always return success to prevent email enumeration
        if (user is null) return;

        // Generate a simple reset token (in production, use a dedicated PasswordResetToken table)
        var resetToken = Guid.NewGuid().ToString("N");

        // Placeholder: log token to console instead of sending email
        Console.WriteLine("==================================================");
        Console.WriteLine($"🔑 PASSWORD RESET TOKEN for {email}:");
        Console.WriteLine($"   Token: {resetToken}");
        Console.WriteLine($"   URL: http://localhost:3000/reset-password?token={resetToken}");
        Console.WriteLine("==================================================");
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
            LastLoginAt: user.LastLoginAt
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
