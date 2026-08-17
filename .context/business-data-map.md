# Business Data Map: StakeLedger

> Fuente de verdad operativa del MVP. Actualizado: 2026-08-17.
>
> Leyenda: **Implementado** describe comportamiento verificable en código o schema remoto. **Confirmado** recoge una decisión de producto explícita. **Adoptado** es una decisión de arquitectura tomada para cerrar un bloqueo. **Diseñado** define un contrato aprobado todavía no implementado. **Futuro** existe en schema o especificación, pero aún no tiene flujo de aplicación implementado.

## 1. Propósito, usuarios y límites

StakeLedger permite a cada usuario adulto registrar su capital de apuestas por casa, separar dinero real de promociones, explicar cada movimiento y analizar resultados sin mezclar saldos de distinta naturaleza.

| Actor | Necesidad y límite |
| --- | --- |
| `user` | Gestiona exclusivamente sus banks, movimientos, tickets, metas y seguimiento de recomendaciones. No comparte banks con otros usuarios en MVP. |
| `editor` | Mantiene catálogo y recomendaciones. No administra roles ni opera dinero ajeno. |
| `admin` | Gestiona roles, catálogo y recomendaciones; puede consultar evidencia de auditoría según RLS. No sustituye al titular de un bank para operar su dinero. |

Fuera de alcance MVP: OCR, importación desde casas, fiscalidad, pagos, alertas en tiempo real, colaboración sobre un bank y creación automática de apuestas al seguir una recomendación.

## 2. Glosario operativo

| Término | Definición |
| --- | --- |
| bank | Cuenta contable de un usuario en una única divisa. |
| pocket | Subsaldo de un bank: `cash`, `bonus` o `freebet`. |
| cash | Dinero real disponible. Es el único saldo operativo y el único afectado por depósitos, retiros y transferencias MVP. |
| bonus | Crédito promocional; al liquidar conserva retorno y beneficio en el pocket bonus. |
| freebet | Crédito promocional para stake; al ganar acredita solo beneficio a cash y un void devuelve la parte anulada a freebet. |
| saldo operativo | Importe `cash` del bank. Implementado en `src/lib/banks/balance.ts`. |
| transacción | Asiento inmutable de entrada, salida, reserva, retorno o transferencia; `amount` siempre es positivo y su tipo expresa dirección. |
| reserva de apuesta | Débito `bet_reserve` de un pocket al crear un ticket; cada aporte positivo genera un asiento enlazado desde `bet_funding`. |
| ticket | Apuesta registrada en `bets`, compuesta por una o más legs. |
| stake | Importe arriesgado por ticket. En MVP no supera el 40% del cash disponible. |
| retorno | Importe acreditado tras liquidación o cashout. |
| beneficio | Retorno menos stake financiado, con semántica futura para financiación promocional. |
| auditoría | Evidencia append-only en `audit_logs`; no admite `UPDATE` ni `DELETE`. |
| catálogo | Equipos, competiciones, eventos, mercados y alias que normalizan una apuesta o recomendación. |
| recomendación | Pick publicado por editor/admin para evento y mercado normalizados; seguirla solo genera un prefill. |
| meta | Objetivo de capital vinculado a un bank y propiedad de un usuario. |
| riesgo | Límites de cuota, porcentaje de stake y pérdida diaria propiedad del usuario. |

## 3. Entidades, ownership y relaciones

```text
auth.users --trigger--> users --1:N--> banks --1:N--> bank_pockets
                              |             |--1:N--> transactions
                              |             |--1:N--> bets --1:N--> bet_legs
                              |             |              |--1:N--> bet_funding
                              |             |              |--1:N--> bet_cashouts
                              |             |              `--N:1--> goals
                              |--1:N--> goals --1:N--> goal_history
                              |--1:1--> risk_limits
                              |--1:N--> audit_logs
                              |--1:N--> recommendation_follows <--N:1-- recommendations

