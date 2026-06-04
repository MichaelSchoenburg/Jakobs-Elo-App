# SPEC — Holdfast ELO-System Web-App

**Projekt:** Holdfast: Nations at War — ELO-Ranglisten-App  
**Version:** 1.0  
**Datum:** 2026-06-04  
**Status:** Entwurf

---

## 1. Systemarchitektur

```
┌─────────────────────────────────────────────┐
│                  Vercel                      │
│  ┌─────────────────────────────────────┐    │
│  │        Next.js App (TypeScript)     │    │
│  │  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │  Frontend    │  │  API Routes │ │    │
│  │  │  (React +    │  │  (Server    │ │    │
│  │  │  Framer      │  │  Actions /  │ │    │
│  │  │  Motion)     │  │  Route Hdl) │ │    │
│  │  └──────────────┘  └─────────────┘ │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────┐
│                 Supabase                     │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Auth        │  │  PostgreSQL DB       │ │
│  │  - Google    │  │  + Row Level         │ │
│  │    OAuth     │  │    Security (RLS)    │ │
│  │  - Email/PW  │  │                      │ │
│  │  - TOTP      │  │                      │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Schicht | Technologie |
|---|---|
| **Framework** | Next.js 14+ (App Router, TypeScript) |
| **Styling** | Tailwind CSS |
| **UI-Animationen** | Framer Motion |
| **Backend / DB** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Google OAuth, Email/Password, TOTP) |
| **ORM / DB-Client** | Supabase JS Client (`@supabase/supabase-js`) |
| **Formulare** | React Hook Form + Zod (Validierung) |
| **Charts** | Recharts (ELO-Verlaufsgraph) |
| **Hosting** | Vercel |
| **Sprache** | TypeScript (strict mode) |

---

## 3. Datenbankschema

### 3.1 `profiles`
Erweitert `auth.users` von Supabase.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id   TEXT UNIQUE NOT NULL,        -- z.B. "HF-0042", auto-generiert
  display_name TEXT NOT NULL,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  elo         INTEGER NOT NULL DEFAULT 1000,
  wins        INTEGER NOT NULL DEFAULT 0,
  losses      INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 `matches`

```sql
CREATE TYPE match_status AS ENUM ('pending', 'confirmed');

CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id      UUID NOT NULL REFERENCES profiles(id),
  player2_id      UUID NOT NULL REFERENCES profiles(id),
  winner_id       UUID NOT NULL REFERENCES profiles(id),
  
  -- ELO-Snapshot zum Zeitpunkt der Bestätigung
  player1_elo_before  INTEGER,
  player2_elo_before  INTEGER,
  player1_elo_after   INTEGER,
  player2_elo_after   INTEGER,
  
  -- Workflow
  status          match_status NOT NULL DEFAULT 'pending',
  submitted_by    UUID NOT NULL REFERENCES profiles(id),
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_by    UUID REFERENCES profiles(id),
  confirmed_at    TIMESTAMPTZ,
  
  CONSTRAINT different_players CHECK (player1_id <> player2_id),
  CONSTRAINT valid_winner CHECK (winner_id = player1_id OR winner_id = player2_id)
);
```

### 3.3 `elo_history`
Wird bei jeder ELO-Änderung beschrieben (nach Match-Bestätigung oder Gesamt-Reset).

```sql
CREATE TABLE elo_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES profiles(id),
  elo        INTEGER NOT NULL,
  delta      INTEGER NOT NULL,           -- Änderung (+/-)
  match_id   UUID REFERENCES matches(id), -- NULL bei Reset
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.4 Row Level Security (RLS)

| Tabelle | Öffentlich (anon) | Spieler (auth) | Admin |
|---|---|---|---|
| `profiles` | SELECT (Leaderboard-Felder) | SELECT own + alle | SELECT + UPDATE + DELETE alle |
| `matches` | SELECT confirmed | SELECT + INSERT | SELECT + UPDATE + DELETE |
| `elo_history` | SELECT | SELECT | SELECT |

---

## 4. ELO-Berechnung

### Formel

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
E_B = 1 - E_A

