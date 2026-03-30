# Business Data Map: StakeLedger

╔══════════════════════════════════════════════════════════════════════════════╗
║ STAKELEDGER - BUSINESS DATA MAP ║
║ Gestor de inversion en apuestas con ledger contable y riesgo controlado ║
╚══════════════════════════════════════════════════════════════════════════════╝

---

#### 1. RESUMEN EJECUTIVO

┌──────────────────────────────────────────────────────────────────────────────┐
│ 📋 RESUMEN EJECUTIVO │
└──────────────────────────────────────────────────────────────────────────────┘

## ¿Qué hace este sistema?

StakeLedger es un sistema de control financiero para apuestas deportivas que convierte el historial disperso de un usuario en un ledger auditable y accionable. El problema central no es solo registrar apuestas, sino separar correctamente el origen del dinero (cash, bonus, freebet), imponer reglas de riesgo y mantener la trazabilidad completa de cada movimiento.

El valor no está en un registro basico, sino en la combinacion de contabilidad, normalizacion deportiva y asesoramiento de metas. Esto permite a usuarios recreacionales y avanzados tomar decisiones basadas en datos, reducir errores por percepcion y construir un historial confiable que soporte analitica real.

## Actores Principales

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Usuario │ │ Apostador │ │ Admin / Tipster │
│ recreacional │ │ avanzado │ │ │
│ (control) │ │ (analitica) │ │ (feed) │
└─────────────────┘ └─────────────────┘ └─────────────────┘

## Propuesta de Valor

- Usuarios recreacionales obtienen control del capital y reglas de riesgo simples.
- Usuarios avanzados consiguen datos limpios y auditables para mejorar rendimiento.
- Tipsters y admins publican recomendaciones normalizadas con adhesion directa.

---

#### 2. MAPA DE ENTIDADES

┌──────────────────────────────────────────────────────────────────────────────┐
│ 📦 MAPA DE ENTIDADES │
└──────────────────────────────────────────────────────────────────────────────┘

```
Usuario
  │
  ├─► Bank (cuentas separadas por usuario)
  │     ├─► Pocket (cash / bonus / freebet)
  │     ├─► Transaction (movimientos contables)
  │     └─► Bet (tickets)
  │            ├─► BetLeg (detalle de mercados/selecciones)
  │            └─► BetCashout (cashout parcial)
  │
  ├─► Goal (metas financieras)
  │     └─► GoalEvent (recalculos y cambios)
  │
  ├─► Recommendation (tips publicados)
  │     └─► RecommendationFollow (adhesion de usuarios)
  │
  └─► AuditLog (trazabilidad inmutable)

Catalogo deportivo
  ├─► CatalogTeam
  ├─► CatalogCompetition
  └─► CatalogAlias (normalizacion y equivalencias)
```

### Entidades y su Rol de Negocio

| Entidad                       | Rol en el Negocio                 | Por Que Existe                                    |
| ----------------------------- | --------------------------------- | ------------------------------------------------- |
| Usuario                       | Actor propietario del bank        | Aislar datos y permisos por persona               |
| Bank                          | Contenedor financiero por usuario | Separar capital por estrategia o objetivo         |
| Pocket                        | Sub-balance por tipo de dinero    | Evitar mezclar cash, bonus y freebet              |
| Transaction                   | Movimiento contable               | Garantizar trazabilidad y auditoria               |
| Bet                           | Ticket de apuesta                 | Centralizar stake, odds y estado                  |
| BetLeg                        | Detalle de mercados               | Soportar apuestas simples y combinadas            |
| BetCashout                    | Registro de cashout parcial       | Mantener historico sin perder trazabilidad        |
| Goal                          | Meta financiera                   | Guiar al usuario con objetivos y misiones diarias |
| Recommendation                | Recomendacion publicada           | Habilitar feed y adhesion a apuestas              |
| CatalogTeam/Competition/Alias | Normalizacion deportiva           | Evitar duplicidad y permitir analitica confiable  |
| AuditLog                      | Registro inmutable                | Auditar cambios criticos en el ledger             |

### Relaciones Clave

- Bank existe para separar estrategias y capital dentro de un mismo usuario; los pockets garantizan que las reglas de riesgo se calculen sobre cash real, no sobre promociones.
- Bet siempre cuelga de un bank porque el riesgo y el stake dependen del saldo operativo de ese bank.
- Catalogo deportivo no es solo un lookup: es el puente entre entradas manuales y datos normalizados para que la analitica posterior sea confiable.

---

#### 3. FLUJOS DE NEGOCIO

┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔄 FLUJOS DE NEGOCIO │
└──────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
FLUJO 1: Registro / Login (Identidad y Acceso)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ POST /auth ┌─────────────────┐ ┌──────────────────┐
│ Usuario │ ─────────► │ Supabase Auth │ ──────►│ Sesion + Perfil │
└─────────────┘ └─────────────────┘ └──────────────────┘

**Narrativa del Flujo:**

1. El usuario se registra o inicia sesion con email/password.
2. Supabase valida credenciales y crea la sesion.
3. La sesion habilita acceso a bancos, apuestas y metas.

