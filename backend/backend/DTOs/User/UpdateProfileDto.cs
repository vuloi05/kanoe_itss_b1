using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User;

public record UpdateProfileDto(
    [StringLength(100, ErrorMessage = "Display name must not exceed 100 characters.")]
    string? Name,

    [StringLength(2000, ErrorMessage = "Bio must not exceed 2000 characters.")]
    string? Bio
);
