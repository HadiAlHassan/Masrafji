-- Money moved into savings is recorded as an expense with the 'saving' category, so the
-- available balance stays truthful. Goals are targets measured against that pot rather
-- than envelopes money is allocated into.
alter table public.expenses
drop constraint if exists expenses_category_check;

do $$
declare
  constraint_name text;
begin
  select conname
  into constraint_name
  from pg_constraint
  where conrelid = 'public.expenses'::regclass
    and pg_get_constraintdef(oid) like '%category in%';

  if constraint_name is not null then
    execute format('alter table public.expenses drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.expenses
add constraint expenses_category_check
check (category in (
  'food', 'transport', 'shopping', 'bills', 'health',
  'entertainment', 'home', 'saving', 'other'
));

alter table public.transaction_triggers
drop constraint if exists transaction_triggers_category_check;

alter table public.transaction_triggers
add constraint transaction_triggers_category_check
check (category in (
  'food', 'transport', 'shopping', 'bills', 'health',
  'entertainment', 'home', 'saving', 'other'
));

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  currency text not null default 'USD' check (currency in ('USD', 'LBP')),
  note text,
  achieved_at date,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create index if not exists goals_user_id_idx
on public.goals (user_id, created_at desc);

drop policy if exists "users can read own goals" on public.goals;
drop policy if exists "users can insert own goals" on public.goals;
drop policy if exists "users can update own goals" on public.goals;
drop policy if exists "users can delete own goals" on public.goals;

create policy "users can read own goals"
on public.goals
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own goals"
on public.goals
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own goals"
on public.goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete own goals"
on public.goals
for delete
to authenticated
using (auth.uid() = user_id);
