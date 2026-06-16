# Planner++ — Project Cockpit

Een productieklare projectmanagement-cockpit voor de PM die 3–4 projecten tegelijk beheert.

## Functies

- **Projectenboard** — Kanban met 6 fases, drag-and-drop via dnd-kit
- **PM Cockpit** — Stuurcockpit per project (overzicht, taken, tijdlijn, blokkades, besluiten, historie)
- **Gantt-lite** — Visuele SVG-tijdlijn met versleepbare taken
- **Supabase auth** — E-mail/wachtwoord, rollen (contributor / viewer / admin)
- **RLS** — Row Level Security op alle tabellen
- **Geschiedenis** — Automatische activiteitenlog

---

## Lokale installatie

### 1. Repository klonen

```bash
git clone https://github.com/jouw-org/planner-plus.git
cd planner-plus
```

### 2. Dependencies installeren

```bash
npm install
```

### 3. Supabase project aanmaken

1. Ga naar [supabase.com](https://supabase.com) en log in
2. Klik op **New project**
3. Kies een naam, wachtwoord en regio
4. Wacht tot het project klaar is

### 4. Database-schema uitvoeren

1. Ga naar **SQL Editor** in Supabase
2. Plak de inhoud van `supabase-schema.sql`
3. Klik op **Run**

### 5. Omgevingsvariabelen instellen

```bash
cp .env.example .env.local
```

Vul in `.env.local`:

```
VITE_SUPABASE_URL=https://jouw-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-anon-key
```

U vindt deze waarden in Supabase onder **Project Settings → API**.

### 6. Eerste gebruiker aanmaken

1. Ga in Supabase naar **Authentication → Users**
2. Klik op **Invite user** of **Add user**
3. Voer e-mail en wachtwoord in
4. Stel in de `profielen`-tabel de rol in op `admin`

### 7. Applicatie starten

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment op Cloudflare Pages

### 1. GitHub repository aanmaken

```bash
git init
git add .
git commit -m "Initieel commit — Planner++"
git remote add origin https://github.com/jouw-org/planner-plus.git
git push -u origin main
```

### 2. Cloudflare Pages verbinden

1. Ga naar [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Klik op **Create a project** → **Connect to Git**
3. Selecteer uw GitHub-repository
4. Stel in:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 3. Omgevingsvariabelen instellen in Cloudflare

Ga naar **Pages → Uw project → Settings → Environment variables** en voeg toe:

| Variabele | Waarde |
|-----------|--------|
| `VITE_SUPABASE_URL` | `https://jouw-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `jouw-anon-key` |

### 4. Deployen

Elke push naar `main` triggert automatisch een nieuwe deploy.

---

## Mappenstructuur

```
planner-plus/
├── src/
│   ├── components/
│   │   ├── board/          ← Portfolio Board (dnd-kit)
│   │   ├── cockpit/        ← PM Cockpit tabs
│   │   ├── beheer/         ← Admin sectie
│   │   ├── layout/         ← Zijbalk, topbalk
│   │   └── ui/             ← Herbruikbare componenten
│   ├── hooks/              ← Data-hooks (Supabase)
│   ├── lib/                ← Supabase client, helpers
│   ├── pages/              ← Pagina-componenten
│   └── styles/             ← Design tokens
├── supabase-schema.sql     ← Database-schema
└── .env.example            ← Omgevingsvariabelen voorbeeld
```

---

## Rollen

| Rol | Rechten |
|-----|---------|
| `viewer` | Alleen lezen |
| `contributor` | Lezen + schrijven op projecten, taken, blokkades, besluiten |
| `admin` | Alles + gebruikersbeheer, stamdata |

---

## Technologie

- **React 18** + Vite 5
- **Supabase** (PostgreSQL, Auth, RLS)
- **dnd-kit** (drag-and-drop)
- **React Router v6**
- **Cloudflare Pages** (deployment)
