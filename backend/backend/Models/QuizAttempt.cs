using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("quiz_attempts")]
[Index("UserId", "IsCorrect", Name = "idx_quiz_attempts_correct")]
[Index("ExerciseId", Name = "idx_quiz_attempts_exercise")]
[Index("UserId", Name = "idx_quiz_attempts_user")]
public partial class QuizAttempt
{
    [Key]
    [Column("attempt_id")]
    public Guid AttemptId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("exercise_id")]
    public Guid ExerciseId { get; set; }

    [Column("selected_answer")]
    [StringLength(50)]
    public string SelectedAnswer { get; set; } = null!;

    [Column("is_correct")]
    public bool IsCorrect { get; set; }

    [Column("time_taken_ms")]
    public int? TimeTakenMs { get; set; }

    [Column("attempted_at")]
    public DateTime AttemptedAt { get; set; }

    [ForeignKey("ExerciseId")]
    [InverseProperty("QuizAttempts")]
    public virtual Exercise Exercise { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("QuizAttempts")]
    public virtual User User { get; set; } = null!;
}
