## Feature Test Plan - Generated 2026-03-10

**QA Lead:** AI-Generated
**Status:** Draft - Pending Team Review

---

# Feature Test Plan: EPIC-SL-6 - Banks and Balances

**Fecha:** 2026-03-10
**QA Lead:** AI-Generated
**Epic Jira Key:** SL-6
**Status:** Draft

---

## Business Context Analysis

### Business Value

Esta epica habilita el ledger financiero base: separar cash/bonus/freebet, mantener saldos consistentes y garantizar trazabilidad. Sin esto, no se puede medir rendimiento real ni aplicar reglas de riesgo con confianza.

**Key Value Proposition:**

- Separacion clara de saldos por pocket con trazabilidad contable.
- Confianza en saldos operativos para decisiones de stake y gestion del bank.

**Success Metrics (KPIs):**

- 30% de usuarios crean al menos 1 bank y registran 5 apuestas en 14 dias.
- 200 usuarios activos en 60 dias.

**User Impact:**

- Carlos Vega (recreacional): necesita separar cash/bonus/freebet para no distorsionar su balance.
- Laura Rios (avanzada): requiere un ledger auditable para analisis y confianza en metricas.
- Miguel Santos (tipster): necesita consistencia en saldos para recomendaciones trazables.

**Critical User Journeys:**

- Journey 1: Registro y primera apuesta (creacion de bank y saldos iniciales).

---

## Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Componentes a crear/modificar: formulario de creacion de bank, vista de detalle de bank, UI de transferencias, UI de depositos/retiros.
- Paginas/rutas afectadas: /banks, /banks/[bankId] (o equivalente).

**Backend:**

- APIs a crear/modificar:
  - POST /api/banks
  - GET /api/banks
  - GET /api/banks/{bankId}
  - PUT /api/banks/{bankId}
  - POST /api/banks/{bankId}/transfer
  - POST /api/transactions
- Servicios de negocio afectados: calculo de saldos, ledger, validaciones de ownership.

**Database:**

- Tablas involucradas: banks, bank_pockets, transactions.
- Queries criticos: agregaciones de saldo por pocket, inserciones atomicas de ledger, doble asiento en transferencias.

**External Services:**

- No aplica para esta epica.

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend <-> Backend API (banks, transfer, transactions)
- Backend <-> Database (ledger y balances)
- Backend <-> Auth/RLS (ownership y permisos)

**External Integration Points:**

- N/A

**Data Flow:**

```
User -> Frontend -> API Routes -> Database
                     -> Auth (ownership/RLS)
```

---

## Risk Analysis

### Technical Risks

#### Risk 1: Ledger desbalanceado por operaciones no atomicas

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend / Database
- **Mitigation Strategy:**
  - Operaciones atomicas en transferencias y transacciones.
  - Tests de integracion con dobles asientos.
- **Test Coverage Required:** integration tests + API tests para transferencias/depositos/retiros.

#### Risk 2: Regla de saldo operativo ambigua o incorrecta

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend / Frontend
- **Mitigation Strategy:**
  - Definir regla explicita y validarla con PO.
  - Tests de unidad y contrato para calculo.
- **Test Coverage Required:** unit tests de calculo + validacion UI/API.

#### Risk 3: Ownership/RLS incorrecto

- **Impact:** High
- **Likelihood:** Low
- **Area Affected:** Security / Integration
- **Mitigation Strategy:**
  - Validaciones de ownership en API.
  - Tests negativos con bank ajeno.
- **Test Coverage Required:** API tests de permisos + E2E negativo.

---

### Business Risks

#### Risk 1: Saldos incorrectos erosionan la confianza del usuario

- **Impact on Business:** baja adopcion, menor retencion
- **Impact on Users:** todas las personas
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Validaciones de ledger y saldo operativo.
  - Escenarios de edge cases y reconciliacion basica.
- **Acceptance Criteria Validation:** asegurar AC con saldo correcto y validaciones de monto.

#### Risk 2: Fricciones en depositos/retiros reducen uso

- **Impact on Business:** menor uso recurrente
- **Impact on Users:** Carlos Vega
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - UX clara en validaciones y mensajes de error.
  - Tests de error y boundary.

