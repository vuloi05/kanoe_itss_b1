using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("messages")]
[Index("ConversationId", "SentAt", Name = "idx_messages_conversation")]
[Index("SenderId", Name = "idx_messages_sender")]
public partial class Message
{
    [Key]
    [Column("message_id")]
    public Guid MessageId { get; set; }

    [Column("conversation_id")]
    public Guid ConversationId { get; set; }

    [Column("sender_id")]
    public Guid SenderId { get; set; }

    [Column("content")]
    public string Content { get; set; } = null!;

    [Column("is_read")]
    public bool? IsRead { get; set; }

    [Column("sent_at")]
    public DateTime SentAt { get; set; }

    [ForeignKey("ConversationId")]
    [InverseProperty("Messages")]
    public virtual Conversation Conversation { get; set; } = null!;

    [ForeignKey("SenderId")]
    [InverseProperty("Messages")]
    public virtual User Sender { get; set; } = null!;
}
