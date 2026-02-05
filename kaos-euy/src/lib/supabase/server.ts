import type { Product } from '@/types/product';
import { getSupabaseEnv } from '@/lib/env';

function buildRestUrl(path: string) {
  const { url } = getSupabaseEnv();
  const base = url.endsWith('/') ? url.slice(0, -1) : url;
  return `${base}/rest/v1/${path}`;
}

function buildStorageUrl(path: string) {
  const { url } = getSupabaseEnv();
  const base = url.endsWith('/') ? url.slice(0, -1) : url;
  return `${base}/storage/v1/${path}`;
}

async function supabaseRestFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { serviceRoleKey } = getSupabaseEnv();
  const res = await fetch(buildRestUrl(path), {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const message = [
      'Supabase 요청에 실패했습니다.',
      `status=${res.status}`,
      text ? `body=${text}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    console.error(message);
    throw new Error(message);
  }

  return (await res.json()) as T;
}

async function supabaseStorageFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { serviceRoleKey } = getSupabaseEnv();
  const res = await fetch(buildStorageUrl(path), {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const message = [
      'Supabase Storage 요청에 실패했습니다.',
      `status=${res.status}`,
      text ? `body=${text}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    console.error(message);
    throw new Error(message);
  }

  return (await res.json()) as T;
}

function normalizeProduct(item: Product): Product {
  return {
    ...item,
    images: Array.isArray(item.images)
      ? item.images.filter((image): image is string => typeof image === 'string')
      : [],
    options: item.options ?? {},
  };
}

export async function fetchActiveProducts(): Promise<Product[]> {
  const query = new URLSearchParams({
    select: 'id,slug,name,description,price_cents,currency,images,options,is_active',
    is_active: 'eq.true',
    order: 'created_at.desc',
  });

  const data = await supabaseRestFetch<Product[]>(`products?${query.toString()}`);

  return data.map(normalizeProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const query = new URLSearchParams({
    select: 'id,slug,name,description,price_cents,currency,images,options,is_active',
    slug: `eq.${slug}`,
    limit: '1',
  });

  const data = await supabaseRestFetch<Product[]>(`products?${query.toString()}`);
  if (!data || data.length === 0) {
    return null;
  }

  return normalizeProduct(data[0]);
}

export async function supabaseAdminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return supabaseRestFetch<T>(path, init);
}

export async function supabaseStorageAdminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return supabaseStorageFetch<T>(path, init);
}
