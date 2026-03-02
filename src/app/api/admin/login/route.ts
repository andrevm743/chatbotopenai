import { NextRequest } from 'next/server';
import { clearAdminSession, setAdminSession } from '@/lib/auth';
import { AppError, fail, ok } from '@/lib/http';
import { parseRequiredString } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = parseRequiredString(body?.password, 'password', 200);

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Senha inválida');
    }

    await setAdminSession();
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE() {
  await clearAdminSession();
  return ok({ ok: true });
}
