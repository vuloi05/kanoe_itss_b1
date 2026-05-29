-- =============================================================================
-- FIX: Remove invalid progress data for abc@gmail.com (V2 chapters 10–16)
-- =============================================================================
-- Context:
--   User abc@gmail.com has level V2. With Sequential Chapter Unlocking,
--   Chapter 2 (ch10) onward should be LOCKED because Chapter 1 (ch9) is
--   only 3/7 lessons completed (base L1-L3 done, extra L4-L7 not started).
--
--   This script deletes all lesson_progress records for chapters 10–16
--   (V2 Ch2–Ch8) so the UI correctly shows them as locked.
--
-- Safe to re-run: DELETE WHERE is idempotent on empty result sets.
-- =============================================================================

BEGIN;

DO $$
DECLARE
    v_user_id UUID;
    v_deleted INT;
BEGIN
    SELECT user_id INTO v_user_id FROM users WHERE email = 'abc@gmail.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User abc@gmail.com not found — skipping fix';
        RETURN;
    END IF;

    -- Delete progress for V2 chapters 10-16 (Ch2-Ch8)
    -- Keeps Ch9 (V2 Ch1) progress intact: 3 base lessons completed
    DELETE FROM lesson_progress
    WHERE user_id = v_user_id
      AND lesson_id IN (
          SELECT lesson_id FROM lessons
          WHERE chapter_id IN (10, 11, 12, 13, 14, 15, 16)
      );

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % progress records for abc@gmail.com (V2 Ch10-16)', v_deleted;
END $$;

COMMIT;
