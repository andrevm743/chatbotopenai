import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { extractTextWithGemini } from '@/lib/gemini';
import { AppError, fail, ok } from '@/lib/http';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_PREFIXES = ['application/pdf', 'image/', 'audio/'];

function isAllowedMime(mimeType: string) {
  return ALLOWED_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const kindRaw = form.get('kind');

    if (!(file instanceof File)) {
      throw new AppError(400, 'FILE_REQUIRED', 'Arquivo obrigatório');
    }

    if (typeof kindRaw !== 'string') {
      throw new AppError(400, 'KIND_REQUIRED', 'kind obrigatório');
    }

    const kind = kindRaw.toUpperCase();
    if (!['CHAT', 'KB'].includes(kind)) {
      throw new AppError(400, 'INVALID_KIND', 'kind deve ser chat ou kb');
    }

    if (!isAllowedMime(file.type || '')) {
      throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Tipo de arquivo não suportado');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError(413, 'FILE_TOO_LARGE', 'Arquivo excede 25MB');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = randomUUID();
    const ext = path.extname(file.name) || '.bin';
    const filename = `${id}${ext}`;
    const uploadDir = path.join(process.cwd(), 'data', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, filename);
    await fs.writeFile(fullPath, buffer);

    let extractedText = '';
    try {
      extractedText = await extractTextWithGemini({
        mimeType: file.type || 'application/octet-stream',
        base64Data: buffer.toString('base64'),
        originalName: file.name
      });
    } catch (error) {
      extractedText = `Falha de extração Gemini: ${String(error)}`;
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        kind: kind as 'CHAT' | 'KB',
        size: buffer.length,
        path: `data/uploads/${filename}`,
        extractedText
      }
    });

    return ok({ attachment }, 201);
  } catch (error) {
    return fail(error);
  }
}
