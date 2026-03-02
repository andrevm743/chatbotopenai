codex/create-internal-office-chat-web-app-njscch
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AppError, fail, ok } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { ensurePrompts } from '@/lib/prompts';
import { parseMode, parseRequiredString } from '@/lib/validation';
=======
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensurePrompts } from '@/lib/prompts';
main

export async function GET() {
  try {
    await requireAdmin();
    await ensurePrompts();
    const prompts = await prisma.prompt.findMany({ orderBy: { mode: 'asc' } });
codex/create-internal-office-chat-web-app-njscch
    return ok({ prompts });
  } catch (error) {
    return fail(error);
=======
    return NextResponse.json({ prompts });
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
    const mode = parseMode(body?.mode);
    const content = parseRequiredString(body?.content, 'content', 12000);

=======
    const { mode, content } = await req.json();
main
    const saved = await prisma.prompt.upsert({
      where: { mode },
      update: { content },
      create: { mode, content }
    });
codex/create-internal-office-chat-web-app-njscch

    return ok({ prompt: saved });
  } catch (error) {
    if (error instanceof AppError) return fail(error);
    return fail(error);
=======
    return NextResponse.json({ prompt: saved });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
main
  }
}
