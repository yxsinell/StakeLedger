# Implementation Plan: STORY-SL-19 - Ingreso manual unnormalized

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-015
- API contract: `.context/SRS/api-contracts.yaml` `/api/catalog/manual`

## Estado Actual Verificado

- No existe `src/app/api/catalog/manual/route.ts`.
- No hay tablas `catalog_*` en `src/types/supabase.ts`.
- No existe formulario manual de catalogo.
- OpenAPI declara `CatalogManualRequest` con `type`, `rawText`, `country?` y requiere `type`, `rawText`.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de SL-18 para flujo completo desde empty state del autocomplete.
- No depende de Banks, pero el resultado se usa en bets y recommendations.
- SL-20 depende de estos registros para mantenimiento posterior.

## Alcance

- Crear registro manual con `normalization_status=UNNORMALIZED`.
- Capturar `type`, `rawText` y `country` si se confirma.
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

- Migration-first: requiere tabla/modelo de catalogo con `raw_text`, `entity_type`, `country`, `normalization_status`, `created_by`.
- Definir enum exacto de `normalization_status`; story usa `UNNORMALIZED`.
- Definir dedupe minimo para evitar duplicados obvios por `created_by + entity_type + normalized raw_text` si aplica.
- RLS: usuario autenticado crea/lee sus manual entries si no son globales; admin/editor puede normalizar en SL-20.
- Indices por `created_by`, `entity_type`, `normalization_status`.

## API Necesaria

- `POST /api/catalog/manual` con `{ type, rawText, country? }`.
- Success: `201` con `{ success, itemId }`.
- Errors: `400` rawText vacio/type invalido/country invalido, `401`, `409` duplicado si se aprueba.

## UI Necesaria

- Formulario manual desde empty state de autocomplete.
- Campos raw text, type y country.
- Confirmacion visible tras guardar y retorno al flujo original.
- `data-testid`: `manualEntryForm`, `manual_raw_text_input`, `manual_type_select`, `manual_country_input`, `submit_manual_entry_button`, `manual_entry_error`.

## Validaciones Zod

- `type`: enum `team|competition`; decidir si mayusculas se normalizan o rechazan.
- `rawText`: string trim, min 1, max pendiente.
- `country`: opcional segun OpenAPI actual, formato ISO si se confirma.
- Rechazar raw text solo espacios.

## Tests Minimos

- Unit: rawText vacio/espacios y type invalido.
- API: crea entry `UNNORMALIZED` con type valido.
- API: `TEAM` mayuscula segun decision aprobada.
- API/RLS: usuario no puede modificar entry ajena si hay ownership.
- E2E: empty autocomplete abre manual form y guarda.

## Criterios de Cierre

- AC SL-19 cubiertos: ingreso exitoso, texto requerido, tipo invalido.
- `normalization_status` exacto definido en DB/API/tests.
- Manual entry queda disponible para workflows dependientes sin marcarse normalizado.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- `country` obligatorio u opcional.
- Min/max y caracteres permitidos para `rawText`.
- Normalizar o rechazar `type` en mayusculas.
- Dedupe manual entries en MVP.
