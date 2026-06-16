alter table public.tokens add column if not exists "ownerUserId" text;
alter table public.tokens add column if not exists "characterId" text;
alter table public.tokens add column if not exists token_type text;
alter table public.tokens add column if not exists rotation numeric not null default 0;
alter table public.tokens add column if not exists scale numeric not null default 1;
alter table public.tokens add column if not exists "accentColor" text not null default '#ff4fa3';
alter table public.tokens add column if not exists "borderColor" text not null default '#160611';
alter table public.tokens add column if not exists "isLocked" boolean not null default false;
alter table public.tokens add column if not exists "isInTurnOrder" boolean not null default true;
alter table public.tokens add column if not exists active boolean not null default true;
alter table public.tokens add column if not exists "createdBy" text;
alter table public.tokens add column if not exists "updatedBy" text;

update public.tokens
set
  "characterId" = coalesce("characterId", "ownerCharacterId"),
  token_type = coalesce(token_type, kind),
  stats = jsonb_build_object(
    'temporaryHp', 0,
    'creatureType', case when kind = 'player' then 'Player character' else 'Monster' end,
    'visibleNotes', coalesce(stats->>'notes', ''),
    'secretNotes', '',
    'notes', coalesce(stats->>'notes', '')
  ) || coalesce(stats, '{}'::jsonb);

alter table public.map_assets add column if not exists "ownerUserId" text;
alter table public.map_assets add column if not exists "createdBy" text;
alter table public.map_assets add column if not exists "updatedBy" text;

alter table public.tokens drop constraint if exists tokens_kind_check;
alter table public.tokens add constraint tokens_kind_check check (kind in ('player', 'monster', 'npc', 'custom'));

alter table public.tokens drop constraint if exists tokens_visibility_check;
alter table public.tokens add constraint tokens_visibility_check check (visibility in ('dm', 'dm_only', 'public'));

alter table public.map_assets drop constraint if exists map_assets_visibility_check;
alter table public.map_assets add constraint map_assets_visibility_check check (visibility in ('dm', 'dm_only', 'public'));

alter table public.drawings drop constraint if exists drawings_visibility_check;
alter table public.drawings add constraint drawings_visibility_check check (visibility in ('dm', 'dm_only', 'public'));

alter table public.battlemap_areas drop constraint if exists battlemap_areas_visibility_check;
alter table public.battlemap_areas add constraint battlemap_areas_visibility_check check (visibility in ('dm', 'dm_only', 'public'));

alter table public.map_assets drop constraint if exists map_assets_type_check;
alter table public.map_assets add constraint map_assets_type_check check (type in (
  'wall',
  'door',
  'locked-door',
  'secret-door',
  'trap',
  'danger',
  'difficult-terrain',
  'cover',
  'obstacle',
  'chest-loot',
  'stairs',
  'water',
  'fire',
  'pit-hole',
  'altar-objective',
  'entry-exit',
  'switch-mechanism',
  'light-source',
  'darkness-zone',
  'barricade',
  'rubble',
  'statue',
  'rune-glyph',
  'poison-zone',
  'ice-zone',
  'lightning-zone',
  'column-pillar',
  'shrine',
  'portal',
  'magic-circle',
  'cage-prison',
  'bridge',
  'broken-bridge',
  'difficult-vegetation',
  'hazard-marker',
  'secret-passage',
  'ambush-marker',
  'campfire',
  'bedroll-camp',
  'lever',
  'sealed-door',
  'cracked-wall',
  'treasure-marker',
  'corpse-remains',
  'summoning-point',
  'spawn-point',
  'objective-marker',
  'interactable-prop',
  'resource'
));

create or replace function public.is_own_player_token_id(target_token_id text, target_campaign_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tokens token
    join public.campaign_members member
      on member."campaignId" = target_campaign_id
     and member."userId" = auth.uid()::text
     and member."characterId" = token."ownerCharacterId"
    where token.id = target_token_id
      and token.kind = 'player'
      and token.visibility = 'public'
  );
$$;

create or replace function public.validate_token_player_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_campaign_id text;
begin
  target_campaign_id := public.campaign_id_for_map(new."mapId");

  if public.is_campaign_dm(target_campaign_id) then
    return new;
  end if;

  if not public.is_own_player_token_id(old.id, target_campaign_id) then
    raise exception 'Only the DM can edit this token';
  end if;

  if (to_jsonb(new) - 'x' - 'y' - 'stats' - 'updatedBy') <> (to_jsonb(old) - 'x' - 'y' - 'stats' - 'updatedBy') then
    raise exception 'Players can only move their own token or update initiative';
  end if;

  if (coalesce(new.stats, '{}'::jsonb) - 'initiative') <> (coalesce(old.stats, '{}'::jsonb) - 'initiative') then
    raise exception 'Players can only update token initiative inside stats';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_token_player_update on public.tokens;
create trigger validate_token_player_update
before update on public.tokens
for each row execute function public.validate_token_player_update();

create or replace function public.validate_turn_order_player_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_campaign_id text;
  new_entry jsonb;
  old_entry jsonb;
  matching_entry jsonb;
  token_id text;
