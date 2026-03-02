import { NextRequest, NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
  }

  await setAdminSession(password);
  return NextResponse.json({ ok: true });
}