---

### Integration Risks

#### Integration Risk 1: Frontend <-> API inconsistentes

- **Integration Point:** Frontend <-> API
- **What Could Go Wrong:** payloads incompletos, errores de validacion no manejados
- **Impact:** Medium
- **Mitigation:**
  - Contract testing con OpenAPI
  - E2E de formularios

#### Integration Risk 2: API <-> Database no atomico

- **Integration Point:** API <-> Database
- **What Could Go Wrong:** doble asiento incompleto o saldos fuera de sync
- **Impact:** High
- **Mitigation:**
  - Integration tests con transacciones DB
  - Simulacion de fallos y retries

---

## Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Definicion exacta de saldo operativo

- **Found in:** STORY-SL-8 / Epic notes
- **Question for PO:** El saldo operativo es suma de cash+bonus+freebet o solo cash? Incluye fondos bloqueados?
- **Impact if not clarified:** UI y reportes pueden mostrar valores incorrectos.

**Ambiguity 2:** Transferencias entre pockets

- **Found in:** STORY-SL-9 vs API contract
- **Question for Dev:** La transferencia permite cambiar pocket destino o siempre es mismo pocketType? El API solo define pocketType.
- **Impact if not clarified:** inconsistencia entre UI y backend.

**Ambiguity 3:** Moneda por bank y transferencias

- **Found in:** STORY-SL-7/SL-9
- **Question for PO:** Se permiten transferencias entre banks con distinta moneda?
- **Impact if not clarified:** errores de calculo y saldos cruzados.

---

### Missing Information

**Missing 1:** Metodos permitidos para depositos/retiros

- **Needed for:** validaciones y test data
- **Suggestion:** agregar lista de metodos validos y reglas por metodo.

**Missing 2:** Precision y redondeo de montos

- **Needed for:** calculos de saldo y asserts
- **Suggestion:** definir precision (ej. 2 decimales) y regla de redondeo.

---

### Suggested Improvements (Before Implementation)

**Improvement 1:** Definir regla de saldo operativo

- **Story Affected:** STORY-SL-8
- **Current State:** regla no especificada
- **Suggested Change:** describir formula exacta y ejemplos
- **Benefit:** evita errores de UI/API y discrepancias contables

**Improvement 2:** Alinear transferencias con API

- **Story Affected:** STORY-SL-9
- **Current State:** UI menciona pocket origen/destino, API solo pocketType
- **Suggested Change:** actualizar story o contrato para reflejar comportamiento real
- **Benefit:** reduce riesgos de integracion

**Improvement 3:** Definir metodos de deposito/retiro

- **Story Affected:** STORY-SL-10
- **Current State:** metodos no definidos
- **Suggested Change:** enumerar metodos y reglas de validacion
- **Benefit:** permite pruebas completas y UX consistente

---

## Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, Database)
- Integration testing (internal services)
- Non-functional testing (Performance, Security segun NFRs)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness (iOS Safari, Android Chrome)
- API contract validation (OpenAPI)
- Data validation (input/output segun SRS)

**Out of Scope (For This Epic):**

- Integraciones directas con casas de apuestas
- Conciliacion automatica con proveedores externos
- Colaboracion multiusuario en un bank

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80%
- **Focus Areas:**
  - Calculo de saldos
  - Validaciones de monto y ownership
  - Utilidades de ledger
- **Responsibility:** Dev team (QA valida evidencia)

#### Integration Testing

- **Coverage Goal:** todos los integration points
- **Focus Areas:**
  - Frontend <-> Backend API (OpenAPI)
  - Backend <-> Database (ledger y balances)
  - Backend <-> Auth/RLS
- **Responsibility:** QA + Dev

#### End-to-End (E2E) Testing

- **Coverage Goal:** journeys criticos completos
- **Tool:** Playwright
- **Focus Areas:**
  - Crear bank con pockets
  - Ver saldo operativo y desglose
  - Transferir fondos
  - Depositos y retiros
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% endpoints de esta epica
- **Tool:** Postman/Newman o Playwright API
- **Focus Areas:**
  - Contract validation
  - Status codes
  - Error handling
  - Authorization
- **Responsibility:** QA team

---

### Test Types per Story

