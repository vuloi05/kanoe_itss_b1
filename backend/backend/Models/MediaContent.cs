using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("media_content")]
[Index("LevelId", Name = "idx_media_content_level")]
[Index("IsPublished", "PublishedAt", Name = "idx_media_content_published", IsDescending = new[] { false, true })]
[Index("MediaType", Name = "idx_media_content_type")]
public partial class MediaContent
{
    [Key]
    [Column("media_id")]
    public Guid MediaId { get; set; }

    [Column("title")]
    [StringLength(255)]
    public string Title { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("media_type")]
    [StringLength(10)]
    public string MediaType { get; set; } = null!;

    [Column("source_platform")]
    [StringLength(30)]
    public string? SourcePlatform { get; set; }

    [Column("media_url")]
    public string MediaUrl { get; set; } = null!;

    [Column("thumbnail_url")]
    public string? ThumbnailUrl { get; set; }

    [Column("duration_seconds")]
    public int? DurationSeconds { get; set; }

    [Column("level_id")]
    public int LevelId { get; set; }

    [Column("is_published")]
    public bool IsPublished { get; set; }

    [Column("published_at")]
    public DateTime? PublishedAt { get; set; }

    [Column("created_by")]
    public Guid? CreatedBy { get; set; }

    [Column("view_count")]
    public int? ViewCount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("CreatedBy")]
    [InverseProperty("MediaContents")]
    public virtual User? CreatedByNavigation { get; set; }

    [InverseProperty("Media")]
    public virtual ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();

    [ForeignKey("LevelId")]
    [InverseProperty("MediaContents")]
    public virtual ContentLevel Level { get; set; } = null!;

    [InverseProperty("Media")]
    public virtual ICollection<ListeningError> ListeningErrors { get; set; } = new List<ListeningError>();

    [InverseProperty("Media")]
    public virtual ICollection<ShadowingLog> ShadowingLogs { get; set; } = new List<ShadowingLog>();

    [InverseProperty("Media")]
    public virtual Transcript? Transcript { get; set; }

    [InverseProperty("Media")]
    public virtual ICollection<ViewingHistory> ViewingHistories { get; set; } = new List<ViewingHistory>();

    [ForeignKey("MediaId")]
    [InverseProperty("Media")]
    public virtual ICollection<ContentCategory> Categories { get; set; } = new List<ContentCategory>();
}
