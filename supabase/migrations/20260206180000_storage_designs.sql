-- Storage bucket for custom designs (public, anon upload)

insert into storage.buckets (id, name, public)
values ('designs', 'designs', true)
on conflict (id) do update set public = true;

-- Public read for all objects in this bucket
drop policy if exists "designs_public_read" on storage.objects;
create policy "designs_public_read"
on storage.objects for select
using (bucket_id = 'designs');

-- Allow anon/authenticated to upload into guest/ prefix
drop policy if exists "designs_guest_insert" on storage.objects;
create policy "designs_guest_insert"
on storage.objects for insert
with check (
  bucket_id = 'designs'
  and name like 'guest/%'
  and (auth.role() = 'anon' or auth.role() = 'authenticated')
);

