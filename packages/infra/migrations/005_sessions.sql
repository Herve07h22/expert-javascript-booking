create table sessions (
  token      text primary key,
  user_id    text not null references users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Une session qui ne meurt jamais est une clé perdue qui ouvre encore.
create index sessions_expiry on sessions (expires_at);
