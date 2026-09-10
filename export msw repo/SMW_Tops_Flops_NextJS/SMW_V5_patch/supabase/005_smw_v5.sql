-- SMW V5: several ballots per browser + match-winner statistics

-- Allow multiple anonymous ballots from the same browser for the same match.
alter table public.ballots
  drop constraint if exists ballots_match_id_voter_token_hash_key;

drop index if exists public.ballots_match_id_voter_token_hash_key;

-- Rebuild admin statistics.
-- top_match_wins: number of closed matches where the player finished first on Top points.
-- flop_match_wins: number of closed matches where the player received the most Flop votes.
-- Ties count as a win for every tied player.
create or replace view public.admin_season_stats as
with closed_matches as (
  select id
  from public.matches
  where status = 'closed'
),
player_match as (
  select
    p.id as player_id,
    m.id as match_id,
    coalesce(sum(case v.kind
      when 'top1' then 3
      when 'top2' then 2
      when 'top3' then 1
      else 0
    end), 0)::bigint as top_points,
    (-count(v.id) filter (where v.kind = 'flop'))::bigint as flop_points,
    count(v.id) filter (where v.kind = 'top1')::bigint as top1_count,
    count(v.id) filter (where v.kind = 'top2')::bigint as top2_count,
    count(v.id) filter (where v.kind = 'top3')::bigint as top3_count,
    count(v.id) filter (where v.kind = 'flop')::bigint as flop_count,
    count(v.id) = 0 as is_ghost
  from public.players p
  cross join closed_matches m
  left join public.votes v
    on v.match_id = m.id
   and v.player_id = p.id
  group by p.id, m.id
),
ranked as (
  select
    pm.*,
    max(pm.top_points) over (partition by pm.match_id) as match_max_top_points,
    max(pm.flop_count) over (partition by pm.match_id) as match_max_flop_count
  from player_match pm
),
aggregated as (
  select
    r.player_id,
    count(r.match_id)::bigint as matches_count,
    sum(r.top_points)::bigint as top_points,
    sum(r.flop_points)::bigint as flop_points,
    sum(r.top1_count)::bigint as top1_count,
    sum(r.top2_count)::bigint as top2_count,
    sum(r.top3_count)::bigint as top3_count,
    sum(r.flop_count)::bigint as flop_count,
    count(*) filter (
      where r.match_max_top_points > 0
        and r.top_points = r.match_max_top_points
    )::bigint as top_match_wins,
    count(*) filter (
      where r.match_max_flop_count > 0
        and r.flop_count = r.match_max_flop_count
    )::bigint as flop_match_wins,
    count(*) filter (where r.is_ghost)::bigint as ghost_count
  from ranked r
  group by r.player_id
)
select
  p.id as player_id,
  p.name,
  p.active,
  coalesce(a.matches_count, 0)::bigint as matches_count,
  coalesce(a.top_points, 0)::bigint as top_points,
  coalesce(a.flop_points, 0)::bigint as flop_points,
  coalesce(a.top1_count, 0)::bigint as top1_count,
  coalesce(a.top2_count, 0)::bigint as top2_count,
  coalesce(a.top3_count, 0)::bigint as top3_count,
  coalesce(a.flop_count, 0)::bigint as flop_count,
  coalesce(a.top_match_wins, 0)::bigint as top_match_wins,
  coalesce(a.flop_match_wins, 0)::bigint as flop_match_wins,
  coalesce(a.ghost_count, 0)::bigint as ghost_count
from public.players p
left join aggregated a on a.player_id = p.id;

revoke all on public.admin_season_stats from anon, authenticated;
grant select on public.admin_season_stats to service_role;
