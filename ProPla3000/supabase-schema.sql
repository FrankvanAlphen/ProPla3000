-- ============================================================
-- Planner++ — Supabase SQL Schema
-- Voer dit uit in de Supabase SQL Editor
-- ============================================================

-- ── Extensies ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profielen (koppeling aan auth.users) ─────────────────────
create table profielen (
  id          uuid primary key references auth.users(id) on delete cascade,
  naam        text,
  email       text,
  rol         text not null default 'contributor' check (rol in ('contributor', 'viewer', 'admin')),
  aangemaakt_op timestamptz default now()
);

-- Automatisch profiel aanmaken bij registratie
create or replace function publiek.maak_profiel_aan()
returns trigger language plpgsql security definer as $$
begin
  insert into profielen (id, email, naam)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger na_gebruiker_aanmaken
  after insert on auth.users
  for each row execute procedure publiek.maak_profiel_aan();

-- ── Projecten ────────────────────────────────────────────────
create table projecten (
  id                uuid primary key default uuid_generate_v4(),
  titel             text not null,
  beschrijving      text,
  eigenaar_id       uuid references profielen(id),
  eigenaar_naam     text,
  fase              text not null default 'Ideeën' check (fase in ('Ideeën','Inventarisatie','Analyse','Implementatie','Nazorg','Archief')),
  gezondheid        text not null default 'groen' check (gezondheid in ('groen','oranje','rood')),
  projecttype       text,
  themas            text,
  blokkade_toelichting text,
  bijgewerkt_op     timestamptz default now(),
  aangemaakt_op     timestamptz default now()
);

-- ── Taken ────────────────────────────────────────────────────
create table taken (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projecten(id) on delete cascade,
  titel         text not null,
  omschrijving  text,
  eigenaar      text,
  status        text not null default 'niet_gestart' check (status in ('niet_gestart','actief','geblokkeerd','afgerond')),
  startdatum    date,
  einddatum     date,
  mijlpaal      boolean not null default false,
  bijgewerkt_op timestamptz default now(),
  aangemaakt_op timestamptz default now()
);

-- ── Blokkades ────────────────────────────────────────────────
create table blokkades (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projecten(id) on delete cascade,
  omschrijving  text not null,
  eigenaar      text,
  status        text not null default 'open' check (status in ('open','opgelost')),
  oplossing     text,
  opgelost_op   timestamptz,
  aangemaakt_op timestamptz default now()
);

-- ── Besluiten ────────────────────────────────────────────────
create table besluiten (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projecten(id) on delete cascade,
  vraag         text not null,
  context       text,
  eigenaar      text,
  deadline      date,
  status        text not null default 'open' check (status in ('open','besloten','uitgesteld')),
  uitkomst      text,
  besloten_op   timestamptz,
  aangemaakt_op timestamptz default now()
);

-- ── Geschiedenis ─────────────────────────────────────────────
create table geschiedenis (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projecten(id) on delete cascade,
  gebruiker_id  uuid references profielen(id),
  actie         text not null,
  details       jsonb default '{}',
  aangemaakt_op timestamptz default now()
);

-- ── Stamdata ─────────────────────────────────────────────────
create table themas (
  id   uuid primary key default uuid_generate_v4(),
  naam text not null unique
);

create table projecttypes (
  id   uuid primary key default uuid_generate_v4(),
  naam text not null unique
);

-- ── Voorbeelddata ─────────────────────────────────────────────
insert into themas (naam) values ('Digitalisering'), ('Klantgericht'), ('Operationele excellentie'), ('Duurzaamheid');
insert into projecttypes (naam) values ('IT-project'), ('Bedrijfsverandering'), ('Infrastructuur'), ('Onderzoek');

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table profielen    enable row level security;
alter table projecten    enable row level security;
alter table taken        enable row level security;
alter table blokkades    enable row level security;
alter table besluiten    enable row level security;
alter table geschiedenis enable row level security;
alter table themas       enable row level security;
alter table projecttypes enable row level security;

-- Profielen: iedereen kan lezen, alleen eigen profiel schrijven
create policy "profielen_lezen"  on profielen for select using (true);
create policy "profielen_update" on profielen for update using (auth.uid() = id);

-- Projecten: lezen voor alle ingelogde gebruikers, schrijven voor contributors
create policy "projecten_lezen"    on projecten for select using (auth.role() = 'authenticated');
create policy "projecten_invoegen" on projecten for insert with check (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);
create policy "projecten_update"   on projecten for update using (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);

-- Taken: zelfde patroon
create policy "taken_lezen"    on taken for select using (auth.role() = 'authenticated');
create policy "taken_invoegen" on taken for insert with check (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);
create policy "taken_update"   on taken for update using (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);
create policy "taken_verwijder" on taken for delete using (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);

-- Blokkades
create policy "blokkades_lezen"    on blokkades for select using (auth.role() = 'authenticated');
create policy "blokkades_invoegen" on blokkades for insert with check (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);
create policy "blokkades_update"   on blokkades for update using (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);

-- Besluiten
create policy "besluiten_lezen"    on besluiten for select using (auth.role() = 'authenticated');
create policy "besluiten_invoegen" on besluiten for insert with check (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);
create policy "besluiten_update"   on besluiten for update using (
  exists (select 1 from profielen where id = auth.uid() and rol in ('contributor','admin'))
);

-- Geschiedenis
create policy "geschiedenis_lezen"    on geschiedenis for select using (auth.role() = 'authenticated');
create policy "geschiedenis_invoegen" on geschiedenis for insert with check (auth.role() = 'authenticated');

-- Stamdata: iedereen lezen, admins schrijven
create policy "themas_lezen"    on themas for select using (true);
create policy "themas_schrijven" on themas for all using (
  exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
);
create policy "projecttypes_lezen"    on projecttypes for select using (true);
create policy "projecttypes_schrijven" on projecttypes for all using (
  exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
);
