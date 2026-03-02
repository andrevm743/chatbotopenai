codex/create-internal-office-chat-web-app-njscch
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AppError, fail, ok } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { parseOptionalString, parseRequiredString } from '@/lib/validation';
=======
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
main

export async function GET() {
  try {
    await requireAdmin();
    const docs = await prisma.knowledgeDocument.findMany({
      include: { attachment: true },
      orderBy: { updatedAt: 'desc' }
    });
codex/create-internal-office-chat-web-app-njscch
    return ok({ docs });
  } catch (error) {
    return fail(error);
=======
    return NextResponse.json({ docs });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
main
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
codex/create-internal-office-chat-web-app-njscch
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

=======
    const { title, attachmentId, tags } = await req.json();
    const at = await prisma.attachment.findUnique({ where: { id: attachmentId } });
main
    const doc = await prisma.knowledgeDocument.create({
      data: {
        title,
        attachmentId,
codex/create-internal-office-chat-web-app-njscch
        tags,
        extractedText: at.extractedText || ''
      }
    });

    return ok({ doc }, 201);
  } catch (error) {
    return fail(error);
=======
        tags: tags || '',
        extractedText: at?.extractedText || ''
      }
    });
    return NextResponse.json({ doc });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
main
  }
}
