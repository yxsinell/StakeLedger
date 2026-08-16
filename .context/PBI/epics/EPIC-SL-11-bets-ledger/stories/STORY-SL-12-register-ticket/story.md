# Como usuario, quiero registrar un ticket con legs para aplicar un stake controlado

**Jira Key:** SL-12
**Epic:** EPIC-SL-11 (Bets Ledger)
**Prioridad:** High
**Story Points:** 5
**Estado:** To Do
**Implementación:** Fase 4G aplicada; E2E manual y concurrencia multisesión pendientes

## User Story

**Como** usuario
**Quiero** registrar un ticket con sus legs y un stake explícito o calculado
**Para** reservar fondos de forma atómica sin superar mi límite de riesgo

## Alcance

### Incluido

- UI MVP en `/dashboard/bets/new` para crear tickets.
- `POST /api/bets` autenticado mediante cookie de sesión BFF.
- Una clave `Idempotency-Key` UUID obligatoria por intento de creación.
- Ticket con entre 1 y 20 legs, cuota de ticket y cuota por leg.
- Stake discriminado: importe explícito o nivel calculado.
- Legs discriminadas: referencia `normalized` o `manual` explícita.
- Creación atómica de ticket, legs, funding, reservas y ledger junto con SL-13.

### Excluido

- Liquidación, reglas de retorno de freebet, cashout y auditoría de esos flujos.
- OCR, importación automática y creación desde recomendaciones.
- Endpoint posterior para financiar un ticket ya creado.

## Criterios de aceptación

### Escenario 1: Creación con importe explícito

- **Dado** un usuario autenticado, un bank propio y saldos suficientes
- **Cuando** envía un ticket válido con `stake.amount`, funding exacto y una clave idempotente nueva
- **Entonces** se crean ticket, legs, funding y reservas en una única operación atómica
- **Y** el ticket queda `open` solo después de persistir todas las reservas
- **Y** la API responde `201`

### Escenario 2: Creación con nivel de stake

- **Dado** un cash previo de 100.00 y saldos suficientes
- **Cuando** envía `stake.level=10.0`
- **Entonces** el stake se calcula como `100.00 × (10.0 / 20) × 0.40 = 20.00`
- **Y** el cálculo no se redondea ni ajusta

### Escenario 3: Cap exacto

- **Dado** el cash previo del bank
- **Cuando** el stake es exactamente el 40% de ese cash
- **Entonces** se acepta si el funding tiene saldo suficiente
- **Cuando** el stake supera ese cap por cualquier funding
- **Entonces** se rechaza con `409` sin cambios persistidos

### Escenario 4: Validación de precisión y cuotas

- **Cuando** una cuota de ticket o leg es menor o igual que 1, o tiene más de cuatro decimales
- **Entonces** la API responde `400`
- **Cuando** `stake.amount` tiene más de dos decimales o un `stake.level` no pertenece a `0.1..20.0` en pasos de `0.1`
- **Entonces** la API responde `400`
- **Cuando** el cálculo por nivel produce más de dos decimales
- **Entonces** la API responde `400`; nunca redondea ni ajusta

### Escenario 5: Legs normalizadas y manuales

- **Cuando** una leg es `normalized`
- **Entonces** exige `eventId` y `marketId`, y el mercado debe pertenecer al evento
- **Cuando** una leg es `manual`
- **Entonces** exige `eventName` y `marketName`, y persiste IDs normalizados nulos
- **Y** ninguna leg puede omitir o mezclar ambos tipos de referencia

### Escenario 6: Seguridad, idempotencia y concurrencia

- **Cuando** falta sesión válida, la API responde `401`
- **Cuando** el bank no existe o pertenece a otro usuario, responde `404` genérico
- **Cuando** se repite la misma clave con payload equivalente, devuelve el resultado original con `200`
- **Cuando** se reutiliza la clave con payload distinto, responde `409`
- **Cuando** el cap o cualquier saldo deja de ser suficiente antes del bloqueo transaccional, responde `409` sin estado parcial

## Reglas de negocio

- `legs` contiene de 1 a 20 elementos.
- Cuotas de ticket y leg: mayores que 1 y máximo cuatro decimales.
- Una leg normalizada solo admite eventos `scheduled|live` y mercados `active`; el mercado debe pertenecer al evento.
- `stake` es exactamente uno de `{ amount }` o `{ level }`.
- `amount`: positivo y máximo dos decimales.
- `level`: `0.1..20.0`, paso exacto `0.1`.
- Fórmula: `cash previo × (level / 20) × 0.40`.
- El stake debe ser menor o igual al 40% del cash previo, sin importar la composición del funding.
- Todo resultado monetario con más de dos decimales se rechaza; no existe redondeo ni ajuste automático.
- La creación completa se delega a una RPC única y atómica; no se persiste un estado `draft` observable.

## Workflow

1. El usuario completa ticket, legs, stake y funding en `/dashboard/bets/new`.
2. El BFF valida sesión, cabecera y payload.
3. La RPC bloquea idempotencia y pockets en orden determinista, recalcula cash previo, cap y saldos.
4. La RPC crea ticket, legs, funding y una reserva por cada funding positivo.
5. Solo después marca el ticket `open` y devuelve el agregado creado.

## Dependencias

**Bloqueada por:** SL-7, SL-8, SL-10 y catálogo local SL-18..20.
**Se entrega conjuntamente con:** SL-13.
**Bloquea:** SL-14, SL-15 y SL-16, fuera de Fase 4G.

## Definition of Done

- [ ] Contrato, schema, RPC, grants y RLS coinciden con esta historia.
- [ ] Pruebas unitarias, API, RLS, atomicidad, concurrencia e idempotencia superadas.
- [ ] E2E manual de `/dashboard/bets/new` superado.
- [ ] Elementos interactivos usan `data-testid` estáticos.
- [ ] Tipos Supabase regenerados tras migrations aprobadas.
- [ ] `bun run repo:check` supera todas las validaciones.

## Documentación relacionada

- Acceptance test plan: `acceptance-test-plan.md`
- Implementation plan: `implementation-plan.md`
- SRS funcional: `.context/SRS/functional-specs.md` (FR-009)
- Contrato API: `.context/SRS/api-contracts.yaml` (`POST /api/bets`)
- Reglas canónicas: `.context/business-data-map.md`
