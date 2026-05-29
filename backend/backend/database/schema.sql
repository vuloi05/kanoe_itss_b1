-- ======================================================================
-- -----------------------------------------------------------------------------
-- VietImmerse — Database Schema (Source of Truth)
-- ======================================================================
-- -----------------------------------------------------------------------------
-- This file is the AUTHORITATIVE DDL for all tables.
-- DatabaseSeeder.cs auto-applies this file on startup when content changes.
-- All statements use CREATE TABLE IF NOT EXISTS for idempotent re-execution.
--
-- ⚠️  EF Core Migrations are NOT used — schema is managed here.
-- ======================================================================
-- -----------------------------------------------------------------------------
--
-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  CRITICAL RULE — READ BEFORE EDITING                                    ║
-- ║                                                                         ║
-- ║  When adding a NEW COLUMN to an EXISTING table, you MUST do BOTH:       ║
-- ║                                                                         ║
-- ║    1. Declare the column inside the CREATE TABLE block (for fresh DBs). ║
-- ║    2. Add an ALTER TABLE … ADD COLUMN IF NOT EXISTS statement in the    ║
-- ║       "IDEMPOTENT COLUMN PATCHES" section at the BOTTOM of this file    ║
-- ║       (for existing DBs where CREATE TABLE IF NOT EXISTS is a no-op).   ║
-- ║                                                                         ║
-- ║  Failure to do BOTH will cause the Seeder to crash on environments      ║
-- ║  that already have the table but lack the new column.                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

-- Custom ENUM types (managed by Npgsql)
-- CREATE TYPE account_status   AS ENUM ('active','inactive','suspended','pending_verification');
-- CREATE TYPE booking_status   AS ENUM ('pending','confirmed','completed','cancelled','no_show');
-- CREATE TYPE user_role        AS ENUM ('admin','learner','partner','guest');
-- CREATE TYPE learner_level    AS ENUM ('basic','intermediate','advanced');
-- CREATE TYPE notification_type AS ENUM ('system','booking_reminder','new_message','review_received','progress_milestone');
-- CREATE TYPE partner_profile_status AS ENUM ('draft','pending_review','approved','rejected');
-- CREATE TYPE content_category_type  AS ENUM ('shopping','taxi','dining','greeting','work','culture','grammar','pronunciation','daily_life');

