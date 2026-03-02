codex/create-internal-office-chat-web-app-njscch
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AppError, fail, ok } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { parseRequiredString } from '@/lib/validation';
=======
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
main

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
codex/create-internal-office-chat-web-app-njscch
    const safeId = parseRequiredString(id, 'id', 100);
    const body = await req.json();

    if (typeof body?.active !== 'boolean') {
      throw new AppError(400, 'INVALID_ACTIVE', 'Campo active deve ser boolean');
    }

    const existing = await prisma.knowledgeDocument.findUnique({ where: { id: safeId } });
    if (!existing) {
      throw new AppError(404, 'KNOWLEDGE_NOT_FOUND', 'Documento não encontrado');
    }

    const doc = await prisma.knowledgeDocument.update({
      where: { id: safeId },
      data: { active: body.active }
    });

    return ok({ doc });
  } catch (error) {
    return fail(error);
=======
    const { active } = await req.json();
    const doc = await prisma.knowledgeDocument.update({
      where: { id },
      data: { active: Boolean(active) }
    });
    return NextResponse.json({ doc });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
main
  }
}
