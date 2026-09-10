-- SMW V4: fix scheduled match creation
-- The old constraint considered every status other than open as closed.

alter table public.matches
  drop constraint if exists closed_has_date;

alter table public.matches
  add constraint closed_has_date
  check (status <> 'closed' or closed_at is not null);

-- Match name is free text. Date remains required by the UI/database.
drop function if exists public.create_scheduled_match(text, timestamptz);
drop function if exists public.create_scheduled_match(text, date);

create or replace function public.create_scheduled_match(
  p_label text,
  p_played_at date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.matches (
    label,
    played_at,
    status,
    opened_at,
    closed_at
  )
  values (
    coalesce(p_label, ''),
    p_played_at::timestamptz,
    'scheduled',
    now(),
    null
  )
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_scheduled_match(text, date)
  to anon, authenticated;
