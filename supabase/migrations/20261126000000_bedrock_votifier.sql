create table public.server_bedrock_votifier (
  server_id uuid primary key references public.servers (id) on delete cascade,
  secret_hash text not null unique,
  created_at timestamptz not null default now()
);

alter table public.server_bedrock_votifier enable row level security;

create policy "Owners manage their Bedrock Votifier key"
  on public.server_bedrock_votifier
  for all
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = server_id and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.servers s
      where s.id = server_id and s.owner_id = (select auth.uid())
    )
  );

create table public.bedrock_vote_queue (
  id bigint generated always as identity primary key,
  server_id uuid not null references public.server_bedrock_votifier (server_id) on delete cascade,
  username text not null,
  voted_at timestamptz not null default now()
);

create index bedrock_vote_queue_server_id_idx on public.bedrock_vote_queue (server_id, id);

alter table public.bedrock_vote_queue enable row level security;

create function public.queue_bedrock_vote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.minecraft_username is null or btrim(new.minecraft_username) = '' then
    return new;
  end if;

  delete from public.bedrock_vote_queue
  where server_id = new.server_id and voted_at < now() - interval '7 days';

  insert into public.bedrock_vote_queue (server_id, username)
  select c.server_id, btrim(new.minecraft_username)
  from public.server_bedrock_votifier c
  where c.server_id = new.server_id;

  return new;
end;
$$;

create trigger votes_queue_bedrock_vote
  after insert on public.votes
  for each row execute function public.queue_bedrock_vote();

create function public.bedrock_votifier_server(p_key text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select server_id
  from public.server_bedrock_votifier
  where secret_hash = encode(sha256(convert_to(p_key, 'UTF8')), 'hex');
$$;

create function public.bedrock_votifier_pending(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_server_id uuid := public.bedrock_votifier_server(p_key);
begin
  if v_server_id is null then
    return null;
  end if;

  return (
    select coalesce(jsonb_agg(to_jsonb(v) order by v.id), '[]'::jsonb)
    from (
      select id, username, voted_at
      from public.bedrock_vote_queue
      where server_id = v_server_id
      order by id
      limit 100
    ) v
  );
end;
$$;

create function public.bedrock_votifier_claim(p_key text, p_ids bigint[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_server_id uuid := public.bedrock_votifier_server(p_key);
  v_claimed integer;
begin
  if v_server_id is null then
    return null;
  end if;

  delete from public.bedrock_vote_queue
  where server_id = v_server_id and id = any (p_ids);

  get diagnostics v_claimed = row_count;
  return v_claimed;
end;
$$;

revoke execute on function public.queue_bedrock_vote() from public, anon, authenticated;
revoke execute on function public.bedrock_votifier_server(text) from public, anon, authenticated;
revoke execute on function public.bedrock_votifier_pending(text) from public;
revoke execute on function public.bedrock_votifier_claim(text, bigint[]) from public;
grant execute on function public.bedrock_votifier_pending(text) to anon, authenticated;
grant execute on function public.bedrock_votifier_claim(text, bigint[]) to anon, authenticated;
