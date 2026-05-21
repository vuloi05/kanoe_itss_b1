using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("content_levels")]
public partial class ContentLevel
{
    [Key]
    [Column("level_id")]
    public int LevelId { get; set; }

    [Column("display_name")]
    [StringLength(50)]
    public string DisplayName { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [InverseProperty("Level")]
    public virtual ICollection<MediaContent> MediaContents { get; set; } = new List<MediaContent>();

    [InverseProperty("Level")]
    public virtual ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
}
