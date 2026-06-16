alter table public.inventory_items add column if not exists "imageUrl" text;
alter table public.inventory_items add column if not exists "imagePath" text;
alter table public.inventory_items add column if not exists "imageAlt" text;

alter table public.character_spells add column if not exists known boolean not null default true;
alter table public.character_spells add column if not exists "schoolIcon" text not null default 'universal';
alter table public.character_spells add column if not exists "createdBy" text not null default auth.uid()::text;
alter table public.character_spells add column if not exists "updatedBy" text not null default auth.uid()::text;

alter table public.character_features add column if not exists "sourceType" text not null default 'custom';
alter table public.character_features add column if not exists "sourceClass" text not null default '';
alter table public.character_features add column if not exists "functionalType" text not null default 'utility';
alter table public.character_features add column if not exists icon text not null default 'spark';
alter table public.character_features add column if not exists "beginnerHint" text not null default '';
alter table public.character_features add column if not exists "highlightForPlayer" boolean not null default false;
alter table public.character_features add column if not exists "highlightedByDm" boolean not null default false;
alter table public.character_features add column if not exists "createdBy" text not null default auth.uid()::text;
alter table public.character_features add column if not exists "updatedBy" text not null default auth.uid()::text;

alter table public.character_traits add column if not exists "sourceType" text not null default 'custom';
alter table public.character_traits add column if not exists "sourceClass" text not null default '';
alter table public.character_traits add column if not exists "functionalType" text not null default 'passive';
alter table public.character_traits add column if not exists icon text not null default 'rune';
alter table public.character_traits add column if not exists "beginnerHint" text not null default '';
alter table public.character_traits add column if not exists "highlightForPlayer" boolean not null default false;
alter table public.character_traits add column if not exists "highlightedByDm" boolean not null default false;
alter table public.character_traits add column if not exists "createdBy" text not null default auth.uid()::text;
alter table public.character_traits add column if not exists "updatedBy" text not null default auth.uid()::text;

create table if not exists public.character_conditions (
  id text primary key default gen_random_uuid()::text,
  "characterId" text not null references public.characters(id) on delete cascade,
  kind text not null check (kind in ('condition', 'resistance', 'immunity', 'vulnerability')),
  name text not null,
  icon text not null default 'rune',
  notes text not null default '',
  "createdBy" text not null default auth.uid()::text,
  "updatedBy" text not null default auth.uid()::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists inventory_items_image_path_idx on public.inventory_items ("imagePath");
create index if not exists character_conditions_character_idx on public.character_conditions ("characterId");
create index if not exists character_conditions_kind_idx on public.character_conditions (kind);

alter table public.character_conditions enable row level security;

drop policy if exists "character_conditions_select_allowed" on public.character_conditions;
create policy "character_conditions_select_allowed" on public.character_conditions for select using (
  public.can_manage_character_detail("characterId")
);

drop policy if exists "character_conditions_manage_allowed" on public.character_conditions;
create policy "character_conditions_manage_allowed" on public.character_conditions for all using (
  public.can_manage_character_detail("characterId")
) with check (
  public.can_manage_character_detail("characterId")
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inventory-item-images', 'inventory-item-images', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "inventory_item_images_authenticated_read" on storage.objects;
create policy "inventory_item_images_authenticated_read" on storage.objects for select using (
  bucket_id = 'inventory-item-images'
  and auth.role() = 'authenticated'
);

drop policy if exists "inventory_item_images_authenticated_upload" on storage.objects;
create policy "inventory_item_images_authenticated_upload" on storage.objects for insert with check (
  bucket_id = 'inventory-item-images'
  and auth.role() = 'authenticated'
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'inventory_items',
    'character_spells',
    'character_features',
    'character_traits',
    'character_conditions'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
