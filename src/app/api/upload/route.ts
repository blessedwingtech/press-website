import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';

console.log('🔍 [Upload] R2_PUBLIC_URL =', process.env.R2_PUBLIC_URL);
console.log('🔍 [Upload] R2_BUCKET_NAME =', process.env.R2_BUCKET_NAME);
console.log('🔍 [Upload] R2_ACCOUNT_ID =', process.env.R2_ACCOUNT_ID);

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Rate limiting (gardé)
const ipBuckets = new Map<string, { tokens: number; lastRefill: number }>();
const CAPACITY = 10;
const REFILL_RATE = 1 / 10000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let bucket = ipBuckets.get(ip);
  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
    ipBuckets.set(ip, bucket);
  }
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
  const session = await getServerSession(authOptions);
  if (!session || !['journalist', 'admin'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Patientez.' },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier > 5 Mo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
    const key = `uploads/${filename}`;

    await R2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