**Positive Test Cases:**

- Happy path
- Variaciones validas

**Negative Test Cases:**

- Input invalido
- Campos requeridos vacios
- Acceso no autorizado
- Violaciones de reglas

**Boundary Test Cases:**

- Min/max values
- Valores cero
- Precision decimal

**Exploratory Testing:**

- Flujos de ledger ante retries y fallos parciales
- UX de mensajes de error en transferencias y retiros

---

## Test Cases Summary by Story

### STORY-SL-7: Create banks with pockets

**Complexity:** Medium
**Estimated Test Cases:** 12

- Positive: 4
- Negative: 4
- Boundary: 2
- Integration: 1
- API: 1

**Rationale for estimate:** validaciones de montos, creacion atomica de pockets y ledger inicial, ownership.

**Parametrized Tests Recommended:** Yes
Validaciones de montos iniciales y monedas.

---

### STORY-SL-8: View operational balance and pocket breakdown

**Complexity:** Medium
**Estimated Test Cases:** 9

- Positive: 3
- Negative: 3
- Boundary: 1
- Integration: 1
- API: 1

**Rationale for estimate:** calculo de saldo operativo, permisos, bank sin movimientos.

**Parametrized Tests Recommended:** No

---

### STORY-SL-9: Transfer funds between banks

**Complexity:** High
**Estimated Test Cases:** 14

- Positive: 4
- Negative: 5
- Boundary: 2
- Integration: 2
- API: 1

**Rationale for estimate:** doble asiento, validaciones de saldo y ownership, idempotencia.

**Parametrized Tests Recommended:** Yes
Montos, pocketType y combinaciones de banks.

---

### STORY-SL-10: Record deposits and withdrawals

**Complexity:** Medium
**Estimated Test Cases:** 12

- Positive: 4
- Negative: 4
- Boundary: 2
- Integration: 1
- API: 1

**Rationale for estimate:** validaciones de monto y cash disponible, ledger y balance updates.

**Parametrized Tests Recommended:** Yes
Tipos deposit/withdraw y montos.

---

### Total Estimated Test Cases for Epic

**Total:** 47
**Breakdown:**

- Positive: 15
- Negative: 16
- Boundary: 7
- Integration: 5
- API: 4

---

## Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

- User data: usuarios con rol user y owner de banks
- Bank data: bank con moneda EUR/USD, pockets iniciales (0, >0)
- Transaction data: deposit/withdraw con montos pequenos y medianos

**Invalid Data Sets:**

- Montos negativos, cero, o superiores al cash disponible
- bankId de otro usuario
- pocketType invalido

**Boundary Data Sets:**

- Min/max values (segun precision definida)
- Valores con muchos decimales
- Valores cero

**Test Data Management:**

- Use Faker.js para datos realistas
- Crear data factories
- No hardcodear datos estaticos en tests
- Limpiar data post ejecucion

---

### Test Environments

**Staging Environment:**

- URL: preview
- Database: Staging DB
- External Services: N/A
- **Purpose:** Primary testing environment

**Production Environment:**

- URL: https://api.example.com
- **Purpose:** solo smoke tests post-deployment
- **Restrictions:** no tests destructivos

---

## Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story implementada y desplegada a staging
- [ ] Code review aprobado (2 reviewers)
- [ ] Unit tests passing (>80% coverage)
- [ ] Dev hizo smoke testing
- [ ] No blocker bugs en dependencias
- [ ] Test data disponible
- [ ] API docs actualizadas

### Exit Criteria (Per Story)

- [ ] Todos los test cases ejecutados
- [ ] Critical/High 100% passing
- [ ] Medium/Low >=95% passing
- [ ] Bugs criticos/high resueltos
- [ ] Regression testing pasado
- [ ] NFRs validados
- [ ] Reporte de ejecucion generado

### Epic Exit Criteria

- [ ] Todas las stories cumplen exit criteria
- [ ] Integration testing completo
- [ ] E2E journeys criticos completos
- [ ] API contract testing completo
- [ ] NFRs validados
- [ ] Exploratory testing completado
- [ ] Sin bugs criticos/high abiertos

---

## Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-001:** Page load LCP p75 < 2.5s

