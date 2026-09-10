-- Run this second, after 002a succeeded.
create or replace function public.create_scheduled_match(p_label text,p_played_at timestamptz) returns uuid language plpgsql security definer set search_path=public as $$ declare new_id uuid; begin if char_length(trim(p_label)) not between 1 and 100 then raise exception 'Libellé invalide'; end if; insert into public.matches(label,played_at,status,opened_at) values(trim(p_label),p_played_at,'scheduled',p_played_at) returning id into new_id; return new_id; end $$;

create or replace function public.open_scheduled_match(p_match_id uuid) returns uuid language plpgsql security definer set search_path=public as $$ begin if exists(select 1 from public.matches where status='open') then raise exception 'Un autre match est déjà ouvert'; end if; update public.matches set status='open',opened_at=now(),closed_at=null where id=p_match_id and status='scheduled'; if not found then raise exception 'Match introuvable ou déjà traité'; end if; return p_match_id; end $$;

create or replace function public.get_public_matches() returns table(id uuid,label text,played_at timestamptz,status public.match_status,ballot_count bigint) language sql stable security definer set search_path=public as $$ select m.id,m.label,m.played_at,m.status,count(b.id) from public.matches m left join public.ballots b on b.match_id=m.id group by m.id order by case m.status when 'open' then 0 when 'scheduled' then 1 else 2 end,m.played_at desc $$;

grant execute on function public.create_scheduled_match(text,timestamptz) to anon,authenticated;
grant execute on function public.open_scheduled_match(uuid) to anon,authenticated;
grant execute on function public.get_public_matches() to anon,authenticated;
