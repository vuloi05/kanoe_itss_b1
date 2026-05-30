-- ═══════════════════════════════════════════════════════════════════════════════
-- TOKEN ECONOMY — Paid Connection via Token (70/30 Revenue Split)
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration adds the Token Economy feature:
--   - Learners spend tokens to initiate conversations with Partners
--   - Revenue split: Partner receives 70%, Platform retains 30%
--   - Default connection cost: 100 tokens
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add token_balance column to users table
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INT NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create token_transactions table (immutable audit log)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS token_transactions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id       UUID NOT NULL,
    partner_id       UUID NOT NULL,
    amount_paid      INT  NOT NULL DEFAULT 100,   -- Total tokens deducted from learner
    partner_received INT  NOT NULL DEFAULT 70,    -- 70% goes to partner
    platform_fee     INT  NOT NULL DEFAULT 30,    -- 30% retained by platform
    conversation_id  UUID,                        -- FK to conversation created by this transaction
    status           VARCHAR(20) NOT NULL DEFAULT 'completed',  -- completed | refunded | failed
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT token_transactions_learner_id_fkey
        FOREIGN KEY (learner_id)  REFERENCES users(user_id),
    CONSTRAINT token_transactions_partner_id_fkey
        FOREIGN KEY (partner_id)  REFERENCES users(user_id),
    CONSTRAINT token_transactions_conversation_id_fkey
        FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),

    -- Prevent duplicate charges for the same learner-partner pair
    CONSTRAINT token_transactions_no_duplicate
        UNIQUE (learner_id, partner_id, status)
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_learner  ON token_transactions (learner_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_partner  ON token_transactions (partner_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created  ON token_transactions (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Seed mock data — Give test users 1000 tokens for demo
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE users SET token_balance = 1000 WHERE email = 'abc@gmail.com';
UPDATE users SET token_balance = 1000 WHERE email = 'learner@test.com';
UPDATE users SET token_balance = 500  WHERE email = 'learner2@test.com';

-- Give all existing learners some starting tokens for demo convenience
UPDATE users SET token_balance = 500 WHERE role = 'learner' AND token_balance = 0;
