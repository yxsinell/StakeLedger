# Implementation Plan: STORY-SL-15 - Cashout parcial

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-012
- API contract: `.context/SRS/api-contracts.yaml` `/api/bets/{betId}/cashout`

## Estado Actual Verificado

- No existe `src/app/api/bets/[betId]/cashout/route.ts`.
- `bet_cashouts` existe con `bet_id`, `cashout_amount`, `remaining_stake`, pero no hay relacion con bet cerrada/open resultante.
- `bets` no tiene parent/split/source bet fields.
- No hay servicio atomico para cerrar ticket A y crear ticket B.
- No hay UI de cashout.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de Banks/ledger SL-7/SL-8/SL-10 para movimientos.
- Depende de SL-12 para ticket abierto.
- Depende de SL-13/SL-14 para funding, settlement y estados consistentes.

## Alcance

- Ejecutar cashout parcial sobre ticket abierto.
- Cerrar ticket A, crear ticket B con stake restante y mantener trazabilidad.
- Registrar ledger, audit y cashout record atomicos.
- Mantener fuera de alcance cashout total automatico e integraciones con bookmakers.

## Archivos a Tocar

- `src/app/api/bets/[betId]/cashout/route.ts` - endpoint cashout.
- `src/lib/bets/cashout-service.ts` - split atomico y validaciones.
- `src/lib/bets/cashout-rules.ts` - reglas de herencia A/B.
- `src/lib/bets/schemas.ts` - `BetCashoutRequestSchema`.
- `src/lib/banks/ledger.ts` - movimientos cashout.
- `src/components/bets/cashout-form.tsx` - UI de cashout.
- `src/lib/openapi/schemas/bets.ts` - schemas cashout.

## DB/RLS Necesarios

- Migration-first: requiere fields de split (`source_bet_id`, `split_group_id`, `cashout_id`, `closed_from_cashout`) o modelo equivalente.
- Requiere relacion trazable entre ticket A cerrado y ticket B abierto.
- Requiere decidir como heredan legs, odds y funding al ticket B.
- Requiere transaccion DB para cerrar A, crear B, insertar `bet_cashouts`, ledger y audit sin estado parcial.
- RLS: owner solo puede cashoutear bets propias; no puede modificar cashouts ajenos.

## API Necesaria

- `POST /api/bets/{betId}/cashout` con `{ cashoutAmount, remainingStake }` segun OpenAPI.
- Success: `200` con `{ success, closedBetId, openBetId }`.
- Errors: `400` amount <= 0 o >= stake, `403`, `404`, `409/422` bet cerrada.
- Definir si `remainingStake` lo calcula backend para evitar payload incoherente.

## UI Necesaria

- Formulario cashout con monto, preview de remaining stake y confirmacion del split.
- Mostrar ticket A cerrado y ticket B abierto despues de confirmar.
- `data-testid`: `cashoutForm`, `cashout_amount_input`, `remaining_stake_preview`, `confirm_cashout_button`, `cashout_state_error`, `split_result_panel`.

## Validaciones Zod

- `betId`: UUID.
- `cashoutAmount`: number finite, > 0.
- `remainingStake`: number finite, > 0 si se acepta desde cliente.
- `cashoutAmount < stakeAmount` para cashout parcial.
- Bet debe estar `open`.

## Tests Minimos

- Unit: monto 0, monto >= stake, remaining stake.
- Unit: reglas de herencia de legs/odds/funding.
- API: cashout exitoso crea B, cierra A y registra ledger/audit.
- API: ticket cerrado rechaza cashout.
- API/RLS: bet ajena rechazada.
- E2E: UI confirma split y muestra ambos tickets.

## Criterios de Cierre

- AC SL-15 cubiertos: cashout exitoso, monto invalido, ticket cerrado.
- Split atomico probado.
- Trazabilidad A/B clara en DB y audit.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Herencia exacta de legs/odds/funding en ticket B.
- Si `remainingStake` se envia o se calcula backend.
- Reglas de retorno del cashout parcial.
- Idempotencia para doble submit.

## Implementación Fase 4H — 2026-08-17

Decisiones abiertas cerradas. Implementación real: migration `20260817045500`, RPC `partial_cashout_bet`, BFF `/api/bets/{betId}/cashout`, UI conectada y trazabilidad `source_bet_id=original`, `bet_id=derivado`, `split_group_id`, `transaction.bet_id/cashout_id`.
