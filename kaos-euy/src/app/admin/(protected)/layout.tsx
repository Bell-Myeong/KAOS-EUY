import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from '@/lib/admin/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieValue = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminSessionValid(cookieValue)) {
    redirect('/admin/login?reason=expired');
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
