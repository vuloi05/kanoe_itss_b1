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
    private readonly ILessonService _lessonService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(VietImmerseDbContext db, IJwtService jwt, IEmailService email, ILessonService lessonService, ILogger<AuthService> logger)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
        _lessonService = lessonService;
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

        // Normalize level string for storage (e.g. "v2" → "V2")
        var normalizedLevel = request.Level?.Trim().ToUpperInvariant();
        var isValidLevel = normalizedLevel is not null && levelMap.ContainsKey(normalizedLevel);

        var learnerProfile = new LearnerProfile
        {
            UserId = user.UserId,
            NativeLanguage = "ja",
            CurrentLevel = isValidLevel ? normalizedLevel! : "V1",
            Goals = isValidLevel ? normalizedLevel : null,
            DailyStudySeconds = 0,
            DailyStudyDate = DateOnly.FromDateTime(DateTime.UtcNow),
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

            // Auto-complete lessons below registered level
            if (request.Level is not null)
            {
                await _lessonService.InitProgressForLevelAsync(user.UserId, request.Level);
            }

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

    // Target vocabulary count per level — used by Weighted Mastery algorithm
    private static readonly Dictionary<string, int> TargetVocabByLevel = new(StringComparer.OrdinalIgnoreCase)
    {
        ["V1"] = 500,
        ["V2"] = 1000,
        ["V3"] = 1500,
    };

    // Map level string → content_levels.level_id
    private static readonly Dictionary<string, int> LevelIdMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["V1"] = 1,
        ["V2"] = 2,
        ["V3"] = 3,
    };

    public async Task<UserProfileResponse> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .Include(u => u.LearnerProfile)
            .Include(u => u.PartnerProfile)
            .FirstOrDefaultAsync(u => u.UserId == userId && u.DeletedAt == null)
            ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");

        // Count unique vocabulary words only for learner accounts
        var vocabCount = user.LearnerProfile != null
            ? await _db.LearnerVocabularies
                .CountAsync(v => v.LearnerProfileId == user.LearnerProfile.ProfileId)
            : 0;

        // Safely compute average tone accuracy from Voice Lab records.
        // Cast to (double?) so SQL returns NULL for empty set instead of throwing.
        var avgToneAccuracy = 0;
        if (user.Role == "learner")
        {
            double? avgResult = await _db.VoiceLabRecords
                .Where(v => v.UserId == user.UserId && v.AccuracyScore != null)
                .AverageAsync(v => (double?)v.AccuracyScore);

            avgToneAccuracy = (int)Math.Round(avgResult ?? 0);
        }

        // ── Weighted Mastery Calculation (40-40-20) ──────────────────────
        var currentLevel = user.LearnerProfile?.CurrentLevel ?? "V1";
        var masteryPercentage = 0;

        if (user.Role == "learner")
        {
            var levelId = LevelIdMap.TryGetValue(currentLevel, out var lid) ? lid : 1;

            // Var 1 — LessonProgress (40%): completed / total lessons in current level
            var totalLessons = await _db.Lessons
                .CountAsync(l => l.Chapter.LevelId == levelId);

            var completedLessons = totalLessons > 0
                ? await _db.LessonProgresses
                    .CountAsync(p => p.UserId == userId
                                  && p.IsCompleted
                                  && p.Lesson.Chapter.LevelId == levelId)
                : 0;

            double lessonProgress = totalLessons > 0
                ? completedLessons * 100.0 / totalLessons
                : 0;

            // Var 2 — ToneAccuracy (40%): reuse avgToneAccuracy already queried above
            double toneAccuracy = avgToneAccuracy;

            // Var 3 — VocabCoverage (20%): reuse vocabCount already queried above
            var targetVocab = TargetVocabByLevel.TryGetValue(currentLevel, out var tv) ? tv : 500;
            double vocabCoverage = targetVocab > 0
                ? Math.Min(vocabCount * 100.0 / targetVocab, 100.0)
                : 0;

            double mastery = (lessonProgress * 0.4) + (toneAccuracy * 0.4) + (vocabCoverage * 0.2);
            masteryPercentage = Math.Clamp((int)Math.Round(mastery), 0, 100);
        }

        // Calculate daily study hours
        // If daily_study_date != today, reset to 0 and update date
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var learnerProfile = user.LearnerProfile;

        if (learnerProfile != null)
        {
            // Reset counter if it's a new day
            if (learnerProfile.DailyStudyDate != today)
            {
                learnerProfile.DailyStudySeconds = 0;
                learnerProfile.DailyStudyDate = today;
                learnerProfile.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                // Reload from DB to get fresh data
                await _db.Entry(learnerProfile).ReloadAsync();
            }
        }

        // Always recalculate from current learnerProfile value
        var dailyStudyHours = learnerProfile?.DailyStudySeconds / 3600.0 ?? 0;

        // ── Streak Expiry Check ──────────────────────────────────────
        // If the learner hasn't studied today or yesterday, their streak is broken → reset to 0.
        if (learnerProfile is not null)
        {
            var lastStudyDay = learnerProfile.LastStudyDate?.Date;
            var todayDate = DateTime.UtcNow.Date;
            var yesterdayDate = todayDate.AddDays(-1);

            if (lastStudyDay is not null && lastStudyDay != todayDate && lastStudyDay != yesterdayDate)
            {
                learnerProfile.CurrentStreak = 0;
                learnerProfile.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        var currentStreak = learnerProfile?.CurrentStreak ?? 0;

        return new UserProfileResponse(
            UserId: user.UserId.ToString(),
            Email: user.Email,
            DisplayName: user.DisplayName,
            Role: user.Role,
            AvatarUrl: user.AvatarUrl,
            Level: user.LearnerProfile?.Goals,
            Phone: user.Phone,
            LanguagePref: user.LanguagePref,
            Bio: user.PartnerProfile?.Bio,
            CurrentStreak: currentStreak,
            LearnedVocabCount: vocabCount,
            AverageToneAccuracy: avgToneAccuracy,
            TotalStudyHours: (decimal)dailyStudyHours,
            CurrentLevel: currentLevel,
            MasteryPercentage: masteryPercentage,
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
