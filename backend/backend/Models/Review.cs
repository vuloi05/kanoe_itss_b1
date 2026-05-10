using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("reviews")]
[Index("BookingId", Name = "idx_reviews_booking")]
[Index("Rating", Name = "idx_reviews_rating")]
[Index("RevieweeId", Name = "idx_reviews_reviewee")]
[Index("BookingId", Name = "reviews_booking_id_key", IsUnique = true)]
public partial class Review
{
    [Key]
    [Column("review_id")]
    public Guid ReviewId { get; set; }

    [Column("booking_id")]
    public Guid BookingId { get; set; }

    [Column("reviewer_id")]
    public Guid ReviewerId { get; set; }

    [Column("reviewee_id")]
    public Guid RevieweeId { get; set; }

    [Column("rating")]
    public int Rating { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("is_public")]
    public bool? IsPublic { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("Review")]
    public virtual Booking Booking { get; set; } = null!;

    [ForeignKey("RevieweeId")]
    [InverseProperty("ReviewReviewees")]
    public virtual User Reviewee { get; set; } = null!;

    [ForeignKey("ReviewerId")]
    [InverseProperty("ReviewReviewers")]
    public virtual User Reviewer { get; set; } = null!;
}
