using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public record ChangePasswordRequest(
    [Required]
    string CurrentPassword,

    [Required][MinLength(8)][MaxLength(128)]
    string NewPassword
);
