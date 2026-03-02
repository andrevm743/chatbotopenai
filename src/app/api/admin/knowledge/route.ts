import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AppError, fail, ok } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { parseOptionalString, parseRequiredString } from '@/lib/validation';

export async function GET() {
  try {
    await requireAdmin();
    const docs = await prisma.knowledgeDocument.findMany({
      include: { attachment: true },
      orderBy: { updatedAt: 'desc' }
    });
    return ok({ docs });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const title = parseRequiredString(body?.title, 'title', 250);
    const attachmentId = parseRequiredString(body?.attachmentId, 'attachmentId', 100);
    const tags = parseOptionalString(body?.tags, 500) || '';

    const at = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!at) {
      throw new AppError(404, 'ATTACHMENT_NOT_FOUND', 'Anexo não encontrado');
    }

    if (at.kind !== 'KB') {
      throw new AppError(400, 'INVALID_ATTACHMENT_KIND', 'O anexo deve ser do tipo KB');
    }

    const doc = await prisma.knowledgeDocument.create({
      data: {
        title,
        attachmentId,
        tags,
        extractedText: at.extractedText || ''
      }
    });

    return ok({ doc }, 201);
  } catch (error) {
    return fail(error);
  }
}
