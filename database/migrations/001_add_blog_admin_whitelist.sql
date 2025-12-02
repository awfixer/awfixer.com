-- Migration: Add Blog Admin Whitelist Support
-- Description: Adds is_blog_admin column to user table and creates blog_admin_whitelist table
-- Date: 2024
-- Run this migration if you already have the base schema installed

-- Add is_blog_admin column to user table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user' AND column_name = 'is_blog_admin'
    ) THEN
        ALTER TABLE "user" ADD COLUMN is_blog_admin BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Create blog_admin_whitelist table if it doesn't exist
CREATE TABLE IF NOT EXISTS "blog_admin_whitelist" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    discord_id TEXT NOT NULL UNIQUE,
    added_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on is_blog_admin for performance (partial index on true values only)
CREATE INDEX IF NOT EXISTS idx_user_is_blog_admin
ON "user"(is_blog_admin)
WHERE is_blog_admin = true;

-- Create index on blog_admin_whitelist discord_id
CREATE INDEX IF NOT EXISTS idx_blog_admin_whitelist_discord_id
ON "blog_admin_whitelist"(discord_id);

-- Add RLS policies for blog_admin_whitelist table
ALTER TABLE "blog_admin_whitelist" ENABLE ROW LEVEL SECURITY;

-- Only admins can view the whitelist
CREATE POLICY "Only admins can view whitelist" ON "blog_admin_whitelist"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "user"
            WHERE "user".id = auth.uid()::text
            AND "user".is_blog_admin = true
        )
    );

-- Service role can manage whitelist
CREATE POLICY "Service role can manage whitelist" ON "blog_admin_whitelist"
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger for updating timestamps on blog_admin_whitelist
CREATE TRIGGER update_blog_admin_whitelist_updated_at
    BEFORE UPDATE ON "blog_admin_whitelist"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to sync whitelist with user table (helper function)
CREATE OR REPLACE FUNCTION sync_blog_admin_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- When added to whitelist, mark user as blog admin
        UPDATE "user"
        SET is_blog_admin = true
        WHERE discord_id = NEW.discord_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- When removed from whitelist, unmark user as blog admin
        UPDATE "user"
        SET is_blog_admin = false
        WHERE discord_id = OLD.discord_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync blog admin status
CREATE TRIGGER sync_user_blog_admin_status
    AFTER INSERT OR DELETE ON "blog_admin_whitelist"
    FOR EACH ROW
    EXECUTE FUNCTION sync_blog_admin_status();

-- Populate whitelist from environment variable (optional)
-- This requires a custom function to read the BLOG_ADMIN_WHITELIST env var
-- Run manually after setting BLOG_ADMIN_WHITELIST if needed:
--
-- INSERT INTO blog_admin_whitelist (discord_id, notes)
-- VALUES
--   ('123456789012345678', 'Initial admin - added via migration'),
--   ('987654321098765432', 'Initial admin - added via migration')
-- ON CONFLICT (discord_id) DO NOTHING;

COMMENT ON TABLE "blog_admin_whitelist" IS 'Whitelist of Discord user IDs authorized to access blog admin panel';
COMMENT ON COLUMN "blog_admin_whitelist"."discord_id" IS 'Discord user ID from OAuth authentication';
COMMENT ON COLUMN "blog_admin_whitelist"."added_by" IS 'Email or ID of person who added this user to whitelist';
COMMENT ON COLUMN "blog_admin_whitelist"."notes" IS 'Reason or context for granting blog admin access';
COMMENT ON COLUMN "user"."is_blog_admin" IS 'Flag indicating if user has blog admin access (synced from whitelist)';
