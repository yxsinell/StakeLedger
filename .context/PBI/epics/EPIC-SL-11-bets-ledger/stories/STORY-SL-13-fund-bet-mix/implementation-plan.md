# Implementation Plan: STORY-SL-13 - Financiar apuesta con mix de fondos

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-010
- API contract: `.context/SRS/api-contracts.yaml` `BetCreateRequest` y ruta pendiente para funding si se separa

## Estado Actual Verificado

- No existe endpoint de funding separado.
- `bets` no tiene desglose de funding ni estado de financiacion.
- `transactions` registra `pocket_type`, pero no liga una reserva a una bet.
- `bank_pockets` existe con pockets `cash|bonus|freebet`, pero no hay reglas de freebet configurables.
- Fase 2A marco SL-13 como migration-first.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de Banks SL-7/SL-8/SL-10 para pockets, saldo disponible y transaction semantics.
- Depende de SL-12 para ticket con `stake_amount` definido.

## Alcance

- Permitir financiar una apuesta con montos cash, bonus y freebet.
- Validar que la suma exacta del funding sea igual a `stake_amount`.
- Reservar fondos por pocket y registrar movimientos trazables.
- Bloquear freebet si no existen reglas de retorno configuradas.

## Archivos a Tocar

- `src/app/api/bets/[betId]/fund/route.ts` si se aprueba endpoint separado.
- `src/app/api/bets/route.ts` si funding queda dentro de create bet.
- `src/lib/bets/funding-service.ts` - validacion y reserva por pocket.
- `src/lib/bets/freebet-rules.ts` - reglas de retorno configurables.
- `src/lib/bets/schemas.ts` - schema de funding mix.
- `src/lib/banks/balance.ts` - saldo disponible por pocket.
- `src/components/bets/funding-mix-form.tsx` - UI de mix.
- `src/lib/openapi/schemas/bets.ts` - actualizar contrato si se agrega ruta.

## DB/RLS Necesarios

- Migration-first: requiere tabla o columnas nuevas para `bet_funding` (`bet_id`, `pocket_type`, `amount`, `reserved_transaction_id`, `return_rule`).
- Requiere constraint `amount >= 0` y uniqueness por `bet_id + pocket_type`.
- Requiere modelo aprobado para freebet return rules; sin esto SL-14 no puede liquidar correctamente.
- Requiere transaccion atomica para descontar pockets y crear ledger por pocket.
- RLS: owner de bet/bank puede leer funding; otros usuarios no.

## API Necesaria

- Opcion A: funding incluido en `POST /api/bets` como `{ funding: { cash, bonus, freebet } }`.
- Opcion B: `POST /api/bets/{betId}/fund` con payload de funding.
- Success: `200/201` con desglose persistido y balances actualizados.
- Errors: `400` suma incorrecta/montos negativos, `403` bet ajena, `409/422` reglas freebet ausentes o saldo insuficiente.

## UI Necesaria

- Inputs para cash, bonus y freebet con sumatoria en vivo.
- Mostrar saldo disponible por pocket y error de saldo insuficiente.
- Bloquear submit si sumatoria no coincide con stake.
- `data-testid`: `fundingMixForm`, `cash_amount_input`, `bonus_amount_input`, `freebet_amount_input`, `funding_total_label`, `funding_sum_error`, `submit_funding_button`.

## Validaciones Zod

- `betId`: UUID.
- `cashAmount`, `bonusAmount`, `freebetAmount`: number finite, >= 0.
- Sumatoria debe igualar `stakeAmount` con precision/tolerancia aprobada.
- Al menos un monto > 0.
- Si `freebetAmount > 0`, reglas freebet deben existir.

## Tests Minimos

- Unit: suma exacta, montos negativos, todos cero, tolerancia de redondeo.
- Unit: freebet sin reglas bloquea.
- API: funding valido reserva cada pocket y registra ledger.
- API: saldo insuficiente por pocket no cambia DB.
- E2E: UI valida suma y confirma funding.

## Criterios de Cierre

- AC SL-13 cubiertos: mix valido, sumatoria incorrecta, freebet sin reglas.
- Modelo funding permite liquidar SL-14 sin inferencias ambiguas.
- Funding y ledger quedan atomicos.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Endpoint separado vs funding dentro de create bet.
- Reglas exactas de retorno de freebet.
- Precision/tolerancia de sumatoria.
- Se permite 100% bonus o 100% freebet.
