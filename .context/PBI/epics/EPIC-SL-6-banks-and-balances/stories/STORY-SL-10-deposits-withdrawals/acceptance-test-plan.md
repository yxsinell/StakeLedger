## Acceptance Test Plan - Generated 2026-03-10

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-10 - Deposits and withdrawals

**Fecha:** 2026-03-10
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-10
**Epic:** EPIC-SL-6 - Banks and Balances
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita registrar depositos/retiros para mantener ledger real.
- **Secondary:** Laura Rios - requiere transacciones auditables para analitica.

**Business Value:**

- **Value Proposition:** ledger completo con depositos y retiros consistentes.
- **Business Impact:** mejora uso recurrente y confianza.

**Related User Journey:**

- Journey: Registro y primera apuesta
- Step: registrar depositos/retiros despues de crear bank

---

### Technical Context of This Story

**Frontend:**

- Components: formulario deposito/retiro
- Pages/Routes: /banks/[bankId]/transactions (o modal)

**Backend:**

- API Endpoints: POST /api/transactions
- Services: validaciones de monto, update pockets, ledger
- Database: banks, bank_pockets, transactions

**Integration Points:**

- Frontend -> Backend API (POST /api/transactions)
- Backend -> Database (ledger)
- Backend -> Auth/RLS (ownership)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic complexity: Medium - reglas de retiro
- Integration complexity: Medium - API + DB + Auth
- Data validation complexity: Medium - amount, method
- UI complexity: Low

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks:**

- Ledger desbalanceado por operaciones no atomicas
- Acceso indebido por ownership/RLS

**Critical Questions from Epic:**

- PO: Metodos permitidos para depositos/retiros (⏳ Pending)

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Metodos permitidos para depositos/retiros

- **Location:** Notes
- **Question for PO:** cuales metodos son validos? (card, bank_transfer, cash, etc.)
- **Impact on Testing:** no podemos validar payload

**Ambiguity 2:** Pocket destino en depositos

- **Location:** Scope
- **Question for PO/Dev:** los depositos siempre van a cash? se permite bonus/freebet?
- **Impact on Testing:** afecta validaciones y balances

---

### Missing Information / Gaps

**Gap 1:** Mensajes/codigos de error esperados

- **Type:** Acceptance Criteria
- **Why It's Critical:** validar UX y API
- **Suggested Addition:** definir codigos/mensajes

**Gap 2:** Precision y redondeo

- **Type:** Business Rule
- **Why It's Critical:** asserts de saldo

---

### Edge Cases NOT Covered

- Monto cero
- Metodo invalido
- Retiro exacto al limite del cash

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Deposito exitoso

**Type:** Positive
**Priority:** Critical

- **Given:** bank cash=100
- **When:** POST /api/transactions type=deposit, amount=50, method=bank_transfer
- **Then:** 201 Created + cash=150 + ledger registra transaccion

---

### Scenario 2: Retiro con saldo insuficiente

**Type:** Negative
**Priority:** High

- **Given:** bank cash=10
- **When:** withdraw amount=20
- **Then:** 400 Bad Request + error saldo insuficiente

---

### Scenario 3: Retiro exitoso

**Type:** Positive
**Priority:** High

- **Given:** bank cash=100
- **When:** withdraw amount=30
- **Then:** 201 Created + cash=70 + ledger registra transaccion

---

### Scenario 4: Monto cero

**Type:** Boundary
**Priority:** Medium

- **When:** amount=0
- **Then:** 400 Bad Request

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

- Positive: 3
- Negative: 4
- Boundary: 2
- Integration: 1
- API: 1

---

### Test Outlines (resumen)

- Validar deposito exitoso
- Validar retiro exitoso
- Validar saldo insuficiente
- Validar monto cero
- Validar metodo invalido
- Validar UI deposito/retiro

---

## Action Required

**Product Owner:**

- [ ] Definir metodos permitidos
- [ ] Definir si depositos pueden ir a bonus/freebet

**Dev Lead:**

- [ ] Confirmar codigos/mensajes de error
- [ ] Confirmar precision/rounding

---

**Documentation:**
`.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-10-deposits-withdrawals/acceptance-test-plan.md`
