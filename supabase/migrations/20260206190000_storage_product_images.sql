-- Storage bucket for product images (public read, admin upload)

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Public read for all objects in this bucket
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

-- Admin-only write into products/ prefix
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
);

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
)
with check (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
);

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
);

