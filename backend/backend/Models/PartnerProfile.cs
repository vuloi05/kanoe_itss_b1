using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("partner_profiles")]
[Index("RatingAvg", Name = "idx_partner_profiles_rating", AllDescending = true)]
[Index("UserId", Name = "partner_profiles_user_id_key", IsUnique = true)]
public partial class PartnerProfile
{
    [Key]
    [Column("profile_id")]
    public Guid ProfileId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("rating_avg")]
    [Precision(3, 2)]
    public decimal? RatingAvg { get; set; }

    [Column("rating_count")]
    public int? RatingCount { get; set; }

    [Column("hourly_rate")]
    [Precision(8, 2)]
    public decimal? HourlyRate { get; set; }

    [Column("specialties")]
    public List<string>? Specialties { get; set; }

    [Column("availability_json", TypeName = "jsonb")]
    public string? AvailabilityJson { get; set; }

    [Column("intro_video_url")]
    public string? IntroVideoUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("PartnerProfile")]
    public virtual User User { get; set; } = null!;
}
