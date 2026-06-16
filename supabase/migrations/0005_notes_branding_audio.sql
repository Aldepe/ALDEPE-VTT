create table if not exists public.notes (
  id text primary key default gen_random_uuid()::text,
  "campaignId" text not null references public.campaigns(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  tags text[] not null default '{}',
  type text not null default 'personal' check (type in ('personal', 'party', 'dm')),
  "authorUserId" text not null,
  "authorName" text not null default '',
  pinned boolean not null default false,
  "linkedCharacterIds" text[] not null default '{}',
  "linkedLoreEntryIds" text[] not null default '{}',
  "linkedMapIds" text[] not null default '{}',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists notes_campaign_idx on public.notes ("campaignId");
create index if not exists notes_author_idx on public.notes ("authorUserId");
create index if not exists notes_type_idx on public.notes (type);

alter table public.notes enable row level security;

drop policy if exists "notes_select_allowed" on public.notes;
create policy "notes_select_allowed" on public.notes for select using (
  public.is_campaign_dm("campaignId") or
  (
    public.is_campaign_member("campaignId") and (
      type = 'party' or
      (type = 'personal' and "authorUserId" = auth.uid()::text)
    )
  )
);

drop policy if exists "notes_insert_allowed" on public.notes;
create policy "notes_insert_allowed" on public.notes for insert with check (
  public.is_campaign_dm("campaignId") or
  (
    public.is_campaign_member("campaignId") and
    "authorUserId" = auth.uid()::text and
    type in ('personal', 'party')
  )
);

drop policy if exists "notes_update_allowed" on public.notes;
create policy "notes_update_allowed" on public.notes for update using (
  public.is_campaign_dm("campaignId") or
  (
    "authorUserId" = auth.uid()::text and
    type in ('personal', 'party') and
    public.is_campaign_member("campaignId")
  )
) with check (
  public.is_campaign_dm("campaignId") or
  (
    "authorUserId" = auth.uid()::text and
    type in ('personal', 'party') and
    public.is_campaign_member("campaignId")
  )
);

drop policy if exists "notes_delete_allowed" on public.notes;
create policy "notes_delete_allowed" on public.notes for delete using (
  public.is_campaign_dm("campaignId") or
  (
    "authorUserId" = auth.uid()::text and
    type in ('personal', 'party') and
    public.is_campaign_member("campaignId")
  )
);

insert into public.notes (
  id, "campaignId", title, content, tags, type, "authorUserId", "authorName", pinned,
  "linkedCharacterIds", "linkedLoreEntryIds", "linkedMapIds"
)
values
  (
    'note_party_aldepe',
    'campaign_demo',
    'Pistas compartidas',
    'La luz cyan responde a canciones lentas y el emblema draconico aparece cerca de portales activos.',
    '{pistas,portal}',
    'party',
    'REPLACE_WITH_DM_USER_ID',
    'DM Demo',
    true,
    '{character_lira}',
    '{lore_vespera}',
    '{map_aldepe_forest}'
  ),
  (
    'note_dm_aldepe',
    'campaign_demo',
    'Secreto del claro',
    'El primer enemigo huira si el grupo activa tres glifos sin romper el circulo central.',
    '{dm,encuentro}',
    'dm',
    'REPLACE_WITH_DM_USER_ID',
    'DM Demo',
    false,
    '{}',
    '{}',
    '{map_aldepe_forest}'
  )
on conflict (id) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.notes;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.maps;
exception when duplicate_object then null;
end $$;
