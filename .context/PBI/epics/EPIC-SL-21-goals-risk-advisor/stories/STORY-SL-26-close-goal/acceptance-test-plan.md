## 🧪 Acceptance Test Plan - Generated 2026-03-21

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-26 - Cierre anticipado de meta

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-26
**Epic:** EPIC-SL-21 - Goals and Risk Advisor
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita cerrar al cumplir objetivo sin friccion.
- **Secondary:** Laura Rios - requiere estados consistentes y trazables.

**Business Value:**

- **Value Proposition:** cierre claro al alcanzar objetivo y detener recalculos.
- **Business Impact:** mejora confianza y evita inconsistencias.

**Related User Journey:**

- Journey 2: Meta dinamica con recalculo diario
- Step: Cierre anticipado tras objetivo

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- UI de cierre con confirmacion
- Estado final y mensaje

**Backend:**

- POST /api/goals/{goalId}/close
- Cambio de status a completed
- Registro de fecha de cierre

**Database:**

- goals, goal_history

**Integration Points:**

- UI ↔ API close goal
- Backend ↔ Database (Goals)

---

### Story Complexity Analysis

**Overall Complexity:** Low/Medium

**Complexity Factors:**

- Business logic complexity: Medium - reglas de cierre
- Integration complexity: Low - endpoint de cierre
- Data validation complexity: Medium - estado y confirmacion
- UI complexity: Medium - confirmaciones y mensajes

**Estimated Test Effort:** Medium
**Rationale:** requiere validar reglas de cierre y estados.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Cierre anticipado ambiguo y sin reglas claras.

**Integration Points from Epic Analysis:**

- Backend ↔ Database: ✅ Yes

**Critical Questions Already Asked at Epic Level:**

- Regla de cierre cuando objetivo no alcanzado.

**Test Strategy from Epic:**

- Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Postman
- **How This Story Aligns:** UI + API + reglas de negocio.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** detiene recalculos y cierra objetivo.
- **Inherited Risks:** reglas ambiguas de cierre.
- **Unique Considerations:** confirmacion adicional.

---
## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Cierre sin objetivo alcanzado.

- **Location in Story:** Acceptance Criteria / Business Rules
- **Question for PO/Dev:** se permite cerrar con confirmacion? o se bloquea?
- **Impact on Testing:** no se puede validar comportamiento esperado.
- **Suggested Clarification:** definir regla y mensajes.

**Ambiguity 2:** Mensaje en meta ya cerrada.

- **Location in Story:** Scenario 3
- **Question for PO/Dev:** cual es el mensaje exacto y CTA permitido?
- **Impact on Testing:** pruebas ambiguas.
- **Suggested Clarification:** definir mensaje y CTA.

---

### Missing Information / Gaps

**Gap 1:** Respuesta del endpoint /close.

- **Type:** Technical Details
- **Why It's Critical:** validar API y UI.
- **Suggested Addition:** schema de respuesta.
- **Impact if Not Added:** pruebas ambiguas.

**Gap 2:** Registro de fecha de cierre.

- **Type:** Business Rule
- **Why It's Critical:** trazabilidad del cierre.
- **Suggested Addition:** campo y formato.
- **Impact if Not Added:** inconsistencias.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Intento de cierre doble.

- **Scenario:** cerrar una meta ya completed
- **Expected Behavior:** idempotente, no cambia estado
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** Cierre con objetivo exacto (boundary).

- **Scenario:** target alcanzado exactamente
- **Expected Behavior:** cierre permitido
- **Criticality:** Medium
- **Action Required:** Add to test cases

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Expected results are not specific enough
- [x] Missing test data examples
- [x] Missing error scenarios

**Recommendations to Improve Testability:**

- Definir regla de cierre sin objetivo.
- Definir mensajes y respuesta API.

---
## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Cierre exitoso al alcanzar objetivo

**Type:** Positive
**Priority:** Critical

- **Given:** goal activa con objetivo alcanzado
- **When:** usuario confirma cierre
- **Then:** status = completed y fecha de cierre registrada

---

### Scenario 2: Intento de cierre sin objetivo

**Type:** Negative
**Priority:** High

- **Given:** goal activa sin objetivo alcanzado
- **When:** usuario intenta cerrar
- **Then:** requiere confirmacion adicional o bloquea (TBD)

---

### Scenario 3: Meta ya cerrada

**Type:** Negative
**Priority:** High

- **Given:** goal completed
- **When:** usuario intenta cerrar nuevamente
- **Then:** mantiene estado y muestra mensaje

---

### Scenario 4: Cierre con objetivo exacto

**Type:** Boundary
**Priority:** Medium

- **Given:** goal alcanza target exacto
- **When:** usuario confirma cierre
- **Then:** cierre permitido

---

### Scenario 5: Cierre idempotente

**Type:** Edge Case
**Priority:** Medium

- **Given:** goal completed
- **When:** usuario intenta cerrar dos veces
- **Then:** no cambia estado ni fecha

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 6

**Breakdown:**

- Positive: 2
- Negative: 2
- Boundary: 1
- Integration: 1
- API: 3

**Rationale for This Number:** reglas de cierre + estados.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Estado de meta

- **Base Scenario:** POST /api/goals/{goalId}/close
- **Parameters to Vary:** status, target_reached
- **Test Data Sets:**

| status    | target_reached | Expected Result                 |
| --------- | -------------- | ------------------------------- |
| active    | true           | cierre exitoso                  |
| active    | false          | confirmacion adicional o bloque |
| completed | true           | estado sin cambios              |

**Total Tests from Parametrization:** 3
**Benefit:** cubre estados sin duplicacion.

---

### Test Outlines

#### **Validar cierre exitoso con objetivo alcanzado**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** status completed + fecha cierre

---

#### **Validar cierre sin objetivo alcanzado**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** confirmacion adicional o bloqueo (TBD)

---

#### **Validar cierre en meta ya cerrada**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** estado sin cambios

---

#### **Validar cierre con objetivo exacto**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

**Expected Result:** cierre permitido

---

#### **Validar idempotencia de cierre**

**Related Scenario:** Scenario 5
**Type:** Edge Case
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

**Expected Result:** sin cambios en status ni fecha

---
## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: UI → Close Goal

**Integration Point:** UI close → /api/goals/{goalId}/close
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Usuario confirma cierre
2. API actualiza status
3. UI muestra estado final

**Expected Result:**

- UI y API reflejan status completed

---

## 📊 Edge Cases Summary

| Edge Case                   | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| -------------------------- | --------------------------- | -------------------- | --------- | -------- |
| Cierre doble               | ❌ No                        | ✅ Yes               | TC-05     | Medium   |
| Cierre con objetivo exacto | ❌ No                        | ✅ Yes               | TC-04     | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                    |
| --------------- | ----- | --------------- | --------------------------- |
| Valid data      | 1     | Positive tests  | goal con target alcanzado   |
| Invalid data    | 1     | Negative tests  | goal sin objetivo           |
| Boundary values | 1     | Boundary tests  | target exacto               |
| Edge case data  | 1     | Edge case tests | cierre doble                |

---

## 📋 Test Execution Tracking

**Test Execution Date:** TBD
**Environment:** Staging
**Executed By:** TBD

**Results:**

- Total Tests: 6
- Passed: TBD
- Failed: TBD
- Blocked: TBD

---

**Documentation:**
`.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-26-close-goal/acceptance-test-plan.md`
