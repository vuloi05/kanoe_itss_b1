using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public record ForgotPasswordRequest(
    [Required][EmailAddress]
    string Email
);
