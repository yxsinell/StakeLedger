# Business Data Map: StakeLedger

> Fuente de verdad operativa del MVP. Actualizado: 2026-08-03.
>
> Leyenda: **Implementado** describe comportamiento verificable en código o schema remoto. **Confirmado** recoge una decisión de producto explícita. **Adoptado** es una decisión de arquitectura tomada para cerrar un bloqueo. **Futuro** existe en schema o especificación, pero aún no tiene flujo de aplicación implementado.

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
| bonus | Crédito promocional con reglas de retorno aún no implementadas. |
| freebet | Crédito promocional para stake; su regla de devolución se define en liquidación futura. |
| saldo operativo | Importe `cash` del bank. Implementado en `src/lib/banks/balance.ts`. |
| transacción | Asiento inmutable de entrada, salida, reserva, retorno o transferencia; `amount` siempre es positivo y su tipo expresa dirección. |
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
| `transactions` | Hereda titularidad de bank | Existe. Ledger futuro para movimientos, reservas, retornos y transferencias. Solo asientos iniciales implementados. |
| `bets` | Hereda titularidad de bank | Existe. Ticket futuro; puede enlazar una meta y una transacción de reserva. |
| `bet_legs` | Hereda titularidad de bet | Existe. Leg futura; puede referenciar evento y mercado normalizados. |
| `bet_funding` | Hereda titularidad de bet | Existe. Desglose futuro por pocket, una fila por tipo. |
| `bet_cashouts` | Hereda titularidad de bet | Existe. Evidencia futura de cashout y relación de división. |
| `audit_logs` | Actor y entidad auditada | Existe. Inmutable; ownership de lectura depende de actor, entidad propia o admin. |
| `goals` | `user_id`, y bank del mismo titular | Existe. Flujo futuro. |
| `goal_history` | Hereda titularidad de goal | Existe. Historial futuro de creación, misión, recálculo y cierre. |
| `risk_limits` | `user_id`, único | Existe. Flujo futuro; un conjunto de límites por usuario. |
| catálogo | Editor/admin para escritura; autenticados leen | Existe como `catalog_teams`, `catalog_competitions`, `catalog_aliases`, `catalog_events`, `catalog_markets`. Flujo futuro. |
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
- **Confirmado:** solo `admin` puede cambiar roles; enforcement completo de gestión de roles es futuro.

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

### Transferencia — Planificado

```text
Usuario -> validar origen/destino -> misma titularidad y divisa
        -> débito cash + crédito cash, mismo transfer_id, una operación atómica
        -> auditoría de ambos asientos
```

- **Confirmado:** solo `cash`, mismo usuario y misma divisa.
- **Adoptado:** `transfer_debit` y `transfer_credit` son pareja indivisible; `related_transaction_id` los enlaza mutuamente.
- **Adoptado:** misma clave idempotente no puede duplicar ninguno de los dos asientos.

### Creación, financiación y liquidación de ticket — Planificado

```text
Ticket draft -> validar legs, cuota, riesgo y funding -> reserva -> open
open -> liquidar resultado -> retorno y auditoría -> settled|void
open -> cashout parcial -> ticket cerrado + ticket abierto derivado
```

- **Confirmado:** al menos una leg, cuota mayor que 1 y stake máximo 40% del cash disponible.
- **Confirmado:** financiación admite `cash|bonus|freebet`; su suma debe ser igual al stake.
- **Adoptado:** se rechaza toda cantidad con más de dos decimales; no se corrige por redondeo.
- **Adoptado:** un ticket solo alcanza `open` después de persistir reservas y `bet_funding` en la misma unidad atómica.
- **Adoptado:** `void` devuelve el stake a cada pocket financiador. `won`, `lost`, `half_won` y `half_lost` liquidan cada aportación de forma proporcional, sin conversión entre pockets salvo freebet ganada.
- **Adoptado:** cash y bonus devuelven respectivamente `aportación × cuota`; freebet ganada devuelve solo `aportación × (cuota - 1)` a `cash`. `half_won` devuelve media aportación más media aportación ganadora; `half_lost` devuelve media aportación. Si un asiento calculado supera dos decimales, el ticket o liquidación se rechaza: no se redondea.

### Catálogo normalizado y fallback manual — Planificado

```text
Consulta >= 2 caracteres -> catálogo local -> resultado normalizado
                                         -> sin resultado -> entrada manual
                                                              -> status=manual
```

- **Confirmado:** usuario puede crear entrada manual marcada; editor/admin mantiene catálogo y alias.
- **Adoptado:** fallback manual crea `normalization_status=manual`, nunca se presenta como normalizado.
- **Adoptado:** proveedor y `external_id` son únicos por entidad; alias es único por entidad y normalizado por trim/lowercase.

