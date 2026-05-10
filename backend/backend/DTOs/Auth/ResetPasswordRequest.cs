using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public record ResetPasswordRequest(
    [Required]
    string Token,

    [Required][MinLength(8)][MaxLength(128)]
    string NewPassword
);
