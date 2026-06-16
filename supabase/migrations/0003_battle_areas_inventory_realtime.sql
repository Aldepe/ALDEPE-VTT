alter table public.map_assets add column if not exists name text not null default 'Map asset';
alter table public.map_assets add column if not exists category text not null default 'marker';
alter table public.map_assets add column if not exists rotation numeric not null default 0;
alter table public.map_assets add column if not exists color text not null default '#f7e66f';
alter table public.map_assets add column if not exists variant text not null default 'default';
alter table public.map_assets add column if not exists locked boolean not null default false;

create table if not exists public.battlemap_areas (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  "mapId" text not null references public.maps(id) on delete cascade,
  type text not null check (type in ('circle', 'cone', 'square', 'line')),
  name text not null default '',
  x numeric not null default 0,
  y numeric not null default 0,
  start jsonb not null,
  "end" jsonb not null,
  width numeric not null default 0,
  height numeric not null default 0,
  radius numeric not null default 0,
  length numeric not null default 0,
  angle numeric not null default 0,
  rotation numeric not null default 0,
  color text not null default '#22f0c8',
  opacity numeric not null default 0.26,
  "strokeWidth" numeric not null default 5,
  "placementMode" text not null default 'free' check ("placementMode" in ('free', 'cell-center', 'grid-intersection')),
  visibility text not null default 'public' check (visibility in ('dm', 'public')),
  notes text not null default '',
  locked boolean not null default false,
  hidden boolean not null default false,
  "createdByUserId" text not null,
  "updatedByUserId" text not null,
  version integer not null default 1,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.inventory_containers (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  description text not null default '',
  weight numeric,
  "sortOrder" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  "containerId" text references public.inventory_containers(id) on delete set null,
  name text not null,
  type text not null default '',
  rarity text not null default '',
  "requiresAttunement" boolean not null default false,
  equipped boolean not null default false,
  quantity integer not null default 1,
  weight numeric not null default 0,
  cost text not null default '',
  source text not null default '',
  description text not null default '',
  notes text not null default '',
  tags text[] not null default '{}',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists battlemap_areas_campaign_idx on public.battlemap_areas ("campaignId");
create index if not exists battlemap_areas_map_idx on public.battlemap_areas ("mapId");
create index if not exists inventory_containers_character_idx on public.inventory_containers ("characterId");
create index if not exists inventory_items_character_idx on public.inventory_items ("characterId");
create index if not exists inventory_items_container_idx on public.inventory_items ("containerId");

alter table public.battlemap_areas enable row level security;
alter table public.inventory_containers enable row level security;
alter table public.inventory_items enable row level security;

drop policy if exists "areas_select_visible" on public.battlemap_areas;
create policy "areas_select_visible" on public.battlemap_areas for select using (
  public.is_campaign_dm("campaignId") or
  (visibility = 'public' and not hidden and public.is_campaign_member("campaignId"))
);

drop policy if exists "areas_insert_allowed" on public.battlemap_areas;
create policy "areas_insert_allowed" on public.battlemap_areas for insert with check (
  public.is_campaign_dm("campaignId") or
  exists (
    select 1 from public.campaign_members member
    where member."campaignId" = public.battlemap_areas."campaignId"
      and member."userId" = auth.uid()::text
      and member."canDrawOnMap"
  )
);

drop policy if exists "areas_update_allowed" on public.battlemap_areas;
create policy "areas_update_allowed" on public.battlemap_areas for update using (
  not locked and (
    public.is_campaign_dm("campaignId") or "createdByUserId" = auth.uid()::text
  )
) with check (
  public.is_campaign_dm("campaignId") or "createdByUserId" = auth.uid()::text
);

drop policy if exists "areas_delete_allowed" on public.battlemap_areas;
create policy "areas_delete_allowed" on public.battlemap_areas for delete using (
  not locked and (
    public.is_campaign_dm("campaignId") or "createdByUserId" = auth.uid()::text
  )
);

drop policy if exists "inventory_containers_select_allowed" on public.inventory_containers;
create policy "inventory_containers_select_allowed" on public.inventory_containers for select using (
  exists (
    select 1 from public.characters character
    where character.id = "characterId"
      and (public.is_campaign_dm(character."campaignId") or character."ownerUserId" = auth.uid()::text)
  )
);

drop policy if exists "inventory_containers_manage_allowed" on public.inventory_containers;
create policy "inventory_containers_manage_allowed" on public.inventory_containers for all using (
  exists (
    select 1 from public.characters character
    where character.id = "characterId"
      and (public.is_campaign_dm(character."campaignId") or character."ownerUserId" = auth.uid()::text)
  )
) with check (
  exists (
    select 1 from public.characters character
    where character.id = "characterId"
      and (public.is_campaign_dm(character."campaignId") or character."ownerUserId" = auth.uid()::text)
  )
);

drop policy if exists "inventory_items_select_allowed" on public.inventory_items;
create policy "inventory_items_select_allowed" on public.inventory_items for select using (
  exists (
    select 1 from public.characters character
    where character.id = "characterId"
      and (public.is_campaign_dm(character."campaignId") or character."ownerUserId" = auth.uid()::text)
  )
);

drop policy if exists "inventory_items_manage_allowed" on public.inventory_items;
create policy "inventory_items_manage_allowed" on public.inventory_items for all using (
  exists (
    select 1 from public.characters character
    where character.id = "characterId"
      and (public.is_campaign_dm(character."campaignId") or character."ownerUserId" = auth.uid()::text)
  )
) with check (
  exists (
    select 1 from public.characters character
    where character.id = "characterId"
      and (public.is_campaign_dm(character."campaignId") or character."ownerUserId" = auth.uid()::text)
  )
);

do $$
begin
  alter publication supabase_realtime add table public.battlemap_areas;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.map_assets;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.inventory_containers;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.inventory_items;
exception when duplicate_object then null;
end $$;
