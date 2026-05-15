namespace backend.DTOs.Auth;

public record UserProfileResponse(
    string UserId,
    string Email,
    string DisplayName,
    string? DisplayNameJa,
    string Role,
    string? AvatarUrl,
    string? Phone,
    string? LanguagePref,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    DateTime? PasswordChangedAt
);
