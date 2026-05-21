using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("chapters")]
public partial class Chapter
{
    [Key]
    [Column("chapter_id")]
    public int ChapterId { get; set; }

    [Column("level_id")]
    public int LevelId { get; set; }

    [Column("title_vi")]
    [StringLength(255)]
    public string TitleVi { get; set; } = null!;

    [Column("title_jp")]
    [StringLength(255)]
    public string TitleJp { get; set; } = null!;

    /// <summary>
    /// Material Symbols icon name (e.g. "graphic_eq", "restaurant_menu")
    /// </summary>
    [Column("icon")]
    [StringLength(50)]
    public string Icon { get; set; } = null!;

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [ForeignKey("LevelId")]
    [InverseProperty("Chapters")]
    public virtual ContentLevel Level { get; set; } = null!;

    [InverseProperty("Chapter")]
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
