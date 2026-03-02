import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTextWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const kind = (form.get('kind') as string | null)?.toUpperCase();

  if (!file || !kind || !['CHAT', 'KB'].includes(kind)) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
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

  return NextResponse.json({ attachment });
}
