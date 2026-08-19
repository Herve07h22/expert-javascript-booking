create table bookings (
  id               text primary key,
  tenant_id        text not null references users (id),
  accommodation_id text not null references accommodations (id),
  adults           integer not null check (adults >= 1),
  children         integer not null check (children >= 0),
  -- `date`, et surtout pas `timestamptz` : un séjour commence un JOUR,
  -- pas à un instant. Le chapitre 21 a passé une page à expulser les instants.
  starts_on        date not null,
  ends_on          date not null,
  status           text not null check (status in ('confirmed', 'cancelled')),
  created_at       timestamptz not null default now(),
  check (starts_on < ends_on)
);

create index bookings_tenant on bookings (tenant_id);

create index bookings_accommodation_range
  on bookings using gist (accommodation_id, daterange(starts_on, ends_on, '[)'));
