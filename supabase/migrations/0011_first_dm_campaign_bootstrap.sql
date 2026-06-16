create or replace function public.campaign_has_no_members(target_campaign_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.campaign_members
    where "campaignId" = target_campaign_id
  );
$$;

drop policy if exists "members_insert_dm" on public.campaign_members;
drop policy if exists "members_insert_first_dm_or_dm" on public.campaign_members;

create policy "members_insert_first_dm_or_dm" on public.campaign_members for insert with check (
  public.is_campaign_dm("campaignId") or
  (
    role = 'dm'
    and "userId" = auth.uid()::text
    and public.campaign_has_no_members("campaignId")
  )
);
