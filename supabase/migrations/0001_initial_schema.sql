create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  "displayName" text not null default 'Player',
  "createdAt" timestamptz not null default now()
);

create table if not exists public.campaigns (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  description text not null default '',
  "activeMapId" text
);

create table if not exists public.campaign_members (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  "userId" text not null,
  role text not null check (role in ('dm', 'player')),
  "displayName" text not null,
  "characterId" text,
  "canDrawOnMap" boolean not null default true,
  unique ("campaignId", "userId")
);

create table if not exists public.characters (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  "ownerUserId" text not null,
  name text not null,
  portrait jsonb not null default '{}'::jsonb,
  "className" text not null default '',
  "subclassName" text not null default '',
  level integer not null default 1 check (level between 1 and 30),
  species text not null default '',
  "backgroundName" text not null default '',
  abilities jsonb not null default '{"str":10,"dex":10,"con":10,"int":10,"wis":10,"cha":10}'::jsonb,
  "proficiencyBonus" integer not null default 2,
  "armorClass" integer not null default 10,
  "maxHp" integer not null default 1,
  "currentHp" integer not null default 1,
  "temporaryHp" integer not null default 0,
  speed integer not null default 30,
  "passivePerception" integer not null default 10,
  "initiativeBonus" integer not null default 0,
  "savingThrows" jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  proficiencies jsonb not null default '[]'::jsonb,
  equipment jsonb not null default '[]'::jsonb,
  "spellsAndFeatures" text not null default '',
  lore jsonb not null default '{}'::jsonb,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.timeline_sessions (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  "sessionNumber" integer not null,
  "playedAt" date not null,
  title text not null,
  summary text not null default '',
  "visibleNotes" text not null default ''
);

create table if not exists public.quests (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'failed', 'hidden')),
  steps jsonb not null default '[]'::jsonb,
  challenges text not null default '',
  secret text not null default ''
);

create table if not exists public.lore_entries (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  type text not null check (type in ('artifact', 'person', 'zone', 'creature', 'ethnicity', 'event', 'myth', 'organization')),
  name text not null,
  image jsonb not null default '{}'::jsonb,
  "publicFields" jsonb not null default '{}'::jsonb,
  secret text not null default '',
  "isVisibleToPlayers" boolean not null default true,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.lore_links (
  source_id text not null references public.lore_entries(id) on delete cascade,
  target_id text not null references public.lore_entries(id) on delete cascade,
  primary key (source_id, target_id),
  check (source_id <> target_id)
);

create table if not exists public.maps (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  name text not null,
  width integer not null default 2400,
  height integer not null default 1600,
  "gridSize" integer not null default 70,
  background jsonb not null default '{}'::jsonb,
  "isActive" boolean not null default false
);

create table if not exists public.map_assets (
  id text primary key default gen_random_uuid()::text,
  "mapId" text not null references public.maps(id) on delete cascade,
  type text not null check (type in ('trap', 'wall', 'resource')),
  label text not null,
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 70,
  height numeric not null default 70,
  visibility text not null default 'public' check (visibility in ('dm', 'public')),
  notes text not null default ''
);

create table if not exists public.tokens (
  id text primary key default gen_random_uuid()::text,
  "mapId" text not null references public.maps(id) on delete cascade,
  "ownerCharacterId" text references public.characters(id) on delete set null,
  kind text not null check (kind in ('player', 'monster')),
  name text not null,
  image jsonb not null default '{}'::jsonb,
  x numeric not null default 0,
  y numeric not null default 0,
  size numeric not null default 1,
  visibility text not null default 'public' check (visibility in ('dm', 'public')),
  conditions text[] not null default '{}',
  stats jsonb not null default '{}'::jsonb
);

create table if not exists public.drawings (
  id text primary key default gen_random_uuid()::text,
  "mapId" text not null references public.maps(id) on delete cascade,
  "createdByUserId" text not null,
  shape text not null check (shape in ('circle', 'cone', 'square', 'line')),
  start jsonb not null,
  "end" jsonb not null,
  color text not null default '#22f0c8',
  visibility text not null default 'public' check (visibility in ('dm', 'public'))
);

create table if not exists public.turn_orders (
  id text primary key default gen_random_uuid()::text,
  "mapId" text not null references public.maps(id) on delete cascade,
  round integer not null default 1,
  "currentIndex" integer not null default 0,
  entries jsonb not null default '[]'::jsonb
);

create table if not exists public.conditions (
  id text primary key default gen_random_uuid()::text,
  "tokenId" text not null references public.tokens(id) on delete cascade,
  label text not null,
  color text not null default '#f7e66f',
  "createdAt" timestamptz not null default now()
);

create index if not exists campaign_members_campaign_idx on public.campaign_members ("campaignId");
create index if not exists campaign_members_user_idx on public.campaign_members ("userId");
create index if not exists characters_campaign_idx on public.characters ("campaignId");
create index if not exists timeline_campaign_idx on public.timeline_sessions ("campaignId");
create index if not exists quests_campaign_idx on public.quests ("campaignId");
create index if not exists lore_campaign_idx on public.lore_entries ("campaignId");
create index if not exists maps_campaign_idx on public.maps ("campaignId");
create index if not exists tokens_map_idx on public.tokens ("mapId");
create index if not exists drawings_map_idx on public.drawings ("mapId");
create index if not exists assets_map_idx on public.map_assets ("mapId");

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, "displayName")
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'Player'), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      "displayName" = excluded."displayName";
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_campaign_member(target_campaign_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.campaign_members
    where "campaignId" = target_campaign_id
      and "userId" = auth.uid()::text
  );
