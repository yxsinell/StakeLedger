# Implementation Plan: STORY-SL-19 - Ingreso manual `manual`

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-015
- API contract: `.context/SRS/api-contracts.yaml` `/api/catalog/manual`

## Estado Actual Verificado

- No existe `src/app/api/catalog/manual/route.ts`.
- `src/types/supabase.ts` contiene tablas `catalog_*`.
- No existe formulario manual de catalogo.
- OpenAPI declara `CatalogManualRequest` con `type`, `rawText`, `country?` y requiere `type`, `rawText`.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de SL-18 para flujo completo desde empty state del autocomplete.
- No depende de Banks, pero el resultado se usa en bets y recommendations.
- SL-20 depende de estos registros para mantenimiento posterior.

## Alcance

- Crear registro manual con `normalization_status='manual'`.
- Capturar `type`, `rawText` y `country?`.
- Permitir que el ticket/recommendation use la entidad como no normalizada donde sea aceptado.
- Mantener fuera de alcance normalizacion automatica posterior.

## Archivos a Tocar

- `src/app/api/catalog/manual/route.ts` - create manual entry.
- `src/lib/catalog/manual-service.ts` - persistencia y dedupe basico.
- `src/lib/catalog/schemas.ts` - `CatalogManualRequestSchema`.
- `src/components/catalog/manual-entry-form.tsx` - formulario manual.
- `src/components/catalog/catalog-autocomplete.tsx` - CTA a manual entry.
- `src/lib/openapi/schemas/catalog.ts` - schemas manual.

## DB/RLS Necesarios

- Usar `catalog_teams` y `catalog_competitions` existentes; `name` almacena `rawText` trimmeado.
- Enum exacto de `normalization_status`: `manual`.
- `created_by` registra el usuario que crea la entrada manual.
- Writes directos de catálogo están revocados para `authenticated`; el BFF autenticado crea filas `manual` mediante RPC service-role validada.
- Preflight completado: historial RBAC remoto/local reconciliado como `20260816145742_add_admin_role_management.sql`.
- No se requiere dedupe global para manual MVP; duplicados manuales son trabajo editorial posterior.

## API Necesaria

- `POST /api/catalog/manual` con `{ type, rawText, country? }`.
- Success: `201` con `{ success, item }` e `isNormalized=false`.
- Errors: `400` rawText vacio/type invalido/country invalido, `401`, `409` duplicado si se aprueba.

## UI Necesaria

- Formulario manual desde empty state de autocomplete.
- Campos raw text, type y country.
- Confirmacion visible tras guardar y retorno al flujo original.
- `data-testid`: `manualEntryForm`, `manual_raw_text_input`, `manual_type_select`, `manual_country_input`, `submit_manual_entry_button`, `manual_entry_error`.

## Validaciones Zod

- `type`: enum estricto `team|competition`; mayusculas se rechazan con `VALIDATION_ERROR`.
- `rawText`: string trim, min 1, max 100.
- `country`: opcional, string trim max 100.
- Rechazar raw text solo espacios.

## Tests Minimos

- Unit: rawText vacio/espacios y type invalido.
- API: crea entry `manual` con type valido.
- API: `TEAM` mayuscula se rechaza.
- API/RLS: usuario no puede modificar entry ajena si hay ownership.
- E2E: empty autocomplete abre manual form y guarda.

## Criterios de Cierre

- AC SL-19 cubiertos: ingreso exitoso, texto requerido, tipo invalido.
- `normalization_status='manual'` definido en DB/API/tests.
- Manual entry queda disponible para workflows dependientes sin marcarse normalizado.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Ninguna bloqueante. Dedupe manual queda fuera de alcance MVP.