begin
  target_campaign_id := public.campaign_id_for_map(new."mapId");

  if public.is_campaign_dm(target_campaign_id) then
    return new;
  end if;

  if not public.is_campaign_member(target_campaign_id) then
    raise exception 'Only campaign members can update initiative';
  end if;

  if (to_jsonb(new) - 'entries') <> (to_jsonb(old) - 'entries') then
    raise exception 'Players can only update turn order entries';
  end if;

  for old_entry in select value from jsonb_array_elements(old.entries)
  loop
    select value into matching_entry
    from jsonb_array_elements(new.entries)
    where value->>'id' = old_entry->>'id'
    limit 1;

    if matching_entry is null then
      token_id := old_entry->>'tokenId';
      if not public.is_own_player_token_id(token_id, target_campaign_id) then
        raise exception 'Players cannot remove other turn entries';
      end if;
    end if;
  end loop;

  for new_entry in select value from jsonb_array_elements(new.entries)
  loop
    select value into matching_entry
    from jsonb_array_elements(old.entries)
    where value->>'id' = new_entry->>'id'
    limit 1;

    if matching_entry is null then
      token_id := new_entry->>'tokenId';
      if not public.is_own_player_token_id(token_id, target_campaign_id) then
        raise exception 'Players cannot add other turn entries';
      end if;
    elsif new_entry <> matching_entry then
      token_id := new_entry->>'tokenId';
      if not public.is_own_player_token_id(token_id, target_campaign_id) then
        raise exception 'Players cannot update other turn entries';
      end if;

      if (new_entry - 'initiative') <> (matching_entry - 'initiative') then
        raise exception 'Players can only update their initiative';
      end if;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists validate_turn_order_player_update on public.turn_orders;
create trigger validate_turn_order_player_update
before update on public.turn_orders
for each row execute function public.validate_turn_order_player_update();

drop policy if exists "tokens_select_visible" on public.tokens;
create policy "tokens_select_visible" on public.tokens for select using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  (visibility = 'public' and public.is_campaign_member(public.campaign_id_for_map("mapId")))
);

drop policy if exists "tokens_insert_dm" on public.tokens;
create policy "tokens_insert_dm" on public.tokens for insert with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);

drop policy if exists "tokens_update_allowed" on public.tokens;
create policy "tokens_update_dm_or_owner_player" on public.tokens for update using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  public.is_own_player_token_id(id, public.campaign_id_for_map("mapId"))
) with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  public.is_own_player_token_id(id, public.campaign_id_for_map("mapId"))
);

drop policy if exists "tokens_delete_dm" on public.tokens;
create policy "tokens_delete_dm" on public.tokens for delete using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);

drop policy if exists "assets_select_visible" on public.map_assets;
create policy "assets_select_visible" on public.map_assets for select using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  (visibility = 'public' and public.is_campaign_member(public.campaign_id_for_map("mapId")))
);

drop policy if exists "assets_manage_dm" on public.map_assets;
create policy "assets_manage_dm" on public.map_assets for all using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
) with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);

drop policy if exists "areas_select_visible" on public.battlemap_areas;
create policy "areas_select_visible" on public.battlemap_areas for select using (
  public.is_campaign_dm("campaignId") or
  (visibility = 'public' and not hidden and public.is_campaign_member("campaignId"))
);

drop policy if exists "areas_insert_allowed" on public.battlemap_areas;
create policy "areas_insert_allowed" on public.battlemap_areas for insert with check (
  public.is_campaign_dm("campaignId") or
  (
    visibility = 'public'
    and not hidden
    and "createdByUserId" = auth.uid()::text
    and exists (
      select 1 from public.campaign_members member
      where member."campaignId" = public.battlemap_areas."campaignId"
        and member."userId" = auth.uid()::text
        and member."canDrawOnMap"
    )
  )
);

drop policy if exists "areas_update_allowed" on public.battlemap_areas;
create policy "areas_update_allowed" on public.battlemap_areas for update using (
  not locked and (
    public.is_campaign_dm("campaignId") or
    (
      visibility = 'public'
      and not hidden
      and "createdByUserId" = auth.uid()::text
    )
  )
) with check (
  public.is_campaign_dm("campaignId") or
  (
    visibility = 'public'
    and not hidden
    and "createdByUserId" = auth.uid()::text
  )
);

drop policy if exists "areas_delete_allowed" on public.battlemap_areas;
create policy "areas_delete_allowed" on public.battlemap_areas for delete using (
  not locked and (
    public.is_campaign_dm("campaignId") or
    (
      visibility = 'public'
      and not hidden
      and "createdByUserId" = auth.uid()::text
    )
  )
);

drop policy if exists "turns_update_member" on public.turn_orders;
create policy "turns_update_member" on public.turn_orders for update using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  public.is_campaign_member(public.campaign_id_for_map("mapId"))
) with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId")) or
  public.is_campaign_member(public.campaign_id_for_map("mapId"))
);

drop policy if exists "turns_insert_dm" on public.turn_orders;
create policy "turns_insert_dm" on public.turn_orders for insert with check (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);

drop policy if exists "turns_delete_dm" on public.turn_orders;
create policy "turns_delete_dm" on public.turn_orders for delete using (
  public.is_campaign_dm(public.campaign_id_for_map("mapId"))
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tokens',
    'drawings',
    'turn_orders',
    'battlemap_areas',
    'map_assets'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
