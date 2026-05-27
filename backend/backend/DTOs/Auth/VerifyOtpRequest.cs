using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public record VerifyOtpRequest(
    [Required][EmailAddress]
    string Email,

    [Required][StringLength(10)]
    string Otp
);
