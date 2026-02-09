-- Guest checkout (no customer login) + admin-only catalog writes
-- Safe for anon-key frontend (no service role key required/exposed).

-- 1) Harden public.users policies to prevent privilege escalation
drop policy if exists "users_select_own_or_admin" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own_or_admin" on public.users;
drop policy if exists "users_delete_admin" on public.users;

create policy "users_select_self_or_admin"
on public.users for select
using (id = auth.uid() or public.is_admin());

create policy "users_insert_self"
on public.users for insert
with check (id = auth.uid());

create policy "users_update_admin_only"
on public.users for update
using (public.is_admin())
with check (public.is_admin());

create policy "users_delete_admin_only"
on public.users for delete
using (public.is_admin());

-- 2) Guest order metadata
alter table public.orders
  add column if not exists guest_email text,
  add column if not exists guest_name text,
  add column if not exists guest_phone text,
  add column if not exists guest_shipping jsonb,
  add column if not exists lookup_token text not null default encode(gen_random_bytes(16), 'hex');

create index if not exists orders_guest_email_idx on public.orders (guest_email);
create index if not exists orders_lookup_token_idx on public.orders (lookup_token);

-- 3) Lock down orders + order_items (guest access only via RPC; admins via normal queries)
drop policy if exists "orders_owner" on public.orders;
create policy "orders_admin_only"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_owner_read" on public.order_items;
drop policy if exists "order_items_owner_write" on public.order_items;
drop policy if exists "order_items_owner_update" on public.order_items;
drop policy if exists "order_items_owner_delete" on public.order_items;

create policy "order_items_admin_only"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

-- Optional: cart_items is not used in guest checkout; lock it down too.
drop policy if exists "cart_items_owner" on public.cart_items;
create policy "cart_items_admin_only"
on public.cart_items for all
using (public.is_admin())
with check (public.is_admin());

-- 4) RPC: create guest order (transactional)
create or replace function public.create_order_guest(
  p_items jsonb,
  p_customer jsonb,
  p_shipping jsonb
)
returns table(order_id uuid, lookup_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_lookup_token text;
  v_subtotal integer;
  v_shipping_fee integer := 0;
  v_total integer;
  v_email text;
  v_name text;
  v_phone text;
  v_item_count int;
  v_priced_count int;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a json array';
  end if;

  select jsonb_array_length(p_items) into v_item_count;
  if v_item_count is null or v_item_count <= 0 then
    raise exception 'cart is empty';
  end if;

  v_email := lower(coalesce(p_customer->>'email', ''));
  v_name := coalesce(p_customer->>'name', '');
  v_phone := coalesce(p_customer->>'phone', '');

  if v_email = '' then
    raise exception 'email is required';
  end if;

  with items as (
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'size')::text as size,
      (elem->>'color_code')::text as color_code,
      (elem->>'color_name')::text as color_name,
      greatest(((elem->>'quantity')::int), 0) as quantity
    from jsonb_array_elements(p_items) as elem
  ),
  priced as (
    select
      i.product_id,
      p.name as product_name,
      i.size,
      i.color_code,
      i.color_name,
      i.quantity,
      p.price as unit_price,
      (p.price * i.quantity) as line_total
    from items i
    join public.products p on p.id = i.product_id
    where i.quantity > 0
      and p.in_stock = true
  )
  select
    coalesce(sum(line_total), 0)::int,
    count(*)::int
  into v_subtotal, v_priced_count
  from priced;

  if v_priced_count <= 0 or v_subtotal <= 0 then
    raise exception 'invalid cart items';
  end if;

  v_total := v_subtotal + v_shipping_fee;

  insert into public.orders (
    user_id,
    status,
    currency,
    subtotal,
    shipping_fee,
    total,
    guest_email,
    guest_name,
    guest_phone,
    guest_shipping
  )
  values (
    null,
    'pending',
    'IDR',
    v_subtotal,
    v_shipping_fee,
    v_total,
    v_email,
    nullif(v_name, ''),
    nullif(v_phone, ''),
    p_shipping
  )
  returning id, lookup_token into v_order_id, v_lookup_token;

  with items as (
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'size')::text as size,
      (elem->>'color_code')::text as color_code,
      (elem->>'color_name')::text as color_name,
      greatest(((elem->>'quantity')::int), 0) as quantity
    from jsonb_array_elements(p_items) as elem
  ),
  priced as (
    select
      i.product_id,
      p.name as product_name,
      i.size,
      i.color_code,
      i.color_name,
      i.quantity,
      p.price as unit_price,
      (p.price * i.quantity) as line_total
    from items i
    join public.products p on p.id = i.product_id
    where i.quantity > 0
      and p.in_stock = true
  )
  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    size,
    color_code,
    color_name,
    quantity,
    unit_price,
    line_total
  )
  select
    v_order_id,
    product_id,
    product_name,
    size,
    color_code,
    color_name,
    quantity,
    unit_price,
    line_total
  from priced;

  return query select v_order_id, v_lookup_token;
end;
$$;

-- 5) RPC: guest order lookup
create or replace function public.get_order_guest(
  p_order_id uuid,
  p_email text,
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
    and guest_email = lower(p_email)
    and lookup_token = p_token;

  if not found then
    raise exception 'not_found';
  end if;

  return jsonb_build_object(
    'order', to_jsonb(v_order),
    'items', coalesce(
      (select jsonb_agg(to_jsonb(oi) order by oi.created_at asc)
       from public.order_items oi
       where oi.order_id = v_order.id),
      '[]'::jsonb
    )
  );
end;
$$;

-- 6) Grants: anon can only read products + execute guest RPCs
grant usage on schema public to anon, authenticated;

grant select on table public.products to anon, authenticated;

revoke all on table public.cart_items from anon, authenticated;
revoke all on table public.orders from anon;
revoke all on table public.order_items from anon;

grant execute on function public.create_order_guest(jsonb, jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_order_guest(uuid, text, text) to anon, authenticated;