$$;

create or replace function public.is_campaign_dm(target_campaign_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.campaign_members
    where "campaignId" = target_campaign_id
      and "userId" = auth.uid()::text
      and role = 'dm'
  );
$$;

create or replace function public.campaign_id_for_map(target_map_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select "campaignId" from public.maps where id = target_map_id;
$$;

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.characters enable row level security;
alter table public.timeline_sessions enable row level security;
alter table public.quests enable row level security;
alter table public.lore_entries enable row level security;
alter table public.lore_links enable row level security;
alter table public.maps enable row level security;
alter table public.map_assets enable row level security;
alter table public.tokens enable row level security;
alter table public.drawings enable row level security;
alter table public.turn_orders enable row level security;
alter table public.conditions enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "campaigns_select_member" on public.campaigns for select using (public.is_campaign_member(id));
create policy "campaigns_insert_authenticated" on public.campaigns for insert with check (auth.role() = 'authenticated');
create policy "campaigns_update_dm" on public.campaigns for update using (public.is_campaign_dm(id)) with check (public.is_campaign_dm(id));
create policy "campaigns_delete_dm" on public.campaigns for delete using (public.is_campaign_dm(id));

create policy "members_select_campaign" on public.campaign_members for select using (public.is_campaign_member("campaignId"));
create policy "members_insert_dm" on public.campaign_members for insert with check (public.is_campaign_dm("campaignId"));
create policy "members_update_dm" on public.campaign_members for update using (public.is_campaign_dm("campaignId")) with check (public.is_campaign_dm("campaignId"));
create policy "members_delete_dm" on public.campaign_members for delete using (public.is_campaign_dm("campaignId"));

create policy "characters_select_allowed" on public.characters for select using (
  public.is_campaign_dm("campaignId") or "ownerUserId" = auth.uid()::text
);
create policy "characters_insert_allowed" on public.characters for insert with check (
  public.is_campaign_dm("campaignId") or "ownerUserId" = auth.uid()::text
);
create policy "characters_update_allowed" on public.characters for update using (
  public.is_campaign_dm("campaignId") or "ownerUserId" = auth.uid()::text
) with check (
  public.is_campaign_dm("campaignId") or "ownerUserId" = auth.uid()::text
);

create policy "sessions_select_member" on public.timeline_sessions for select using (public.is_campaign_member("campaignId"));
create policy "sessions_manage_dm" on public.timeline_sessions for all using (public.is_campaign_dm("campaignId")) with check (public.is_campaign_dm("campaignId"));

create policy "quests_select_allowed" on public.quests for select using (
  public.is_campaign_dm("campaignId") or (public.is_campaign_member("campaignId") and status <> 'hidden')
);
create policy "quests_manage_dm" on public.quests for all using (public.is_campaign_dm("campaignId")) with check (public.is_campaign_dm("campaignId"));

create policy "lore_select_allowed" on public.lore_entries for select using (
  public.is_campaign_dm("campaignId") or (public.is_campaign_member("campaignId") and "isVisibleToPlayers")
);
create policy "lore_manage_dm" on public.lore_entries for all using (public.is_campaign_dm("campaignId")) with check (public.is_campaign_dm("campaignId"));

create policy "lore_links_select_member" on public.lore_links for select using (
  exists (
    select 1 from public.lore_entries source
    where source.id = source_id and public.is_campaign_member(source."campaignId")
  )
);
create policy "lore_links_manage_dm" on public.lore_links for all using (
  exists (
    select 1 from public.lore_entries source
    where source.id = source_id and public.is_campaign_dm(source."campaignId")
  )
) with check (
  exists (
    select 1 from public.lore_entries source
    where source.id = source_id and public.is_campaign_dm(source."campaignId")
  )
);

create policy "maps_select_member" on public.maps for select using (public.is_campaign_member("campaignId"));
create policy "maps_manage_dm" on public.maps for all using (public.is_campaign_dm("campaignId")) with check (public.is_campaign_dm("campaignId"));

create policy "assets_select_visible" on public.map_assets for select using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  (visibility = 'public' and public.is_campaign_member(public.campaign_id_for_map("mapId")))
);
create policy "assets_manage_dm" on public.map_assets for all using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
) with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);

