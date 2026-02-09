-- Customization fields on order_items + server-side fee calculation

alter table public.order_items
  add column if not exists customization jsonb,
  add column if not exists custom_fee integer not null default 0;

-- Update guest checkout RPC to persist customization + compute fee safely on server.
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
  v_custom_fee_per_pos int := 25000;
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
      greatest(((elem->>'quantity')::int), 0) as quantity,
      case when elem ? 'customization' then elem->'customization' else null end as customization
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
      i.customization,
      -- Only allow up to 4 positions (front/back/leftArm/rightArm)
      (
        least(
          4,
          greatest(
            coalesce(jsonb_array_length(i.customization->'applied_positions'), 0),
            0
          )
        )::int
      ) as applied_pos_count,
      (
        least(
          4,
          greatest(
            coalesce(jsonb_array_length(i.customization->'applied_positions'), 0),
            0
          )
        )::int * v_custom_fee_per_pos
      ) as custom_fee,
      (p.price + (
        least(
          4,
          greatest(
            coalesce(jsonb_array_length(i.customization->'applied_positions'), 0),
            0
          )
        )::int * v_custom_fee_per_pos
      )) as unit_price,
      ((p.price + (
        least(
          4,
          greatest(
            coalesce(jsonb_array_length(i.customization->'applied_positions'), 0),
            0
          )
        )::int * v_custom_fee_per_pos
      )) * i.quantity) as line_total
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
      greatest(((elem->>'quantity')::int), 0) as quantity,
      case when elem ? 'customization' then elem->'customization' else null end as customization
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
      i.customization,
      (
        least(
          4,
          greatest(
            coalesce(jsonb_array_length(i.customization->'applied_positions'), 0),
            0
          )
        )::int * v_custom_fee_per_pos
      ) as custom_fee,
      (p.price + (
        least(
          4,
          greatest(
            coalesce(jsonb_array_length(i.customization->'applied_positions'), 0),
            0
          )
        )::int * v_custom_fee_per_pos
      )) as unit_price,
      ((p.price + (
        least(
          4,
          greatest(
            coalesce(jsonb_array_length(i.customization->'applied_positions'), 0),
            0
          )
        )::int * v_custom_fee_per_pos
      )) * i.quantity) as line_total
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
    custom_fee,
    customization,
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
    custom_fee,
    customization,
    line_total
  from priced;

  return query select v_order_id, v_lookup_token;
end;
$$;

