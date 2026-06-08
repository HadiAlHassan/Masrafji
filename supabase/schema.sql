create extension if not exists pgcrypto;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_type text not null default 'expense' check (
    transaction_type in ('deposit', 'expense')
  ),
  title text not null check (char_length(title) between 1 and 80),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'USD' check (currency in ('USD', 'LBP')),
  category text not null check (
    category in ('food', 'transport', 'shopping', 'bills', 'health', 'entertainment', 'home', 'other')
  ),
  note text,
  spent_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create index if not exists expenses_user_id_spent_at_idx
on public.expenses (user_id, spent_at desc);

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
