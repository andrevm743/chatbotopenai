import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();
    const docs = await prisma.knowledgeDocument.findMany({
      include: { attachment: true },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ docs });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { title, attachmentId, tags } = await req.json();
    const at = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    const doc = await prisma.knowledgeDocument.create({
      data: {
        title,
        attachmentId,
        tags: tags || '',
        extractedText: at?.extractedText || ''
      }
    });
    return NextResponse.json({ doc });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
