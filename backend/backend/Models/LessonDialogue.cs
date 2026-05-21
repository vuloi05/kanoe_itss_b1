using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("lesson_dialogues")]
public partial class LessonDialogue
{
    [Key]
    [Column("dialogue_id")]
    public Guid DialogueId { get; set; }

    [Column("lesson_id")]
    public Guid LessonId { get; set; }

    [Column("speaker")]
    [StringLength(50)]
    public string Speaker { get; set; } = null!;

    [Column("speaker_jp")]
    [StringLength(50)]
    public string SpeakerJp { get; set; } = null!;

    [Column("line_vi")]
    public string LineVi { get; set; } = null!;

    [Column("line_jp")]
    public string LineJp { get; set; } = null!;

    [Column("is_active")]
    public bool IsActive { get; set; }

    /// <summary>
    /// JSON array of { index: number, color: string } for word highlighting.
    /// Stored as JSONB for flexible querying.
    /// </summary>
    [Column("highlight_words_json", TypeName = "jsonb")]
    public string? HighlightWordsJson { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("Dialogues")]
    public virtual Lesson Lesson { get; set; } = null!;
}
