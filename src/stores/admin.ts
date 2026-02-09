import { create } from 'zustand';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
}

interface AdminState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

async function loadAdminUser() {
  const supabase = getSupabaseBrowserClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const sessionUser = sessionData.session?.user ?? null;
  if (!sessionUser) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, name, is_admin')
    .eq('id', sessionUser.id)
    .single();

  if (profileError) throw profileError;
  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: profile.id,
    email: profile.email ?? sessionUser.email ?? '',
    name: profile.name ?? null,
  } satisfies AdminUser;
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const adminUser = await loadAdminUser();
      set({
        user: adminUser,
        isAuthenticated: Boolean(adminUser),
        isLoading: false,
        error: null,
      });
    } catch (e) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    try {
      const adminUser = await loadAdminUser();
      if (!adminUser) {
        set({ user: null, isAuthenticated: false, isLoading: false, error: 'Admin access required' });
        return false;
      }

      set({ user: adminUser, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: e instanceof Error ? e.message : String(e) });
      return false;
    }
  },

  logout: async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));
