create table users (
  id              text primary key,
  email           text not null unique,
  hashed_password text not null,
  created_at      timestamptz not null default now()
);

-- Une adresse email n'est pas sensible à la casse : c'est une règle métier,
-- et le test de contrat la vérifie des deux côtés.
create unique index users_email_lower on users (lower(email));
