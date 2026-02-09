-- Kaos EUY Supabase schema (MVP)

create extension if not exists "pgcrypto";

create type public.order_status as enum (
  'pending',
  'processing',
  'printing',
  'shipped',
  'completed',
  'cancelled'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_users_updated_at
before update on public.users
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price integer not null,
  images text[] not null default '{}',
  category text not null check (category in ('tshirt','hoodie','totebag','other')),
  sizes text[] not null,
  colors jsonb not null default '[]',
  in_stock boolean not null default true,
  is_customizable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

create table public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_type text not null check (order_type in ('personal','bulk')),
  customer_info jsonb not null,
  product_base jsonb not null,
  size_quantity jsonb not null,
  design jsonb not null,
  sundanese_elements jsonb,
  order_details jsonb,
  shipping jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_custom_orders_updated_at
before update on public.custom_orders
for each row execute procedure public.set_updated_at();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status public.order_status not null default 'pending',
  currency text not null default 'IDR',
  subtotal integer not null default 0,
  shipping_fee integer not null default 0,
  total integer not null default 0,
  custom_order_id uuid references public.custom_orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  size text not null check (size in ('XS','S','M','L','XL','XXL','3XL')),
  color_code text not null,
  color_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  line_total integer not null,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  size text not null check (size in ('XS','S','M','L','XL','XXL','3XL')),
  color_code text not null,
  color_name text not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_cart_items_updated_at
before update on public.cart_items
for each row execute procedure public.set_updated_at();

create unique index cart_items_unique_variant
on public.cart_items (user_id, product_id, size, color_code);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
  );
$$;

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.custom_orders enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "users_select_own_or_admin"
on public.users for select
using (id = auth.uid() or public.is_admin());

create policy "users_insert_own"
on public.users for insert
with check (id = auth.uid() or public.is_admin());

create policy "users_update_own_or_admin"
on public.users for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "users_delete_admin"
on public.users for delete
using (public.is_admin());

create policy "products_select_all"
on public.products for select
using (true);

create policy "products_admin_write"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "cart_items_owner"
on public.cart_items for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "custom_orders_owner"
on public.custom_orders for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "orders_owner"
on public.orders for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "order_items_owner_read"
on public.order_items for select
using (
  public.is_admin() or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "order_items_owner_write"
on public.order_items for insert
with check (
  public.is_admin() or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "order_items_owner_update"
on public.order_items for update
using (
  public.is_admin() or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
)
with check (
  public.is_admin() or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "order_items_owner_delete"
on public.order_items for delete
using (
  public.is_admin() or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create index products_category_idx on public.products (category);
create index products_in_stock_idx on public.products (in_stock);
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index order_items_order_id_idx on public.order_items (order_id);
create index cart_items_user_id_idx on public.cart_items (user_id);
create index custom_orders_user_id_idx on public.custom_orders (user_id);

