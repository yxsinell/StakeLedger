## 🧪 Acceptance Test Plan - Generated 2026-03-21

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-24 - Recalculo de meta

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-24
**Epic:** EPIC-SL-21 - Goals and Risk Advisor
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Laura Rios - necesita precision en recalculos tras apuestas.
- **Secondary:** Carlos Vega - requiere mision diaria consistente.

**Business Value:**

- **Value Proposition:** mision diaria siempre actualizada.
- **Business Impact:** confianza en las metas y menor friccion.

**Related User Journey:**

- Journey 2: Meta dinamica con recalculo diario
- Step: Liquidacion de apuesta y actualizacion de mision

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Actualizacion del estado de la meta y mision diaria.

**Backend:**

- POST /api/bets/{betId}/settle
- POST /api/goals/{goalId}/recalculate
- Guardar historial de recalculos

**Database:**

- goals, goal_history, bets

**Integration Points:**

- Bets settlement ↔ Goals recalculation
- Backend ↔ Database (Goals, Goal History, Bets)

---

### Story Complexity Analysis

**Overall Complexity:** Medium/High

**Complexity Factors:**

- Business logic complexity: High - impacto de resultados en brecha.
- Integration complexity: High - eventos y vinculacion de apuestas.
- Data validation complexity: Medium - control de estados.
- UI complexity: Medium - actualizacion de mision.

**Estimated Test Effort:** High
**Rationale:** depende de eventos, idempotencia y vinculacion.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Settlement no dispara recalculo.
- Formulas inconsistentes tras liquidacion.

**Integration Points from Epic Analysis:**

- Backend ↔ Bets settlement: ✅ Yes
- Backend ↔ Database: ✅ Yes

**Critical Questions Already Asked at Epic Level:**

- Como se asocia bet_id a goal_id.
- Idempotencia del recalculo.

**Test Strategy from Epic:**

- Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Postman
- **How This Story Aligns:** Integration + API + eventos.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** actualiza mision diaria tras liquidacion.
- **Inherited Risks:** vinculacion e idempotencia.
- **Unique Considerations:** apuestas no vinculadas.

---
## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Vinculo entre meta y apuesta.

- **Location in Story:** Notes / Technical Notes
- **Question for Dev:** como se vincula bet_id con goal_id?
- **Impact on Testing:** no se puede validar filtrado correcto.
- **Suggested Clarification:** definir campo y regla de vinculacion.

**Ambiguity 2:** Idempotencia del recalculo.

- **Location in Story:** Technical Notes
- **Question for Dev:** que ocurre si se procesa el settlement dos veces?
- **Impact on Testing:** riesgo de doble recalculo.
- **Suggested Clarification:** definir control idempotente.

---

### Missing Information / Gaps

**Gap 1:** Respuesta esperada del endpoint de recalculo.

- **Type:** Technical Details
- **Why It's Critical:** validar API y UI.
- **Suggested Addition:** schema de respuesta.
- **Impact if Not Added:** pruebas ambiguas.

**Gap 2:** Manejo de apuestas void/half.

- **Type:** Business Rule
- **Why It's Critical:** afecta brecha y mision.
- **Suggested Addition:** regla de recalculo por resultado.
- **Impact if Not Added:** inconsistencias.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Settlement duplicado.

- **Scenario:** misma apuesta liquidada dos veces.
- **Expected Behavior:** recalculo una sola vez.
- **Criticality:** High
- **Action Required:** Add to test cases

**Edge Case 2:** Apuesta vinculada pero meta cerrada.

- **Scenario:** settlement posterior al cierre.
- **Expected Behavior:** no recalcular.
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

- Definir vinculo bet-goal y regla idempotente.
- Definir resultados supported (win/lose/void/half).

---
## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Recalculo tras apuesta win

**Type:** Positive
**Priority:** Critical

- **Given:** goal activa con apuesta vinculada
- **When:** bet se liquida como win
- **Then:** recalcula brecha y mision diaria

---

### Scenario 2: Recalculo tras apuesta lose

**Type:** Positive
**Priority:** High

- **Given:** goal activa con apuesta vinculada
- **When:** bet se liquida como lose
- **Then:** recalcula brecha y ajusta mision

---

### Scenario 3: Apuesta no vinculada

**Type:** Negative
**Priority:** High

- **Given:** goal activa
- **When:** se liquida apuesta no vinculada
- **Then:** no recalcula meta

---

### Scenario 4: Settlement duplicado

**Type:** Edge Case
**Priority:** High

- **Given:** goal activa con apuesta vinculada
- **When:** settlement duplicado
- **Then:** recalculo idempotente

---

### Scenario 5: Meta cerrada

**Type:** Boundary
**Priority:** Medium

- **Given:** goal completed
- **When:** se liquida apuesta vinculada
- **Then:** no recalcula meta

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

**Breakdown:**

- Positive: 3
- Negative: 2
- Boundary: 1
- Integration: 2
- API: 4

**Rationale for This Number:** win/lose + no vinculada + idempotencia.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Resultados de settlement

- **Base Scenario:** POST /api/bets/{betId}/settle
- **Parameters to Vary:** result
- **Test Data Sets:**

| result | Expected Result           |
| ------ | ------------------------- |
| win    | recalcula mision diaria   |
| lose   | recalcula mision diaria   |
| void   | recalcula segun regla (TBD) |

**Total Tests from Parametrization:** 3
**Benefit:** cubre resultados sin duplicacion.

---

### Test Outlines

#### **Validar recalculo tras win**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** brecha y mision actualizadas

---

#### **Validar recalculo tras lose**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** brecha y mision ajustadas

---

#### **Validar no recalculo en apuesta no vinculada**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Expected Result:** no cambios en goal

---

#### **Validar idempotencia de settlement**

**Related Scenario:** Scenario 4
**Type:** Edge Case
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Expected Result:** recalculo unico

---

#### **Validar no recalculo en meta cerrada**

**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

**Expected Result:** estado y mision sin cambios

---
## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Settlement → Recalculate

**Integration Point:** /api/bets/{betId}/settle → /api/goals/{goalId}/recalculate
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Liquidar apuesta vinculada
2. Ejecutar recalculo
3. Verificar goal_history actualizado

**Expected Result:**

- Recalculo ejecutado una vez
- Historial consistente

---

## 📊 Edge Cases Summary

| Edge Case                            | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| ----------------------------------- | --------------------------- | -------------------- | --------- | -------- |
| Settlement duplicado                | ❌ No                        | ✅ Yes               | TC-04     | High     |
| Apuesta vinculada con meta cerrada  | ❌ No                        | ✅ Yes               | TC-05     | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                 |
| --------------- | ----- | --------------- | ------------------------ |
| Valid data      | 2     | Positive tests  | win, lose                |
| Invalid data    | 1     | Negative tests  | apuesta no vinculada     |
| Boundary values | 1     | Boundary tests  | meta cerrada             |
| Edge case data  | 1     | Edge case tests | settlement duplicado     |

---

## 📋 Test Execution Tracking

**Test Execution Date:** TBD
**Environment:** Staging
**Executed By:** TBD

**Results:**

- Total Tests: 8
- Passed: TBD
- Failed: TBD
- Blocked: TBD

---

**Documentation:**
`.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-24-goal-recalculation/acceptance-test-plan.md`
