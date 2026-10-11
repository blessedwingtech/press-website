#!/bin/bash
set -e
cd ~/news-platform

echo "🧹 Nettoyage des modifications locales temporaires..."
git checkout -- prisma/schema.prisma

echo "📥 Pull des dernières modifications..."
git pull origin main

echo "🔧 Adaptation du provider Prisma pour PostgreSQL..."
sed -i 's/provider = env("DATABASE_PROVIDER")/provider = "postgresql"/' prisma/schema.prisma
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "📦 Installation des dépendances..."
npm ci --ignore-scripts

echo "🔄 Génération du client Prisma..."
npx prisma generate

echo "🗄️ Synchronisation de la base de données..."
npx prisma db push --accept-data-loss=false

echo "🗑️ Suppression de l'ancien build (évite les ChunkLoadError)..."
rm -rf .next

echo "🏗️ Build de l'application..."
npm run build

echo "📁 Copie des fichiers statiques..."
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/

echo "📁 Copie des fichiers publics..."
cp -r public/ .next/standalone/

echo "🔗 Création du lien symbolique pour les uploads..."
cd .next/standalone
mkdir -p public
rm -rf public/uploads
ln -sf /var/data/news-platform/uploads public/uploads
cd ../..

echo "🔄 Redémarrage du service..."
sudo systemctl restart news-platform

echo "✅ Déploiement terminé avec succès !"
