-- Seed sample catalog items for local Supabase
-- Note: seed runs with elevated privileges in local reset, so it can insert even with RLS.

-- Customizable base product (one product with two example images for white/black)
insert into public.products (
  name,
  slug,
  description,
  price,
  images,
  sizes,
  colors,
  in_stock,
  is_customizable
) values (
  'Kaos EUY Basic',
  'kaos-euy-basic',
  'Plain cotton tee. Perfect base for custom prints.',
  150000,
  array['/products/blank-tee-white.svg','/products/blank-tee-black.svg']::text[],
  array['XS','S','M','L','XL','XXL','3XL']::text[],
  '[{"code":"#ffffff","name":"White"},{"code":"#111827","name":"Black"}]'::jsonb,
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  images = excluded.images,
  sizes = excluded.sizes,
  colors = excluded.colors,
  in_stock = excluded.in_stock,
  is_customizable = excluded.is_customizable,
  updated_at = now();

-- Remove older seed-only products if they exist (keeps catalog clean)
delete from public.products
where slug in ('blank-tee-white', 'blank-tee-black');