R_A_neu = R_A + K * (S_A - E_A)
R_B_neu = R_B + K * (S_B - E_B)
```

| Variable | Bedeutung |
|---|---|
| `R_A`, `R_B` | Aktueller ELO-Wert von Spieler A bzw. B |
| `E_A`, `E_B` | Erwarteter Score (Gewinnwahrscheinlichkeit) |
| `S_A`, `S_B` | Tatsächlicher Score: Gewinner = 1, Verlierer = 0 |
| `K` | **K-Faktor = 16** (klein für kleine Spielerpool) |

### Start-ELO
Jeder neue Spieler startet mit **ELO = 1000**.

### Berechnungszeitpunkt
Die ELO-Berechnung findet **serverseitig** statt, wenn ein Admin ein Match bestätigt. Die Werte werden atomar in `matches` (Snapshots) und `profiles` (aktueller ELO) sowie `elo_history` geschrieben (Datenbank-Transaktion).

---

## 5. Routing & Seitenstruktur

```
/                       → Öffentliches Leaderboard (Rangliste)
/login                  → Anmeldeseite (Google SSO + E-Mail/PW)
/register               → Registrierungsseite (wartet auf Admin-Freigabe)

/dashboard              → Spieler-Dashboard (geschützt, nur approved)
/dashboard/match/new    → Match eintragen (Formular)
/players/[player_id]    → Öffentliches Spielerprofil

