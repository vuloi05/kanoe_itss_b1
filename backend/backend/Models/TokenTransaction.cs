using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("token_transactions")]
[Index("LearnerId", Name = "idx_token_transactions_learner")]
[Index("PartnerId", Name = "idx_token_transactions_partner")]
public partial class TokenTransaction
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("learner_id")]
    public Guid LearnerId { get; set; }

    [Column("partner_id")]
    public Guid PartnerId { get; set; }

    [Column("amount_paid")]
    public int AmountPaid { get; set; }

    [Column("partner_received")]
    public int PartnerReceived { get; set; }

    [Column("platform_fee")]
    public int PlatformFee { get; set; }

    [Column("conversation_id")]
    public Guid? ConversationId { get; set; }

    [Column("status")]
    [StringLength(20)]
    public string Status { get; set; } = "completed";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("LearnerId")]
    public virtual User Learner { get; set; } = null!;

    [ForeignKey("PartnerId")]
    public virtual User Partner { get; set; } = null!;

    [ForeignKey("ConversationId")]
    public virtual Conversation? Conversation { get; set; }
}
