create table if not exists public.app_data (
  collection text not null,
  id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_data_updated_at on public.app_data;
create trigger trg_app_data_updated_at
before update on public.app_data
for each row
execute function public.set_updated_at();

alter table public.app_data enable row level security;

drop policy if exists "Allow public read" on public.app_data;
create policy "Allow public read" on public.app_data
for select
to public
using (true);

drop policy if exists "Allow public insert" on public.app_data;
create policy "Allow public insert" on public.app_data
for insert
to public
with check (true);

drop policy if exists "Allow public update" on public.app_data;
create policy "Allow public update" on public.app_data
for update
to public
using (true)
with check (true);

drop policy if exists "Allow public delete" on public.app_data;
create policy "Allow public delete" on public.app_data
for delete
to public
using (true);