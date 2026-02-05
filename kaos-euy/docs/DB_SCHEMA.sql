-- Supabase Postgres Schema (MVP)

create extension if not exists "pgcrypto";

-- Enums
create type order_status as enum (
  'PENDING_CONFIRMATION',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'IN_PRODUCTION',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED'
);

create type custom_request_status as enum (
  'pending',
  'reviewing',
  'quoted',
  'accepted',
  'rejected',
  'completed'
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer not null,
  currency text not null default 'IDR',
  images jsonb not null default '[]'::jsonb,
  options jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_is_active on products (is_active);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  buyer_name text not null,
  buyer_phone text,
  buyer_email text,
  shipping_address jsonb,
  notes text,
  status order_status not null default 'PENDING_CONFIRMATION',
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  total_cents integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status_created_at on orders (status, created_at desc);

-- Order Items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on order_items (order_id);
create index if not exists idx_order_items_product_id on order_items (product_id);

-- Custom Requests
create table if not exists custom_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  requester_name text not null,
  whatsapp text,
  org_name text,
  upload_group_id text,
  product_types text[] not null default '{}',
  quantity_estimate integer,
  deadline_date date,
  notes text,
  status custom_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custom_requests_status_created_at on custom_requests (status, created_at desc);
create index if not exists idx_custom_requests_upload_group_id on custom_requests (upload_group_id);

-- Files (Storage metadata)
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('order', 'custom_request')),
  owner_id uuid not null,
  bucket text not null,
  path text not null,
  original_name text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create index if not exists idx_files_owner on files (owner_type, owner_id);
create index if not exists idx_files_created_at on files (created_at desc);

-- RLS / Policy Notes (MVP)
-- 1) MVP 기본 방침: 모든 테이블에 RLS 활성화 + 직접 접근 차단.
-- 2) 공개 사용자(anon)와 일반 authenticated 사용자 모두 SELECT/INSERT/UPDATE/DELETE 금지.
-- 3) 서버 API 라우트에서 Service Role로만 DB 접근을 수행한다.
-- 4) Admin은 MVP에서는 ADMIN_PASSWORD 기반 인증(서버 라우트)으로 처리한다.
--    운영 단계에서 Supabase Auth + 이메일 allowlist로 전환을 권장한다.
--
-- 예시 설정 (실제 적용은 운영 정책에 따라 선택):
-- alter table products enable row level security;
-- alter table orders enable row level security;
-- alter table order_items enable row level security;
-- alter table custom_requests enable row level security;
-- alter table files enable row level security;
--
-- files.owner_id는 orders/custom_requests 둘 중 하나를 참조한다.
-- FK 강제 대신 애플리케이션 레벨에서 owner_type과 owner_id의 정합성을 보장한다.

