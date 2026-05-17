namespace backend.DTOs.Auth;

public record AuthResponse(
    string Token,
    string UserId,
    string Email,
    string DisplayName,
    string Role,
    string? AvatarUrl
);
