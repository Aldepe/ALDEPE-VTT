alter table public.characters add column if not exists "isVisibleToPlayer" boolean not null default true;
alter table public.characters add column if not exists "passiveOverrides" jsonb not null default '{}'::jsonb;
alter table public.characters add column if not exists currency jsonb not null default '{"platinum":0,"gold":0,"electrum":0,"silver":0,"copper":0}'::jsonb;

drop policy if exists "characters_select_allowed" on public.characters;
create policy "characters_select_allowed" on public.characters for select using (
  public.is_campaign_dm("campaignId")
  or (
    "isVisibleToPlayer"
    and (
      "ownerUserId" = auth.uid()::text
      or exists (
        select 1
        from public.campaign_members member
        where member."campaignId" = characters."campaignId"
          and member."userId" = auth.uid()::text
          and member."characterId" = characters.id
      )
    )
  )
);
