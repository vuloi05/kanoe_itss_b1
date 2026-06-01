using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("learner_vocabularies")]
public class LearnerVocabulary
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("learner_profile_id")]
    public Guid LearnerProfileId { get; set; }

    [Column("word")]
    [StringLength(100)]
    public string Word { get; set; } = string.Empty;

    [Column("learned_at")]
    public DateTime LearnedAt { get; set; }

    [ForeignKey("LearnerProfileId")]
    [InverseProperty("LearnerVocabularies")]
    public virtual LearnerProfile LearnerProfile { get; set; } = null!;
}
