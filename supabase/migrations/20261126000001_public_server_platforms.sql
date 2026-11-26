create function public.public_server_platforms()
returns table (id uuid, has_java boolean, has_bedrock boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,
    coalesce(s.ip_or_code, '') not in ('', 'None'),
    coalesce(s.bedrock_ip, '') <> ''
  from public.servers s
  where s.status = 'approved' and s.type = 'server';
$$;

revoke execute on function public.public_server_platforms() from public;
grant execute on function public.public_server_platforms() to anon, authenticated;
