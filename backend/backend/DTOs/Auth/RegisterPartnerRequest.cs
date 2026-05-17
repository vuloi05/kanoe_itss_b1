using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public record RegisterPartnerRequest(
    [Required][EmailAddress][StringLength(255)]
    string Email,

    [Required][MinLength(8)][MaxLength(128)]
    string Password,

    [Required][StringLength(100)]
    string DisplayName,

    [Phone][StringLength(20)]
    string? Phone,

    string? Bio
);
