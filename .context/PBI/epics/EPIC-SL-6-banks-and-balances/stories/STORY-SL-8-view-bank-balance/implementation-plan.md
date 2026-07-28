# Implementation Plan: STORY-SL-8 - Ver saldo operativo y pockets

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-006
- API contract: `.context/SRS/api-contracts.yaml` `/api/banks/{bankId}`

## Estado Actual Verificado

- `src/app/dashboard/page.tsx` lista bancos recientes con pockets por server query.
- No existe detalle `/banks/[bankId]` ni `/dashboard/banks/[bankId]`.
- No existe `src/app/api/banks/[bankId]/route.ts`.
- No hay formula implementada para `saldo_operativo`; dashboard muestra yield demo.
- `src/lib/types.ts` define `BankWithPockets` con `pocket_type` y `balance`.

## Alcance

- Mostrar detalle de un bank del usuario con desglose `cash`, `bonus`, `freebet`.
- Calcular y devolver saldo operativo.
- Bloquear acceso a bank ajeno.
- Mantener fuera de alcance: reportes historicos y exportaciones.

## Archivos a Tocar

- `src/app/api/banks/[bankId]/route.ts` - crear `GET` detail.
- `src/lib/banks/balance.ts` - formula de balances y operative balance.
- `src/lib/banks/schemas.ts` - params/payload schemas.
- `src/app/dashboard/banks/[bankId]/page.tsx` o `src/app/banks/[bankId]/page.tsx` - crear vista detalle segun routing aprobado.
- `src/app/dashboard/page.tsx` - linkear items a detalle y usar helper de balances.
- `src/lib/openapi/schemas/banks.ts` - BankResponse con balances.
- `src/components/layout/app-sidebar.tsx` - actualizar nav banks cuando exista ruta real.

## DB/RLS Necesarios

- No requiere tabla nueva si pockets guardan saldos actuales.
- RLS debe denegar banks/pockets de otro usuario; API responde `404` generico para bank inexistente o ajeno.
- Considerar view/RPC de balance solo si evita duplicar formula o mejora atomicidad.
- Hardening RLS y grants GraphQL segun advisors si hay migracion.

## API Necesaria

- `GET /api/banks/{bankId}`.
- Response: `{ success, bank: { id, name, currency, balances: { cash, bonus, freebet, operative } } }`.
- Errors: `401` anon, `404` generico para bank ajeno o inexistente.
- Debe usar auth server helper y owner filter.

## UI Necesaria

- Vista detalle con cards por pocket y saldo operativo destacado.
- Estado vacio para bank sin movimientos adicionales.
- Estados de error: acceso denegado, bank inexistente, loading/skeleton si client component.
- `data-testid`: `bankDetailPage`, `operative_balance`, `cash_balance`, `bonus_balance`, `freebet_balance`, `bank_not_found`, `bank_forbidden`.

## Validaciones Zod

- `bankId`: UUID.
- No aceptar path param invalido; responder `400` o `404` segun patron de API definido.
- Balance formatter debe preservar precision monetaria definida.

## Tests Minimos

- Unit: formula de saldo operativo con combinaciones de pockets.
- API: bank propio devuelve pockets y operative balance.
- API: bank ajeno devuelve `404` generico.
- API: bank inexistente devuelve `404`.
- E2E: usuario abre detalle y ve cards con saldos correctos.

## Criterios de Cierre

- AC de SL-8 cubiertos: saldo/desglose, bank ajeno, bank sin movimientos.
- Formula de saldo operativo documentada con ejemplos.
- API y UI usan misma formula.
- Tests prueban ownership y bank inexistente.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Saldo operativo = cash disponible.
- Maximo dos decimales; rechazar sin redondeo.
- Bank ajeno o inexistente responde `404` generico.
