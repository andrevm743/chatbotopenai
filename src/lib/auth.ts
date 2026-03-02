import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'admin_session';

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return Boolean(token && process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD);
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
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
