# Identity and Access

**Jira Key:** SL-1
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Foundation

---

## Epic Description

Esta epica establece el acceso base a StakeLedger: registro, inicio de sesion y recuperacion de password para usuarios finales. Define el flujo de autenticacion con validaciones de credenciales y manejo de sesiones para garantizar acceso seguro a datos financieros.

Incluye la gestion de roles (admin, editor, user) para controlar permisos en UI y endpoints. Este control de acceso es un prerequisito para operar banks, apuestas, catalogo y recomendaciones.

**Business Value:**
Sin identidad y permisos confiables no es posible asegurar saldos, tickets y rendimiento. Esta epica habilita el onboarding y reduce riesgo operacional desde el primer uso.

---

## User Stories

1. **SL-2** - Como usuario, quiero registrarme con email y password para acceder a la plataforma.
2. **SL-3** - Como usuario, quiero iniciar sesion para ver mis banks y apuestas.
3. **SL-4** - Como usuario, quiero recuperar mi password si lo olvido.
4. **SL-5** - Como admin, quiero gestionar roles (admin, editor, user) para controlar permisos.

---

## Scope

### In Scope

- Registro con email y password con validaciones de formato y fortaleza
- Inicio de sesion y creacion de sesion activa
- Recuperacion de password por email
- Asignacion y enforcement de roles (admin, editor, user)
- Control de acceso a UI y endpoints segun rol

### Out of Scope (Future)

- Login social (Google, Apple, etc.)
- MFA/2FA y SSO empresarial
- Auditoria avanzada de accesos
- Gestion de usuarios multi-tenant

---

## Acceptance Criteria (Epic Level)

1. ✅ Usuarios pueden registrarse, iniciar sesion y recuperar password con validaciones consistentes.
2. ✅ Roles admin/editor/user se aplican en UI y endpoints sensibles.
3. ✅ Sesiones expiran y se invalidan correctamente al cerrar sesion.
4. ✅ Flujos de error muestran mensajes claros sin exponer datos sensibles.

---

## Related Functional Requirements

- **FR-001:** Registro de usuarios con email y password
- **FR-002:** Inicio de sesion
- **FR-003:** Recuperacion de password
- **FR-004:** Roles y permisos

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Autenticacion y Sesiones

- Integrar Supabase Auth para registro, login y reset
- Validar password policy y email unico
- Gestionar tokens de sesion y refresh

### Database Schema

**Tables:**
- Usuarios y perfiles vinculados a Auth
- Roles y permisos (segun esquema real)

**IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP para schema real.

### Security Requirements

- Password policy minima (8 chars, 1 mayuscula, 1 numero)
- Rate limiting en login y reset
- RBAC aplicado en backend y UI

---

## Dependencies

### External Dependencies

- Supabase Auth
- Servicio de email para reset

### Internal Dependencies

- Ninguna (epica fundacional)

### Blocks

- EPIC-SL-02 Banks and Balances
- EPIC-SL-03 Bets Ledger
- EPIC-SL-04 Catalog and Normalization
- EPIC-SL-05 Goals and Risk Advisor
- EPIC-SL-06 Recommendations and Insights

---

## Success Metrics

### Functional Metrics

- Tasa de registro exitoso > 95%
- Tasa de login exitoso > 97%
- Recuperacion de password exitosa > 90%

### Business Metrics

- Activacion inicial (registro + primer login) >= objetivo MVP
- Retencion semanal alineada al KPI del MVP

---

## Risks & Mitigations

| Risk                               | Impact | Probability | Mitigation                               |
| ---------------------------------- | ------ | ----------- | ---------------------------------------- |
| Configuracion incorrecta de Auth   | High   | Medium      | Checklist y pruebas E2E tempranas        |
| Entregabilidad de email de reset   | Medium | Medium      | Proveedor confiable + monitoreo          |
| RBAC incompleto en endpoints       | High   | Medium      | Tests de integracion por rol             |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-1-identity-and-access/feature-test-plan.md`

### Test Coverage Requirements

- **Unit Tests:** validaciones de inputs y utilidades de auth
- **Integration Tests:** flujos de registro/login/reset con Supabase
- **E2E Tests:** registro, login, reset y permisos por rol

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SL-1-identity-and-access/feature-implementation-plan.md`

### Recommended Story Order

1. [SL-2] - Registro con email y password
2. [SL-3] - Inicio de sesion
3. [SL-4] - Recuperacion de password
4. [SL-5] - Gestion de roles y permisos

### Estimated Effort

- **Development:** 1-2 sprints
- **Testing:** 1 sprint
- **Total:** 2 sprints

---

## Notes

- Mantener consistencia de mensajes de error y estado de sesion

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-001 a FR-004)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
