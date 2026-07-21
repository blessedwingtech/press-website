import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Initialisation conditionnelle du client Cloudflare R2
const isR2Configured =
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME &&
  process.env.R2_PUBLIC_URL;

const R2 = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    // 1. Limite de taille à 5 Mo
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Le fichier dépasse la limite autorisée de 5 Mo.' }, { status: 400 });
    }

    // 2. Vérification du type (seulement les images pour les avatars)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Seuls les formats d\'image PNG, JPG, GIF et WEBP sont autorisés.' }, { status: 400 });
    }

    // 3. Lire le buffer du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Optimisation de l'image (redimensionnement pour avatar à 400px maximum, compression webp)
    let processedBuffer;
    try {
      processedBuffer = await sharp(buffer)
        .resize({ width: 400, height: 400, fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (sharpError: any) {
      console.error('Sharp processing error:', sharpError);
      return NextResponse.json(
        { error: 'Le format de cette image n\'est pas supporté (ex: HEIC) ou le fichier est corrompu.' },
        { status: 400 }
      );
    }

    const filename = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;

    // 5. Uploader vers Cloudflare R2 si configuré (Production)
    if (R2 && isR2Configured) {
      const key = `avatars/${filename}`;
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
    }

    // 6. Sinon, sauvegarder en local (Développement)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, processedBuffer);

    // URL relative publique locale
    const fileUrl = `/uploads/avatars/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error('Error in avatar upload:', error);
    return NextResponse.json({ error: error.message || 'Une erreur est survenue lors du téléversement.' }, { status: 500 });
  }
}
