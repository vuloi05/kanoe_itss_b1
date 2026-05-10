using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("notifications")]
[Index("UserId", "IsRead", "CreatedAt", Name = "idx_notifications_user", IsDescending = new[] { false, false, true })]
public partial class Notification
{
    [Key]
    [Column("notification_id")]
    public Guid NotificationId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("title")]
    [StringLength(255)]
    public string Title { get; set; } = null!;

    [Column("body")]
    public string? Body { get; set; }

    [Column("data_json", TypeName = "jsonb")]
    public string? DataJson { get; set; }

    [Column("is_read")]
    public bool? IsRead { get; set; }

    [Column("read_at")]
    public DateTime? ReadAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Notifications")]
    public virtual User User { get; set; } = null!;
}
