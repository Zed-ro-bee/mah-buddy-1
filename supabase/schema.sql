-- Mah Buddy foundation schema
-- Applied to the connected Supabase project and kept here as the reproducible schema.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_name text,
  buddy_name text default 'Mah Buddy',
  age text,
  learning_level text,
  goal text,
  education_level text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists preferred_name text;
alter table public.profiles add column if not exists buddy_name text default 'Mah Buddy';
alter table public.profiles add column if not exists age text;
alter table public.profiles add column if not exists learning_level text;
alter table public.profiles add column if not exists goal text;
alter table public.profiles add column if not exists education_level text;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system','light','dark')),
  voice_enabled boolean not null default true,
  tts_enabled boolean not null default true,
  notifications_enabled boolean not null default true,
  memory_enabled boolean not null default true,
  british_english boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "profiles own row" on public.profiles;
drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles delete own" on public.profiles;
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles delete own" on public.profiles for delete using (auth.uid() = id);

drop policy if exists "settings own row" on public.user_settings;
drop policy if exists "settings select own" on public.user_settings;
drop policy if exists "settings insert own" on public.user_settings;
drop policy if exists "settings update own" on public.user_settings;
drop policy if exists "settings delete own" on public.user_settings;
create policy "settings select own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings insert own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings update own" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings delete own" on public.user_settings for delete using (auth.uid() = user_id);

drop policy if exists "conversations own rows" on public.conversations;
drop policy if exists "conversations select own" on public.conversations;
drop policy if exists "conversations insert own" on public.conversations;
drop policy if exists "conversations update own" on public.conversations;
drop policy if exists "conversations delete own" on public.conversations;
create policy "conversations select own" on public.conversations for select using (auth.uid() = user_id);
create policy "conversations insert own" on public.conversations for insert with check (auth.uid() = user_id);
create policy "conversations update own" on public.conversations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conversations delete own" on public.conversations for delete using (auth.uid() = user_id);

drop policy if exists "messages own rows" on public.messages;
drop policy if exists "messages select own" on public.messages;
drop policy if exists "messages insert own" on public.messages;
drop policy if exists "messages update own" on public.messages;
drop policy if exists "messages delete own" on public.messages;
create policy "messages select own" on public.messages for select using (auth.uid() = user_id);
create policy "messages insert own" on public.messages for insert with check (auth.uid() = user_id);
create policy "messages update own" on public.messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages delete own" on public.messages for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, preferred_name, buddy_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email), coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 'Mah Buddy')
  on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
