# As an admin, I want to publish recommendations with normalized data and ICP so that users can follow them

**Jira Key:** SL-28
**Epic:** EPIC-SL-27 (Recommendations and Insights)
**Priority:** Medium
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** admin
**I want to** publicar recomendaciones con datos normalizados y ICP
**So that** los usuarios puedan seguirlas

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Crear recomendacion con evento, mercado, odds, type (pre/live) e ICP
- Validar que el evento este normalizado
- Publicar en feed

### Out of Scope

- Publicacion automatica masiva
- Recomendaciones con datos no normalizados

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Publicacion exitosa

- **Given:** un admin autenticado
- **When:** crea una recomendacion con datos normalizados validos y type definido
- **Then:** el sistema publica la recomendacion en el feed

### Scenario 2: Evento no normalizado

- **Given:** un admin autenticado
- **When:** intenta publicar con evento no normalizado
- **Then:** el sistema bloquea la publicacion con error

### Scenario 3: Usuario sin permisos

- **Given:** un usuario no admin/editor
- **When:** intenta publicar una recomendacion
- **Then:** el sistema rechaza la accion por permisos

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Solo admin/editor puede publicar
- Datos deben estar normalizados

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Admin crea recomendacion
2. Sistema valida normalizacion
3. Recomendacion publicada en feed

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de creacion de recomendaciones

### Backend

- Validar normalizacion antes de publicar
- Registrar recomendacion con ICP

### Database

- Recommendations, Events
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-17 (catalogo normalizado)

### Blocks

- SL-29 (feed filtrable)

### Related Stories

- SL-29

---

## Definition of Done

- [ ] Codigo implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integracion (API + DB)
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado (2 reviewers)
- [ ] Documentacion actualizada (README, API docs)
- [ ] Deployed to staging
- [ ] QA testing passed
- [ ] Acceptance criteria validated
- [ ] No critical/high bugs open

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-28-publish-recommendations/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir campos ICP requeridos

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-27-recommendations-insights/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-022)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
