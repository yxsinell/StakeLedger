# Implementation Plan: STORY-SL-7 - Crear bank con pockets

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-005
- API contract: `.context/SRS/api-contracts.yaml` `/api/banks`

## Estado Actual Verificado

- `src/app/api/example/route.ts` crea solo `banks`; es prototipo, no contrato SRS.
- No existe `src/app/api/banks/route.ts`.
- `src/types/supabase.ts` contiene `banks`, `bank_pockets`, `transactions`.
- `bank_pockets.pocket_type` acepta `cash|bonus|freebet`.
- `transactions.type` es `text` sin check/enum visible en types.
- `QuickActionsPanel` tiene UI demo de crear bank, sin envio real ni campos de montos iniciales completos.

## Alcance

- Crear bank con nombre, moneda y tres pockets `cash`, `bonus`, `freebet`.
- Registrar tres transacciones `initial_deposit`, una por cada pocket con monto inicial positivo.
- Ejecutar bank+pockets+ledger en operacion atomica.
- Mantener fuera de alcance: banks compartidos, proveedores externos, importacion.

## Archivos a Tocar

- `src/app/api/banks/route.ts` - crear `GET` list y `POST` create.
- `src/app/api/example/route.ts` - eliminar, deprecar o dejar fuera de navegacion en slice posterior.
- `src/lib/banks/schemas.ts` - schema Zod de create/list.
- `src/lib/banks/service.ts` - atomicidad y mapping de respuesta.
- `src/lib/openapi/schemas/banks.ts` - schemas OpenAPI.
- `src/lib/openapi/schemas/index.ts` - exportar banks schemas.
- `src/components/dashboard/quick-actions.tsx` - reemplazar demo por formulario real o mover a componente dominio.
- `src/app/dashboard/page.tsx` - refrescar/listar banks desde API o server query consistente.

## DB/RLS Necesarios

- Definir fuente de migraciones antes de cambios DB; Fase 2A detecto ausencia de migrations locales.
- Confirmar constraints: `amount > 0` en transacciones iniciales, `balance >= 0`, currency `EUR|USD|ARS`, y `transactions.type` incluye `initial_deposit`.
- Si Supabase REST no permite transaccion multi-step segura desde app con anon key, crear RPC o usar server-side transactional strategy aprobada.
- RLS: owner puede insertar/leer sus `banks`, `bank_pockets`, `transactions`; otro usuario no.
- Hardening: `(select auth.uid())` en policies y grants GraphQL segun advisors.

## API Necesaria

- `POST /api/banks` con `{ name, currency, initialCash, initialBonus, initialFreebet }`.
- `GET /api/banks` para listar banks del usuario con pockets.
- Success create: `201` con `BankResponse` y balances.
- Errors: `401` anon, `400` validacion, `500` errores inesperados sin detalles internos.
- Respuesta debe envolver datos segun SRS `{ success, bank }` o actualizar contrato.

## UI Necesaria

- Formulario crear bank con name, currency, initialCash, initialBonus, initialFreebet.
- `data-testid`: `createBankDialog`, `bank_name_input`, `bank_currency_select`, `initial_cash_input`, `initial_bonus_input`, `initial_freebet_input`, `confirm_bank_button`.
- Estados de validacion inline y confirmacion post-create.
- Actualizar lista de banks sin depender de demo visual.

## Validaciones Zod

- `name`: trim, min 1, max 100.
- `currency`: ISO 4217 uppercase o lista aprobada (`EUR`, `USD`, `ARS` si se confirma).
- Montos iniciales: number finite, > 0, maximo dos decimales y rechazo sin redondeo.
- Body JSON invalido -> validation error.

## Tests Minimos

- Unit: schema rechaza name vacio, monto negativo y currency invalida.
- API: create exitoso crea bank, 3 pockets y ledger inicial atomico.
- API: montos cero, negativos o con mas de dos decimales no crean filas.
- API/RLS: usuario no puede leer bank ajeno.
- E2E: formulario crea bank y lista refleja pockets.

## Criterios de Cierre

- AC de SL-7 cubiertos: creacion exitosa, monto negativo, nombre requerido.
- `api/example` deja de ser referencia funcional para banks.
- Operacion atomica demostrada por test de error parcial.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Definir lista/formato de moneda.
- Definir precision y redondeo de montos.
- Definir si nombres duplicados por usuario se permiten.
- Definir tipo exacto de ledger inicial.
