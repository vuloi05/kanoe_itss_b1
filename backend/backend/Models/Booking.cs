using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("bookings")]
[Index("LearnerId", Name = "idx_bookings_learner")]
[Index("PartnerId", Name = "idx_bookings_partner")]
[Index("StartTime", Name = "idx_bookings_time")]
public partial class Booking
{
    [Key]
    [Column("booking_id")]
    public Guid BookingId { get; set; }

    [Column("learner_id")]
    public Guid LearnerId { get; set; }

    [Column("partner_id")]
    public Guid PartnerId { get; set; }

    [Column("start_time")]
    public DateTime StartTime { get; set; }

    [Column("end_time")]
    public DateTime EndTime { get; set; }

    [Column("meeting_url")]
    public string? MeetingUrl { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("learner_notes")]
    public string? LearnerNotes { get; set; }

    [Column("partner_notes")]
    public string? PartnerNotes { get; set; }

    [Column("cancelled_by")]
    public Guid? CancelledBy { get; set; }

    [Column("cancellation_reason")]
    public string? CancellationReason { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("CancelledBy")]
    [InverseProperty("BookingCancelledByNavigations")]
    public virtual User? CancelledByNavigation { get; set; }

    [ForeignKey("LearnerId")]
    [InverseProperty("BookingLearners")]
    public virtual User Learner { get; set; } = null!;

    [ForeignKey("PartnerId")]
    [InverseProperty("BookingPartners")]
    public virtual User Partner { get; set; } = null!;

    [InverseProperty("Booking")]
    public virtual Review? Review { get; set; }
}
