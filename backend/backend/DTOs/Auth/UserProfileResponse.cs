namespace backend.DTOs.Auth;

public record UserProfileResponse(
    string UserId,
    string Email,
    string DisplayName,
    string Role,
    string? AvatarUrl,
    string? Level,
    string? Phone,
    string? LanguagePref,
    string? Bio,
    int CurrentStreak,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    DateTime? PasswordChangedAt
);