**Reglas de Negocio:**

- Email debe ser unico y valido.
- Password cumple policy minima.

**Codigo Involucrado:**

- `src/lib/supabase/*` → clientes para auth y sesiones.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 2: Creacion de Bank y Bolsillos
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ POST /banks ┌─────────────────┐ ┌──────────────────┐
│ Usuario │ ───────────►│ API / Supabase │ ──────►│ Bank + Pockets │
└─────────────┘ └─────────────────┘ └──────────────────┘

**Narrativa del Flujo:**

1. El usuario crea un bank con saldos iniciales.
2. El sistema registra pockets separados (cash/bonus/freebet).
3. Se crea la transaccion inicial para trazabilidad.

**Reglas de Negocio:**

- Montos iniciales >= 0.
- El bank pertenece al usuario autenticado.

**Codigo Involucrado:**

- `src/app/api/*` (futuro) → endpoints de bancos.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 3: Depositos, Retiros y Transferencias
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ POST /transactions ┌───────────────┐ ┌──────────────────┐
│ Usuario │ ─────────────────► │ Ledger Logic │ ───►│ Pockets + Ledger │
└─────────────┘ └───────────────┘ └──────────────────┘

**Narrativa del Flujo:**

1. El usuario registra un deposito o retiro.
2. El sistema actualiza el pocket correspondiente.
3. Se crea una transaccion para mantener auditoria.

**Reglas de Negocio:**

- Retiro no puede exceder cash disponible.
- Transferencias solo entre banks del mismo usuario.

**Codigo Involucrado:**

- `src/app/api/*` (futuro) → endpoints de ledger.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 4: Registro de Apuesta (Ticket + Legs)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ POST /bets ┌───────────────┐ ┌──────────────────┐
│ Usuario │ ─────────► │ Stake Engine │ ───►│ Bet + Legs + Log │
└─────────────┘ └───────────────┘ └──────────────────┘

**Narrativa del Flujo:**

1. El usuario registra un ticket con legs y odds.
2. El sistema calcula stake o valida el stake proporcionado.
3. Se bloquea el cash necesario y se persiste la apuesta.

**Reglas de Negocio:**

- Stake maximo: 40% del cash disponible.
- Apuesta debe tener al menos 1 leg.

**Codigo Involucrado:**

- `src/app/api/*` (futuro) → endpoints de bets.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 5: Liquidacion y Cashout Parcial
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ PATCH /bets/{id} ┌───────────────┐ ┌────────────────────┐
│ Usuario │ ───────────────► │ Settlement │ ►│ Pockets + AuditLog │
└─────────────┘ └───────────────┘ └────────────────────┘

**Narrativa del Flujo:**

1. El usuario liquida la apuesta con resultado.
2. El sistema calcula retorno y actualiza pockets.
3. Si hay cashout parcial, se divide el ticket.

**Reglas de Negocio:**

- Solo apuestas abiertas pueden liquidarse.
- Cashout parcial crea un nuevo ticket con stake restante.

**Codigo Involucrado:**

- `src/app/api/*` (futuro) → endpoints de settlement.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 6: Metas y Mision Diaria
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ POST /goals ┌───────────────┐ ┌──────────────────┐
│ Usuario │ ──────────► │ Goal Engine │ ───►│ Goal + Mission │
└─────────────┘ └───────────────┘ └──────────────────┘

**Narrativa del Flujo:**

1. El usuario define una meta con base, target y fecha limite.
2. El sistema calcula mision diaria y cuota sugerida.
3. Cada apuesta liquidada recalcula la meta.

**Reglas de Negocio:**

- Target > base.
- Deadline futura.

**Codigo Involucrado:**

- `src/app/api/*` (futuro) → endpoints de metas.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 7: Normalizacion del Catalogo
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ GET /catalog/search ┌──────────────┐ ┌─────────────────┐
│ Usuario │ ──────────────────► │ Catalog API │ ───►│ Resultados │
└─────────────┘ └──────────────┘ └─────────────────┘

**Narrativa del Flujo:**

1. El usuario busca equipos o competiciones.
2. El sistema usa catalogo normalizado y fallback manual.
3. Los alias evitan duplicidad al consolidar fuentes.

**Reglas de Negocio:**

- Query minima de 2 caracteres.
- Entradas manuales quedan marcadas como unnormalized.

**Codigo Involucrado:**

- `src/app/api/*` (futuro) → endpoints de catalogo.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 8: Feed de Recomendaciones
═══════════════════════════════════════════════════════════════════════════════

┌─────────────┐ POST /recommendations ┌──────────────┐ ┌─────────────────┐
│ Admin │ ────────────────────► │ Feed Logic │ ►│ Recommendation │
└─────────────┘ └──────────────┘ └─────────────────┘

**Narrativa del Flujo:**

1. Admin publica una recomendacion normalizada.
2. Los usuarios siguen la recomendacion.
3. El ledger se precarga con el payload de apuesta.

**Reglas de Negocio:**

