-- Saved transaction templates. A trigger with no day_of_month is fired manually
-- whenever the money actually moves; one with a day_of_month is also surfaced as due
-- on that day of each month.
create table if not exists public.transaction_triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_type text not null default 'expense' check (
    transaction_type in ('deposit', 'expense')
  ),
  title text not null check (char_length(title) between 1 and 80),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'USD' check (currency in ('USD', 'LBP')),
  category text not null default 'other' check (
    category in ('food', 'transport', 'shopping', 'bills', 'health', 'entertainment', 'home', 'other')
  ),
  note text,
  day_of_month int check (day_of_month between 1 and 31),
  last_triggered_on date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.transaction_triggers enable row level security;

create index if not exists transaction_triggers_user_id_idx
on public.transaction_triggers (user_id, created_at desc);

drop policy if exists "users can read own triggers" on public.transaction_triggers;
drop policy if exists "users can insert own triggers" on public.transaction_triggers;
drop policy if exists "users can update own triggers" on public.transaction_triggers;
drop policy if exists "users can delete own triggers" on public.transaction_triggers;

create policy "users can read own triggers"
on public.transaction_triggers
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own triggers"
on public.transaction_triggers
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own triggers"
on public.transaction_triggers
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete own triggers"
on public.transaction_triggers
for delete
to authenticated
using (auth.uid() = user_id);
