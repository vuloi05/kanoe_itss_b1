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
    int LearnedVocabCount,
    int AverageToneAccuracy,
    decimal TotalStudyHours,
    string CurrentLevel,
    int MasteryPercentage,
    int ProfileCompletionRate,
    int CompletedSessions,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    DateTime? PasswordChangedAt
);
