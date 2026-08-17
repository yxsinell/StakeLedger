# Implementation Plan: STORY-SL-14 - Liquidar apuestas

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-011
- API contract: `.context/SRS/api-contracts.yaml` `/api/bets/{betId}/settle`

## Estado Actual Verificado

- No existe `src/app/api/bets/[betId]/settle/route.ts`.
- `bets.status` existe como `string`, pero no hay enum/constraint visible en types.
- `bets` no contiene `result`, `settlement_amount`, `return_amount`, `profit_amount` ni `settled_at`.
- No hay servicio de settlement ni reglas half/freebet.
- `transactions` puede registrar movimientos, pero no los liga a settlement/bet.

## Dependencias

- Depende de Identity para usuario autenticado y ownership.
- Depende de Banks SL-7/SL-8/SL-10 para pockets y ledger.
- Depende de SL-12 para bet abierta.
- Depende de SL-13 si hay funding mix o freebet.

## Alcance

- Liquidar bet abierta con `win|lose|void|half_win|half_loss`.
- Calcular retorno, beneficio y movimientos de pockets.
- Registrar ledger y audit de settlement.
- Mantener fuera de alcance liquidacion automatica por proveedor externo.

## Archivos a Tocar

- `src/app/api/bets/[betId]/settle/route.ts` - endpoint settlement.
- `src/lib/bets/settlement-service.ts` - validacion estado, calculo retorno, atomicidad.
- `src/lib/bets/settlement-rules.ts` - resultados, half y freebet.
- `src/lib/bets/schemas.ts` - `BetSettleRequestSchema`.
- `src/lib/banks/ledger.ts` - registrar transacciones de retorno.
- `src/components/bets/settle-bet-form.tsx` - UI de liquidacion.
- `src/lib/openapi/schemas/bets.ts` - schemas settle.

## DB/RLS Necesarios

- Migration-first: requiere campos o tabla de settlement para `result`, `settlement_amount`, `return_amount`, `profit_amount`, `settled_at` y transaccion relacionada.
- Definir enum/constraint de resultados permitidos.
- Definir si `settlementAmount` viene del cliente o lo calcula backend; contrato actual lo hace opcional.
- Requiere atomicidad para actualizar bet, pockets, transactions, goal recalculation hook futuro y audit.
- RLS: owner solo liquida bets propias; no debe poder reliquidar bet cerrada.

## API Necesaria

- `POST /api/bets/{betId}/settle` con `{ result, settlementAmount? }`.
- Success: `200` con bet actualizada, retorno y beneficio.
- Errors: `400` result invalido, `403` bet ajena, `404`, `409/422` bet no abierta o settlement incoherente.
- Respuesta debe seguir `BetResponse` OpenAPI o ampliarse con settlement summary.

## UI Necesaria

- Selector de resultado, preview de retorno, confirmacion antes de aplicar.
- Mostrar estado cerrado y bloquear segunda liquidacion.
- `data-testid`: `settleBetForm`, `settlement_result_select`, `settlement_amount_input`, `settlement_preview`, `confirm_settlement_button`, `settlement_state_error`.

## Validaciones Zod

- `betId`: UUID.
- `result`: enum `win|lose|void|half_win|half_loss`.
- `settlementAmount`: number finite, >= 0 si se permite input.
- Validar estado `open` antes de cualquier movimiento.
- Validar coherencia de result/amount segun reglas aprobadas.

## Tests Minimos

- Unit: reglas de retorno por `win|lose|void|half_win|half_loss`.
- Unit: freebet en win/void/half segun tabla aprobada.
- API: settlement win actualiza bet, pocket, ledger y audit.
- API: bet ya liquidada devuelve error y no cambia DB.
- API/RLS: bet ajena no se liquida.
- E2E: usuario liquida bet abierta y ve balances actualizados.

## Criterios de Cierre

- AC SL-14 cubiertos: win, void, resultado invalido.
- Half win/loss y freebet quedan definidos o story queda bloqueada explicitamente.
- Settlement atomico y auditable.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Formula exacta de `half_win` y `half_loss`.
- Reglas freebet por resultado.
- Fuente de verdad de `settlementAmount`.
- Idempotencia para doble submit.

## Implementación Fase 4H — 2026-08-17

Decisiones abiertas cerradas. Implementación real: migration `20260817045500`, RPC `settle_bet`, BFF `/api/bets/{betId}/settle`, reglas puras en `settlement-rules.ts`, UI en detalle ticket, OpenAPI runtime/estático y auditoría embebida. Atomicidad vive en PostgreSQL; TypeScript valida y orquesta.
