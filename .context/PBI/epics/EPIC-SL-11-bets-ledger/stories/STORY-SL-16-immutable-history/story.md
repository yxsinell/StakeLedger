# As a user, I want an immutable history of movements and adjustments so that I can audit changes

**Jira Key:** SL-16
**Epic:** EPIC-SL-11 (Bets Ledger)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** tener un historial inmutable de movimientos y ajustes
**So that** pueda auditar cambios

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Registrar eventos de movimientos y ajustes con timestamp
- Prohibir edicion/borrado de eventos
- Consultar historial por entidad

### Out of Scope

- Exportaciones avanzadas
- Integraciones con herramientas externas de auditoria

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Registrar evento en audit log

- **Given:** una operacion de bank o bet
- **When:** se ejecuta la operacion
- **Then:** el sistema registra un evento inmutable en el audit log

### Scenario 2: Intento de modificar evento

- **Given:** un evento ya registrado
- **When:** un usuario intenta editar o borrar
- **Then:** el sistema bloquea la accion y mantiene el evento

### Scenario 3: Consulta por entidad

- **Given:** un usuario autenticado
- **When:** solicita el historial de una entidad propia
- **Then:** el sistema devuelve eventos ordenados por fecha

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Eventos inmutables (write-once)
- Acceso solo al owner/admin

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Operacion crea evento
2. Evento se guarda con timestamp
3. Usuario consulta historial

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Vista de historial por entidad

### Backend

- Tabla de audit log append-only
- Indexar por entity_type y entity_id

### Database

- Audit Log
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-12 (registro de ticket)
- SL-14 (liquidacion)

### Blocks

- Reportes y metricas futuras

### Related Stories

- SL-14
- SL-15

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

See: `.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-16-immutable-history/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir retencion y consulta eficiente de eventos

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-11-bets-ledger/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-013)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
