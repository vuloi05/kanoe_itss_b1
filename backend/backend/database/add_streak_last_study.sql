-- Migration: Add last_study_date column to learner_profiles
-- Required for streak calculation logic (tracks when user last studied)
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS last_study_date TIMESTAMPTZ;
