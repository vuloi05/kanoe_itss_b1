using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("users")]
[Index("Email", Name = "idx_users_email")]
[Index("Email", Name = "users_email_key", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [Column("password_hash")]
    [StringLength(255)]
    public string PasswordHash { get; set; } = null!;

    [Column("display_name")]
    [StringLength(100)]
    public string DisplayName { get; set; } = null!;



    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Column("phone")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [Column("country_code")]
    [StringLength(5)]
    public string? CountryCode { get; set; }

    [Column("language_pref")]
    [StringLength(10)]
    public string? LanguagePref { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [Column("last_login_at")]
    public DateTime? LastLoginAt { get; set; }

    [Column("is_online")]
    public bool IsOnline { get; set; } = false;

    [Column("last_seen")]
    public DateTime? LastSeen { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("password_changed_at")]
    public DateTime? PasswordChangedAt { get; set; }

    [Column("role")]
    [StringLength(20)]
    public string Role { get; set; } = "guest";

    [Column("account_status")]
    [StringLength(30)]
    public string AccountStatus { get; set; } = "active";

    [Column("token_balance")]
    public int TokenBalance { get; set; }

    [InverseProperty("CancelledByNavigation")]
    public virtual ICollection<Booking> BookingCancelledByNavigations { get; set; } = new List<Booking>();

    [InverseProperty("Learner")]
    public virtual ICollection<Booking> BookingLearners { get; set; } = new List<Booking>();

    [InverseProperty("Partner")]
    public virtual ICollection<Booking> BookingPartners { get; set; } = new List<Booking>();

    [InverseProperty("Learner")]
    public virtual ICollection<Conversation> ConversationLearners { get; set; } = new List<Conversation>();

    [InverseProperty("Partner")]
    public virtual ICollection<Conversation> ConversationPartners { get; set; } = new List<Conversation>();

    [InverseProperty("User")]
    public virtual LearnerProfile? LearnerProfile { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<ListeningError> ListeningErrors { get; set; } = new List<ListeningError>();

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<MediaContent> MediaContents { get; set; } = new List<MediaContent>();

    [InverseProperty("Sender")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [InverseProperty("User")]
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    [InverseProperty("User")]
    public virtual PartnerProfile? PartnerProfile { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();

    [InverseProperty("Reviewee")]
    public virtual ICollection<Review> ReviewReviewees { get; set; } = new List<Review>();

    [InverseProperty("Reviewer")]
    public virtual ICollection<Review> ReviewReviewers { get; set; } = new List<Review>();

    [InverseProperty("User")]
    public virtual ICollection<ShadowingLog> ShadowingLogs { get; set; } = new List<ShadowingLog>();

    [InverseProperty("User")]
    public virtual UserSetting? UserSetting { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<ViewingHistory> ViewingHistories { get; set; } = new List<ViewingHistory>();

    [InverseProperty("User")]
    public virtual ICollection<VoiceLabRecord> VoiceLabRecords { get; set; } = new List<VoiceLabRecord>();

    [InverseProperty("User")]
    public virtual ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();

    [InverseProperty("Learner")]
    public virtual ICollection<TokenTransaction> TokenTransactionsAsLearner { get; set; } = new List<TokenTransaction>();

    [InverseProperty("Partner")]
    public virtual ICollection<TokenTransaction> TokenTransactionsAsPartner { get; set; } = new List<TokenTransaction>();
}