/admin                  → Admin-Übersicht (geschützt, nur Admin)
/admin/matches          → Ausstehende Matches bestätigen / korrigieren
/admin/users            → Benutzerverwaltung (anlegen, freigeben, löschen)
/admin/reset            → Rangliste zurücksetzen (mit Bestätigungsdialog)
```

---

## 6. Authentifizierung & Zugriffsschutz

### Supabase Auth Provider
- **Google OAuth**: Konfiguriert über Supabase Dashboard → Auth → Providers
- **E-Mail + Passwort + TOTP**: Aktiviert über Supabase MFA. Nach Login wird TOTP-Verifizierung erzwungen, wenn für den Account aktiviert.

### Middleware (Next.js)
`middleware.ts` prüft die Supabase Session bei jedem Request:

```
/dashboard/*   → Session required + is_approved = true
/admin/*       → Session required + is_admin = true
```

### Registrierungsflow
```
User registriert sich (Google oder E-Mail/PW)
        ↓
Profil wird angelegt (is_approved = false)
        ↓
Admin sieht pending User in /admin/users
        ↓
Admin genehmigt → is_approved = true
        ↓
User kann /dashboard aufrufen
```

---

## 7. API / Server Actions

Alle Datenmutationen laufen über **Next.js Server Actions** (kein separates REST-Layer nötig).

| Action | Berechtigung | Beschreibung |
|---|---|---|
| `submitMatch()` | Spieler (approved) | Neues Match mit Status `pending` anlegen |
| `confirmMatch(matchId, correction?)` | Admin | Match bestätigen, ELO berechnen und schreiben |
| `approveUser(userId)` | Admin | `is_approved = true` setzen |
| `deleteUser(userId)` | Admin | Profil + Auth-User löschen |
| `createUser(data)` | Admin | Neuen Supabase-Auth-User + Profil anlegen |
| `resetRanking()` | Admin | Alle ELO auf 1000 zurücksetzen, W/L auf 0, Reset in `elo_history` loggen |

---

## 8. Frontend-Komponenten

### Öffentliches Leaderboard (`/`)
- Tabelle: Rang | Anzeigename | ELO | Siege | Niederlagen | W/L-Quote
- Sortierung: ELO absteigend
- Kein Login nötig

### Spieler-Dashboard (`/dashboard`)
- **ELO-Verlaufsgraph**: `Recharts` LineChart, X-Achse = Match-Datum, Y-Achse = ELO
- **W/L-Statistik**: Einfache Zählkarten (Siege, Niederlagen, Quote in %)
- **Aktueller Rang**: Große Anzeige (z.B. „#3 von 24 Spielern")
- **CTA**: Button „Neues Match eintragen"

### Match-Formular (`/dashboard/match/new`)
- Felder: Gegner (Dropdown aus `profiles`), Gewinner (Radio: Ich / Gegner)
- Validierung: Pflichtfelder, kein Match gegen sich selbst
- Submit → `submitMatch()` Server Action → Bestätigung mit Hinweis „Wartet auf Admin-Freigabe"

### Admin-Bereich (`/admin/matches`)
- Liste aller `pending` Matches: Spieler A vs. Spieler B, Gemeldetes Ergebnis, Eingetragen von, Datum
- Pro Match: Button „Bestätigen" oder „Korrigieren" (Dropdown Gewinner ändern) + „Bestätigen"
- Nach Bestätigung: Match aus der Liste entfernt, ELO aktualisiert

---

## 9. Design-System

### Farben
| Token | Wert | Verwendung |
|---|---|---|
| `--color-primary` | `#003153` (Preußisches Blau) | Hintergrund, Haupt-UI |
| `--color-primary-light` | `#1a4d6e` | Hover-States, Cards |
| `--color-accent` | `#C9A84C` (Goldgelb) | CTAs, Highlights, ELO-Werte |
| `--color-text` | `#F0EAD6` (Elfenbein) | Primärer Text |
| `--color-muted` | `#8A9BB0` | Sekundärer Text, Labels |
| `--color-danger` | `#8B1A1A` (Dunkelrot) | Fehlermeldungen, Löschen |

### Typografie
| Einsatz | Font | Gewicht |
|---|---|---|
| App-Titel / Logo | `"Playfair Display"` oder `"Cinzel"` (Google Fonts) | 900, Caps |
| Section-Header | `"Libre Baskerville"` Condensed Bold | 700 |
| UI-Labels / Tabellen | `"Share Tech Mono"` (Monospace) | 400 |
| Akzent-Dekorations-Text | `"UnifrakturMaguntia"` (Fraktur, sparsam) | 400 |

### Animationen (Framer Motion)
- Page Transitions: `fade + slide-up` (0.3s ease)
- Tabellenzeilen im Leaderboard: Staggered `fade-in` beim ersten Laden
- ELO-Zähler: Animated Number Counter beim Dashboard-Load
- Match-Bestätigung: Kurze `scale`-Bestätigungs-Animation auf dem Rang

---

## 10. Deployment

### Vercel
- Next.js App → Vercel automatisch erkannt
- Umgebungsvariablen in Vercel Dashboard:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=   (nur serverseitig, für Admin-Actions)
  ```

### Supabase
- Projekt in `eu-central-1` (Frankfurt) für niedrige Latenz
- RLS auf allen Tabellen aktiv
- `service_role` Key **nur** in Server Actions verwenden, niemals im Client

---

## 11. Projektstruktur (Next.js App Router)

```
holdfast-elo/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Leaderboard
│   │   └── players/[player_id]/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                  # Dashboard
│   │   └── match/new/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── matches/page.tsx
│   │   ├── users/page.tsx
│   │   └── reset/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                           # Button, Card, Table, Badge, ...
│   ├── leaderboard/
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Client
│   │   └── server.ts                 # Server Client (Server Actions)
│   ├── elo.ts                        # ELO-Berechnung (pure functions)
│   └── actions/                      # Server Actions
│       ├── matches.ts
│       ├── users.ts
│       └── admin.ts
├── middleware.ts                     # Auth-Guard
├── types/
│   └── database.ts                   # Supabase generated types
└── supabase/
    └── migrations/                   # SQL Migrations
```

---

## 12. Entwicklungsplan (Phasen)

| Phase | Inhalt |
|---|---|
| **Phase 1** | Supabase-Projekt aufsetzen, Schema migrieren, RLS konfigurieren, Auth-Provider einrichten |
| **Phase 2** | Next.js-Grundgerüst, Middleware, Auth-Flow (Login, Register, Google SSO) |
| **Phase 3** | Öffentliches Leaderboard + Spielerprofil |
| **Phase 4** | Spieler-Dashboard (Charts, Stats) + Match-Formular |
| **Phase 5** | Admin-Bereich (Match-Bestätigung, Benutzerverwaltung, Reset) |
| **Phase 6** | Design-System anwenden (Farben, Fonts, Framer Motion Animationen) |
| **Phase 7** | Testing, Edge Cases (ELO-Berechnung, RLS-Sicherheit), Deployment auf Vercel |
