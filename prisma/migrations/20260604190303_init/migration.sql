-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reader',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "SubMenu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "menuId" TEXT NOT NULL,
    CONSTRAINT "SubMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "imagePrincipale" TEXT NOT NULL,
    "datePublication" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteurId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "submenuId" TEXT,
    CONSTRAINT "Article_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_submenuId_fkey" FOREIGN KEY ("submenuId") REFERENCES "SubMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_slug_key" ON "Menu"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SubMenu_slug_key" ON "SubMenu"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_menuId_idx" ON "Article"("menuId");

-- CreateIndex
CREATE INDEX "Article_submenuId_idx" ON "Article"("submenuId");

-- CreateIndex
CREATE INDEX "Article_datePublication_idx" ON "Article"("datePublication");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "Article"("slug");
