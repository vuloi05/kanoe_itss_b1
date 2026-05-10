using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("transcripts")]
[Index("MediaId", Name = "transcripts_media_id_key", IsUnique = true)]
public partial class Transcript
{
    [Key]
    [Column("transcript_id")]
    public Guid TranscriptId { get; set; }

    [Column("media_id")]
    public Guid MediaId { get; set; }

    [Column("full_text")]
    public string FullText { get; set; } = null!;

    [Column("language")]
    [StringLength(10)]
    public string? Language { get; set; }

    [Column("has_timestamps")]
    public bool? HasTimestamps { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("MediaId")]
    [InverseProperty("Transcript")]
    public virtual MediaContent Media { get; set; } = null!;

    [InverseProperty("Transcript")]
    public virtual ICollection<TranscriptSegment> TranscriptSegments { get; set; } = new List<TranscriptSegment>();
}
