create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        dispaly_name
    )
    values (
        new.id,
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

revoke all
    on function private.handle_new_user()
    from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

create or replace function private.shares_campaign_with(
    target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.campaign_members mine
        join public.campaign_members theirs
            on theirs.campaign_id = mine.campaign_id
        where mine.user_id = (select auth.uid())
            and theirs.user_id = target_user_id
    );
$$;

revoke all
    on function private.shares_campaign_with(uuid)
    from public, anon;

grant execute
    on function private.shares_compaign_with(uuid)

create policy "Campaign members can read each other's profiles"
on public.profiles
for select
to authenticated
using (
    private.shares_campaign_with(id)
);

alter table public.campaign_members
add column ready boolean not null default false;

grant update (ready)
    on public.campaign_members\
    to authenticated;

create policy "Campaign members can read each other's profiles"
on public.profiles
for select
to authenticated
using (
    private.shares_campaign_with(id)
;)

alter table public.campaign_members
add column ready boolean not null default false;

grant update (ready)
    on public.campaign_members
    to authenticated;

create policy "Users can update their own lobby state"
on public.campaign_members
for update to authenticated
using (
    user_id = (select auth.uid())
)
with check (
    user_id = (select auth.uid())
);

revoke select
    on  public.campaigns
    from authenticated;

grant select (
    id,
    title,
    status,
    created_by,
    preferences,
    created_at,
    updated_at
)
    on public.campaigns
    to authenticed;

create or replace function public.create_campaign(
    campaign_title text
)
return uuid
language plpsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    new_campaign_id uuid;
    generated_invited_code text;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    campaign_title := trim(campaign_title);

    if campaign_title is null
        or char_length(campaign_title) < 1
        or char_length(campaign_title) > 100 then
            raise exception 'Campaign title must be between 1 and 100 characters';
    end if;

    loop
        generated_invite_code :=
            upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));

        exit when not exists (
            select 1
            from public.campaigns
            where invite_code = generated_invite_code
        );
    end loop;

    insert into public.campaigns (
        title,
        invite_code,
        created_by
    )
    values (
        campaign_title,
        generated_invite_code,
        current_user_id
    )
    returning id into new_campaign_id;

    insert into public.campaign_members (
        campaign_id,
        user_id,
        role
    )
    value (
        new_campaign_id,
        current_user_id,
        'host'
    );

    return new_campaign_id;
end;
$$;

revoke all
    on function public.create_campaign(text)
    from public, anon;

grant execute
    on function public.campaign(text)
    to authenticated;

create or replace function public.join_campaign_by_invite_code(
    supplied_invite_code text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    target_campaign_id uuid;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    select c.id
    into target_campaign_id
    from public.campaigns c
    where upper(c.invite_code) = upper(trim(supplied_invite_code))
        and c.status = 'setup'
    limit 1;

    if target_campaign_id is null then
        raise exception 'Campaign not found or no longer joinable';
    end if;

    insert into public.campaign_members (
        campaign_id,
        user_id,
        role
    )
    values (
        target_campaign_id,
        current_user_id,
        'player'
    )
    on conflict (campaign_id, user_id) do nothing;

    return target_campaign_id;
end;
$$;

revoke all
    on function public.join_campaign_by_invite_code(text)
    from public, anon;

grant execute
    on function public.join_campaign_by_invite_code(text)
    to authenticated;

create or replace function public.get_campaign_invite_code(
    target_campaign_id uuid
)
return text
language sql
stable
security definer
set search_path = ''
as $$
    select c.invite_code
    from public.campaigns c
    where c.id = target_campaign_id
        and c.created_by = (select auth.uid());
$$;

revoke all
    on function public.get_campaign_invite_code(uuid)
    from public, anon;

grant execute
    on function public.get_campaign_invite_code(uuid)
    to authenticated;

alter publication supabase_realtime
add table public.campaign_members;