import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  // Sécurité : éviter les attaques de traversée de répertoire
  const safePath = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, '');
  if (!safePath) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  // Déterminer le dossier d'upload selon l'environnement
  const isProduction = process.env.NODE_ENV === 'production';
  const uploadsDir = isProduction
    ? (process.env.UPLOAD_DIR || '/var/data/news-platform/uploads')
    : path.join(process.cwd(), 'public', 'uploads');

  const filePath = path.join(uploadsDir, safePath);

  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    return new NextResponse('File not found', { status: 404 });
  }

  const stat = await fs.promises.stat(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Lire le fichier et le servir
  const fileStream = fs.createReadStream(filePath);
  const passThrough = new PassThrough();
  fileStream.pipe(passThrough);

  return new NextResponse(passThrough as any, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': stat.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

