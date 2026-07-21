-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "sessionIdentifier" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "views" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Article_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_submenuId_fkey" FOREIGN KEY ("submenuId") REFERENCES "SubMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_actualitesSubmenuId_fkey" FOREIGN KEY ("actualitesSubmenuId") REFERENCES "SubMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("actualitesSubmenuId", "alsoInActualites", "auteurId", "contenu", "datePublication", "id", "imagePrincipale", "isDemo", "menuId", "slug", "submenuId", "titre") SELECT "actualitesSubmenuId", "alsoInActualites", "auteurId", "contenu", "datePublication", "id", "imagePrincipale", "isDemo", "menuId", "slug", "submenuId", "titre" FROM "Article";
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

-- CreateIndex
CREATE INDEX "Rating_articleId_idx" ON "Rating"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_articleId_sessionIdentifier_key" ON "Rating"("articleId", "sessionIdentifier");
