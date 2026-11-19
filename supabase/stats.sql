-- Play statistics for the game: daily / total players and buildings destroyed.
-- Tables are closed to the public (RLS on, no policies); the game only calls the three functions below.
-- "Today" is the Korean calendar day.

create table if not exists public.visitors (
  id uuid primary key,              -- random id the browser keeps in localStorage; nothing personal
  first_day date not null,
  last_day date not null
);
create table if not exists public.daily_stats (
  day date primary key,
  users integer not null default 0,
  buildings bigint not null default 0
);
create table if not exists public.totals (
  id smallint primary key default 1 check (id = 1),
  users bigint not null default 0,
  buildings bigint not null default 0
);
insert into public.totals (id) values (1) on conflict (id) do nothing;

alter table public.visitors enable row level security;
alter table public.daily_stats enable row level security;
alter table public.totals enable row level security;

create or replace function public.kst_today() returns date
language sql stable set search_path = public as $$
  select (now() at time zone 'Asia/Seoul')::date
$$;

create or replace function public.get_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'today_users', coalesce((select users from daily_stats where day = kst_today()), 0),
    'total_users', coalesce((select users from totals where id = 1), 0),
    'today_buildings', coalesce((select buildings from daily_stats where day = kst_today()), 0),
    'total_buildings', coalesce((select buildings from totals where id = 1), 0))
$$;

-- first visit of the day counts once per browser; the very first visit also counts toward the total
create or replace function public.track_visit(p_id uuid) returns json
language plpgsql security definer set search_path = public as $$
declare d date := kst_today();
begin
  if p_id is not null then
    insert into visitors (id, first_day, last_day) values (p_id, d, d) on conflict (id) do nothing;
    if found then
      update totals set users = users + 1 where id = 1;
      insert into daily_stats (day, users) values (d, 1) on conflict (day) do update set users = daily_stats.users + 1;
    else
      update visitors set last_day = d where id = p_id and last_day < d;
      if found then
        insert into daily_stats (day, users) values (d, 1) on conflict (day) do update set users = daily_stats.users + 1;
      end if;
    end if;
  end if;
  return get_stats();
end $$;

-- buildings brought down since the last report (capped so one call cannot inflate the counters much)
create or replace function public.add_destroyed(p_n integer) returns void
language plpgsql security definer set search_path = public as $$
declare n integer := least(greatest(coalesce(p_n, 0), 0), 500); d date := kst_today();
begin
  if n = 0 then return; end if;
  insert into daily_stats (day, buildings) values (d, n) on conflict (day) do update set buildings = daily_stats.buildings + n;
  update totals set buildings = buildings + n where id = 1;
end $$;

revoke all on function public.get_stats(), public.track_visit(uuid), public.add_destroyed(integer), public.kst_today() from public;
grant execute on function public.get_stats(), public.track_visit(uuid), public.add_destroyed(integer) to anon, authenticated;
