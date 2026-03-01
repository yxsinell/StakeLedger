# Backend Setup - StakeLedger

## Database Schema

Tablas fundacionales creadas en Supabase:

- users
  - id (uuid, PK, auth.users)
  - email (text, unique)
  - role (text, admin|editor|user)
  - created_at (timestamptz)
- banks
  - id (uuid, PK)
  - user_id (uuid, FK -> users.id)
  - name (text)
  - currency (text)
  - created_at (timestamptz)
- bank_pockets
  - id (uuid, PK)
  - bank_id (uuid, FK -> banks.id)
  - pocket_type (text, cash|bonus|freebet)
  - balance (numeric)
  - unique(bank_id, pocket_type)
- transactions
  - id (uuid, PK)
  - bank_id (uuid, FK -> banks.id)
  - pocket_type (text)
  - type (text)
  - amount (numeric)
  - method (text)
  - created_at (timestamptz)
- bets
  - id (uuid, PK)
  - bank_id (uuid, FK -> banks.id)
  - stake_amount (numeric)
  - status (text)
  - odds (numeric)
  - created_at (timestamptz)
- bet_legs
  - id (uuid, PK)
  - bet_id (uuid, FK -> bets.id)
  - market (text)
  - selection (text)
  - odds (numeric)
- bet_cashouts
  - id (uuid, PK)
  - bet_id (uuid, FK -> bets.id)
  - cashout_amount (numeric)
  - remaining_stake (numeric)
  - created_at (timestamptz)
- audit_logs
  - id (uuid, PK)
  - entity_type (text)
  - entity_id (uuid)
  - action (text)
  - actor_id (uuid, FK -> users.id)
  - created_at (timestamptz)

## Indices

- banks_user_id_idx
- bank_pockets_bank_id_idx
- transactions_bank_id_created_at_idx
- bets_bank_id_created_at_idx
- bet_legs_bet_id_idx
- bet_cashouts_bet_id_idx
- audit_logs_actor_id_idx
- audit_logs_entity_idx

## Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Politicas aplicadas:

- users: CRUD solo si id = auth.uid()
- banks: CRUD solo si user_id = auth.uid()
- bank_pockets: CRUD solo si bank_id pertenece a auth.uid()
- transactions: CRUD solo si bank_id pertenece a auth.uid()
- bets: CRUD solo si bank_id pertenece a auth.uid()
- bet_legs: CRUD solo si bet_id pertenece a auth.uid() via banks
- bet_cashouts: CRUD solo si bet_id pertenece a auth.uid() via banks
- audit_logs: CRUD solo si actor_id = auth.uid()

## Authentication

- Supabase Auth con @supabase/ssr
- AuthContext: src/contexts/auth-context.tsx
- Middleware: middleware.ts (protege /dashboard)

## API Layer

- Browser client: src/lib/supabase/client.ts
- Server client: src/lib/supabase/server.ts
- Config: src/lib/config.ts

## Variables de Entorno

Requeridas:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

## Seed Data

Seed realista insertado para el usuario:

- banks: 3
- bank_pockets: 9
- transactions: 7
- bets: 4
- bet_legs: 4
- bet_cashouts: 1
- audit_logs: 11 (7 transactions + 4 bets)

Si necesitas regenerarlo, usa el user_id en Supabase (auth.users) y re-ejecuta el script de seed.

## Comandos utiles

- Generar tipos:
  supabase gen types --project-id ziqbjajprkoukezhgidr --schema public > src/types/supabase.ts

- Limpiar cache y reiniciar dev:
  rm -rf .next && bun run dev

## Troubleshooting

- MCP Unauthorized: verificar SUPABASE_ACCESS_TOKEN en el entorno del MCP.
- Tipos no encontrados: regenerar src/types/supabase.ts.
- Errores de cookies: usar await cookies() en Next 16.

## Proximos pasos

- Insertar seed data realista.
- Validar typecheck y build.
- Conectar mas paginas con datos reales.
