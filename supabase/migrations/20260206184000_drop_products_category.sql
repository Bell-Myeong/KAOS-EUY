-- Remove products.category (single catalog type)

drop index if exists public.products_category_idx;

alter table public.products
  drop column if exists category;