create policy "tokens_select_visible" on public.tokens for select using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  (visibility = 'public' and public.is_campaign_member(public.campaign_id_for_map("mapId")))
);
create policy "tokens_insert_dm" on public.tokens for insert with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);
create policy "tokens_update_allowed" on public.tokens for update using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  exists (
    select 1 from public.campaign_members member
    where member."userId" = auth.uid()::text
      and member."characterId" = "ownerCharacterId"
      and member."campaignId" = public.campaign_id_for_map("mapId")
  )
) with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  exists (
    select 1 from public.campaign_members member
    where member."userId" = auth.uid()::text
      and member."characterId" = "ownerCharacterId"
      and member."campaignId" = public.campaign_id_for_map("mapId")
  )
);

create policy "drawings_select_visible" on public.drawings for select using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  (visibility = 'public' and public.is_campaign_member(public.campaign_id_for_map("mapId")))
);
create policy "drawings_insert_allowed" on public.drawings for insert with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  exists (
    select 1 from public.campaign_members member
    where member."campaignId" = public.campaign_id_for_map("mapId")
      and member."userId" = auth.uid()::text
      and member."canDrawOnMap"
  )
);
create policy "drawings_update_creator_or_dm" on public.drawings for update using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or "createdByUserId" = auth.uid()::text
) with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or "createdByUserId" = auth.uid()::text
);

create policy "turns_select_member" on public.turn_orders for select using (public.is_campaign_member(public.campaign_id_for_map("mapId")));
create policy "turns_manage_dm" on public.turn_orders for all using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
) with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);

create policy "conditions_select_member" on public.conditions for select using (
  exists (
    select 1 from public.tokens token
    where token.id = "tokenId"
      and public.is_campaign_member(public.campaign_id_for_map(token."mapId"))
  )
);
create policy "conditions_manage_dm" on public.conditions for all using (
  exists (
    select 1 from public.tokens token
    where token.id = "tokenId"
      and public.is_campaign_dm(public.campaign_id_for_map(token."mapId"))
  )
) with check (
  exists (
    select 1 from public.tokens token
    where token.id = "tokenId"
      and public.is_campaign_dm(public.campaign_id_for_map(token."mapId"))
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('character-images', 'character-images', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('lore-images', 'lore-images', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('map-images', 'map-images', false, 52428800, array['image/png', 'image/jpeg', 'image/webp']),
  ('token-images', 'token-images', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "storage_authenticated_read" on storage.objects for select using (
  bucket_id in ('character-images', 'lore-images', 'map-images', 'token-images')
  and auth.role() = 'authenticated'
);

create policy "storage_authenticated_upload" on storage.objects for insert with check (
  bucket_id in ('character-images', 'lore-images', 'map-images', 'token-images')
  and auth.role() = 'authenticated'
);

create policy "storage_owner_update" on storage.objects for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "storage_owner_delete" on storage.objects for delete using (owner = auth.uid());
