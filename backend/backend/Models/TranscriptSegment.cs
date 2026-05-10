using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("transcript_segments")]
[Index("TranscriptId", "SegmentIndex", Name = "idx_segments_order", IsUnique = true)]
[Index("TranscriptId", "StartMs", "EndMs", Name = "idx_segments_time")]
public partial class TranscriptSegment
{
    [Key]
    [Column("segment_id")]
    public Guid SegmentId { get; set; }

    [Column("transcript_id")]
    public Guid TranscriptId { get; set; }

    [Column("segment_index")]
    public int SegmentIndex { get; set; }

    [Column("text")]
    public string Text { get; set; } = null!;

    [Column("start_ms")]
    public int StartMs { get; set; }

    [Column("end_ms")]
    public int EndMs { get; set; }

    [Column("speaker")]
    [StringLength(50)]
    public string? Speaker { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Segment")]
    public virtual ICollection<ListeningError> ListeningErrors { get; set; } = new List<ListeningError>();

    [InverseProperty("Segment")]
    public virtual ICollection<ShadowingLog> ShadowingLogs { get; set; } = new List<ShadowingLog>();

    [ForeignKey("TranscriptId")]
    [InverseProperty("TranscriptSegments")]
    public virtual Transcript Transcript { get; set; } = null!;
}