-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
    user_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    display_name        VARCHAR(100) NOT NULL,
    avatar_url          TEXT,
    phone               VARCHAR(20),
    country_code        VARCHAR(5)   DEFAULT 'JP',
    language_pref       VARCHAR(10)  DEFAULT 'ja',
    role                VARCHAR(20)  NOT NULL DEFAULT 'guest',
    account_status      VARCHAR(30)  NOT NULL DEFAULT 'active',
    is_online           BOOLEAN      NOT NULL DEFAULT false,
    last_seen           TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT users_email_key UNIQUE (email)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS learner_profiles (
    profile_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL UNIQUE,
    total_study_hours NUMERIC(6,2) DEFAULT 0,
    videos_completed INT DEFAULT 0,
    current_streak   INT DEFAULT 0,
    longest_streak   INT DEFAULT 0,
    goals            TEXT,
    native_language  VARCHAR(10) DEFAULT 'ja',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT learner_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS partner_profiles (
    profile_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL UNIQUE,
    bio               TEXT,
    rating_avg        NUMERIC(3,2) DEFAULT 0,
    rating_count      INT DEFAULT 0,
    hourly_rate       NUMERIC(8,2),
    specialties       TEXT[],
    availability_json JSONB,
    intro_video_url   TEXT,
    age_range         VARCHAR(10),
    job               VARCHAR(30),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT partner_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_rating ON partner_profiles (rating_avg DESC);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id      UUID NOT NULL,
    partner_id      UUID NOT NULL,
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT conversations_learner_id_fkey  FOREIGN KEY (learner_id) REFERENCES users(user_id),
    CONSTRAINT conversations_partner_id_fkey  FOREIGN KEY (partner_id) REFERENCES users(user_id),
    CONSTRAINT conversations_learner_id_partner_id_key UNIQUE (learner_id, partner_id)
);
CREATE INDEX IF NOT EXISTS idx_conversations_learner ON conversations (learner_id);
CREATE INDEX IF NOT EXISTS idx_conversations_partner ON conversations (partner_id);

CREATE TABLE IF NOT EXISTS messages (
    message_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id    UUID NOT NULL,
    sender_id          UUID NOT NULL,
    content            TEXT NOT NULL,
    content_translated TEXT,
    message_type       VARCHAR(20) DEFAULT 'text',
    booking_id         UUID,
    is_read            BOOLEAN NOT NULL DEFAULT false,
    sent_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
    CONSTRAINT messages_sender_id_fkey       FOREIGN KEY (sender_id)       REFERENCES users(user_id)
);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (conversation_id, is_read) WHERE is_read = false;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
    booking_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id     UUID NOT NULL,
    partner_id     UUID NOT NULL,
    start_time     TIMESTAMPTZ NOT NULL,
    end_time       TIMESTAMPTZ NOT NULL,
    status         VARCHAR(20) DEFAULT 'pending',
    topic          TEXT,
    notes          TEXT,
    cancelled_by   UUID,
    cancel_reason  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bookings_learner_id_fkey     FOREIGN KEY (learner_id)   REFERENCES users(user_id),
    CONSTRAINT bookings_partner_id_fkey     FOREIGN KEY (partner_id)   REFERENCES users(user_id),
    CONSTRAINT bookings_cancelled_by_fkey   FOREIGN KEY (cancelled_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL UNIQUE,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    rating      INT NOT NULL,
    comment     TEXT,
    is_public   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT reviews_booking_id_fkey  FOREIGN KEY (booking_id)  REFERENCES bookings(booking_id),
    CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES users(user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    title           VARCHAR(200) NOT NULL,
    body            TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS user_settings (
    setting_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL UNIQUE,
    theme                  VARCHAR(10) DEFAULT 'light',
    playback_speed         NUMERIC(3,1) DEFAULT 1.0,
    show_japanese_subs     BOOLEAN DEFAULT true,
    auto_play_next         BOOLEAN DEFAULT true,
    daily_goal_minutes     INT DEFAULT 15,
    notify_push            BOOLEAN DEFAULT true,
    notify_email           BOOLEAN DEFAULT true,
    notify_sms             BOOLEAN DEFAULT false,
    notify_booking_reminder BOOLEAN DEFAULT true,
    timezone               VARCHAR(50) DEFAULT 'Asia/Tokyo',
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CONTENT & LEARNING
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_levels (
    level_id     SERIAL PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    description  TEXT,
    sort_order   INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS content_categories (
    category_id  SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    description  TEXT
);

CREATE TABLE IF NOT EXISTS chapters (
    chapter_id SERIAL PRIMARY KEY,
    level_id   INT NOT NULL,
    title_vi   VARCHAR(255) NOT NULL,
    title_jp   VARCHAR(255) NOT NULL,
    icon       VARCHAR(50)  NOT NULL,
    sort_order INT NOT NULL,
    CONSTRAINT chapters_level_id_fkey FOREIGN KEY (level_id) REFERENCES content_levels(level_id)
);

CREATE TABLE IF NOT EXISTS lessons (
    lesson_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id       INT NOT NULL,
    scene_label      VARCHAR(100) NOT NULL,
    scene_label_jp   VARCHAR(100) NOT NULL,
    title_vi         VARCHAR(255) NOT NULL,
    title_jp         VARCHAR(255) NOT NULL,
    subtitle_vi      TEXT NOT NULL,
    subtitle_jp      TEXT NOT NULL,
    tag              VARCHAR(50),
    tag_jp           VARCHAR(50),
    duration_minutes INT,
    sort_order       INT NOT NULL,
    is_locked        BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT lessons_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id)
);

CREATE TABLE IF NOT EXISTS lesson_dialogues (
    dialogue_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id            UUID NOT NULL,
    speaker              VARCHAR(50) NOT NULL,
    speaker_jp           VARCHAR(50) NOT NULL,
    line_vi              TEXT NOT NULL,
    line_jp              TEXT NOT NULL,
    is_active            BOOLEAN NOT NULL DEFAULT false,
    highlight_words_json JSONB,
    sort_order           INT NOT NULL,
    CONSTRAINT lesson_dialogues_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

CREATE TABLE IF NOT EXISTS lesson_tone_notes (
    note_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id  UUID NOT NULL,
    tone       VARCHAR(50)  NOT NULL,
    desc_vi    TEXT NOT NULL,
    desc_jp    TEXT NOT NULL,
    example    VARCHAR(255) NOT NULL,
    color      VARCHAR(50)  NOT NULL,
    sort_order INT NOT NULL,
    CONSTRAINT lesson_tone_notes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media_content (
    media_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    url         TEXT NOT NULL,
    thumbnail_url TEXT,
    media_type  VARCHAR(20),
    duration_seconds INT,
    level_id    INT NOT NULL,
    created_by  UUID,
    view_count  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT media_content_level_id_fkey    FOREIGN KEY (level_id)   REFERENCES content_levels(level_id),
    CONSTRAINT media_content_created_by_fkey  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS media_category (
    media_id    UUID NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (media_id, category_id),
    CONSTRAINT media_category_media_id_fkey    FOREIGN KEY (media_id)    REFERENCES media_content(media_id),
    CONSTRAINT media_category_category_id_fkey FOREIGN KEY (category_id) REFERENCES content_categories(category_id)
);
CREATE INDEX IF NOT EXISTS idx_media_category_category ON media_category (category_id);

CREATE TABLE IF NOT EXISTS transcripts (
    transcript_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id       UUID NOT NULL UNIQUE,
    full_text      TEXT,
    language       VARCHAR(10) DEFAULT 'vi',
    has_timestamps BOOLEAN DEFAULT false,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT transcripts_media_id_fkey FOREIGN KEY (media_id) REFERENCES media_content(media_id)
);

CREATE TABLE IF NOT EXISTS transcript_segments (
    segment_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL,
    start_ms      INT NOT NULL,
    end_ms        INT NOT NULL,
    text_vi       TEXT NOT NULL,
    text_jp       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT transcript_segments_transcript_id_fkey FOREIGN KEY (transcript_id) REFERENCES transcripts(transcript_id)
);

CREATE TABLE IF NOT EXISTS exercises (
    exercise_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id       UUID NOT NULL,
    question       TEXT NOT NULL,
    options_json   JSONB,
    correct_answer TEXT NOT NULL,
    explanation    TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT exercises_media_id_fkey FOREIGN KEY (media_id) REFERENCES media_content(media_id)
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS viewing_history (
    history_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,
    media_id         UUID NOT NULL,
    last_position_ms INT DEFAULT 0,
    is_completed     BOOLEAN DEFAULT false,
    replay_count     INT DEFAULT 0,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at      TIMESTAMPTZ,
    CONSTRAINT viewing_history_user_id_fkey  FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT viewing_history_media_id_fkey FOREIGN KEY (media_id) REFERENCES media_content(media_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    exercise_id  UUID NOT NULL,
    user_answer  TEXT NOT NULL,
    is_correct   BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT quiz_attempts_user_id_fkey     FOREIGN KEY (user_id)     REFERENCES users(user_id),
    CONSTRAINT quiz_attempts_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

CREATE TABLE IF NOT EXISTS shadowing_logs (
    log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,
    media_id       UUID NOT NULL,
    segment_id     UUID,
    score          NUMERIC(5,2),
    feedback_json  JSONB,
    practiced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT shadowing_logs_user_id_fkey    FOREIGN KEY (user_id)    REFERENCES users(user_id),
    CONSTRAINT shadowing_logs_media_id_fkey   FOREIGN KEY (media_id)   REFERENCES media_content(media_id),
    CONSTRAINT shadowing_logs_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES transcript_segments(segment_id)
);

CREATE TABLE IF NOT EXISTS listening_errors (
    error_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    media_id    UUID NOT NULL,
    segment_id  UUID,
    error_text  TEXT,
    correct_text TEXT,
    reviewed    BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT listening_errors_user_id_fkey    FOREIGN KEY (user_id)    REFERENCES users(user_id),
    CONSTRAINT listening_errors_media_id_fkey   FOREIGN KEY (media_id)   REFERENCES media_content(media_id),
    CONSTRAINT listening_errors_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES transcript_segments(segment_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- VOICE LAB (Pronunciation Scoring)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS voice_lab_records (
    record_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Nullable during dev (AllowAnonymous); set NOT NULL before production
    user_id             UUID,
    expected_text       TEXT NOT NULL,
    actual_text         TEXT,
    completeness_score  NUMERIC(5,2),
    accuracy_score      NUMERIC(5,2),
    fluency_score       NUMERIC(5,2),
    prosody_score       NUMERIC(5,2),
    audio_duration      NUMERIC(8,3),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT voice_lab_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE INDEX IF NOT EXISTS idx_voice_lab_records_user ON voice_lab_records (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- LESSON PROGRESS (Per-user lesson completion tracking)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_progress (
    progress_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    lesson_id    UUID NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    progress     INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT lesson_progress_user_id_fkey   FOREIGN KEY (user_id)   REFERENCES users(user_id),
    CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id),
    CONSTRAINT lesson_progress_unique         UNIQUE (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress (user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- IDEMPOTENT COLUMN PATCHES
-- ═══════════════════════════════════════════════════════════════════════════════
-- These ALTER statements ensure new columns are added to tables that already
-- exist in the database. CREATE TABLE IF NOT EXISTS silently skips DDL when the
-- table is present, so any columns added after initial creation would be missed.
--
-- Each statement uses ADD COLUMN IF NOT EXISTS to remain safe for re-execution.
-- ═══════════════════════════════════════════════════════════════════════════════

-- lesson_progress.progress — tracks lesson completion percentage (0-100)
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;

-- -----------------------------------------------------------------------------
-- PASSWORD RESETS (OTP / Reset Tokens)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_resets (
    reset_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255) NOT NULL,
    otp_code          VARCHAR(10) NOT NULL,
    otp_expires_at    TIMESTAMPTZ NOT NULL,
    reset_token       VARCHAR(255) DEFAULT NULL,
    token_expires_at  TIMESTAMPTZ DEFAULT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets (email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets (reset_token);

