create table accommodations (
  id          text primary key,
  host_id     text not null references users (id),
  name        text not null,
  location    text not null,
  capacity    integer not null check (capacity >= 1),
  price_cents integer not null check (price_cents >= 0),
  image_url   text
);
