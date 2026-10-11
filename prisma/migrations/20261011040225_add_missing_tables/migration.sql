-- Migration: add_missing_tables (PostgreSQL compatible)
-- Safely adds columns and tables missing from earlier migrations.
-- Uses DO $$ blocks for ALTER TABLE to avoid errors if columns already exist.

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Add profilePhoto to User (safe: skip if already exists)
-- ──────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "profilePhoto" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Add impressions, clicks, ownerId to Ad
-- ──────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "Ad" ADD COLUMN "impressions" INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Ad" ADD COLUMN "clicks" INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Ad" ADD COLUMN "ownerId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Create SystemSetting table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "key"   TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Create AdSetting table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AdSetting" (
    "position" TEXT NOT NULL,
    "limit"    INTEGER NOT NULL DEFAULT 5,
    "interval" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "AdSetting_pkey" PRIMARY KEY ("position")
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Create GalleryImage table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id"          TEXT NOT NULL,
    "url"         TEXT NOT NULL,
    "title"       TEXT,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"      TEXT NOT NULL,
    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GalleryImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. Create AccountRequest table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AccountRequest" (
    "id"                TEXT NOT NULL,
    "name"              TEXT NOT NULL,
    "username"          TEXT NOT NULL,
    "email"             TEXT NOT NULL,
    "role"              TEXT NOT NULL DEFAULT 'reader',
    "profilePhoto"      TEXT,
    "status"            TEXT NOT NULL DEFAULT 'PENDING',
    "confirmationToken" TEXT NOT NULL,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountRequest_pkey" PRIMARY KEY ("id")
);

-- Unique indexes for AccountRequest (safe)
CREATE UNIQUE INDEX IF NOT EXISTS "AccountRequest_username_key" ON "AccountRequest"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountRequest_email_key" ON "AccountRequest"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountRequest_confirmationToken_key" ON "AccountRequest"("confirmationToken");

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. Unique index for User.resetToken (safe)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");
