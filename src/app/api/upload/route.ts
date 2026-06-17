import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Limitation du débit (Token Bucket) en mémoire
const ipBuckets = new Map<string, { tokens: number; lastRefill: number }>();
const CAPACITY = 10; // Max 10 uploads
const REFILL_RATE = 1 / 10000; // 1 token toutes les 10 secondes (1 / 10000 ms)

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let bucket = ipBuckets.get(ip);
  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
    ipBuckets.set(ip, bucket);
  }

  // Recharge des tokens basés sur le temps écoulé
  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + elapsed * REFILL_RATE);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  // Vérification de l'authentification
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== 'journalist' && (session.user as any).role !== 'admin')) {
    return NextResponse.json({ error: 'Accès non autorisé. Journalistes et Admins uniquement.' }, { status: 401 });
  }

  // Limitation du débit
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez patienter quelques instants avant de ré-uploader.' },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier n’a été fourni.' }, { status: 400 });
    }

    // Validation des formats de fichier supportés
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format invalide. Formats supportés : JPEG, PNG, WEBP et GIF.' },
        { status: 400 }
      );
    }

    // Validation de la taille maximale (5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd. Limite : 5 Mo.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Optimisation de l'image (Redimensionnement 1200px de large, compression WebP)
    const processedBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // S'assurer que le dossier d'uploads local existe
    // const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    // if (!fs.existsSync(uploadsDir)) {
    //   fs.mkdirSync(uploadsDir, { recursive: true });
    // }
    // Déterminer le dossier d'upload selon l'environnement
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadsDir = isProduction
      ? (process.env.UPLOAD_DIR || '/var/data/news-platform/uploads')
      : path.join(process.cwd(), 'public', 'uploads');

    // Créer le dossier s'il n'existe pas (utile en développement)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Nom de fichier unique avec extension .webp
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
    const filePath = path.join(uploadsDir, filename);

    // Écriture du fichier sur le stockage local (en dev et serveurs persistants)
    fs.writeFileSync(filePath, processedBuffer);

    // URL relative de l'image générée
    // const url = `/uploads/${filename}`;
    const url = `/api/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l’upload de l’image.' }, { status: 500 });
  }
}
