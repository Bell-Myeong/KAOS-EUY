import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { ApiError } from './errors';

export async function requireUserId(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new ApiError(error.message, { cause: error });
  }

  const userId = data.session?.user.id;
  if (!userId) {
    throw new ApiError('Authentication required', { status: 401 });
  }

  return userId;
}

