-- SMW V3: date without time, unrestricted match label, public reopening

-- Remove the V2 overload to avoid RPC ambiguity.
drop function if exists public.create_scheduled_match(text, timestamptz);

create or replace function public.create_scheduled_match(
  p_label text,
  p_played_at date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_id uuid;
begin
  insert into public.matches(label, played_at, status, opened_at)
  values (coalesce(p_label, ''), p_played_at::timestamptz, 'scheduled', now())
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.reopen_match(p_match_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists(select 1 from public.matches where status = 'open' and id <> p_match_id) then
    raise exception 'Un autre match est déjà ouvert';
  end if;

  update public.matches
  set status = 'open', opened_at = now(), closed_at = null
  where id = p_match_id and status = 'closed';

  if not found then
    raise exception 'Match introuvable ou non clôturé';
  end if;

  return p_match_id;
end;
$$;

grant execute on function public.create_scheduled_match(text, date) to anon, authenticated;
grant execute on function public.reopen_match(uuid) to anon, authenticated;
