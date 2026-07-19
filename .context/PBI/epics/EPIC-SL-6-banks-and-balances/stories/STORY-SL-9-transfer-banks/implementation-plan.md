# Implementation Plan: STORY-SL-9 - Transferir fondos entre banks

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-007
- API contract: `.context/SRS/api-contracts.yaml` `/api/banks/{bankId}/transfer`

## Estado Actual Verificado

- No existe endpoint transfer.
- `transactions` existe con `bank_id`, `pocket_type`, `type`, `amount`, `method`.
- No hay campo visible para `to_bank_id`, transfer group/idempotency key, signed amount o double-entry link.
- No hay UI real de transferencias.
- Fase 2A marco transfer semantics como migration-first.

## Alcance

- Transferir monto entre banks del mismo usuario.
- Validar ownership de origen y destino, saldo suficiente y monto > 0.
- Debitar y acreditar pockets de forma atomica.
- Registrar ledger de transferencia con doble asiento o modelo equivalente trazable.
- Mantener fuera de alcance: transferencias entre usuarios o banks externos.

## Archivos a Tocar

- `src/app/api/banks/[bankId]/transfer/route.ts` - crear endpoint.
- `src/lib/banks/transfer-service.ts` - validaciones y atomicidad.
- `src/lib/banks/schemas.ts` - `TransferRequestSchema`.
- `src/lib/banks/balance.ts` - saldo disponible por pocket.
- `src/lib/openapi/schemas/banks.ts` - schemas transfer.
- `src/app/dashboard/banks/[bankId]/transfer/page.tsx` o modal dentro detalle.
- `src/components/banks/transfer-form.tsx` - formulario dominio si se separa UI.

## DB/RLS Necesarios

- Requiere decision/migracion para representar doble asiento: por ejemplo `transfer_id`, `direction`, `related_transaction_id`, o signed amounts.
- Considerar `idempotency_key` unico por usuario para retries.
- Constraint: `amount > 0`, pocket_type valido, banks mismo owner.
- Si transferencias entre currencies se bloquean, constraint/validacion debe exigir misma `currency`.
- RLS: solo owner puede modificar pockets/transactions de ambos banks.
- RPC/transaction DB recomendado para evitar estado parcial.

## API Necesaria

- `POST /api/banks/{bankId}/transfer`.
- Request: `{ toBankId, amount, pocketType }` y opcional `idempotencyKey` si se aprueba.
- Success: `200` con `{ success: true }` y balances actualizados si se extiende contrato.
- Errors: `400` monto invalido/saldo insuficiente/mismo bank/currency invalida, `401`, `403` bank ajeno, `404` bank no existe.

## UI Necesaria

- Selector bank origen/destino, pocket, monto.
- Mostrar saldo disponible antes de confirmar.
- Estados de saldo insuficiente y permisos.
- `data-testid`: `transferForm`, `from_bank_select`, `to_bank_select`, `transfer_pocket_select`, `transfer_amount_input`, `submit_transfer_button`, `insufficient_funds_error`.

## Validaciones Zod

- `bankId` y `toBankId`: UUID.
- `amount`: number finite, > 0, precision aprobada.
- `pocketType`: enum `cash|bonus|freebet`.
- `toBankId !== bankId` salvo decision explicita de transfer intra-bank.
- `idempotencyKey`: string UUID/header si se adopta.

## Tests Minimos

- Unit: schema rechaza amount 0, UUID invalido y pocket invalido.
- Unit: saldo insuficiente por pocket.
- API: transferencia exitosa deja origen/destino con balances correctos y ledger doble.
- API: bank destino ajeno devuelve `403` y no modifica saldos.
- API: retry con idempotency key no duplica asientos si se implementa.
- E2E: formulario transfiere y detalle refleja saldos.

## Criterios de Cierre

- AC de SL-9 cubiertos: exito, saldo insuficiente, bank ajeno.
- No existe estado parcial si falla una parte de la transferencia.
- Ledger permite explicar debit/acredit de la transferencia.
- Decision de currencies, pocket destino e idempotencia queda cerrada o marcada como blocker.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Definir si se permiten banks de distinta moneda.
- Definir si destino puede ser pocket distinto o siempre mismo `pocketType`.
- Definir estrategia de idempotencia.
- Definir modelo DB exacto de doble asiento.
