using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("listening_errors")]
[Index("ErrorType", Name = "idx_listening_errors_type")]
[Index("UserId", Name = "idx_listening_errors_user")]
public partial class ListeningError
{
    [Key]
    [Column("error_id")]
    public Guid ErrorId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("media_id")]
    public Guid MediaId { get; set; }

    [Column("segment_id")]
    public Guid? SegmentId { get; set; }

    [Column("error_type")]
    [StringLength(30)]
    public string? ErrorType { get; set; }

    [Column("learner_heard")]
    public string? LearnerHeard { get; set; }

    [Column("correct_text")]
    public string? CorrectText { get; set; }

    [Column("reviewed")]
    public bool? Reviewed { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("MediaId")]
    [InverseProperty("ListeningErrors")]
    public virtual MediaContent Media { get; set; } = null!;

    [ForeignKey("SegmentId")]
    [InverseProperty("ListeningErrors")]
    public virtual TranscriptSegment? Segment { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ListeningErrors")]
    public virtual User User { get; set; } = null!;
}
