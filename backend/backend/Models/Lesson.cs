using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("lessons")]
public partial class Lesson
{
    [Key]
    [Column("lesson_id")]
    public Guid LessonId { get; set; }

    [Column("chapter_id")]
    public int ChapterId { get; set; }

    [Column("scene_label")]
    [StringLength(100)]
    public string SceneLabel { get; set; } = null!;

    [Column("scene_label_jp")]
    [StringLength(100)]
    public string SceneLabelJp { get; set; } = null!;

    [Column("title_vi")]
    [StringLength(255)]
    public string TitleVi { get; set; } = null!;

    [Column("title_jp")]
    [StringLength(255)]
    public string TitleJp { get; set; } = null!;

    [Column("subtitle_vi")]
    public string SubtitleVi { get; set; } = null!;

    [Column("subtitle_jp")]
    public string SubtitleJp { get; set; } = null!;

    /// <summary>
    /// Display tag (e.g. "Sơ cấp", "Trung cấp", "Thực tế")
    /// </summary>
    [Column("tag")]
    [StringLength(50)]
    public string? Tag { get; set; }

    [Column("tag_jp")]
    [StringLength(50)]
    public string? TagJp { get; set; }

    [Column("duration_minutes")]
    public int? DurationMinutes { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [Column("is_locked")]
    public bool IsLocked { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ChapterId")]
    [InverseProperty("Lessons")]
    public virtual Chapter Chapter { get; set; } = null!;

    [InverseProperty("Lesson")]
    public virtual ICollection<LessonDialogue> Dialogues { get; set; } = new List<LessonDialogue>();

    [InverseProperty("Lesson")]
    public virtual ICollection<LessonToneNote> ToneNotes { get; set; } = new List<LessonToneNote>();
}
