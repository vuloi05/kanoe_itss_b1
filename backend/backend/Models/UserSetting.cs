using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("user_settings")]
[Index("UserId", Name = "user_settings_user_id_key", IsUnique = true)]
public partial class UserSetting
{
    [Key]
    [Column("setting_id")]
    public Guid SettingId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("notify_email")]
    public bool? NotifyEmail { get; set; }

    [Column("notify_push")]
    public bool? NotifyPush { get; set; }

    [Column("notify_sms")]
    public bool? NotifySms { get; set; }

    [Column("notify_booking_reminder")]
    public bool? NotifyBookingReminder { get; set; }

    [Column("daily_goal_minutes")]
    public int? DailyGoalMinutes { get; set; }

    [Column("auto_play_next")]
    public bool? AutoPlayNext { get; set; }

    [Column("playback_speed")]
    [Precision(3, 2)]
    public decimal? PlaybackSpeed { get; set; }

    [Column("show_japanese_subs")]
    public bool? ShowJapaneseSubs { get; set; }

    [Column("theme")]
    [StringLength(20)]
    public string? Theme { get; set; }

    [Column("timezone")]
    [StringLength(50)]
    public string? Timezone { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserSetting")]
    public virtual User User { get; set; } = null!;
}
