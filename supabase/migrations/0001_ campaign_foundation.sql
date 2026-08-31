create extension if not exists pgcrypto;

create type public.campaign_status as enum (
    'setup',
    'active',
    'paused',
    'completed',
    'archived'
);

create type public.campaign_member_role as enum (
    'host',
    'player'
);

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.campaigns (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(title) between 1 and 100),
    invite_code text not null unique,
    status public.campaign_status not null default 'setup',
    created_by uuid not null references auth.users(id) on delete restrict,
    preferences jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.campaign_members (
    id uuid primary key default gen_random_uuid(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role public.campaign_member_role not null default 'player',
    joined_at timestamptz not null default now(),
    unique (campaign_id, user_id)
);

create index campaign_members_user_id_idx
    on public.campaign_members(user_id);

create index campaigns_created_by_idx
    on public.campaigns(created_by);

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;

grant select, insert, update
    on public.profiles
    to authenticated;

grant select, insert, update
    on public.campaigns
    to authenticated;

grant select, insert, delete
    on public.campaign_members
    to authenticated;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Campaign creators can create campaigns"
on public.campaigns
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_campaign_member(
    target_campaign_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.campaign_members cm
        where cm.campaign_id = target_campaign_id
            and cm.user_id = (select auth.uid())
    );
$$;

revoke all
    on function private.is_campaign_member(uuid)
    from public, anon;

grant execute
    on function private.is_campaign_member(uuid)
    to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

revoke all
    on function private.set_updated_at()
    from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

create trigger campaigns_set_updated_at
before update on public.campaigns
for each row
execute function private.set_updated_at();

create policy "Campaign members can read campaigns"
on public.campaigns
for select
to authenticated
using (
    created_by = (select auth.uid())
    or private.is_campaign_member(id)
);

create policy "Campaign creators can update campaigns"
on public.campaigns
for update
to authenticated
using(created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create policy "Campaign members can read membership"
on public.campaign_members
for select
to authenticated
using (
    private.is_campaign_member(campaign_id)
);

create policy "Campaign creators can create host membership"
on public.campaign_members
for insert
to authenticated
with check (
    user_id = (select auth.uid())
    and role = 'host'
    and exists (
        select 1
        from public.campaigns
        where campaigns.id = campaign_members.campaign_id
            and campaigns.created_by = (select auth.uid())
    )
);

create policy "Users can leave campaigns"
on public.campaign_members
for delete
to authenticated
using (
    user_id = (select auth.uid())
);