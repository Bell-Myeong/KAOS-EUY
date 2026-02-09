# Supabase setup (Admin-only login + Guest checkout)

## Environment variables
Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
```

- `project-ref` is your **project id** in the URL, but you paste the **full URL** (not only the id).
- Get both values in Supabase Dashboard → **Project Settings → API**.

## Apply DB migration (guest orders)
Run the SQL in `supabase/migrations/20260206150000_guest_orders.sql` in:
- Supabase Dashboard → **SQL Editor**, or
- Supabase CLI if you use local migrations.

## Bootstrap an admin user
1) Create a user in Supabase Dashboard → **Authentication → Users** (email/password).
2) Mark them as admin:

```sql
update public.users
set is_admin = true
where email = 'admin@example.com';
```

Tip: Disable public signups in Dashboard → **Authentication → Providers** (turn off email signups) if you want admin-only login.

## Add one catalog product (SQL example)
As an admin (or via Dashboard SQL Editor):

```sql
insert into public.products (
  name, slug, description, price, images, category, sizes, colors, in_stock, is_customizable
) values (
  'Kaos EUY Basic',
  'kaos-euy-basic',
  'Basic cotton tee.',
  150000,
  array['https://placehold.co/800x800/png'],
  'tshirt',
  array['S','M','L','XL']::text[],
  '[{"code":"#000000","name":"Black"},{"code":"#ffffff","name":"White"}]'::jsonb,
  true,
  true
);
```

