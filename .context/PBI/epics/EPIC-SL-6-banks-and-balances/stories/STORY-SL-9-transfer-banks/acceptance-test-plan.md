## Acceptance Test Plan - Generated 2026-03-10

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-9 - Transfer funds between banks

**Fecha:** 2026-03-10
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-9
**Epic:** EPIC-SL-6 - Banks and Balances
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita rebalancear su bank sin perder trazabilidad.
- **Secondary:** Laura Rios - requiere movimientos auditables entre banks.

**Business Value:**

- **Value Proposition:** transferencias internas con ledger consistente.
- **Business Impact:** soporte al KPI de uso recurrente de movimientos.

**Related User Journey:**

- Journey: Registro y primera apuesta
- Step: Rebalanceo de saldos entre banks

---

### Technical Context of This Story

**Frontend:**

- Components: UI de transferencia con selector de bank origen/destino y pocket
- Pages/Routes: /banks/transfer (o modal en /banks)

**Backend:**

- API Endpoints: POST /api/banks/{bankId}/transfer
- Services: validacion de saldo, double-entry ledger, idempotencia
- Database: banks, bank_pockets, transactions

**Integration Points:**

- Frontend -> Backend API (transfer)
- Backend -> Database (doble asiento atomico)
- Backend -> Auth/RLS (ownership)

---

### Story Complexity Analysis

**Overall Complexity:** High

- Business logic complexity: High - doble asiento e idempotencia
- Integration complexity: High - API + DB + Auth
- Data validation complexity: Medium - montos y pocketType
- UI complexity: Medium

**Estimated Test Effort:** High

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks:**

- Ledger desbalanceado por operaciones no atomicas
  - **Relevance:** transferencias requieren doble asiento consistente
- Acceso indebido por ownership/RLS
  - **Relevance:** no permitir transferir a bank ajeno

**Critical Questions from Epic:**

- Dev: La transferencia permite cambiar pocket destino o siempre es mismo pocketType? (⏳ Pending)
- PO: Se permiten transferencias entre banks con distinta moneda? (⏳ Pending)

**Test Strategy from Epic:** Unit, Integration, E2E, API

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Pocket destino vs pocketType unico

- **Location:** Scope / API contract
- **Question for Dev:** Se transfiere entre pockets distintos o siempre mismo pocketType?
- **Impact on Testing:** afecta validaciones de payload y balances

**Ambiguity 2:** Transferencias entre monedas

- **Location:** Scope
- **Question for PO:** Se permiten transferencias entre banks con distinta currency?
- **Impact on Testing:** afecta reglas y validaciones de monto

**Ambiguity 3:** Idempotencia

- **Location:** Notes
- **Question for Dev:** cual es la estrategia de idempotencia? (idempotency-key?)
- **Impact on Testing:** no podemos validar retries

---

### Missing Information / Gaps

**Gap 1:** Mensajes/codigos de error esperados

- **Type:** Acceptance Criteria
- **Why It's Critical:** validacion de UX y API
- **Suggested Addition:** definir error code/message para saldo insuficiente y permisos

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Monto cero

- **Expected Behavior:** rechazo (monto > 0)
- **Criticality:** Medium

**Edge Case 2:** Transferencia entre mismo bank

- **Expected Behavior:** rechazo o no-op
- **Criticality:** Medium

**Edge Case 3:** Retry de misma transferencia

- **Expected Behavior:** idempotente (no duplicar)
- **Criticality:** High

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

- [x] Missing idempotency rules
- [x] Missing error codes/messages
- [x] Missing pocket destino rule

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Transferencia exitosa entre banks del mismo usuario

**Type:** Positive
**Priority:** Critical

- **Given:** usuario autenticado con bank A (cash=100) y bank B (cash=0)
- **When:** POST /api/banks/{bankAId}/transfer con toBankId=bankBId, amount=50, pocketType=cash
- **Then:**
  - 200 OK
  - Bank A cash=50, Bank B cash=50
  - Ledger registra doble asiento

---

### Scenario 2: Monto insuficiente

**Type:** Negative
**Priority:** High

- **Given:** bank A cash=10
- **When:** transfiere amount=20
- **Then:** 400 Bad Request + error saldo insuficiente

---

### Scenario 3: Bank de otro usuario

**Type:** Negative
**Priority:** High

- **Given:** usuario autenticado sin ownership del bank destino
- **When:** intenta transferir
- **Then:** 403 Forbidden

---

### Scenario 4: Monto cero

**Type:** Boundary
**Priority:** Medium

- **Given:** usuario autenticado
- **When:** amount=0
- **Then:** 400 Bad Request

---

### Scenario 5: Retry idempotente

**Type:** Edge Case
**Priority:** High

- **Given:** transferencia enviada con idempotency key
- **When:** reintenta la misma request
- **Then:** no duplica asientos (comportamiento a confirmar)

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

- Positive: 3
- Negative: 5
- Boundary: 2
- Integration: 1
- API: 1

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: montos y pockets**

| amount | pocketType | Expected Result |
| ------ | ---------- | --------------- |
| 10     | cash       | success |
| 10     | bonus      | success (si aplica) |
| 10     | freebet    | success (si aplica) |
| 0      | cash       | error |

---

### Test Outlines (resumen)

- Validar transferencia exitosa entre banks
- Validar rechazo por saldo insuficiente
- Validar bloqueo por bank ajeno
- Validar monto cero
- Validar idempotencia en retry
- Validar UI de transferencia

---

## Action Required

**Product Owner:**

- [ ] Definir si se permiten transferencias entre monedas

**Dev Lead:**

- [ ] Definir pocket destino vs pocketType
- [ ] Definir estrategia de idempotencia
- [ ] Confirmar codigos/mensajes de error

---

**Documentation:**
`.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-9-transfer-banks/acceptance-test-plan.md`
