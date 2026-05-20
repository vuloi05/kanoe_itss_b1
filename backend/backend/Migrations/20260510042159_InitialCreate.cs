using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent enum creation: PostgreSQL doesn't support CREATE TYPE IF NOT EXISTS,
            // so we use PL/pgSQL exception handling to skip if already exists.
            // This handles Supabase databases where enums may exist from previous partial migrations.
            var enumTypes = new Dictionary<string, string>
            {
                ["account_status"] = "'active','inactive','suspended','pending_verification'",
                ["booking_status"] = "'pending','confirmed','completed','cancelled','no_show'",
                ["content_category_type"] = "'shopping','taxi','dining','greeting','work','culture','grammar','pronunciation','daily_life'",
                ["learner_level"] = "'basic','intermediate','advanced'",
                ["notification_type"] = "'system','booking_reminder','new_message','review_received','progress_milestone'",
                ["partner_profile_status"] = "'draft','pending_review','approved','rejected'",
                ["user_role"] = "'admin','learner','partner','guest'"
            };
            foreach (var (name, values) in enumTypes)
            {
                migrationBuilder.Sql($@"
                    DO $$ BEGIN
                        CREATE TYPE {name} AS ENUM ({values});
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;");
            }

            // AlterDatabase annotations removed — enum types are created by raw SQL above
            // to ensure idempotency on Supabase databases with pre-existing types.

            migrationBuilder.CreateTable(
                name: "content_categories",
                columns: table => new
                {
                    category_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    slug = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name_vi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    icon_url = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("content_categories_pkey", x => x.category_id);
                });

            migrationBuilder.CreateTable(
                name: "content_levels",
                columns: table => new
                {
                    level_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    display_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("content_levels_pkey", x => x.level_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    avatar_url = table.Column<string>(type: "text", nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    country_code = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true, defaultValueSql: "'JP'::character varying"),
                    language_pref = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true, defaultValueSql: "'ja'::character varying"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    account_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "bookings",
                columns: table => new
                {
                    booking_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    learner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    partner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    meeting_url = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    learner_notes = table.Column<string>(type: "text", nullable: true),
                    partner_notes = table.Column<string>(type: "text", nullable: true),
                    cancelled_by = table.Column<Guid>(type: "uuid", nullable: true),
                    cancellation_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("bookings_pkey", x => x.booking_id);
                    table.ForeignKey(
                        name: "bookings_cancelled_by_fkey",
                        column: x => x.cancelled_by,
                        principalTable: "users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "bookings_learner_id_fkey",
                        column: x => x.learner_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "bookings_partner_id_fkey",
                        column: x => x.partner_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "conversations",
                columns: table => new
                {
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    learner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    partner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    last_message_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("conversations_pkey", x => x.conversation_id);
                    table.ForeignKey(
                        name: "conversations_learner_id_fkey",
                        column: x => x.learner_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "conversations_partner_id_fkey",
                        column: x => x.partner_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "learner_profiles",
                columns: table => new
                {
                    profile_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    total_study_hours = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true, defaultValue: 0m),
                    videos_completed = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    current_streak = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    longest_streak = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    goals = table.Column<string>(type: "text", nullable: true),
                    native_language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true, defaultValueSql: "'ja'::character varying"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("learner_profiles_pkey", x => x.profile_id);
                    table.ForeignKey(
                        name: "learner_profiles_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "media_content",
                columns: table => new
                {
                    media_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    media_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    source_platform = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    media_url = table.Column<string>(type: "text", nullable: false),
                    thumbnail_url = table.Column<string>(type: "text", nullable: true),
                    duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    level_id = table.Column<int>(type: "integer", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    view_count = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("media_content_pkey", x => x.media_id);
                    table.ForeignKey(
                        name: "media_content_created_by_fkey",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "media_content_level_id_fkey",
                        column: x => x.level_id,
                        principalTable: "content_levels",
                        principalColumn: "level_id");
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    notification_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    body = table.Column<string>(type: "text", nullable: true),
                    data_json = table.Column<string>(type: "jsonb", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("notifications_pkey", x => x.notification_id);
                    table.ForeignKey(
                        name: "notifications_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "partner_profiles",
                columns: table => new
                {
                    profile_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    bio = table.Column<string>(type: "text", nullable: true),
                    rating_avg = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: true, defaultValue: 0m),
                    rating_count = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    hourly_rate = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: true),
                    specialties = table.Column<List<string>>(type: "text[]", nullable: true),
                    availability_json = table.Column<string>(type: "jsonb", nullable: true),
                    intro_video_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("partner_profiles_pkey", x => x.profile_id);
                    table.ForeignKey(
                        name: "partner_profiles_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_settings",
                columns: table => new
                {
                    setting_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    notify_email = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    notify_push = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    notify_sms = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    notify_booking_reminder = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    daily_goal_minutes = table.Column<int>(type: "integer", nullable: true, defaultValue: 15),
                    auto_play_next = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    playback_speed = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: true, defaultValue: 1.0m),
                    show_japanese_subs = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    theme = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true, defaultValueSql: "'light'::character varying"),
                    timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "'Asia/Tokyo'::character varying"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_settings_pkey", x => x.setting_id);
                    table.ForeignKey(
                        name: "user_settings_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    review_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reviewer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reviewee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("reviews_pkey", x => x.review_id);
                    table.ForeignKey(
                        name: "reviews_booking_id_fkey",
                        column: x => x.booking_id,
                        principalTable: "bookings",
                        principalColumn: "booking_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "reviews_reviewee_id_fkey",
                        column: x => x.reviewee_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "reviews_reviewer_id_fkey",
                        column: x => x.reviewer_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    message_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("messages_pkey", x => x.message_id);
                    table.ForeignKey(
                        name: "messages_conversation_id_fkey",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "conversation_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "messages_sender_id_fkey",
                        column: x => x.sender_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "exercises",
                columns: table => new
                {
                    exercise_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    question_text = table.Column<string>(type: "text", nullable: false),
                    question_text_ja = table.Column<string>(type: "text", nullable: true),
                    options_json = table.Column<string>(type: "jsonb", nullable: true),
                    correct_answer = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    explanation = table.Column<string>(type: "text", nullable: true),
                    explanation_ja = table.Column<string>(type: "text", nullable: true),
                    difficulty = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("exercises_pkey", x => x.exercise_id);
                    table.ForeignKey(
                        name: "exercises_media_id_fkey",
                        column: x => x.media_id,
                        principalTable: "media_content",
                        principalColumn: "media_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "media_category",
                columns: table => new
                {
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("media_category_pkey", x => new { x.media_id, x.category_id });
                    table.ForeignKey(
                        name: "media_category_category_id_fkey",
                        column: x => x.category_id,
                        principalTable: "content_categories",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "media_category_media_id_fkey",
                        column: x => x.media_id,
                        principalTable: "media_content",
                        principalColumn: "media_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transcripts",
                columns: table => new
                {
                    transcript_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_text = table.Column<string>(type: "text", nullable: false),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true, defaultValueSql: "'vi'::character varying"),
                    has_timestamps = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("transcripts_pkey", x => x.transcript_id);
                    table.ForeignKey(
                        name: "transcripts_media_id_fkey",
                        column: x => x.media_id,
                        principalTable: "media_content",
                        principalColumn: "media_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "viewing_history",
                columns: table => new
                {
                    history_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_position_ms = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    is_completed = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    replay_count = table.Column<int>(type: "integer", nullable: true, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("viewing_history_pkey", x => x.history_id);
                    table.ForeignKey(
                        name: "viewing_history_media_id_fkey",
                        column: x => x.media_id,
                        principalTable: "media_content",
                        principalColumn: "media_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "viewing_history_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quiz_attempts",
                columns: table => new
                {
                    attempt_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    exercise_id = table.Column<Guid>(type: "uuid", nullable: false),
                    selected_answer = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    time_taken_ms = table.Column<int>(type: "integer", nullable: true),
                    attempted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("quiz_attempts_pkey", x => x.attempt_id);
                    table.ForeignKey(
                        name: "quiz_attempts_exercise_id_fkey",
                        column: x => x.exercise_id,
                        principalTable: "exercises",
                        principalColumn: "exercise_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "quiz_attempts_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transcript_segments",
                columns: table => new
                {
                    segment_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    transcript_id = table.Column<Guid>(type: "uuid", nullable: false),
                    segment_index = table.Column<int>(type: "integer", nullable: false),
                    text = table.Column<string>(type: "text", nullable: false),
                    start_ms = table.Column<int>(type: "integer", nullable: false),
                    end_ms = table.Column<int>(type: "integer", nullable: false),
                    speaker = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("transcript_segments_pkey", x => x.segment_id);
                    table.ForeignKey(
                        name: "transcript_segments_transcript_id_fkey",
                        column: x => x.transcript_id,
                        principalTable: "transcripts",
                        principalColumn: "transcript_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "listening_errors",
                columns: table => new
                {
                    error_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    segment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    error_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    learner_heard = table.Column<string>(type: "text", nullable: true),
                    correct_text = table.Column<string>(type: "text", nullable: true),
                    reviewed = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("listening_errors_pkey", x => x.error_id);
                    table.ForeignKey(
                        name: "listening_errors_media_id_fkey",
                        column: x => x.media_id,
                        principalTable: "media_content",
                        principalColumn: "media_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "listening_errors_segment_id_fkey",
                        column: x => x.segment_id,
                        principalTable: "transcript_segments",
                        principalColumn: "segment_id");
                    table.ForeignKey(
                        name: "listening_errors_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shadowing_logs",
                columns: table => new
                {
                    log_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    segment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    recording_url = table.Column<string>(type: "text", nullable: true),
                    accuracy_score = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    practiced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("shadowing_logs_pkey", x => x.log_id);
                    table.ForeignKey(
                        name: "shadowing_logs_media_id_fkey",
                        column: x => x.media_id,
                        principalTable: "media_content",
                        principalColumn: "media_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "shadowing_logs_segment_id_fkey",
                        column: x => x.segment_id,
                        principalTable: "transcript_segments",
                        principalColumn: "segment_id");
                    table.ForeignKey(
                        name: "shadowing_logs_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_bookings_learner",
                table: "bookings",
                column: "learner_id");

            migrationBuilder.CreateIndex(
                name: "idx_bookings_partner",
                table: "bookings",
                column: "partner_id");

            migrationBuilder.CreateIndex(
                name: "idx_bookings_time",
                table: "bookings",
                column: "start_time");

            migrationBuilder.CreateIndex(
                name: "IX_bookings_cancelled_by",
                table: "bookings",
                column: "cancelled_by");

            migrationBuilder.CreateIndex(
                name: "content_categories_slug_key",
                table: "content_categories",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "conversations_learner_id_partner_id_key",
                table: "conversations",
                columns: new[] { "learner_id", "partner_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_conversations_learner",
                table: "conversations",
                column: "learner_id");

            migrationBuilder.CreateIndex(
                name: "idx_conversations_partner",
                table: "conversations",
                column: "partner_id");

            migrationBuilder.CreateIndex(
                name: "idx_exercises_media",
                table: "exercises",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "learner_profiles_user_id_key",
                table: "learner_profiles",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_listening_errors_type",
                table: "listening_errors",
                column: "error_type");

            migrationBuilder.CreateIndex(
                name: "idx_listening_errors_user",
                table: "listening_errors",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_listening_errors_media_id",
                table: "listening_errors",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "IX_listening_errors_segment_id",
                table: "listening_errors",
                column: "segment_id");

            migrationBuilder.CreateIndex(
                name: "idx_media_category_category",
                table: "media_category",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "idx_media_content_level",
                table: "media_content",
                column: "level_id");

            migrationBuilder.CreateIndex(
                name: "idx_media_content_published",
                table: "media_content",
                columns: new[] { "is_published", "published_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "idx_media_content_type",
                table: "media_content",
                column: "media_type");

            migrationBuilder.CreateIndex(
                name: "IX_media_content_created_by",
                table: "media_content",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "idx_messages_conversation",
                table: "messages",
                columns: new[] { "conversation_id", "sent_at" });

            migrationBuilder.CreateIndex(
                name: "idx_messages_sender",
                table: "messages",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "idx_messages_unread",
                table: "messages",
                columns: new[] { "conversation_id", "is_read" },
                filter: "(is_read = false)");

            migrationBuilder.CreateIndex(
                name: "idx_notifications_user",
                table: "notifications",
                columns: new[] { "user_id", "is_read", "created_at" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "idx_partner_profiles_rating",
                table: "partner_profiles",
                column: "rating_avg",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "partner_profiles_user_id_key",
                table: "partner_profiles",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_quiz_attempts_correct",
                table: "quiz_attempts",
                columns: new[] { "user_id", "is_correct" });

            migrationBuilder.CreateIndex(
                name: "idx_quiz_attempts_exercise",
                table: "quiz_attempts",
                column: "exercise_id");

            migrationBuilder.CreateIndex(
                name: "idx_quiz_attempts_user",
                table: "quiz_attempts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_reviews_booking",
                table: "reviews",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "idx_reviews_rating",
                table: "reviews",
                column: "rating");

            migrationBuilder.CreateIndex(
                name: "idx_reviews_reviewee",
                table: "reviews",
                column: "reviewee_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_reviewer_id",
                table: "reviews",
                column: "reviewer_id");

            migrationBuilder.CreateIndex(
                name: "reviews_booking_id_key",
                table: "reviews",
                column: "booking_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_shadowing_logs_media",
                table: "shadowing_logs",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "idx_shadowing_logs_user",
                table: "shadowing_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_shadowing_logs_segment_id",
                table: "shadowing_logs",
                column: "segment_id");

            migrationBuilder.CreateIndex(
                name: "idx_segments_order",
                table: "transcript_segments",
                columns: new[] { "transcript_id", "segment_index" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_segments_time",
                table: "transcript_segments",
                columns: new[] { "transcript_id", "start_ms", "end_ms" });

            migrationBuilder.CreateIndex(
                name: "transcripts_media_id_key",
                table: "transcripts",
                column: "media_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "user_settings_user_id_key",
                table: "user_settings",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_users_email",
                table: "users",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "users_email_key",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_viewing_history_completed",
                table: "viewing_history",
                columns: new[] { "user_id", "is_completed" });

            migrationBuilder.CreateIndex(
                name: "idx_viewing_history_media",
                table: "viewing_history",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "idx_viewing_history_user",
                table: "viewing_history",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "viewing_history_user_id_media_id_key",
                table: "viewing_history",
                columns: new[] { "user_id", "media_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "learner_profiles");

            migrationBuilder.DropTable(
                name: "listening_errors");

            migrationBuilder.DropTable(
                name: "media_category");

            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "partner_profiles");

            migrationBuilder.DropTable(
                name: "quiz_attempts");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "shadowing_logs");

            migrationBuilder.DropTable(
                name: "user_settings");

            migrationBuilder.DropTable(
                name: "viewing_history");

            migrationBuilder.DropTable(
                name: "content_categories");

            migrationBuilder.DropTable(
                name: "conversations");

            migrationBuilder.DropTable(
                name: "exercises");

            migrationBuilder.DropTable(
                name: "bookings");

            migrationBuilder.DropTable(
                name: "transcript_segments");

            migrationBuilder.DropTable(
                name: "transcripts");

            migrationBuilder.DropTable(
                name: "media_content");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "content_levels");
        }
    }
}
