alter table public.workspaces
  add column if not exists public_phone text,
  add column if not exists public_whatsapp text,
  add column if not exists public_email text,
  add column if not exists public_claim text,
  add column if not exists public_bio text,
  add column if not exists public_logo_url text,
  add column if not exists public_hero_url text;