- **Test Approach:** Lighthouse en /banks y /banks/[bankId]
- **Tools:** Lighthouse

**NFR-P-002:** API p95 < 500ms en endpoints de lectura

- **Test Approach:** medicion en GET /api/banks y GET /api/banks/{bankId}
- **Tools:** k6 o Postman + metrics

### Security Requirements

**NFR-S-001:** Authorization con RBAC y RLS

- **Test Approach:** pruebas de acceso a bank ajeno
- **Tools:** API tests + E2E negativo

**NFR-S-002:** Input validation server-side

- **Test Approach:** payloads invalidos y boundary
- **Tools:** API tests

### Usability Requirements

**NFR-U-001:** accesibilidad basica en acciones clave

- **Test Approach:** teclado + contraste en formularios

---

## Regression Testing Strategy

**Regression Scope:**

- [ ] Auth (registro/login) para ownership
- [ ] Bets ledger (depende de balances)
- [ ] Goals (dependen de saldos)

**Regression Test Execution:**

- Ejecutar suite automatizada antes de iniciar testing
- Re-ejecutar al finalizar todas las stories
- Enfasis en integration points

---

## Testing Timeline Estimate

**Estimated Duration:** 1 sprint (2 weeks)

**Breakdown:**

- Test case design: 3 days
- Test data preparation: 2 days
- Test execution (per story): 2 days por story
- Regression testing: 2 days
- Bug fixing cycles: 2 days buffer
- Exploratory testing: 1 day

**Dependencies:**

- Depends on: EPIC-SL-1 Identity and Access
- Blocks: EPIC-SL-03, EPIC-SL-05, EPIC-SL-06

---

## Tools & Infrastructure

**Testing Tools:**

- E2E Testing: Playwright
- API Testing: Postman/Newman or Playwright API
- Unit Testing: Vitest (frontend), Jest (backend)
- Performance Testing: Lighthouse
- Security Testing: OWASP ZAP (si aplica)
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests on PR creation
- [ ] Tests on merge to main
- [ ] Tests on deployment to staging
- [ ] Smoke tests on production

**Test Management:**

- Jira Xray (test cases linked to stories)
- Test execution reports in Xray
- Bug tracking in Jira

---

## Metrics & Reporting

**Test Metrics to Track:**

- Test cases executed vs total
- Test pass rate
- Bug detection rate
- Bug fix rate
- Test coverage (unit tests)
- Time to test (per story)

**Reporting Cadence:**

- Daily: test execution status
- Per Story: test completion report
- Per Epic: QA sign-off report

---

## Notes & Assumptions

**Assumptions:**

- La regla de saldo operativo sera definida antes de implementar.
- La precision de montos sera definida (ej. 2 decimales).

**Constraints:**

- Sin integraciones externas en esta epica.

**Known Limitations:**

- Sin conciliacion automatica con proveedores.

**Exploratory Testing Sessions:**

- Recommended: 2 sesiones antes de implementacion
  - Session 1: validar UX con prototipos y mensajes de error
  - Session 2: explorar edge cases de ledger y retries

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-6-banks-and-balances/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-*/story.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## Action Required

**Product Owner:**

- [ ] Review ambiguities and missing information (see Critical Analysis section)
- [ ] Answer critical questions for PO
- [ ] Validate risk analysis and business impact
- [ ] Confirm test scope is complete and correct

**Dev Lead:**

- [ ] Review technical risks and mitigation strategies
- [ ] Validate integration points identified
- [ ] Confirm architecture analysis is accurate
- [ ] Answer technical questions

**QA Team:**

- [ ] Review test strategy and estimates
- [ ] Validate test levels and types per story
- [ ] Confirm test data requirements
- [ ] Prepare test environments and tools

---

**Next Steps:**

1. Team discusses critical questions and ambiguities in refinement
2. PO/Dev provide answers and clarifications
3. QA begins test case design per story (use acceptance-test-plan.md prompt)
4. Team validates entry/exit criteria before sprint starts
5. Dev starts implementation only after critical questions resolved

---

**Documentation:** Full test plan also available at:
`.context/PBI/epics/EPIC-SL-6-banks-and-balances/feature-test-plan.md`
