# Como usuario, quiero financiar un ticket con cash, bonus y freebet

**Jira Key:** SL-13
**Epic:** EPIC-SL-11 (Bets Ledger)
**Prioridad:** High
**Story Points:** 3
**Estado:** To Do
**Implementación:** Fase 4G aplicada; E2E manual y concurrencia multisesión pendientes

## User Story

**Como** usuario
**Quiero** distribuir el stake entre cash, bonus y freebet
**Para** reservar exactamente los pockets elegidos con trazabilidad contable

## Alcance

### Incluido

- Objeto `funding` obligatorio dentro de `POST /api/bets`.
- Montos `cash`, `bonus` y `freebet` mayores o iguales que cero.
- Financiación 100% cash, 100% bonus, 100% freebet o cualquier mix válido.
- Una transacción `bet_reserve` por cada funding positivo.
- Una fila `bet_funding` por cada funding positivo enlazada a su transacción.
- Reserva atómica junto con ticket y legs.

### Excluido

- Endpoint `/api/bets/{betId}/fund` o financiación posterior.
- Reglas de devolución, conversión o liquidación de freebet.
- Settlement, cashout y reglas avanzadas por casa de apuestas.

## Criterios de aceptación

### Escenario 1: Funding cash completo

- **Dado** un stake de 20.00 y cash suficiente
- **Cuando** envía `funding={cash:20.00, bonus:0, freebet:0}`
- **Entonces** se reserva cash, se crea una transacción `bet_reserve` y su `bet_funding` enlazado

### Escenario 2: Mix válido

- **Dado** un stake de 20.00 y saldos suficientes
- **Cuando** envía `funding={cash:5.00, bonus:5.00, freebet:10.00}`
- **Entonces** se crean tres reservas y tres filas de funding enlazadas
- **Y** el ticket queda `open` solo después de completar las tres

### Escenario 3: Funding promocional completo

- **Cuando** usa 100% bonus o 100% freebet con saldo suficiente
- **Entonces** la creación se acepta
- **Y** el cap del 40% se sigue calculando exclusivamente sobre cash previo

### Escenario 4: Validación de montos y suma

- **Cuando** un monto es negativo, tiene más de dos decimales, todos son cero o falta `funding`
- **Entonces** la API responde `400` sin cambios
- **Cuando** la suma exacta no coincide con el stake
- **Entonces** la API responde `400`; no aplica tolerancia, redondeo ni ajuste

### Escenario 5: Saldo dinámico insuficiente

- **Dado** un payload estructuralmente válido
- **Cuando** cualquier pocket carece de saldo al bloquearlo dentro de la RPC
- **Entonces** la API responde `409`
- **Y** revierte ticket, legs, funding, reservas y débitos previos

### Escenario 6: Idempotencia

- **Cuando** se repite una creación equivalente con la misma clave
- **Entonces** devuelve el resultado original con `200` sin duplicar reservas
- **Cuando** cambia cualquier monto del funding con la misma clave
- **Entonces** responde `409`

## Reglas de negocio

- `funding` siempre contiene `cash`, `bonus` y `freebet`.
- Cada monto es `>=0` y tiene como máximo dos decimales.
- Al menos un monto es `>0`.
- `cash + bonus + freebet = stake` mediante igualdad decimal exacta.
- Cada monto positivo produce exactamente una transacción `bet_reserve` y una fila `bet_funding` enlazada.
- Un monto cero no produce transaction ni fila de funding.
- El uso de bonus/freebet no incrementa el cap: `stake <= 40% del cash previo` siempre.
- No se redondea, distribuye residuo, corrige ni convierte entre pockets.

## Workflow

1. El usuario distribuye el stake en `/dashboard/bets/new`.
2. UI y BFF validan estructura y suma exacta.
3. La RPC bloquea los pockets en orden determinista y comprueba saldos actuales.
4. La RPC debita cada pocket positivo y crea su reserva y funding enlazados.
5. La RPC abre el ticket solo al completar todo el agregado.

## Dependencias

**Se entrega conjuntamente con:** SL-12.
**Depende de:** banks y pockets existentes, ledger e idempotencia financiera.
**Bloquea:** liquidación futura SL-14, fuera de Fase 4G.

## Definition of Done

- [ ] Funding forma parte obligatoria de `POST /api/bets`.
- [ ] Pruebas unitarias, API, RLS, atomicidad, concurrencia e idempotencia superadas.
- [ ] Funding y cada reserva quedan enlazados y auditables.
- [ ] No existe endpoint `/fund`.
- [ ] E2E manual cubre un mix con freebet.
- [ ] Settlement y cashout permanecen fuera del alcance implementado.

## Documentación relacionada

- Acceptance test plan: `acceptance-test-plan.md`
- Implementation plan: `implementation-plan.md`
- SRS funcional: `.context/SRS/functional-specs.md` (FR-010)
- Contrato API: `.context/SRS/api-contracts.yaml` (`BetCreateRequest.funding`)
- Reglas canónicas: `.context/business-data-map.md`
