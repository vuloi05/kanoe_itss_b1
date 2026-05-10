using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("shadowing_logs")]
[Index("MediaId", Name = "idx_shadowing_logs_media")]
[Index("UserId", Name = "idx_shadowing_logs_user")]
public partial class ShadowingLog
{
    [Key]
    [Column("log_id")]
    public Guid LogId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("media_id")]
    public Guid MediaId { get; set; }

    [Column("segment_id")]
    public Guid? SegmentId { get; set; }

    [Column("recording_url")]
    public string? RecordingUrl { get; set; }

    [Column("accuracy_score")]
    [Precision(3, 2)]
    public decimal? AccuracyScore { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("practiced_at")]
    public DateTime PracticedAt { get; set; }

    [ForeignKey("MediaId")]
    [InverseProperty("ShadowingLogs")]
    public virtual MediaContent Media { get; set; } = null!;

    [ForeignKey("SegmentId")]
    [InverseProperty("ShadowingLogs")]
    public virtual TranscriptSegment? Segment { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ShadowingLogs")]
    public virtual User User { get; set; } = null!;
}