- Solo roles admin/editor pueden publicar.
- Solo recomendaciones activas pueden seguirse.

**Codigo Involucrado:**

- `src/app/api/*` (futuro) → endpoints de feed.

---

#### 4. STATE MACHINES

┌──────────────────────────────────────────────────────────────────────────────┐
│ 📊 STATE MACHINES │
└──────────────────────────────────────────────────────────────────────────────┘

### Bet (Ticket de Apuesta)

┌─────────────────────────────────────────────────────────────────────────────┐
│ BET STATUS MACHINE │
│ │
│ ┌──────────┐ (registro) ┌──────────┐ (liquidacion) ┌──────────┐ │
│ │ Abierta │ ───────────► │ Cerrada │ ─────────────► │ Archivada│ │
│ └──────────┘ └──────────┘ └──────────┘ │
│ │ (cashout parcial) │
│ ▼ │
│ ┌──────────────┐ │
│ │ Dividida │ (crea ticket B) │
│ └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

**Transiciones:**

| De      | A         | Evento que lo dispara          | Efectos                              |
| ------- | --------- | ------------------------------ | ------------------------------------ |
| Abierta | Cerrada   | Liquidacion win/lose/void/half | Ajuste de pockets + audit log        |
| Abierta | Dividida  | Cashout parcial                | Crea nuevo ticket con stake restante |
| Cerrada | Archivada | Post-proceso historico         | Consolidacion para analitica         |

**Reglas de Negocio:**

- No se puede liquidar una apuesta ya cerrada.
- Cashout parcial mantiene trazabilidad sin perder historico.

### Goal (Meta)

┌─────────────────────────────────────────────────────────────────────────────┐
│ GOAL STATUS MACHINE │
│ │
│ ┌──────────┐ (creacion) ┌──────────┐ (cumplida) ┌──────────┐ │
│ │ Activa │ ─────────► │ Completada │ ───────► │ Archivada│ │
│ └──────────┘ └──────────┘ └──────────┘ │
│ │ (cancelacion) │
│ ▼ │
│ ┌──────────┐ │
│ │ Cancelada│ │
│ └──────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

**Transiciones:**

| De     | A          | Evento que lo dispara          | Efectos            |
| ------ | ---------- | ------------------------------ | ------------------ |
| Activa | Completada | Meta alcanzada o cierre manual | Detiene recalculos |
| Activa | Cancelada  | Cancelacion por usuario        | Detiene misiones   |

**Reglas de Negocio:**

- Las metas se recalculan despues de cada apuesta liquidada.
- Cierre anticipado requiere confirmacion explicita.

---

#### 5. PROCESOS AUTOMATICOS

┌──────────────────────────────────────────────────────────────────────────────┐
│ ⚡ PROCESOS AUTOMATICOS │
└──────────────────────────────────────────────────────────────────────────────┘

### Triggers de Base de Datos

| Trigger            | Cuando se ejecuta | Que hace | Por que existe                                      |
| ------------------ | ----------------- | -------- | --------------------------------------------------- |
| (No definidos aun) | -                 | -        | Se definiran cuando el ledger requiera automatismos |

### Cron Jobs

| Job                | Frecuencia | Que hace | Por que existe                                  |
| ------------------ | ---------- | -------- | ----------------------------------------------- |
| (No definidos aun) | -          | -        | Reservado para recalculos y alertas programadas |

### Webhooks Entrantes

| Webhook            | Origen | Que procesa | Efectos en el sistema                   |
| ------------------ | ------ | ----------- | --------------------------------------- |
| (No definidos aun) | -      | -           | Se activaran con integraciones externas |

---

#### 6. INTEGRACIONES EXTERNAS

┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔗 INTEGRACIONES EXTERNAS │
└──────────────────────────────────────────────────────────────────────────────┘

### Proveedores de datos deportivos (planificado)

┌─────────────────────────────────────────────────────────────────────────────┐
│ StakeLedger Proveedor deportes │
│ │
│ Catalog API ───────────────► Eventos/Ligas/Equipos │
│ Catalog API ◄─────────────── Normalizacion + Alias │
└─────────────────────────────────────────────────────────────────────────────┘

**Que hace:** Enriquecer el catalogo con datos confiables para analitica.

**Como afecta los datos:**

- CatalogTeam / CatalogCompetition / CatalogAlias se actualizan con IDs externos.

**Flujos que dependen de esto:**

- Normalizacion del catalogo.
- Feed de recomendaciones (datos consistentes).

### OCR de tickets (planificado)

┌─────────────────────────────────────────────────────────────────────────────┐
│ StakeLedger Proveedor OCR │
│ │
│ Upload ticket ───────────────► Extraccion de datos │
│ Resultado OCR ◄─────────────── Prellenado de apuesta │
└─────────────────────────────────────────────────────────────────────────────┘

**Que hace:** Reducir friccion al registrar apuestas.

**Como afecta los datos:**

- Bet y BetLeg pueden crearse a partir de datos extraidos.

**Flujos que dependen de esto:**

- Registro de apuesta (automatizado).

---
