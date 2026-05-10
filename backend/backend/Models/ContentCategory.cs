using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("content_categories")]
[Index("Slug", Name = "content_categories_slug_key", IsUnique = true)]
public partial class ContentCategory
{
    [Key]
    [Column("category_id")]
    public int CategoryId { get; set; }

    [Column("slug")]
    [StringLength(50)]
    public string Slug { get; set; } = null!;

    [Column("name_en")]
    [StringLength(100)]
    public string NameEn { get; set; } = null!;

    [Column("name_vi")]
    [StringLength(100)]
    public string NameVi { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("icon_url")]
    public string? IconUrl { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Categories")]
    public virtual ICollection<MediaContent> Media { get; set; } = new List<MediaContent>();
}
