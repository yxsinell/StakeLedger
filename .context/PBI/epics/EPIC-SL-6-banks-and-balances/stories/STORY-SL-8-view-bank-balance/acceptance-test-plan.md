## Acceptance Test Plan - Generated 2026-03-10

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-8 - View bank balance and pockets

**Fecha:** 2026-03-10
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-8
**Epic:** EPIC-SL-6 - Banks and Balances
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita entender saldo operativo y desglose para controlar su bank.
- **Secondary:** Laura Rios - requiere consistencia de saldos para analitica confiable.

**Business Value:**

- **Value Proposition:** visibilidad clara de saldos por pocket y saldo operativo.
- **Business Impact:** reduce fricciones y mejora retencion (confianza en metricas).

**Related User Journey:**

- Journey: Registro y primera apuesta
- Step: Ver saldo operativo y desglose luego de crear bank

---

### Technical Context of This Story

**Frontend:**

- Components: vista detalle de bank, cards por pocket, indicador de saldo operativo
- Pages/Routes: /banks/[bankId]
- State Management: n/a (pendiente)

**Backend:**

- API Endpoints: GET /api/banks/{bankId}
- Services: calculo de saldo operativo, ownership validation
- Database: banks, bank_pockets, transactions

**Integration Points:**

- Frontend -> Backend API (GET /api/banks/{bankId})
- Backend -> Database (aggregations)
- Backend -> Auth/RLS (ownership)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic complexity: Medium - regla de saldo operativo
- Integration complexity: Medium - API + DB + Auth
- Data validation complexity: Medium - precision/rounding
- UI complexity: Low

**Estimated Test Effort:** Medium

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks:**

- Ledger desbalanceado por operaciones no atomicas
  - **Relevance:** saldo operativo depende de balances correctos
- Acceso indebido por ownership/RLS
  - **Relevance:** lectura de bank ajeno debe bloquearse

**Integration Points:**

- Frontend <-> Backend API: ✅ Yes
- Backend <-> Database: ✅ Yes
- Backend <-> Auth/RLS: ✅ Yes

**Critical Questions from Epic:**

- PO: Definicion exacta de saldo operativo (cash vs cash+bonus+freebet, fondos bloqueados?) - ⏳ Pending

**Test Strategy from Epic:** Unit, Integration, E2E, API (Playwright/Vitest/Postman). Aplica para UI + API + DB.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Regla exacta de saldo operativo

- **Location:** Business Rules / Notes
- **Question for PO:** Saldo operativo = cash? o cash+bonus+freebet? incluye fondos bloqueados?
- **Impact on Testing:** no podemos validar expected values
- **Suggested Clarification:** definir formula y ejemplos

**Ambiguity 2:** Precision y redondeo de saldos

- **Location:** Business Rules
- **Question for PO/Dev:** precision (2 decimales?) y redondeo?
- **Impact on Testing:** asserts inconsistentes

---

### Missing Information / Gaps

**Gap 1:** Mensajes/codigos de error para 403/404

- **Type:** Acceptance Criteria
- **Why It's Critical:** validar UX y respuesta API
- **Suggested Addition:** definir error code/message

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Bank con pockets en 0

- **Scenario:** bank creado sin movimientos adicionales
- **Expected Behavior:** mostrar 0 en pockets y saldo operativo coherente
- **Criticality:** Medium

**Edge Case 2:** Bank inexistente

- **Scenario:** bankId no existe
- **Expected Behavior:** 404 Not Found + UI error
- **Criticality:** High

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Missing saldo_operativo rule
- [x] Missing error codes/messages
- [x] Missing precision rules

**Recommendations:** definir formula, precision y mensajes de error

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Ver saldo operativo y desglose con bank valido

**Type:** Positive
**Priority:** Critical

- **Given:** usuario autenticado con bank (cash=100, bonus=20, freebet=10)
- **When:** GET /api/banks/{bankId}
- **Then:**
  - 200 OK
  - Response incluye balances por pocket y saldo_operativo
  - UI muestra cards y saldo operativo

---

### Scenario 2: Bank de otro usuario

**Type:** Negative
**Priority:** High

- **Given:** usuario autenticado sin ownership
- **When:** GET /api/banks/{bankId} ajeno
- **Then:** 403 Forbidden + UI acceso denegado

---

### Scenario 3: Bank sin movimientos

**Type:** Boundary
**Priority:** Medium

- **Given:** bank recien creado
- **When:** GET /api/banks/{bankId}
- **Then:** saldos iniciales correctos y saldo_operativo coherente

---

### Scenario 4: Bank inexistente

**Type:** Negative
**Priority:** High

- **Given:** usuario autenticado
- **When:** GET /api/banks/{bankId} inexistente
- **Then:** 404 Not Found + UI error

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

- Positive: 2
- Negative: 3
- Boundary: 2
- Integration: 1
- API: 1

**Rationale:** cubre regla de saldo, permisos y errores clave.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** combinaciones de pockets

| cash | bonus | freebet | Expected Behavior |
| ---- | ----- | ------- | ----------------- |
| 100  | 20    | 10      | saldo_operativo segun regla |
| 0    | 0     | 0       | saldo_operativo = 0 (si aplica) |
| 50.5 | 0     | 0       | precision correcta |

---

### Test Outlines

#### Validar saldo operativo y desglose en bank valido

**Type:** Positive
**Priority:** Critical
**Test Level:** API

**Preconditions:** usuario autenticado, bank con pockets definidos

**Steps:** GET /api/banks/{bankId}

**Expected Result:** 200 OK con balances y saldo_operativo

---

#### Validar bloqueo por bank ajeno

**Type:** Negative
**Priority:** High
**Test Level:** API

**Steps:** GET /api/banks/{bankId} ajeno

**Expected Result:** 403 Forbidden, sin data

---

#### Validar bank inexistente

**Type:** Negative
**Priority:** High
**Test Level:** API

**Steps:** GET /api/banks/{bankId} inexistente

**Expected Result:** 404 Not Found

---

#### Validar UI muestra cards y saldo operativo

**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Steps:** abrir /banks/{bankId} y verificar UI

---

## Integration Test Cases

### Integration Test 1: Frontend -> Backend API (GET /api/banks/{bankId})

**Expected Result:** response cumple OpenAPI y UI refleja data

---

## Action Required

**Product Owner:**

- [ ] Definir regla de saldo operativo y ejemplos
- [ ] Confirmar precision/rounding

**Dev Lead:**

- [ ] Confirmar codigos/mensajes para 403/404

---

**Documentation:**
`.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-8-view-bank-balance/acceptance-test-plan.md`
