# As a user, I want to register with email and password so that I can access the platform

**Jira Key:** SL-2
**Epic:** EPIC-SL-1 (Identity and Access)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** registrarme con email y password
**So that** pueda acceder a la plataforma de forma segura

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Formulario de registro con email y password
- Validacion de formato de email y fortaleza de password
- Verificacion de email unico
- Creacion de usuario en Supabase Auth
- Confirmacion de registro exitoso

### Out of Scope

- Login social (Google/Apple)
- MFA/2FA
- Registro por invitacion

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Registro exitoso

- **Given:** un usuario con email no registrado y password valida
- **When:** completa el formulario y confirma el registro
- **Then:** el sistema crea la cuenta y devuelve confirmacion de registro

### Scenario 2: Email ya registrado

- **Given:** un email que ya existe en el sistema
- **When:** intenta registrarse con ese email
- **Then:** el sistema rechaza el registro y muestra un mensaje claro

### Scenario 3: Password debil

- **Given:** un email valido y un password que no cumple la politica
- **When:** intenta registrarse
- **Then:** el sistema muestra errores de validacion y no crea la cuenta

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Email debe ser unico y valido
- Password minimo 8 caracteres, 1 mayuscula y 1 numero

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario abre registro
2. Completa email y password
3. Sistema valida y crea cuenta
4. Usuario recibe confirmacion

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario de registro con validaciones inline
- Mensajes de error consistentes

### Backend

- Integracion con Supabase Auth para sign-up
- Manejo de errores y respuesta clara

### Database

- Tabla de perfiles vinculada a Auth (segun schema real)
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Proveedor de email para confirmacion/reset (si aplica)

---

## Dependencies

### Blocked By

- Ninguna

### Blocks

- Registro de banks, apuestas y recomendaciones

### Related Stories

- SL-3 (login)
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

See: `.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-2-user-registration-email/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Mantener mensajes de validacion alineados con la politica de password

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-1-identity-and-access/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-001)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
