drop policy if exists "characters_delete_dm" on public.characters;

create policy "characters_delete_dm" on public.characters for delete using (
  public.is_campaign_dm("campaignId")
);
