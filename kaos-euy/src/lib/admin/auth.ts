import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'admin_session';
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8;

function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword());
}

export function buildAdminSessionValue(password: string): string {
  return hashValue(password);
}

export function isAdminSessionValid(cookieValue?: string | null): boolean {
  const adminPassword = getAdminPassword();
  if (!adminPassword) return false;
  if (!cookieValue) return false;
  return cookieValue === hashValue(adminPassword);
}

export function parseCookieHeader(headerValue: string | null): Record<string, string> {
  if (!headerValue) return {};
  return headerValue
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const [key, ...rest] = part.split('=');
      if (!key) return acc;
      acc[key] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});
}

export function getAdminSessionFromRequest(request: Request): string | null {
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  return cookies[ADMIN_COOKIE_NAME] ?? null;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  };
}

