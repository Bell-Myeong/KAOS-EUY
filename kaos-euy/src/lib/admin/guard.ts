import { getAdminSessionFromRequest, isAdminSessionValid } from '@/lib/admin/auth';

export function requireAdmin(request: Request): { ok: true } | { ok: false; code: string; message: string } {
  const session = getAdminSessionFromRequest(request);
  if (!isAdminSessionValid(session)) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '관리자 인증이 필요합니다.',
    };
  }
  return { ok: true };
}