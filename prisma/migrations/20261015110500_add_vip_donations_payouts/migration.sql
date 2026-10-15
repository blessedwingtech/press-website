-- Migration: add_vip_donations_payouts (PostgreSQL compatible)
-- Adds isVip on Article, whatsappChannel/bio/twitter/balances on User, and creates Donation and Payout tables

-- 1. Add columns to User
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "whatsappChannel" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "bio" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "twitter" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "balanceHTG" DOUBLE PRECISION NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "balanceUSD" DOUBLE PRECISION NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. Add isVip to Article
DO $$ BEGIN
  ALTER TABLE "Article" ADD COLUMN "isVip" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. Create Donation Table (Revenue Share 85% Journalist / 15% PressTonik)
CREATE TABLE IF NOT EXISTS "Donation" (
    "id"            TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount"        DOUBLE PRECISION NOT NULL,
    "currency"      TEXT NOT NULL DEFAULT 'USD',
    "netAmount"     DOUBLE PRECISION NOT NULL,
    "platformFee"   DOUBLE PRECISION NOT NULL,
    "authorId"      TEXT NOT NULL,
    "articleId"     TEXT,
    "donorName"     TEXT,
    "donorEmail"    TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Donation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Donation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Donation_transactionId_key" ON "Donation"("transactionId");
CREATE INDEX IF NOT EXISTS "Donation_authorId_idx" ON "Donation"("authorId");
CREATE INDEX IF NOT EXISTS "Donation_articleId_idx" ON "Donation"("articleId");

-- 4. Create Payout Table (Demandes de reversement des journalistes)
CREATE TABLE IF NOT EXISTS "Payout" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "amount"        DOUBLE PRECISION NOT NULL,
    "currency"      TEXT NOT NULL DEFAULT 'HTG',
    "method"        TEXT NOT NULL,
    "methodDetails" TEXT NOT NULL,
    "status"        TEXT NOT NULL DEFAULT 'PENDING',
    "note"          TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Payout_userId_idx" ON "Payout"("userId");
