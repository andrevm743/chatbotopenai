import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AppError, fail, ok } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { ensurePrompts } from '@/lib/prompts';
import { parseMode, parseRequiredString } from '@/lib/validation';

export async function GET() {
  try {
    await requireAdmin();
    await ensurePrompts();
    const prompts = await prisma.prompt.findMany({ orderBy: { mode: 'asc' } });
    return ok({ prompts });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const mode = parseMode(body?.mode);
    const content = parseRequiredString(body?.content, 'content', 12000);

    const saved = await prisma.prompt.upsert({
      where: { mode },
      update: { content },
      create: { mode, content }
    });

    return ok({ prompt: saved });
  } catch (error) {
    if (error instanceof AppError) return fail(error);
    return fail(error);
  }
}
