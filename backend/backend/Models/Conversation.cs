using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("conversations")]
[Index("LearnerId", "PartnerId", Name = "conversations_learner_id_partner_id_key", IsUnique = true)]
[Index("LearnerId", Name = "idx_conversations_learner")]
[Index("PartnerId", Name = "idx_conversations_partner")]
public partial class Conversation
{
    [Key]
    [Column("conversation_id")]
    public Guid ConversationId { get; set; }

    [Column("learner_id")]
    public Guid LearnerId { get; set; }

    [Column("partner_id")]
    public Guid PartnerId { get; set; }

    [Column("last_message_at")]
    public DateTime? LastMessageAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("LearnerId")]
    [InverseProperty("ConversationLearners")]
    public virtual User Learner { get; set; } = null!;

    [InverseProperty("Conversation")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("PartnerId")]
    [InverseProperty("ConversationPartners")]
    public virtual User Partner { get; set; } = null!;
}
