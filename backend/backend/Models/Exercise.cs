using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("exercises")]
[Index("MediaId", Name = "idx_exercises_media")]
public partial class Exercise
{
    [Key]
    [Column("exercise_id")]
    public Guid ExerciseId { get; set; }

    [Column("media_id")]
    public Guid MediaId { get; set; }

    [Column("question_type")]
    [StringLength(20)]
    public string QuestionType { get; set; } = null!;

    [Column("question_text")]
    public string QuestionText { get; set; } = null!;

    [Column("question_text_ja")]
    public string? QuestionTextJa { get; set; }

    [Column("options_json", TypeName = "jsonb")]
    public string? OptionsJson { get; set; }

    [Column("correct_answer")]
    [StringLength(50)]
    public string CorrectAnswer { get; set; } = null!;

    [Column("explanation")]
    public string? Explanation { get; set; }

    [Column("explanation_ja")]
    public string? ExplanationJa { get; set; }

    [Column("difficulty")]
    public int? Difficulty { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("MediaId")]
    [InverseProperty("Exercises")]
    public virtual MediaContent Media { get; set; } = null!;

    [InverseProperty("Exercise")]
    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
}
