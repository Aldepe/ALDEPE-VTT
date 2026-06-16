alter table public.character_spell_slots add column if not exists "pendingSlots" integer not null default 0;
alter table public.character_spells add column if not exists "effectCategory" text not null default 'utility';
alter table public.character_spells add column if not exists "effectIcon" text not null default 'spark';
alter table public.character_spells add column if not exists "secondaryCategories" text[] not null default '{}';

create table if not exists public.character_turn_plans (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  "combatId" text,
  status text not null default 'draft' check (status in ('draft', 'valid', 'invalid', 'computed', 'undone')),
  "validationErrors" text[] not null default '{}',
  "createdBy" text not null default auth.uid()::text,
  "computedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.character_turn_plan_items (
  id text primary key default gen_random_uuid()::text,
  "turnPlanId" text not null references public.character_turn_plans(id) on delete cascade,
  type text not null,
  name text not null,
  "costType" text not null default 'free',
  "costAmount" integer not null default 0,
  "spellSlotLevel" integer,
  "attackId" text,
  "spellId" text,
  "featureId" text,
  "movementCost" integer,
  "manualRoll" integer,
  "manualDamageRoll" integer,
  notes text not null default '',
  "sortOrder" integer not null default 0
);

create table if not exists public.character_turn_history (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  "turnPlanId" text references public.character_turn_plans(id) on delete set null,
  summary text not null default '',
  "previousState" jsonb not null default '{}'::jsonb,
  "computedState" jsonb not null default '{}'::jsonb,
  "undoneAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create index if not exists character_turn_plans_character_idx on public.character_turn_plans ("characterId");
create index if not exists character_turn_plan_items_plan_idx on public.character_turn_plan_items ("turnPlanId");
create index if not exists character_turn_history_character_idx on public.character_turn_history ("characterId");

alter table public.character_turn_plans enable row level security;
alter table public.character_turn_plan_items enable row level security;
alter table public.character_turn_history enable row level security;

drop policy if exists "character_turn_plans_select_allowed" on public.character_turn_plans;
create policy "character_turn_plans_select_allowed" on public.character_turn_plans for select using (
  public.can_manage_character_detail("characterId")
);

drop policy if exists "character_turn_plans_manage_allowed" on public.character_turn_plans;
create policy "character_turn_plans_manage_allowed" on public.character_turn_plans for all using (
  public.can_manage_character_detail("characterId")
) with check (
  public.can_manage_character_detail("characterId")
);

drop policy if exists "character_turn_plan_items_select_allowed" on public.character_turn_plan_items;
create policy "character_turn_plan_items_select_allowed" on public.character_turn_plan_items for select using (
  exists (
    select 1
    from public.character_turn_plans plan
    where plan.id = "turnPlanId"
      and public.can_manage_character_detail(plan."characterId")
  )
);

drop policy if exists "character_turn_plan_items_manage_allowed" on public.character_turn_plan_items;
create policy "character_turn_plan_items_manage_allowed" on public.character_turn_plan_items for all using (
  exists (
    select 1
    from public.character_turn_plans plan
    where plan.id = "turnPlanId"
      and public.can_manage_character_detail(plan."characterId")
  )
) with check (
  exists (
    select 1
    from public.character_turn_plans plan
    where plan.id = "turnPlanId"
      and public.can_manage_character_detail(plan."characterId")
  )
);

drop policy if exists "character_turn_history_select_allowed" on public.character_turn_history;
create policy "character_turn_history_select_allowed" on public.character_turn_history for select using (
  public.can_manage_character_detail("characterId")
);

drop policy if exists "character_turn_history_manage_allowed" on public.character_turn_history;
create policy "character_turn_history_manage_allowed" on public.character_turn_history for all using (
  public.can_manage_character_detail("characterId")
) with check (
  public.can_manage_character_detail("characterId")
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'character_turn_plans',
    'character_turn_plan_items',
    'character_turn_history'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
