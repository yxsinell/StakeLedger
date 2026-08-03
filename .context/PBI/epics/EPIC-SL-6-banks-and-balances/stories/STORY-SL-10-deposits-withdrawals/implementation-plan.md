# Implementation Plan: STORY-SL-10 - Depositos y retiros

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-008
- API contract: `.context/SRS/api-contracts.yaml` `/api/transactions`

## Estado Actual Verificado

- `transactions` y `transaction_idempotencies` existen en `src/types/supabase.ts`.
- Existe `POST /api/transactions` con sesión BFF por cookie.
- La RPC `record_cash_transaction` aplica movimientos cash-only y conserva el resultado idempotente.
- Existe formulario de depósito/retiro en el detalle de bank.
- La lista histórica de movimientos continúa fuera de alcance.

## Alcance

- Registrar depositos y retiros manuales para banks propios.
- Actualizar exclusivamente cash y ledger en operación atómica.
- Validar que retiro no supere cash disponible.
- Mantener fuera de alcance: pasarelas de pago y conciliacion automatica.

## Archivos a Tocar

- `supabase/migrations/20260803174121_record_cash_transactions.sql` - RPC, tabla de idempotencia y constraint.
- `supabase/migrations/20260803174535_add_cash_transaction_replay_status.sql` - estado de replay idempotente.
- `src/app/api/transactions/route.ts` - BFF `POST`.
- `src/lib/transactions/` - schemas, servicio y prueba unitaria.
- `src/lib/openapi/schemas/transactions.ts` - contrato OpenAPI runtime.
- `src/components/banks/transaction-form.tsx` - formulario de dominio integrado en detalle de bank.

## DB/RLS Necesarios

- `transactions` restringe tipos, importe positivo y pocket válido; los nuevos depósitos/retiros con idempotencia exigen cash y método permitido.
- El contrato fija cash para depósitos y retiros.
- Métodos permitidos: `bank_transfer`, `card`, `cash`.
- RLS/grants: `authenticated` solo lee sus filas; la RPC `SECURITY DEFINER` valida `auth.uid()` y ownership antes de escribir.
- La RPC bloquea cash, actualiza pocket, inserta ledger/auditoría y persiste resultado idempotente en una transacción.

## API Necesaria

- `POST /api/transactions`.
- Request SRS: `{ bankId, type, amount, method }`.
- No acepta `pocketType`: el contrato fija cash.
- Success: `201` para movimiento nuevo y `200` para replay con `{ success, transactionId, balance }`.
- Errors: `400` validación o saldo insuficiente, `401` sin sesión, `404` genérico para bank ajeno o inexistente, `409` para payload idempotente distinto.

## UI Necesaria

- Formulario con tipo `deposit|withdraw`, monto y método; pocket fijo cash.
- Mostrar cash disponible para retiros.
- Confirmacion post-movimiento y actualizacion de balance.
- `data-testid`: `transactionForm`, `transaction_type_select`, `transaction_amount_input`, `transaction_method_select`, `submit_transaction_button`, `withdraw_insufficient_funds_error`.

## Validaciones Zod

- `bankId`: UUID.
- `type`: enum `deposit|withdraw`.
- `amount`: number finite, > 0, precision aprobada.
- `method`: enum `bank_transfer|card|cash`.
- No se acepta `pocketType`.

## Tests Minimos

- Unit: schema rechaza amount 0, type invalido y method invalido cuando haya catalogo.
- API: deposito exitoso aumenta cash y crea transaction.
- API: retiro exitoso reduce cash y crea transaction.
- API: retiro con saldo insuficiente no modifica saldo.
- API/RLS: usuario no puede crear movimiento en bank ajeno.
- E2E: formulario registra deposito/retiro y detalle actualiza balance.

## Criterios de Cierre

- AC de SL-10 cubiertos: deposito exitoso, retiro insuficiente, retiro exitoso.
- Pocket y ledger quedan consistentes despues de cada movimiento.
- Metodo y pocket destino quedan definidos, no inferidos por UI.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones cerradas

- Depósitos y retiros solo cash; métodos `bank_transfer`, `card`, `cash`.
- Importe positivo con máximo dos decimales, sin redondeo.
- `Idempotency-Key` UUID obligatorio; retry equivalente devuelve resultado previo y conflicto de payload devuelve `409`.
