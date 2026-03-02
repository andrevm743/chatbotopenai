import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensurePrompts } from '@/lib/prompts';

export async function GET() {
  try {
    await requireAdmin();
    await ensurePrompts();
    const prompts = await prisma.prompt.findMany({ orderBy: { mode: 'asc' } });
    return NextResponse.json({ prompts });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { mode, content } = await req.json();
    const saved = await prisma.prompt.upsert({
      where: { mode },
      update: { content },
      create: { mode, content }
    });
    return NextResponse.json({ prompt: saved });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
