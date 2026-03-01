# Architecture Specs - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## 1. System Architecture (C4 Level 1-2)

```mermaid
flowchart LR
  user[Usuario] --> ui[Next.js 15 App]
  ui --> api[Next.js API Routes]
  api --> db[(Supabase PostgreSQL)]
  api --> auth[Supabase Auth]
  api --> storage[Supabase Storage]
  api --> external[External APIs: Sports, OCR]
  ui --> cdn[Vercel Edge Network]
```

---

## 2. Database Design (ERD)

> Nota: El schema final se obtiene via Supabase MCP. No se hardcodea SQL en esta fase.

```mermaid
erDiagram
  users ||--o{ banks : owns
  users ||--o{ goals : defines
  users ||--o{ recommendations : publishes
  banks ||--o{ bank_pockets : has
  banks ||--o{ transactions : records
  banks ||--o{ bets : places
  bets ||--o{ bet_legs : contains
  bets ||--o{ bet_cashouts : splits
  bets ||--o{ audit_logs : audited
  goals ||--o{ goal_events : updates
  recommendations ||--o{ recommendation_follows : followed
  catalog_teams ||--o{ catalog_aliases : has
  catalog_competitions ||--o{ catalog_aliases : has

  users {
    uuid id
    string email
    string role
    timestamp created_at
  }
  banks {
    uuid id
    uuid user_id
    string name
    string currency
    timestamp created_at
  }
  bank_pockets {
    uuid id
    uuid bank_id
    string pocket_type
    decimal balance
  }
  transactions {
    uuid id
    uuid bank_id
    string type
    decimal amount
    timestamp created_at
  }
  bets {
    uuid id
    uuid bank_id
    decimal stake_amount
    string status
    decimal odds
    timestamp created_at
  }
  bet_legs {
    uuid id
    uuid bet_id
    string market
    string selection
    decimal odds
  }
  goals {
    uuid id
    uuid user_id
    decimal base_amount
    decimal target_amount
    date deadline
    string status
  }
  recommendations {
    uuid id
    uuid user_id
    string type
    decimal odds
    int icp
  }
  catalog_teams {
    uuid id
    string name
    string country
  }
  catalog_competitions {
    uuid id
    string name
    string country
  }
  catalog_aliases {
    uuid id
    string provider
    string external_id
  }
  audit_logs {
    uuid id
    string entity_type
    uuid entity_id
    string action
    timestamp created_at
  }
```

---

## 3. Tech Stack Justification

- **Frontend: Next.js 15 (App Router)**
  - ✅ React Server Components para performance
  - ✅ Routing file-based y full-stack en un solo repo
  - ✅ Integracion nativa con Vercel
  - ❌ Curva de aprendizaje del App Router

- **Backend: Next.js API Routes**
  - ✅ Simplifica despliegue y DX
  - ✅ Permite endpoints cerca del dominio
  - ✅ Integracion directa con Supabase
  - ❌ Menos flexible que un backend dedicado en alto trafico

- **Database/Auth: Supabase (PostgreSQL)**
  - ✅ RLS y Auth integrados
  - ✅ Buen soporte para real-time y storage
  - ✅ SQL estandar y extensible
  - ❌ Dependencia de proveedor

- **Hosting: Vercel**
  - ✅ CDN global y edge caching
  - ✅ CI/CD simple
  - ✅ Excelente soporte para Next.js
  - ❌ Costos pueden escalar con trafico

- **CI/CD: GitHub Actions**
  - ✅ Integracion con repo y PRs
  - ✅ Automatizacion de tests y lint
  - ✅ Gratis para MVP
  - ❌ Limites de minutos en planes basicos

---

## 4. Data Flow (Create Bet Ticket)

1. User completa formulario de apuesta (Frontend)
2. Validacion client-side (schema)
3. POST /api/bets
4. Validacion server-side
5. Calculo de stake y cap 40% cash
6. Insert en bets y bet_legs
7. Registro en transactions y audit_logs
8. Respuesta 201 con bet_id y saldos actualizados
9. UI actualiza ledger y balance

---

## 5. Security Architecture

### Auth Flow Diagram

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Next.js UI
  participant API as API Routes
  participant AUTH as Supabase Auth

  U->>UI: Submit login
  UI->>API: POST /api/auth/login
  API->>AUTH: Verify credentials
  AUTH-->>API: Session + JWT
  API-->>UI: Success + token
  UI-->>U: Acceso concedido
```

### RBAC Implementation

- Roles definidos: admin, editor, user
- Policies en API Routes y RLS en Supabase
- Endpoints admin solo accesibles por admin/editor

### Data Protection

- TLS 1.3 en trafico
- Encryption at rest via Supabase
- Validacion estricta de inputs
- Logs de auditoria para cambios criticos
