-- sql/rls/110_activities.sql
alter table activities enable row level security;

drop policy if exists "activities_read" on activities;
create policy "activities_read"
on activities for select
using (
  exists (
    select 1 from leads l
    where l.id = activities.lead_id
      and l.org_id = app_auth_org_id()
      and (
        app_is_manager()
        or l.owner_id = app_uid()
        or app_role() = 'viewer' -- idem observação acima
      )
  )
);

drop policy if exists "activities_write" on activities;
create policy "activities_write"
on activities for all
using (
  exists (
    select 1 from leads l
    where l.id = activities.lead_id
      and l.org_id = app_auth_org_id()
      and (
        app_is_manager()
        or (app_role() = 'vendedor' and l.owner_id = app_uid())
      )
  )
)
with check (
  exists (
    select 1 from leads l
    where l.id = activities.lead_id
      and l.org_id = app_auth_org_id()
      and (
        app_is_manager()
        or (app_role() = 'vendedor' and l.owner_id = app_uid())
      )
  )
);
