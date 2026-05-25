using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("lesson_progress")]
[Index("UserId", Name = "idx_lesson_progress_user")]
[Index("UserId", "LessonId", Name = "lesson_progress_unique", IsUnique = true)]
public partial class LessonProgress
{
    [Key]
    [Column("progress_id")]
    public Guid ProgressId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("lesson_id")]
    public Guid LessonId { get; set; }

    [Column("is_completed")]
    public bool IsCompleted { get; set; }

    [Column("progress")]
    public int Progress { get; set; }

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("LessonProgresses")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("LessonId")]
    [InverseProperty("LessonProgresses")]
    public virtual Lesson Lesson { get; set; } = null!;
}
