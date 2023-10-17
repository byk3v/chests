create table clan (
  id uuid not null primary key,
  name text
);

create table chest_type (
  id uuid not null primary key,
  source text
);

create table users (
  id uuid not null primary key,
  email text,
  clan_id uuid references clan on delete cascade not null
);

create table player (
  id uuid not null primary key,
  name text not null,
  clan_id uuid references clan on delete cascade not null,
  might int
);

create table chest (
  id bigint generated by default as identity primary key,
  title text,
  source text,
  level int,
  player_id uuid references player on delete cascade not null,
  chest_type_id uuid references chest_type on delete cascade not null,
  uploaded_by uuid references public.users not null default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
