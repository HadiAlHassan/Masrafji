alter table public.expenses
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.expenses
add column if not exists transaction_type text not null default 'expense';

alter table public.expenses
add column if not exists currency text not null default 'USD';

update public.expenses
set transaction_type = 'deposit',
    category = 'other'
where category = 'income';

alter table public.expenses
drop constraint if exists expenses_category_check;

alter table public.expenses
drop constraint if exists expenses_transaction_type_check;

alter table public.expenses
drop constraint if exists expenses_currency_check;

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

do $$
declare
  constraint_name text;
begin
  select conname
  into constraint_name
  from pg_constraint
  where conrelid = 'public.expenses'::regclass
    and pg_get_constraintdef(oid) like '%transaction_type in%';

  if constraint_name is not null then
    execute format('alter table public.expenses drop constraint %I', constraint_name);
  end if;
end $$;

do $$
declare
  constraint_name text;
begin
  select conname
  into constraint_name
  from pg_constraint
  where conrelid = 'public.expenses'::regclass
    and pg_get_constraintdef(oid) like '%currency in%';

  if constraint_name is not null then
    execute format('alter table public.expenses drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.expenses
add constraint expenses_transaction_type_check
check (transaction_type in ('deposit', 'expense'));

alter table public.expenses
add constraint expenses_currency_check
check (currency in ('USD', 'LBP'));

alter table public.expenses
add constraint expenses_category_check
check (category in ('food', 'transport', 'shopping', 'bills', 'health', 'entertainment', 'home', 'other'));

create index if not exists expenses_user_id_spent_at_idx
on public.expenses (user_id, spent_at desc);

drop policy if exists "prototype anon read expenses" on public.expenses;
drop policy if exists "prototype anon insert expenses" on public.expenses;
drop policy if exists "prototype anon delete expenses" on public.expenses;

drop policy if exists "users can read own expenses" on public.expenses;
drop policy if exists "users can insert own expenses" on public.expenses;
drop policy if exists "users can update own expenses" on public.expenses;
drop policy if exists "users can delete own expenses" on public.expenses;

create policy "users can read own expenses"
on public.expenses
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own expenses"
on public.expenses
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own expenses"
on public.expenses
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete own expenses"
on public.expenses
for delete
to authenticated
using (auth.uid() = user_id);
