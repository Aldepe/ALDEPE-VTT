alter table public.lore_entries
  add column if not exists "visibleToPlayerIds" text[] not null default '{}'::text[];

drop policy if exists "lore_select_allowed" on public.lore_entries;

create policy "lore_select_allowed" on public.lore_entries for select using (
  public.is_campaign_dm("campaignId")
  or (
    public.is_campaign_member("campaignId")
    and "isVisibleToPlayers"
    and (
      coalesce(array_length("visibleToPlayerIds", 1), 0) = 0
      or auth.uid()::text = any("visibleToPlayerIds")
    )
  )
);
