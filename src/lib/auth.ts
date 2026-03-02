codex/create-internal-office-chat-web-app-njscch
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { AppError } from './http';

const ADMIN_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new AppError(500, 'ADMIN_PASSWORD_MISSING', 'ADMIN_PASSWORD não configurada');
  }
  return secret;
}

function sign(payload: string) {
  const secret = getSecret();
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function encodeSession(expiresAt: number) {
  const payload = `admin:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifySession(token: string) {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const [scope, exp] = payload.split(':');
  if (scope !== 'admin') return false;
  const expiresAt = Number(exp);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}
=======
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'admin_session';
main

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
codex/create-internal-office-chat-web-app-njscch
  if (!token) return false;

  try {
    return verifySession(token);
  } catch {
    return false;
  }
=======
  return Boolean(token && process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD);
main
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
codex/create-internal-office-chat-web-app-njscch
    throw new AppError(401, 'UNAUTHORIZED', 'Não autorizado');
  }
}

export async function setAdminSession() {
  const store = await cookies();
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;

  store.set(ADMIN_COOKIE, encodeSession(expiresAt), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
=======
    throw new Error('UNAUTHORIZED');
  }
}

export async function setAdminSession(password: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}
main
