alter table public.characters add column if not exists "passiveInvestigation" integer not null default 10;
alter table public.characters add column if not exists "passiveInsight" integer not null default 10;
alter table public.characters add column if not exists "deathSaves" jsonb not null default '{"successes":0,"failures":0}'::jsonb;
alter table public.characters add column if not exists "hitDice" jsonb not null default '{"die":"d8","total":1,"remaining":1}'::jsonb;
alter table public.characters add column if not exists exhaustion integer not null default 0;
alter table public.characters add column if not exists tools jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists weapons jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists armor jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists resistances text[] not null default '{}';
alter table public.characters add column if not exists immunities text[] not null default '{}';
alter table public.characters add column if not exists vulnerabilities text[] not null default '{}';
alter table public.characters add column if not exists conditions text[] not null default '{}';
alter table public.characters add column if not exists senses text[] not null default '{}';
alter table public.characters add column if not exists "turnState" jsonb not null default '{}'::jsonb;
alter table public.characters add column if not exists actions jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists attacks jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists triggers jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists features jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists traits jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists "spellSlots" jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists spells jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists spellcasting jsonb not null default '{"isSpellcaster":false,"saveDc":10,"attackBonus":0,"knownSpells":0,"preparedSpells":0}'::jsonb;

