## 🧪 Acceptance Test Plan - Generated 2026-03-21

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-23 - Mision diaria

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-23
**Epic:** EPIC-SL-21 - Goals and Risk Advisor
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita una guia diaria simple y clara.
- **Secondary:** Laura Rios - requiere consistencia en formulas y progreso.

**Business Value:**

- **Value Proposition:** visibilidad diaria de objetivo y cuota sugerida.
- **Business Impact:** aumenta uso recurrente y seguimiento de metas.

**Related User Journey:**

- Journey 2: Meta dinamica con recalculo diario
- Step: Visualizacion de mision diaria

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Vista de meta con mision diaria y progreso.
- Estados: activa, sin datos, cerrada.

**Backend:**

- GET /api/goals/{goalId}
- Calculo diario segun brecha y dias restantes
- Cache de calculos por dia

**Database:**

- goals, goal_history

**Integration Points:**

- Frontend ↔ Backend API (Goals)
- Backend ↔ Database (Goals)

---

### Story Complexity Analysis

**Overall Complexity:** Low/Medium

**Complexity Factors:**

- Business logic complexity: Medium - formula de cuota sugerida.
- Integration complexity: Low - lectura de meta.
- Data validation complexity: Low - manejo de estados.
- UI complexity: Medium - estados y mensajes.

**Estimated Test Effort:** Medium
**Rationale:** requiere validar calculo, estados y cache diario.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Formula de suggested_odds/daily_profit no definida.
- Recalculo inconsistente entre dias.

**Integration Points from Epic Analysis:**

- Frontend ↔ Backend API: ✅ Yes
- Backend ↔ Database: ✅ Yes

**Critical Questions Already Asked at Epic Level:**

- Formula exacta y redondeos de suggested_odds/daily_profit.
- Rango permitido de stake_preference.

**Test Strategy from Epic:**

- Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Postman
- **How This Story Aligns:** UI + API + validaciones de estado.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** expone la mision diaria calculada.
- **Inherited Risks:** formulas y precision.
- **Unique Considerations:** cache diario y estados sin datos.

---
## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Formula y redondeo de cuota sugerida.

- **Location in Story:** Technical Notes / Notes
- **Question for PO/Dev:** cual es la formula exacta y precision?
- **Impact on Testing:** no se puede validar resultado exacto.
- **Suggested Clarification:** documentar formula y redondeo.

**Ambiguity 2:** Comportamiento del cache diario.

- **Location in Story:** Technical Notes
- **Question for Dev:** cual es el TTL y cuando se invalida?
- **Impact on Testing:** no se puede validar cambios intra-dia.
- **Suggested Clarification:** definir TTL y triggers de invalidacion.

---

### Missing Information / Gaps

**Gap 1:** Mensajes UI para meta sin stake_preference.

- **Type:** Acceptance Criteria
- **Why It's Critical:** validar UX consistente.
- **Suggested Addition:** texto y accion requerida.
- **Impact if Not Added:** pruebas ambiguas.

**Gap 2:** Estado esperado para meta cerrada.

- **Type:** Business Rule
- **Why It's Critical:** evitar mostrar mision activa.
- **Suggested Addition:** contenido y CTA permitido.
- **Impact if Not Added:** inconsistencias UI.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Cambio de dia con cache activo.

- **Scenario:** mismo goal consultado antes y despues de medianoche.
- **Expected Behavior:** recalcular y mostrar nueva mision.
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** goal con deadline hoy.

- **Scenario:** ultimo dia de meta activa.
- **Expected Behavior:** daily_profit calculado con dias restantes = 1.
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

- Definir formula, precision y reglas de cache.
- Definir mensajes UI y estados.

---
## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Ver mision diaria

**Type:** Positive
**Priority:** Critical

- **Given:**
  - goal activa con base_amount 100, target_amount 150
  - stake_preference definido
  - deadline futura

- **When:**
  - usuario abre la vista de meta

- **Then:**
  - muestra daily_profit
  - muestra suggested_odds
  - muestra progress_pct

---

### Scenario 2: Meta sin datos suficientes

**Type:** Negative
**Priority:** High

- **Given:** goal activa sin stake_preference
- **When:** usuario abre la vista
- **Then:** solicita completar parametros faltantes

---

### Scenario 3: Meta cerrada

**Type:** Negative
**Priority:** High

- **Given:** goal en status completed
- **When:** usuario abre la vista
- **Then:** muestra estado final sin mision activa

---

### Scenario 4: Cache diario

**Type:** Edge Case
**Priority:** Medium

- **Given:** goal activa con cache previo
- **When:** cambia el dia
- **Then:** recalcula mision diaria

---

### Scenario 5: Deadline hoy

**Type:** Boundary
**Priority:** Medium

- **Given:** goal activa con deadline = hoy
- **When:** usuario abre la vista
- **Then:** daily_profit calculado con dias restantes = 1

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

**Rationale for This Number:** estados + formula + cache diario.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Estados de meta

- **Base Scenario:** GET /api/goals/{goalId}
- **Parameters to Vary:** status, stake_preference
- **Test Data Sets:**

| status    | stake_preference | Expected Result               |
| --------- | ---------------- | ----------------------------- |
| active    | 5                | daily_profit + suggested_odds |
| active    | null             | prompt completar parametros   |
| completed | 5                | estado final sin mision       |

**Total Tests from Parametrization:** 3
**Benefit:** reduce duplicacion de escenarios por estado.

---

### Test Outlines

#### **Validar mision diaria en meta activa**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Usuario autenticado
- Goal activa con stake_preference

**Test Steps:**

1. Enviar GET /api/goals/{goalId}
2. Verificar respuesta

**Expected Result:**

- **API Response:** 200 OK
- Body incluye daily_profit, suggested_odds, progress_pct

---

#### **Validar solicitud de parametros faltantes**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** mensaje para completar stake_preference

---

#### **Validar vista de meta cerrada**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** estado final sin mision activa

---

#### **Validar recalculo por cambio de dia**

**Related Scenario:** Scenario 4
**Type:** Edge Case
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Expected Result:** daily_profit actualizado al cambiar el dia

---

#### **Validar deadline hoy**

**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

**Expected Result:** daily_profit calculado con dias restantes = 1

---
## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: UI Goals ↔ API Goals

**Integration Point:** UI → /api/goals/{goalId}
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Abrir vista de meta
2. UI solicita datos a API
3. UI muestra daily_profit y suggested_odds

**Expected Result:**

- Datos consistentes entre API y UI

---

## 📊 Edge Cases Summary

| Edge Case               | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| ---------------------- | --------------------------- | -------------------- | --------- | -------- |
| Cambio de dia con cache | ❌ No                        | ✅ Yes               | TC-04     | Medium   |
| Deadline hoy            | ❌ No                        | ✅ Yes               | TC-05     | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                |
| --------------- | ----- | --------------- | ----------------------- |
| Valid data      | 1     | Positive tests  | goal activa con stake   |
| Invalid data    | 1     | Negative tests  | stake_preference null   |
| Boundary values | 1     | Boundary tests  | deadline hoy            |
| Edge case data  | 1     | Edge case tests | cambio de dia con cache |

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
`.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-23-daily-mission/acceptance-test-plan.md`
