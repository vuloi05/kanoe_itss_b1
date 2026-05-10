using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("learner_profiles")]
[Index("UserId", Name = "learner_profiles_user_id_key", IsUnique = true)]
public partial class LearnerProfile
{
    [Key]
    [Column("profile_id")]
    public Guid ProfileId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("total_study_hours")]
    [Precision(6, 2)]
    public decimal? TotalStudyHours { get; set; }

    [Column("videos_completed")]
    public int? VideosCompleted { get; set; }

    [Column("current_streak")]
    public int? CurrentStreak { get; set; }

    [Column("longest_streak")]
    public int? LongestStreak { get; set; }

    [Column("goals")]
    public string? Goals { get; set; }

    [Column("native_language")]
    [StringLength(10)]
    public string? NativeLanguage { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("LearnerProfile")]
    public virtual User User { get; set; } = null!;
}