### Metas y riesgo — Planificado

```text
Usuario -> goal activa vinculada a bank -> misión diaria
ticket liquidado vinculado -> recálculo idempotente -> goal_history
riesgo excedido -> bloquear recomendación de cuota, no liquidación existente
```

- **Confirmado:** objetivo mayor que capital base y fecha futura; cierre anticipado permitido con confirmación.
- **Adoptado:** una meta activa por bank para evitar objetivos concurrentes incompatibles.
- **Adoptado:** límites de riesgo son configuración explícita del usuario; sin límite configurado se aplica el cap MVP del 40% de cash, no se inventa una cuota máxima.
- **Adoptado:** cada liquidación vinculada genera como máximo un `goal_history(event_type=recalculated)` por índice único existente.

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
| Bet | `draft -> open -> settled|void|cashout`; `settled` requiere `result=won|lost|half_won|half_lost`. `open -> cashout_partial` crea ticket cerrado y ticket derivado `open`. `status` modela ciclo de vida; `result` modela resultado. |
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

No hay cron, webhook de negocio ni integración externa implementados.

## 8. Trazabilidad

| Regla | SRS/PBI | Tabla o migración | API/UI |
| --- | --- | --- | --- |
| Perfil por registro | FR-001, SL-2 | `users`, `20260727155541` | Implementado: `/api/auth/register`, `/signup` |
| Bank y pockets atómicos | FR-005, SL-7 | `banks`, `bank_pockets`, `transactions`, `20260728154428` | Implementado: `/api/banks`, `/dashboard/banks/new` |
| Saldo operativo cash | FR-006, SL-8 | `bank_pockets` | Implementado: `/api/banks/{bankId}`, `balance.ts`, detalle bank |
| Depósito/retiro cash | FR-008, SL-10 | `transactions`, `transaction_idempotencies`, `20260803174121` | Implementado: `/api/transactions`, formulario en detalle de bank |
| Transferencia cash misma divisa | FR-007, SL-9 | `transactions` y campos transferencia | Futuro: contrato/API/UI SL-9 |
| Ticket y funding | FR-009, FR-010, SL-12/13 | `bets`, `bet_legs`, `bet_funding` | Futuro: `/api/bets` |
| Liquidación, cashout y auditoría | FR-011..013, SL-14..16 | `bet_cashouts`, `audit_logs` | Futuro: `/api/bets/{id}/settle|cashout` |
| Catálogo manual y normalizado | FR-014..016, SL-18..20 | tablas `catalog_*` | Futuro: `/api/catalog/*` |
| Meta y riesgo | FR-017..021, SL-22..26 | `goals`, `goal_history`, `risk_limits` | Futuro: `/api/goals/*` |
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
| Transferencias MVP solo cash, mismo usuario y misma divisa | Confirmado; planificado |
| Idempotencia en depósitos/retiros | Confirmado e implementado |

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

### Decisiones pendientes

No hay decisiones pendientes que bloqueen el siguiente tramo: movimientos de cash, después catálogo local y creación de tickets. Cualquier cambio posterior a estas decisiones requiere actualizar primero este mapa y la trazabilidad afectada.

## 11. Informe de validación

- Plantilla sustituida sin marcadores de trabajo incompleto ni texto genérico.
- Todas las entidades obligatorias existen en schema local y remoto; su flujo queda marcado implementado o futuro.
- Cada flujo declara estado.
- Hechos, reglas confirmadas, decisiones adoptadas y límites no resueltos están separados.
- Se preservan PRD/SRS/PBI cuando no contradicen evidencia; discrepancias quedan expuestas.

## 12. Documentos que deben reconciliarse

- `.context/SRS/api-contracts.yaml`: estados de bet, estrategia de meta, `marketId` de recomendaciones, auth cookie/bearer y rutas aún inexistentes.
- `.context/SRS/functional-specs.md`: reglas cash-only, misma divisa, idempotencia y precisión transversal.
- `.context/SRS/architecture-specs.md`: ERD y data flow frente a 17 tablas reales y API actual.
- `.context/dev-roadmap.md` y `.context/master-implementation-plan.md`: baseline de APIs y estado de auth/banks ya implementados.
- PBI SL-9 y SL-10: restricciones cash-only, divisa y métodos.
- PBI SL-12 a SL-16, SL-22 a SL-26 y SL-28 a SL-31: decisiones de liquidación, cashout, riesgo, ICP y métricas.