catalog_teams + catalog_competitions --> catalog_events --> catalog_markets
catalog_aliases ---------------------> teams | competitions
catalog_events + catalog_markets ----> bet_legs | recommendations
```

| Entidad | Ownership | Relaciones y estado |
| --- | --- | --- |
| `users` | Perfil propio; admin gestiona roles | Existe. `id` referencia `auth.users`; roles `user`, `editor`, `admin`. Perfil automático implementado. |
| `banks` | `user_id` | Existe. Un bank pertenece a un usuario y usa `EUR`, `USD` o `ARS`. Creación implementada. |
| `bank_pockets` | Hereda titularidad de bank | Existe. Exactamente un pocket por tipo y bank mediante índice único. |
| `transactions` | Hereda titularidad de bank | Existe. Depósitos, retiros, transferencias y reservas de apuesta están implementados. |
| `bets` | Hereda titularidad de bank | Existe. Creación completa implementada; el ticket solo queda `open` después de reservar todo su funding. |
| `bet_legs` | Hereda titularidad de bet | Existe. Referencias `normalized|manual` explícitas implementadas; filas legacy se conservan. |
| `bet_funding` | Hereda titularidad de bet | Existe. Cada pocket positivo crea una fila enlazada a su `bet_reserve`. |
| `bet_cashouts` | Hereda titularidad de bet | Implementado. `source_bet_id` identifica el original cerrado y `bet_id` el derivado abierto. |
| `audit_logs` | Actor y entidad auditada | Existe. Inmutable; ownership de lectura depende de actor, entidad propia o admin. |
| `goals` | `user_id`, y bank del mismo titular | Implementación local Fase 4I; una active por bank, sin deletes. Migration remota pendiente. |
| `goal_history` | Hereda titularidad de goal | Implementación local: creación, snapshot diario, recálculo por bet y cierre. |
| `risk_limits` | `user_id`, único | Implementación local: max odds y pérdida diaria opt-in; cap de stake fijo 40%. |
| catálogo | `user` crea entradas manuales; `editor/admin` mantienen entidades normalizadas y alias; autenticados leen | Existe como `catalog_teams`, `catalog_competitions`, `catalog_aliases`, `catalog_events`, `catalog_markets`. MVP local y curado, sin proveedor externo. |
| `recommendations` | Editor/admin crea y actualiza | Existe. Feed futuro con estados `draft`, `published`, `inactive`. |
| `recommendation_follows` | `user_id` | Existe. Seguimiento futuro, único por usuario y recomendación. |

## 4. Flujos de negocio

### Registro, autenticación y perfil — Implementado

```text
Usuario -> /api/auth/register -> Supabase Auth -> auth.users
                                              -> trigger -> public.users(role=user)
Usuario -> /api/auth/login -> cookie de sesión -> rutas protegidas
```

- **Implementado:** BFF para registro, login, logout y recuperación de contraseña.
- **Implementado:** `on_auth_user_created` crea perfil con email normalizado y rol `user`.
- **Implementado:** solo `admin` lista usuarios y cambia roles ajenos mediante BFF cookie, RPC exclusiva de `service_role`, versión optimista y auditoría append-only. Ningún actor cambia su propio rol.

### Creación de bank — Implementado

```text
Usuario -> POST /api/banks -> RPC create_bank_with_pockets
                              -> banks + 3 pockets + 3 initial_deposit
                              -> respuesta con operative=cash
```

- **Confirmado:** nombre único por usuario tras trim/case-insensitive; divisa `EUR|USD|ARS`.
- **Confirmado:** importes iniciales positivos, máximo dos decimales, rechazo sin redondeo.
- **Implementado:** atomicidad SQL y creación obligatoria de `cash`, `bonus`, `freebet`.

### Consulta de saldo — Implementado

```text
Usuario -> GET /api/banks[/id] -> banks + bank_pockets -> cash, bonus, freebet, operative
```

- **Confirmado e implementado:** `operative = cash`.
- **Implementado:** RLS limita lectura a banks propios; un bank inexistente o ajeno devuelve 404 genérico.

### Depósito y retiro — Implementado

```text
Usuario -> validar importe y clave idempotente -> operación atómica
        -> transactions(deposit|withdraw, pocket=cash) -> bank_pockets.cash
        -> audit_logs
