-- ReviewReply.ai Database Schema

-- User settings
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  restaurant_name text,
  brand_voice text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Response history
create table if not exists response_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  review text not null,
  rating int not null check (rating between 1 and 5),
  tone text not null check (tone in ('professional', 'friendly', 'empathetic', 'apologetic')),
  response text not null,
  created_at timestamptz default now()
);

-- RLS policies
alter table user_settings enable row level security;
alter table response_history enable row level security;

create policy "Users can read own settings" on user_settings
  for select using (auth.uid() = user_id);

create policy "Users can upsert own settings" on user_settings
  for all using (auth.uid() = user_id);

create policy "Users can read own history" on response_history
  for select using (auth.uid() = user_id);

create policy "Users can insert own history" on response_history
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own history" on response_history
  for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_history_user_id on response_history(user_id);
create index if not exists idx_history_created_at on response_history(created_at desc);
