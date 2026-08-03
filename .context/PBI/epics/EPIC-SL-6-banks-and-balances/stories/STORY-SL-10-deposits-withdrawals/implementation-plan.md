# Implementation Plan: STORY-SL-10 - Depositos y retiros

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-008
- API contract: `.context/SRS/api-contracts.yaml` `/api/transactions`

## Estado Actual Verificado

- `transactions` existe en `src/types/supabase.ts`.
- No existe `src/app/api/transactions/route.ts`.
- `transactions.type` ya restringe `deposit`, `withdraw`, tipos de transferencia y otros asientos de ledger.
- No hay UI real de depositos/retiros.
- No hay UI real de movimientos.

## Alcance

- Registrar depositos y retiros manuales para banks propios.
- Actualizar exclusivamente cash y ledger en operación atómica.
- Validar que retiro no supere cash disponible.
- Mantener fuera de alcance: pasarelas de pago y conciliacion automatica.

## Archivos a Tocar

- `src/app/api/transactions/route.ts` - crear `POST`.
- `src/lib/transactions/schemas.ts` - schema deposit/withdraw.
- `src/lib/transactions/service.ts` - aplicar movimiento y ledger.
- `src/lib/banks/balance.ts` - reutilizar saldo disponible.
- `src/lib/openapi/schemas/transactions.ts` - schemas OpenAPI.
- `src/lib/openapi/schemas/index.ts` - exportar transactions schemas.
- `src/components/banks/transaction-form.tsx` - formulario dominio.
- `src/app/dashboard/banks/[bankId]/page.tsx` - integrar acciones deposito/retiro.

## DB/RLS Necesarios

- `transactions` ya restringe tipos, importe positivo y pocket válido; evaluar migration solo para atomicidad RPC y catálogo de métodos.
- El contrato fija cash para depósitos y retiros.
- Métodos permitidos: `bank_transfer`, `card`, `cash`.
- RLS: owner puede insertar/leer movimientos de banks propios; no puede afectar bank ajeno.
- RPC/transaction DB recomendado para actualizar pocket + insertar transaction sin parcialidad.

## API Necesaria

- `POST /api/transactions`.
- Request SRS: `{ bankId, type, amount, method }`.
- No acepta `pocketType`: el contrato fija cash.
- Success: `201` con `{ success, transactionId, balance }`.
- Errors: `400` validacion/saldo insuficiente/metodo invalido, `401`, `403` bank ajeno, `404` bank inexistente.

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
