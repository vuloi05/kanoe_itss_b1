using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public record RegisterLearnerRequest(
    [Required][EmailAddress][StringLength(255)]
    string Email,

    [Required][MinLength(8)][MaxLength(128)]
    string Password,

    [Required][StringLength(100)]
    string DisplayName,

    // Vietnamese proficiency level: V1 (beginner) – V5 (advanced)
    string? Level
);