```

- **Implementado:** ambos movimientos solo usan `cash`; métodos permitidos: `bank_transfer`, `card`, `cash`.
- **Implementado:** importe positivo, dos decimales como máximo, retirada no superior al cash disponible.
- **Implementado:** la clave de idempotencia es obligatoria por intento de escritura financiera; replay equivalente devuelve resultado original y payload distinto devuelve `409`.
- **Implementado:** la RPC valida titularidad; bank inexistente o ajeno devuelve `404` genérico.

### Transferencia — Implementado

```text
Usuario -> validar origen/destino -> misma titularidad y divisa
        -> débito cash + crédito cash, mismo transfer_id, una operación atómica
        -> auditoría de ambos asientos
```

- **Implementado:** endpoint BFF `POST /api/banks/{bankId}/transfer`, solo `cash`, banks propios distintos y misma divisa.
- **Adoptado:** `transfer_debit` y `transfer_credit` son pareja indivisible; `related_transaction_id` los enlaza mutuamente.
- **Implementado:** misma clave idempotente no puede duplicar ninguno de los dos asientos.
- **Confirmado:** bank ajeno o inexistente devuelve `404 BANK_NOT_FOUND` genérico para no permitir enumeración.

### Creación y financiación de ticket — Implementado en Fase 4G

```text
POST /api/bets -> validar ticket, legs, stake, funding e idempotencia
               -> RPC única: locks + ticket + legs + funding + reservas
               -> open
```

- **Implementado:** BFF por cookie; `POST /api/bets` exige `Idempotency-Key` UUID. Creación nueva responde `201`, replay equivalente `200` y reutilización con payload distinto `409`.
- **Confirmado:** 1..20 legs; cuota de ticket y leg mayor que 1 con máximo cuatro decimales.
- **Implementado:** cada leg declara `referenceType=normalized|manual`. Normalized exige `eventId+marketId`, evento `scheduled|live`, mercado `active` y pertenencia del mercado al evento; manual exige `eventName+marketName` e IDs nulos.
- **Confirmado:** stake discriminado por amount positivo con máximo dos decimales o level `0.1..20.0` en pasos de `0.1`.
- **Confirmado:** fórmula por nivel `cash previo × (level/20) × 0.40`; si produce más de dos decimales, se rechaza sin redondeo ni ajuste.
- **Confirmado:** stake máximo exacto del 40% del cash previo, independiente de si se financia con cash, bonus, freebet o mix.
- **Confirmado:** funding obligatorio con montos `>=0`, al menos uno positivo y suma decimal exacta igual al stake. Se permiten 100% cash, 100% bonus, 100% freebet y mixes.
- **Implementado:** cada funding positivo crea una transacción `bet_reserve` y un `bet_funding` enlazado; los ceros no generan filas.
- **Implementado:** ticket, legs, funding, débitos, reservas e idempotencia se crean en una RPC única y atómica. El ticket solo alcanza `open` al final.
- **Implementado:** RPC `SECURITY INVOKER` ejecutada por `service_role`; RLS conserva lectura por ownership y `authenticated` carece de DML directo y `EXECUTE` sobre la RPC.
- **Fuera de Fase 4G:** liquidación, retorno de freebet y cashout.

### Liquidación, cashout y auditoría — Implementado en Fase 4H

```text
POST /api/bets/{id}/settle -> RPC settle_bet
  -> lock ticket + pockets -> cálculo por funding -> returns + transactions + audit -> settled

POST /api/bets/{id}/cashout -> RPC partial_cashout_bet
  -> lock ticket + cash -> original cashout + retorno + derivado open + carryover + audit
