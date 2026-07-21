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

    // Validation des formats de fichier supportés (Images et Vidéos)
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Format invalide. Formats supportés : Images et Vidéos.' },
        { status: 400 }
      );
    }

    // Validation de la taille maximale (5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd. Limite : 5 Mo.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // S'assurer que le dossier d'uploads local existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let filename = '';
    let finalBuffer: Buffer | any = buffer;

    if (isVideo) {
      // Obtenir l'extension d'origine de la vidéo
      let ext = 'mp4';
      if (file.type === 'video/webm') ext = 'webm';
      else if (file.type === 'video/ogg') ext = 'ogg';
      else if (file.type === 'video/quicktime') ext = 'mov';
      
      filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    } else {
      // Optimisation de l'image (Redimensionnement 1200px, compression WebP)
      try {
        finalBuffer = await sharp(buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
      } catch (sharpError: any) {
        console.error('Sharp processing error:', sharpError);
        return NextResponse.json(
          { error: 'Le format de cette image n\'est pas supporté (ex: HEIC) ou le fichier est corrompu.' },
          { status: 400 }
        );
      }
      
      filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
    }

    const filePath = path.join(uploadsDir, filename);

    // Écriture du fichier sur le stockage local
    fs.writeFileSync(filePath, finalBuffer);

    // URL relative de la ressource générée
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l’upload du média.' }, { status: 500 });
  }
}
