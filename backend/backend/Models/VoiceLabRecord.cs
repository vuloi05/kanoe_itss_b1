using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("voice_lab_records")]
public partial class VoiceLabRecord
{
    [Key]
    [Column("record_id")]
    public Guid RecordId { get; set; }

    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("expected_text")]
    public string ExpectedText { get; set; } = null!;

    [Column("actual_text")]
    public string? ActualText { get; set; }

    [Column("completeness_score")]
    [Precision(5, 2)]
    public decimal? CompletenessScore { get; set; }

    [Column("accuracy_score")]
    [Precision(5, 2)]
    public decimal? AccuracyScore { get; set; }

    [Column("fluency_score")]
    [Precision(5, 2)]
    public decimal? FluencyScore { get; set; }

    [Column("prosody_score")]
    [Precision(5, 2)]
    public decimal? ProsodyScore { get; set; }

    [Column("audio_duration")]
    [Precision(8, 3)]
    public decimal? AudioDuration { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("VoiceLabRecords")]
    public virtual User? User { get; set; }
}