```

- **Implementado:** solo tickets modernos `open`, `funding_status=reserved`, funding exacto y reservas trazables pueden liquidarse. Las cuatro bets legacy se leen, pero no se mutan ni se backfillean.
- **Implementado:** resultados canónicos `won|lost|void|half_won|half_lost`; `status=settled` describe ciclo y `result` desenlace.
- **Implementado:** retorno calculado en servidor; el cliente no envía `settlementAmount`. Cash y bonus `won` acreditan `aporte × cuota`; `void`, el aporte; `half_won`, `aporte × (cuota + 1) / 2`; `half_lost`, `aporte / 2`; `lost`, cero.
- **Implementado:** freebet `won` acredita `aporte × (cuota - 1)` a cash; `void` devuelve aporte a freebet; `half_won` devuelve mitad a freebet y acredita mitad del beneficio a cash; `half_lost` devuelve mitad a freebet; `lost` no acredita.
- **Implementado:** cada componente calculado debe ser exacto a dos decimales. Cualquier fracción adicional revierte toda la RPC; nunca se redondea.
- **Implementado:** `profit_amount` refleja resultado económico de cash/bonus y beneficio cash de freebet; perder freebet no registra pérdida monetaria.
- **Implementado:** cashout parcial solo acepta financiación 100% cash. `cashoutAmount` es payout independiente; `remainingStake` debe ser mayor que cero y menor que stake original.
- **Implementado:** original queda `status=result=cashout`; derivado queda `open`, copia legs y recibe funding cash con asiento `bet_carryover` enlazado a reserva original, sin segundo débito del pocket.
- **Implementado:** settlement y cashout exigen `Idempotency-Key` UUID. Replay equivalente devuelve resultado previo; payload distinto devuelve `409`.
- **Implementado:** transactions enlaza `bet_id` y, para payout, `cashout_id`. Cada crédito financiero genera transacción y evento auditado.
- **Implementado:** auditoría append-only mediante trigger y grants: `authenticated` solo lee según ownership/admin; no inserta, actualiza ni elimina. Rechazos no persisten porque la operación completa revierte.

#### Preflight completado para Fase 4G

- Migration RBAC local reconciliada con remoto como `20260816145742_add_admin_role_management.sql`.
- Las 4 bets legacy sin funding, reserva ni idempotencia permanecen intactas; constraints nuevas exigen la forma Fase 4G a filas nuevas sin validar retrospectivamente las legacy.
- No se aplicó borrado, backfill ni transformación de filas legacy.

### Catálogo normalizado y fallback manual — Diseñado para Fase 4F

```text
Consulta >= 2 caracteres -> catálogo local -> resultado normalizado
                                          -> sin resultado -> entrada manual
                                                              -> normalization_status=manual
