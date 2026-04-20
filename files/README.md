# Måleravlesning

App for registrering og statistikk for strømmålere. Støtter kameraskanning av målerdisplay via Claude Vision.

## Stack
- Vanilla HTML/JS (ingen byggsteg)
- Supabase (database)
- Netlify Functions (Claude Vision API for kameraskanning)

## Oppsett

### 1. Supabase
Opprett tabell i Supabase SQL Editor:
```sql
create table maler_avlesninger (
  id uuid default gen_random_uuid() primary key,
  meter_id text not null,
  year integer not null,
  month integer not null,
  reading numeric,
  consumption numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(meter_id, year, month)
);

grant select, insert, update on maler_avlesninger to anon;
```

### 2. GitHub
Opprett nytt repo og push denne mappen.

### 3. Netlify
1. Koble til GitHub-repo
2. Build settings: ingen (statisk HTML)
3. Publish directory: `public`
4. Functions directory: `netlify/functions`
5. Legg til miljøvariabel:
   - `ANTHROPIC_API_KEY` = din Anthropic API-nøkkel

## Funksjoner
- Registrering av målerstand for 7 målere
- Automatisk beregning av forbruk
- Kameraskanning av målerdisplay (Claude Vision)
- Statistikk: denne måneden vs samme måned i fjor
- Siste 12 måneder og hittil i år vs fjoråret
- Historiske data fra 2014
- PWA-støtte (kan legges til på hjemskjerm)
