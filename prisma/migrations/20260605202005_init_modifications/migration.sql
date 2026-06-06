-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AdSetting" (
    "position" TEXT NOT NULL PRIMARY KEY,
    "limit" INTEGER NOT NULL DEFAULT 5,
    "interval" INTEGER NOT NULL DEFAULT 10
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDemo" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Ad" ("active", "id", "imageUrl", "lien", "position", "titre") SELECT "active", "id", "imageUrl", "lien", "position", "titre" FROM "Ad";
DROP TABLE "Ad";
ALTER TABLE "new_Ad" RENAME TO "Ad";
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "imagePrincipale" TEXT NOT NULL,
    "datePublication" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteurId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "submenuId" TEXT,
    "alsoInActualites" BOOLEAN NOT NULL DEFAULT false,
    "actualitesSubmenuId" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Article_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_submenuId_fkey" FOREIGN KEY ("submenuId") REFERENCES "SubMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_actualitesSubmenuId_fkey" FOREIGN KEY ("actualitesSubmenuId") REFERENCES "SubMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("auteurId", "contenu", "datePublication", "id", "imagePrincipale", "menuId", "slug", "submenuId", "titre") SELECT "auteurId", "contenu", "datePublication", "id", "imagePrincipale", "menuId", "slug", "submenuId", "titre" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_menuId_idx" ON "Article"("menuId");
CREATE INDEX "Article_submenuId_idx" ON "Article"("submenuId");
CREATE INDEX "Article_datePublication_idx" ON "Article"("datePublication");
CREATE INDEX "Article_slug_idx" ON "Article"("slug");
CREATE INDEX "Article_actualitesSubmenuId_idx" ON "Article"("actualitesSubmenuId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