```

- **Confirmado:** catálogo MVP es local y curado; no hay proveedor externo, scraping, timeout externo ni cache externa.
- **Confirmado:** usuario autenticado puede buscar entidades normalizadas y crear entrada manual.
- **Adoptado:** fallback manual crea `normalization_status=manual`, nunca se presenta como normalizado y se expone con `isNormalized=false`.
- **Adoptado:** editor/admin mantiene entidades `normalized` y aliases.
- **Adoptado:** alias se normaliza con `lower(trim(alias))` y es único por entidad de destino.
- **Adoptado:** proveedor y `external_id` son opcionales en MVP local; cuando se introduzcan, el par será único por entidad.
- **Adoptado:** tickets y recomendaciones futuras deberán distinguir referencias normalizadas de entradas manuales explícitamente marcadas.

#### Estados de normalización de catálogo

| Estado | Uso MVP | Regla |
| --- | --- | --- |
| `normalized` | Entidad curada | Puede aparecer en autocomplete y alimentar recomendaciones normalizadas. |
| `manual` | Entrada de usuario | No aparece como normalizada; solo se usa como referencia manual explícita en flujos futuros. |
| `pending` | Reservado | Revisión editorial futura, no usado por el MVP de búsqueda. |
| `deprecated` | Retirada | No aparece en búsquedas normales. |

#### Búsqueda de equipos y competiciones

| Regla | Decisión |
| --- | --- |
| Longitud mínima | `q.trim().length >= 2` en UI y API. |
| Límite | `limit` default 10, máximo 25; `offset` default 0. |
| Coincidencia | Prefijo sobre `normalized_name` y prefijo sobre `catalog_aliases.normalized_alias`. |
| Orden | exact match, prefijo por nombre, prefijo por alias, nombre ascendente, id ascendente. |
| Resultado | Solo entidades `normalized`; empty state ofrece ingreso manual. |

### Metas y riesgo — Implementado localmente en Fase 4I

```text
Usuario -> goal activa vinculada a bank -> misión diaria
ticket liquidado vinculado -> recálculo idempotente -> goal_history
riesgo excedido -> bloquear recomendación de cuota, no liquidación existente
```

- **Confirmado:** objetivo mayor que capital base y fecha futura; cierre anticipado permitido con confirmación.
- **Adoptado:** una meta activa por bank para evitar objetivos concurrentes incompatibles.
- **Adoptado:** límites de riesgo son configuración explícita del usuario; sin límite configurado se aplica el cap MVP del 40% de cash, no se inventa una cuota máxima.
- **Adoptado:** cada liquidación vinculada genera como máximo un `goal_history(event_type=recalculated)` por índice único existente.
- **Implementado local:** creación/update/cierre/configuración usan RPCs atómicas `SECURITY INVOKER` exclusivas de `service_role`; lecturas BFF usan RLS.
- **Confirmado:** `remaining=max(target-cash,0)`, días naturales mínimo 1, daily profit exacto a dos decimales y suggested odds exacta a cuatro; target alcanzado produce `0` y `1`.
- **Confirmado:** completed exige cash >= target; cancelled permite cierre bajo target; reintento no muta.
- **Confirmado:** creación de ticket valida goal opcional, max odds y pérdida diaria; riesgo jamás altera settlement ya realizado.

### Recomendación y seguimiento — Planificado

```text
editor|admin -> draft -> published -> feed filtrable
user -> follow -> recommendation_follows + payload prefill -> revisión manual -> ticket
```

- **Confirmado:** publicar exige evento y mercado normalizados; feed filtra `pre|live`.
- **Confirmado:** seguir no crea ticket; solo precarga formulario.
- **Adoptado:** `inactive` impide nuevos follows y no elimina follows históricos.
- **Adoptado:** ICP se guarda como JSON versionado; hasta definir su esquema, no participa en decisiones automáticas de riesgo ni ordenación obligatoria.

## 5. Máquinas de estado

| Dominio | Estados y transición |
| --- | --- |
| Bank/pockets | `bank creado -> cash|bonus|freebet disponibles`. Un pocket no se elimina individualmente y nunca baja de cero. Cierre de bank no está definido para MVP. |
| Transaction | `solicitada -> aplicada` o `rechazada`. Solo `aplicada` persiste en ledger. Transferencia aplicada crea dos filas; no existe compensación silenciosa. |
| Bet | `creación atómica -> open -> settled|cashout`; cashout parcial crea otro `open`. `status` expresa ciclo y `result` desenlace. |
| Goal | `active -> completed|cancelled`. Ambos estados fijan `closed_at`; no se recalcula una meta cerrada. |
| Recommendation | `draft -> published -> inactive`. Solo `published` se muestra a users y admite follow. |

## 6. Ownership y permisos

| Recurso/acción | user | editor | admin |
| --- | --- | --- | --- |
| Perfil propio | Leer/actualizar datos no privilegiados | Igual | Gestionar roles y perfiles |
| Banks, pockets y movimientos propios | Leer; crear bank; movimientos futuros propios | Igual | Lectura de auditoría autorizada; no opera saldo ajeno |
| Tickets, metas y límites propios | Leer y gestionar futuros | Igual | Sin privilegio de escritura ajena |
| Auditoría | Leer evidencia propia | Evidencia propia | Leer según RLS |
| Catálogo | Leer | Leer/escribir | Leer/escribir |
| Recomendaciones | Leer publicadas; follow propio | Leer/escribir/publicar | Leer/escribir/publicar |

## 7. Procesos automáticos actuales

| Proceso | Evidencia | Efecto |
| --- | --- | --- |
| Trigger de perfil | `20260727155541_create_auth_user_profile.sql` | Tras insertar en `auth.users`, inserta `public.users` con email en minúsculas y rol `user`. |
| RPC atómica de bank | `20260728154428_create_banks_with_pockets.sql` | Valida entrada, crea bank, tres pockets, tres asientos iniciales y devuelve saldos; toda la llamada revierte ante error. |
| RPC atómica de movimientos | `20260803174121_record_cash_transactions.sql` | Bloquea cash, aplica depósito/retiro, inserta ledger y auditoría, y conserva resultado idempotente. |
| RPC atómica de tickets | `20260816192251_create_bet_with_funding.sql` | Bloquea idempotencia, bank y pockets; crea ticket, legs, reservas y funding; abre el ticket solo al completar todo. |

No hay cron, webhook de negocio ni integración externa implementados.

## 8. Trazabilidad

| Regla | SRS/PBI | Tabla o migración | API/UI |
| --- | --- | --- | --- |
| Perfil por registro | FR-001, SL-2 | `users`, `20260727155541` | Implementado: `/api/auth/register`, `/signup` |
| Bank y pockets atómicos | FR-005, SL-7 | `banks`, `bank_pockets`, `transactions`, `20260728154428` | Implementado: `/api/banks`, `/dashboard/banks/new` |
| Saldo operativo cash | FR-006, SL-8 | `bank_pockets` | Implementado: `/api/banks/{bankId}`, `balance.ts`, detalle bank |
| Depósito/retiro cash | FR-008, SL-10 | `transactions`, `transaction_idempotencies`, `20260803174121` | Implementado: `/api/transactions`, formulario en detalle de bank |
| Transferencia cash misma divisa | FR-007, SL-9 | `transactions`, `transaction_idempotencies`, `20260803183644` | Implementado: `/api/banks/{bankId}/transfer`, formulario en detalle bank |
| Ticket y funding | FR-009, FR-010, SL-12/13 | `bets`, `bet_legs`, `bet_funding`, `bet_idempotencies`, `transactions`; `20260816192251`, `20260816192515` | Implementado: `POST /api/bets`, `/dashboard/bets/new` |
| Liquidación, cashout y auditoría | FR-011..013, SL-14..16 | `bets`, `bet_cashouts`, `transactions`, `audit_logs`, idempotencias; `20260817045500`, `20260817045542` | Implementado: `/api/bets/{id}/settle|cashout`, `/api/audit`, detalle ticket |
| Catálogo manual y normalizado | FR-014..016, SL-18..20 | tablas `catalog_*` | Futuro: `/api/catalog/*` |
| Meta y riesgo | FR-017..021, SL-22..26 | `goals`, `goal_history`, `risk_limits`; `20260817160357` | Implementado: `/api/goals/*`, `/api/risk-limits`, UI goals y recálculo settlement |
| Recomendación y follow | FR-022..024, SL-28..30 | `recommendations`, `recommendation_follows` | Futuro: `/api/recommendations/*` |
| Métricas | FR-025, SL-31 | datos liquidados; sin vista actual | Futuro: `/api/metrics/overview` |

## 9. Decisiones confirmadas

| Decisión | Estado |
| --- | --- |
| Saldo operativo = cash | Confirmado e implementado |
| Divisas EUR, USD y ARS | Confirmado e implementado |
| Máximo dos decimales, sin redondeo | Confirmado; implementado para alta de bank |
| Pockets cash, bonus y freebet | Confirmado e implementado |
| Depósitos y retiros MVP solo cash | Confirmado e implementado |
| Transferencias MVP solo cash, mismo usuario y misma divisa | Confirmado e implementado |
| Idempotencia en depósitos/retiros | Confirmado e implementado |
| Fase 4G crea ticket, funding y reservas en una RPC atómica | Confirmado e implementado |
| Funding cash/bonus/freebet puro o mixto, con suma exacta | Confirmado e implementado |
| Cap del 40% sobre cash previo, sin importar funding | Confirmado e implementado |
| Settlement y cashout usan RPCs atómicas, idempotencia y cálculo exacto sin redondeo | Adoptado e implementado |
| Cashout parcial MVP solo 100% cash y crea ticket derivado con carryover sin segundo débito | Adoptado e implementado |

## 10. Decisiones adoptadas y pendientes

| Decisión | Estado | Impacto | Fase |
| --- | --- | --- | --- |
| Una meta activa por bank | Adoptada | Evita misiones y límites contradictorios | Goals |
| `status` describe ciclo y `result` describe desenlace | Adoptada | Normaliza tickets y métricas | Bets |
| Void, half y promociones se liquidan por pocket; freebet ganada acredita solo beneficio a cash | Adoptada | Cierra contabilidad de resultados | Settlement |
| Todo asiento monetario calculado debe tener hasta dos decimales exactos | Adoptada | Preserva regla sin redondeo | Bets, Settlement, Cashout, Goals |
| Cashout parcial se limita en MVP a tickets financiados 100% con cash; crea ticket `cashout` y copia legs al ticket derivado `open` | Adoptada | Elimina división promocional ambigua | Cashout |
| Cashout aplica `cashout_amount` a cash; stake restante conserva financiación cash y no puede superar stake original | Adoptada | Mantiene trazabilidad contable | Cashout |
| Misión diaria = `(target_amount - cash actual) / días naturales restantes`; creación o recálculo se rechaza si resultado monetario tiene más de dos decimales | Adoptada | Fórmula reproducible sin redondeo | Goals/Risk |
| Límite mínimo activo: stake máximo 40% de cash; cuota máxima y pérdida diaria son opt-in del usuario | Adoptada | Evita sugerencias inseguras por defecto | Goals/Risk |
| ICP v1 = `{ version: 1, score: 0..100, factors: string[] }`; se ordena por `published_at`, no por score | Adoptada | Hace el feed explicable sin ranking opaco | Recommendations |
| Catálogo MVP es local y curado; ante ausencia de dato se usa entrada manual. Integración externa queda fuera del MVP actual | Adoptada | Elimina dependencia externa no implementada | Catalog |
| Stake level `0.1..20.0` usa `cash × (level/20) × 0.40`; resultados con más de dos decimales se rechazan | Adoptada | Hace cálculo reproducible sin redondeo | Bets Fase 4G |
| Legs distinguen referencias normalizadas y manuales mediante discriminante obligatorio | Adoptada | Evita inferir semántica desde IDs nulos | Bets Fase 4G |
| Una reserva `bet_reserve` por funding positivo y enlace obligatorio desde `bet_funding` | Adoptada | Mantiene trazabilidad por pocket | Bets Fase 4G |

### Decisiones pendientes

No quedan decisiones funcionales abiertas en Fase 4H. Las migrations y RPCs están aplicadas; las cuatro bets legacy permanecen sin borrado ni backfill. Playwright ejecutó liquidación y cashout reales con datos aislados eliminados al finalizar.

## 11. Informe de validación

- Plantilla sustituida sin marcadores de trabajo incompleto ni texto genérico.
- Todas las entidades obligatorias existen en schema local y remoto; su flujo queda marcado implementado o futuro.
- Cada flujo declara estado.
- Hechos, reglas confirmadas, decisiones adoptadas y límites no resueltos están separados.
- SL-12..SL-16, SRS/OpenAPI y este mapa quedan reconciliados con la implementación Fase 4H.

## 12. Reconciliación documental

- `.context/SRS/api-contracts.yaml`: reconciliado para `POST /api/bets`, stake/legs discriminados, funding, cookie e idempotencia.
- `.context/SRS/functional-specs.md`: reconciliado FR-009/FR-010 para creación y reservas Fase 4G.
- `.context/SRS/architecture-specs.md`: reconciliado flujo atómico, grants/RLS y preflight Fase 4G.
- `.context/dev-roadmap.md` y `.context/master-implementation-plan.md`: baseline de APIs y estado de auth/banks ya implementados.
- PBI SL-9 y SL-10: restricciones cash-only, divisa y métodos.
- PBI SL-12/SL-13: reconciliado; SL-14..16 y dominios posteriores conservan sus fases independientes.
