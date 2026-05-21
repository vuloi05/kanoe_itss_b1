using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("lesson_tone_notes")]
public partial class LessonToneNote
{
    [Key]
    [Column("note_id")]
    public Guid NoteId { get; set; }

    [Column("lesson_id")]
    public Guid LessonId { get; set; }

    [Column("tone")]
    [StringLength(50)]
    public string Tone { get; set; } = null!;

    [Column("desc_vi")]
    public string DescVi { get; set; } = null!;

    [Column("desc_jp")]
    public string DescJp { get; set; } = null!;

    [Column("example")]
    [StringLength(255)]
    public string Example { get; set; } = null!;

    /// <summary>
    /// CSS variable name (e.g. "var(--secondary)")
    /// </summary>
    [Column("color")]
    [StringLength(50)]
    public string Color { get; set; } = null!;

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("ToneNotes")]
    public virtual Lesson Lesson { get; set; } = null!;
}
