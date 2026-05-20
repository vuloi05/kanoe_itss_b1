using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public partial class VietImmerseDbContext : DbContext
{
    public VietImmerseDbContext()
    {
    }

    public VietImmerseDbContext(DbContextOptions<VietImmerseDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<ContentCategory> ContentCategories { get; set; }

    public virtual DbSet<ContentLevel> ContentLevels { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<Exercise> Exercises { get; set; }

    public virtual DbSet<LearnerProfile> LearnerProfiles { get; set; }

    public virtual DbSet<ListeningError> ListeningErrors { get; set; }

    public virtual DbSet<MediaContent> MediaContents { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<PartnerProfile> PartnerProfiles { get; set; }

    public virtual DbSet<QuizAttempt> QuizAttempts { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<ShadowingLog> ShadowingLogs { get; set; }

    public virtual DbSet<Transcript> Transcripts { get; set; }

    public virtual DbSet<TranscriptSegment> TranscriptSegments { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserSetting> UserSettings { get; set; }

    public virtual DbSet<ViewingHistory> ViewingHistories { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // Fallback: read from environment variable when DI is not available (e.g. EF migrations CLI)
            var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
            if (!string.IsNullOrEmpty(connStr))
            {
                optionsBuilder.UseNpgsql(connStr);
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("account_status", new[] { "active", "inactive", "suspended", "pending_verification" })
            .HasPostgresEnum("booking_status", new[] { "pending", "confirmed", "completed", "cancelled", "no_show" })
            .HasPostgresEnum("content_category_type", new[] { "shopping", "taxi", "dining", "greeting", "work", "culture", "grammar", "pronunciation", "daily_life" })
            .HasPostgresEnum("learner_level", new[] { "basic", "intermediate", "advanced" })
            .HasPostgresEnum("notification_type", new[] { "system", "booking_reminder", "new_message", "review_received", "progress_milestone" })
            .HasPostgresEnum("partner_profile_status", new[] { "draft", "pending_review", "approved", "rejected" })
            .HasPostgresEnum("user_role", new[] { "admin", "learner", "partner", "guest" });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("bookings_pkey");

            entity.Property(e => e.BookingId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.CancelledByNavigation).WithMany(p => p.BookingCancelledByNavigations).HasConstraintName("bookings_cancelled_by_fkey");

            entity.HasOne(d => d.Learner).WithMany(p => p.BookingLearners).HasConstraintName("bookings_learner_id_fkey");

            entity.HasOne(d => d.Partner).WithMany(p => p.BookingPartners).HasConstraintName("bookings_partner_id_fkey");
        });

        modelBuilder.Entity<ContentCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("content_categories_pkey");
        });

        modelBuilder.Entity<ContentLevel>(entity =>
        {
            entity.HasKey(e => e.LevelId).HasName("content_levels_pkey");

            entity.Property(e => e.SortOrder).HasDefaultValue(1);
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.ConversationId).HasName("conversations_pkey");

            entity.Property(e => e.ConversationId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Learner).WithMany(p => p.ConversationLearners).HasConstraintName("conversations_learner_id_fkey");

            entity.HasOne(d => d.Partner).WithMany(p => p.ConversationPartners).HasConstraintName("conversations_partner_id_fkey");
        });

        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.ExerciseId).HasName("exercises_pkey");

            entity.Property(e => e.ExerciseId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Media).WithMany(p => p.Exercises).HasConstraintName("exercises_media_id_fkey");
        });

        modelBuilder.Entity<LearnerProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("learner_profiles_pkey");

            entity.Property(e => e.ProfileId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.CurrentStreak).HasDefaultValue(0);
            entity.Property(e => e.LongestStreak).HasDefaultValue(0);
            entity.Property(e => e.NativeLanguage).HasDefaultValueSql("'ja'::character varying");
            entity.Property(e => e.TotalStudyHours).HasDefaultValue(0m);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.VideosCompleted).HasDefaultValue(0);

            entity.HasOne(d => d.User).WithOne(p => p.LearnerProfile).HasConstraintName("learner_profiles_user_id_fkey");
        });

        modelBuilder.Entity<ListeningError>(entity =>
        {
            entity.HasKey(e => e.ErrorId).HasName("listening_errors_pkey");

            entity.Property(e => e.ErrorId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Reviewed).HasDefaultValue(false);

            entity.HasOne(d => d.Media).WithMany(p => p.ListeningErrors).HasConstraintName("listening_errors_media_id_fkey");

            entity.HasOne(d => d.Segment).WithMany(p => p.ListeningErrors).HasConstraintName("listening_errors_segment_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.ListeningErrors).HasConstraintName("listening_errors_user_id_fkey");
        });

        modelBuilder.Entity<MediaContent>(entity =>
        {
            entity.HasKey(e => e.MediaId).HasName("media_content_pkey");

            entity.Property(e => e.MediaId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.ViewCount).HasDefaultValue(0);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MediaContents).HasConstraintName("media_content_created_by_fkey");

            entity.HasOne(d => d.Level).WithMany(p => p.MediaContents)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("media_content_level_id_fkey");

            entity.HasMany(d => d.Categories).WithMany(p => p.Media)
                .UsingEntity<Dictionary<string, object>>(
                    "MediaCategory",
                    r => r.HasOne<ContentCategory>().WithMany()
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("media_category_category_id_fkey"),
                    l => l.HasOne<MediaContent>().WithMany()
                        .HasForeignKey("MediaId")
                        .HasConstraintName("media_category_media_id_fkey"),
                    j =>
                    {
                        j.HasKey("MediaId", "CategoryId").HasName("media_category_pkey");
                        j.ToTable("media_category");
                        j.HasIndex(new[] { "CategoryId" }, "idx_media_category_category");
                        j.IndexerProperty<Guid>("MediaId").HasColumnName("media_id");
                        j.IndexerProperty<int>("CategoryId").HasColumnName("category_id");
                    });
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("messages_pkey");

            entity.HasIndex(e => new { e.ConversationId, e.IsRead }, "idx_messages_unread").HasFilter("(is_read = false)");

            entity.Property(e => e.MessageId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.SentAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Conversation).WithMany(p => p.Messages).HasConstraintName("messages_conversation_id_fkey");

            entity.HasOne(d => d.Sender).WithMany(p => p.Messages).HasConstraintName("messages_sender_id_fkey");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("notifications_pkey");

            entity.Property(e => e.NotificationId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications).HasConstraintName("notifications_user_id_fkey");
        });

        modelBuilder.Entity<PartnerProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("partner_profiles_pkey");

            entity.Property(e => e.ProfileId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.RatingAvg).HasDefaultValue(0m);
            entity.Property(e => e.RatingCount).HasDefaultValue(0);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithOne(p => p.PartnerProfile).HasConstraintName("partner_profiles_user_id_fkey");
        });

        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasKey(e => e.AttemptId).HasName("quiz_attempts_pkey");

            entity.Property(e => e.AttemptId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AttemptedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Exercise).WithMany(p => p.QuizAttempts).HasConstraintName("quiz_attempts_exercise_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.QuizAttempts).HasConstraintName("quiz_attempts_user_id_fkey");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("reviews_pkey");

            entity.Property(e => e.ReviewId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.IsPublic).HasDefaultValue(true);

            entity.HasOne(d => d.Booking).WithOne(p => p.Review).HasConstraintName("reviews_booking_id_fkey");

            entity.HasOne(d => d.Reviewee).WithMany(p => p.ReviewReviewees).HasConstraintName("reviews_reviewee_id_fkey");

            entity.HasOne(d => d.Reviewer).WithMany(p => p.ReviewReviewers).HasConstraintName("reviews_reviewer_id_fkey");
        });

        modelBuilder.Entity<ShadowingLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("shadowing_logs_pkey");

            entity.Property(e => e.LogId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.PracticedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Media).WithMany(p => p.ShadowingLogs).HasConstraintName("shadowing_logs_media_id_fkey");

            entity.HasOne(d => d.Segment).WithMany(p => p.ShadowingLogs).HasConstraintName("shadowing_logs_segment_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.ShadowingLogs).HasConstraintName("shadowing_logs_user_id_fkey");
        });

        modelBuilder.Entity<Transcript>(entity =>
        {
            entity.HasKey(e => e.TranscriptId).HasName("transcripts_pkey");

            entity.Property(e => e.TranscriptId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.HasTimestamps).HasDefaultValue(false);
            entity.Property(e => e.Language).HasDefaultValueSql("'vi'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Media).WithOne(p => p.Transcript).HasConstraintName("transcripts_media_id_fkey");
        });

        modelBuilder.Entity<TranscriptSegment>(entity =>
        {
            entity.HasKey(e => e.SegmentId).HasName("transcript_segments_pkey");

            entity.Property(e => e.SegmentId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Transcript).WithMany(p => p.TranscriptSegments).HasConstraintName("transcript_segments_transcript_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("users_pkey");

            entity.Property(e => e.UserId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CountryCode).HasDefaultValueSql("'JP'::character varying");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.LanguagePref).HasDefaultValueSql("'ja'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<UserSetting>(entity =>
        {
            entity.HasKey(e => e.SettingId).HasName("user_settings_pkey");

            entity.Property(e => e.SettingId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AutoPlayNext).HasDefaultValue(true);
            entity.Property(e => e.DailyGoalMinutes).HasDefaultValue(15);
            entity.Property(e => e.NotifyBookingReminder).HasDefaultValue(true);
            entity.Property(e => e.NotifyEmail).HasDefaultValue(true);
            entity.Property(e => e.NotifyPush).HasDefaultValue(true);
            entity.Property(e => e.NotifySms).HasDefaultValue(false);
            entity.Property(e => e.PlaybackSpeed).HasDefaultValue(1.0m);
            entity.Property(e => e.ShowJapaneseSubs).HasDefaultValue(true);
            entity.Property(e => e.Theme).HasDefaultValueSql("'light'::character varying");
            entity.Property(e => e.Timezone).HasDefaultValueSql("'Asia/Tokyo'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithOne(p => p.UserSetting).HasConstraintName("user_settings_user_id_fkey");
        });

        modelBuilder.Entity<ViewingHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("viewing_history_pkey");

            entity.Property(e => e.HistoryId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);
            entity.Property(e => e.LastPositionMs).HasDefaultValue(0);
            entity.Property(e => e.ReplayCount).HasDefaultValue(0);
            entity.Property(e => e.StartedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Media).WithMany(p => p.ViewingHistories).HasConstraintName("viewing_history_media_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.ViewingHistories).HasConstraintName("viewing_history_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
