-- SMW V6: controlled deletion of matches

-- Public deletion is allowed only for a scheduled match with no ballots.
create or replace function public.delete_scheduled_match(p_match_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and m.status = 'scheduled'
      and not exists (
        select 1 from public.ballots b where b.match_id = m.id
      )
  ) then
    raise exception 'Seul un match à venir sans vote peut être supprimé publiquement';
  end if;

  delete from public.matches where id = p_match_id;
  return p_match_id;
end;
$$;

grant execute on function public.delete_scheduled_match(uuid) to anon, authenticated;
