# As a user, I want to sign in with email and password so that I can access my banks and bets

**Jira Key:** SL-3
**Epic:** EPIC-SL-1 (Identity and Access)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** iniciar sesion con email y password
**So that** pueda acceder a mis banks y apuestas

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Formulario de login con email y password
- Autenticacion contra Supabase Auth
- Creacion de sesion activa
- Redireccion a dashboard

### Out of Scope

- Login social
- MFA/2FA
- Remember me avanzado

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Login exitoso

- **Given:** un usuario registrado con credenciales validas
- **When:** inicia sesion con email y password correctos
- **Then:** el sistema crea una sesion y permite acceso al dashboard

### Scenario 2: Password incorrecto

- **Given:** un usuario registrado
- **When:** ingresa un password incorrecto
- **Then:** el sistema rechaza el login y muestra un mensaje de error

### Scenario 3: Email no registrado

- **Given:** un email que no existe en el sistema
- **When:** intenta iniciar sesion
- **Then:** el sistema rechaza el login y muestra un mensaje adecuado

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Credenciales deben ser validas
- Limitar intentos para reducir fuerza bruta

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario abre login
2. Ingresa email y password
3. Sistema valida y crea sesion
4. Usuario accede al dashboard

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario de login con validaciones inline
- Manejo de mensajes de error

### Backend

- Integracion con Supabase Auth para sign-in
- Emision y refresh de tokens de sesion

### Database

- Tablas de perfiles vinculadas a Auth
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-2 (registro) para pruebas end-to-end

### Blocks

- Acceso a banks, apuestas y recomendaciones

### Related Stories

- SL-2 (registro)
- SL-4 (password reset)

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

See: `.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-3-user-login/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Considerar rate limiting en intentos fallidos

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-1-identity-and-access/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-002)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
