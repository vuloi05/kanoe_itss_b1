using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("password_resets")]
[Index("Email", Name = "idx_password_resets_email")]
[Index("ResetToken", Name = "idx_password_resets_token")]
public partial class PasswordReset
{
    [Key]
    [Column("reset_id")]
    public Guid ResetId { get; set; }

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [Column("otp_code")]
    [StringLength(10)]
    public string OtpCode { get; set; } = null!;

    [Column("otp_expires_at")]
    public DateTime OtpExpiresAt { get; set; }

    [Column("reset_token")]
    [StringLength(255)]
    public string? ResetToken { get; set; }

    [Column("token_expires_at")]
    public DateTime? TokenExpiresAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