alter table public.timeline_sessions add column if not exists "sessionImageUrl" text;
alter table public.timeline_sessions add column if not exists "sessionImagePath" text;
alter table public.timeline_sessions add column if not exists "sessionImageHoloEnabled" boolean not null default true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('timeline-session-photos', 'timeline-session-photos', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.campaign_id_for_character(target_character_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select "campaignId" from public.characters where id = target_character_id;
$$;

create table if not exists public.character_actions (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  "actionCost" text not null default 'action',
  range text not null default '',
  "hitBonus" integer,
  "saveDc" integer,
  "damageDice" text,
  "damageBonus" integer,
  "damageType" text,
  description text not null default '',
  "quickNotes" text not null default '',
  "applicableTriggerIds" text[] not null default '{}',
  "createdBy" text not null default auth.uid()::text,
  "updatedBy" text not null default auth.uid()::text
);

create table if not exists public.character_attacks (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  "actionCost" text not null default 'action',
  range text not null default '',
  "hitBonus" integer not null default 0,
  "saveDc" integer,
  "damageDice" text not null default '',
  "damageBonus" integer not null default 0,
  "damageType" text not null default '',
  "quickNotes" text not null default '',
  "applicableTriggerIds" text[] not null default '{}',
  "createdBy" text not null default auth.uid()::text,
  "updatedBy" text not null default auth.uid()::text
);

create table if not exists public.character_features (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  origin text not null default 'custom',
  type text not null default 'passive',
  "maxUses" integer,
  "currentUses" integer,
  recovery text not null default 'custom',
  summary text not null default '',
  "mechanicalEffect" text not null default '',
  "consumesTurnResource" boolean not null default false,
  modifies text[] not null default '{}',
  active boolean not null default false,
  tags text[] not null default '{}'
);

create table if not exists public.character_traits (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  origin text not null default 'custom',
  type text not null default 'passive',
  "maxUses" integer,
  "currentUses" integer,
  recovery text not null default 'custom',
  summary text not null default '',
  "mechanicalEffect" text not null default '',
  "consumesTurnResource" boolean not null default false,
  modifies text[] not null default '{}',
  active boolean not null default false,
  tags text[] not null default '{}'
);

create table if not exists public.character_triggers (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  "appliesWhen" text not null default '',
  summary text not null default '',
  active boolean not null default false,
  duration text not null default '',
  "usesRemaining" integer
);

create table if not exists public.character_resources (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  "maxValue" integer not null default 1,
  "currentValue" integer not null default 1,
  recovery text not null default 'turn'
);

create table if not exists public.character_spell_slots (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  "spellLevel" integer not null,
  "maxSlots" integer not null default 0,
  "currentSlots" integer not null default 0
);

create table if not exists public.character_spells (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  "spellLevel" integer not null default 0,
  school text not null default '',
  "castingTime" text not null default 'action',
  range text not null default '',
  "hitBonus" integer,
  "saveDc" integer,
  components text not null default '',
  duration text not null default '',
  "requiresConcentration" boolean not null default false,
  summary text not null default '',
  "damageOrHealing" text not null default '',
  "damageType" text not null default '',
  prepared boolean not null default false,
  "usageExamples" text[] not null default '{}',
  "sourceNotes" text not null default ''
);

create table if not exists public.character_resistances (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  kind text not null check (kind in ('resistance', 'immunity', 'vulnerability')),
  name text not null,
  notes text not null default ''
);

create table if not exists public.character_tools (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  proficient boolean not null default false,
  bonus integer not null default 0,
  notes text not null default ''
);

create table if not exists public.character_weapons (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  type text not null default '',
  range text not null default '',
  "hitBonus" integer not null default 0,
  damage text not null default '',
  "damageType" text not null default '',
  properties text[] not null default '{}',
  equipped boolean not null default false
);

create table if not exists public.character_armor (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  name text not null,
  type text not null default '',
  "baseAc" integer not null default 10,
  bonus integer not null default 0,
  equipped boolean not null default false,
  notes text not null default ''
);

create index if not exists character_actions_character_idx on public.character_actions ("characterId");
create index if not exists character_attacks_character_idx on public.character_attacks ("characterId");
create index if not exists character_features_character_idx on public.character_features ("characterId");
create index if not exists character_traits_character_idx on public.character_traits ("characterId");
create index if not exists character_triggers_character_idx on public.character_triggers ("characterId");
create index if not exists character_resources_character_idx on public.character_resources ("characterId");
create index if not exists character_spell_slots_character_idx on public.character_spell_slots ("characterId");
create index if not exists character_spells_character_idx on public.character_spells ("characterId");
create index if not exists character_resistances_character_idx on public.character_resistances ("characterId");
create index if not exists character_tools_character_idx on public.character_tools ("characterId");
create index if not exists character_weapons_character_idx on public.character_weapons ("characterId");
create index if not exists character_armor_character_idx on public.character_armor ("characterId");
create index if not exists timeline_session_image_path_idx on public.timeline_sessions ("sessionImagePath");

alter table public.character_actions enable row level security;
alter table public.character_attacks enable row level security;
alter table public.character_features enable row level security;
alter table public.character_traits enable row level security;
alter table public.character_triggers enable row level security;
alter table public.character_resources enable row level security;
alter table public.character_spell_slots enable row level security;
alter table public.character_spells enable row level security;
alter table public.character_resistances enable row level security;
alter table public.character_tools enable row level security;
alter table public.character_weapons enable row level security;
alter table public.character_armor enable row level security;

create or replace function public.can_manage_character_detail(target_character_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.characters character
    where character.id = target_character_id
      and (
        public.is_campaign_dm(character."campaignId")
        or character."ownerUserId" = auth.uid()::text
      )
  );
$$;

drop policy if exists "timeline_session_photos_authenticated_read" on storage.objects;
create policy "timeline_session_photos_authenticated_read" on storage.objects for select using (
  bucket_id = 'timeline-session-photos'
  and auth.role() = 'authenticated'
);

drop policy if exists "timeline_session_photos_authenticated_upload" on storage.objects;
create policy "timeline_session_photos_authenticated_upload" on storage.objects for insert with check (
  bucket_id = 'timeline-session-photos'
  and auth.role() = 'authenticated'
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'character_actions',
    'character_attacks',
    'character_features',
    'character_traits',
    'character_triggers',
    'character_resources',
    'character_spell_slots',
    'character_spells',
    'character_resistances',
    'character_tools',
    'character_weapons',
    'character_armor'
  ]
  loop
    execute format('drop policy if exists "%1$s_select_allowed" on public.%1$I', table_name);
    execute format('create policy "%1$s_select_allowed" on public.%1$I for select using (public.can_manage_character_detail("characterId"))', table_name);
    execute format('drop policy if exists "%1$s_manage_allowed" on public.%1$I', table_name);
    execute format('create policy "%1$s_manage_allowed" on public.%1$I for all using (public.can_manage_character_detail("characterId")) with check (public.can_manage_character_detail("characterId"))', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'characters',
    'timeline_sessions',
    'character_actions',
    'character_attacks',
    'character_features',
    'character_traits',
    'character_triggers',
    'character_resources',
    'character_spell_slots',
    'character_spells',
    'character_resistances',
    'character_tools',
    'character_weapons',
    'character_armor'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
