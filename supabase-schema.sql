-- CookingHelper Supabase Schema
-- SupabaseのSQL Editorで実行してください

-- recipes: レシピマスタ
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('main', 'soup', 'side')),
  cuisine text not null check (cuisine in ('japanese', 'western', 'chinese', 'other')),
  servings int not null default 2,
  ingredients jsonb not null default '[]',
  is_preset boolean default false,
  memo text,
  created_at timestamptz default now()
);

-- weekly_menus: 週間献立
create table if not exists weekly_menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  week_start date not null,
  day_of_week text not null check (day_of_week in ('mon','tue','wed','thu','fri','sat','sun')),
  main_recipe_id uuid references recipes on delete set null,
  soup_recipe_id uuid references recipes on delete set null,
  side_recipe_ids uuid[] default '{}',
  servings int default 2,
  unique(user_id, week_start, day_of_week)
);

-- shopping_items: 買い物チェック状態
create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  week_start date not null,
  ingredient_name text not null,
  total_amount numeric,
  unit text,
  category text,
  checked boolean default false,
  from_recipes text[] default '{}'
);

-- user_settings: ユーザー設定
create table if not exists user_settings (
  user_id uuid primary key references auth.users not null,
  category_order text[] default ARRAY['野菜・果物','肉','魚','豆腐・乳製品','卵','米・麺・パン','調味料','乾物','冷凍食品','飲み物','その他'],
  default_servings int default 2
);

-- Row Level Security
alter table recipes enable row level security;
alter table weekly_menus enable row level security;
alter table shopping_items enable row level security;
alter table user_settings enable row level security;

-- RLS Policies
create policy "Users can manage own recipes" on recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own menus" on weekly_menus
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own shopping items" on shopping_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own settings" on user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
