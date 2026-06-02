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




    [Column("videos_completed")]
    public int? VideosCompleted { get; set; }

    [Column("current_streak")]
    public int? CurrentStreak { get; set; }

    [Column("longest_streak")]
    public int? LongestStreak { get; set; }

    [Column("current_level")]
    [StringLength(10)]
    public string CurrentLevel { get; set; } = "V1";

    [Column("goals")]
    public string? Goals { get; set; }

    [Column("native_language")]
    [StringLength(10)]
    public string? NativeLanguage { get; set; }

    [Column("daily_study_seconds")]
    public int DailyStudySeconds { get; set; }

    [Column("daily_study_date")]
    public DateOnly? DailyStudyDate { get; set; }

    [Column("last_study_date")]
    public DateTime? LastStudyDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("LearnerProfile")]
    public virtual User User { get; set; } = null!;

    [InverseProperty("LearnerProfile")]
    public virtual ICollection<LearnerVocabulary> LearnerVocabularies { get; set; } = new List<LearnerVocabulary>();
}
