# As a user, I want to reset my password if I forget it so that I can regain access

**Jira Key:** SL-4
**Epic:** EPIC-SL-1 (Identity and Access)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** recuperar mi password
**So that** pueda volver a acceder a la plataforma

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Solicitud de reset con email
- Envio de link de recuperacion
- Validacion de link y actualizacion de password

### Out of Scope

- MFA/2FA
- Recuperacion por SMS

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Solicitud de reset exitosa

- **Given:** un usuario registrado con email valido
- **When:** solicita recuperar password
- **Then:** el sistema envia un email con link de reset

### Scenario 2: Email no registrado

- **Given:** un email que no existe en el sistema
- **When:** solicita recuperar password
- **Then:** el sistema muestra un mensaje generico sin revelar existencia

### Scenario 3: Link expirado o invalido

- **Given:** un link de reset expirado o invalido
- **When:** el usuario intenta cambiar su password
- **Then:** el sistema rechaza la operacion y solicita nueva solicitud

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- El link de reset debe tener expiracion
- No revelar si el email existe

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario solicita reset
2. Sistema envia link
3. Usuario establece nuevo password
4. Sistema confirma cambio

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario de solicitud de reset y set de nuevo password
- Mensajes genericos en error de email inexistente

### Backend

- Flujo de reset en Supabase Auth
- Validacion de token de reset

### Database

- Tablas de perfiles vinculadas a Auth
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Proveedor de email para envio de reset

---

## Dependencies

### Blocked By

- SL-2 (registro) para pruebas end-to-end

### Blocks

- Acceso continuo a la plataforma

### Related Stories

- SL-2 (registro)
- SL-3 (login)

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

See: `.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-4-password-recovery/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Evitar fugas de informacion sobre existencia de cuentas

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-1-identity-and-access/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-003)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
