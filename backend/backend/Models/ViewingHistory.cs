using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("viewing_history")]
[Index("UserId", "IsCompleted", Name = "idx_viewing_history_completed")]
[Index("MediaId", Name = "idx_viewing_history_media")]
[Index("UserId", Name = "idx_viewing_history_user")]
[Index("UserId", "MediaId", Name = "viewing_history_user_id_media_id_key", IsUnique = true)]
public partial class ViewingHistory
{
    [Key]
    [Column("history_id")]
    public Guid HistoryId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("media_id")]
    public Guid MediaId { get; set; }

    [Column("started_at")]
    public DateTime StartedAt { get; set; }

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [Column("last_position_ms")]
    public int? LastPositionMs { get; set; }

    [Column("is_completed")]
    public bool? IsCompleted { get; set; }

    [Column("replay_count")]
    public int? ReplayCount { get; set; }

    [ForeignKey("MediaId")]
    [InverseProperty("ViewingHistories")]
    public virtual MediaContent Media { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("ViewingHistories")]
    public virtual User User { get; set; } = null!;
}
