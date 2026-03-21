## 🧪 Acceptance Test Plan - Generated 2026-03-21

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-22 - Crear meta

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-22
**Epic:** EPIC-SL-21 - Goals and Risk Advisor
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita control simple del bank y metas claras.
- **Secondary:** Laura Rios - requiere formulas consistentes y trazabilidad.

**Business Value:**

- **Value Proposition:** metas realistas con mision diaria accionable.
- **Business Impact:** impulsa uso recurrente de metas y retencion.

**Related User Journey:**

- Journey 2: Meta dinamica con recalculo diario
- Step: Creacion de meta con parametros base

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Formulario de creacion de meta.
- Validaciones de campos y feedback de error.

**Backend:**

- POST /api/goals
- Calculo de brecha, daily_profit, suggested_odds.

**Database:**

- goals, goal_history

**Integration Points:**

- Frontend ↔ Backend API (Goals)
- Backend ↔ Database (Goals)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - formulas y validaciones.
- Integration complexity: Low - un endpoint principal.
- Data validation complexity: Medium - reglas de negocio y rangos.
- UI complexity: Low - formulario con errores.

**Estimated Test Effort:** Medium
**Rationale:** requiere validar formulas, errores y persistencia.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Recalculo y formulas inconsistentes (aplica a esta story).
- Protecciones de riesgo mal calibradas (impacto indirecto).

**Integration Points from Epic Analysis:**

- Frontend ↔ Backend API: ✅ Yes
- Backend ↔ Database: ✅ Yes

**Critical Questions Already Asked at Epic Level:**

- Formula exacta y redondeos para suggested_odds y daily_profit.
- Rango permitido de stake_preference.

**Test Strategy from Epic:**

- Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Postman
- **How This Story Aligns:** API + UI + validaciones de negocio.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** base para mision diaria y recalculo posterior.
- **Inherited Risks:** formulas y validaciones.
- **Unique Considerations:** estrategia opcional y rangos de stake.

---
## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Formula exacta de cuota sugerida y beneficio diario.

- **Location in Story:** Technical Notes / Acceptance Criteria
- **Question for PO/Dev:** cual es la formula y el redondeo esperado?
- **Impact on Testing:** no se puede validar exactitud del calculo.
- **Suggested Clarification:** definir formula y precision (ej: 2 decimales).

**Ambiguity 2:** Rango permitido de stake_preference.

- **Location in Story:** Scope / Notes
- **Question for PO/Dev:** cual es el rango y valores validos?
- **Impact on Testing:** no se pueden cubrir limites ni errores.
- **Suggested Clarification:** rango numerico y valor por defecto.

---

### Missing Information / Gaps

**Gap 1:** Mensajes de error y codigos de validacion.

- **Type:** Acceptance Criteria
- **Why It's Critical:** validar UX y API contract.
- **Suggested Addition:** mensajes y codigos por regla.
- **Impact if Not Added:** pruebas ambiguas y UX inconsistente.

**Gap 2:** Precision de calculos (redondeo).

- **Type:** Business Rule
- **Why It's Critical:** afecta comparaciones y consistencia.
- **Suggested Addition:** precision y metodo de redondeo.
- **Impact if Not Added:** diferencias entre UI y API.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** target_amount con decimales altos (ej: 150.555).

- **Scenario:** valores con precision > 2 decimales
- **Expected Behavior:** redondeo consistente y validacion
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** deadline hoy + 1 dia.

- **Scenario:** minimo permitido
- **Expected Behavior:** aceptado si regla lo permite
- **Criticality:** Medium
- **Action Required:** Add to test cases

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [ ] Acceptance criteria are vague or subjective
- [x] Expected results are not specific enough
- [x] Missing test data examples
- [ ] Missing error scenarios
- [ ] Missing performance criteria (if NFR applies)
- [ ] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**

- Definir formula, precision y rango de stake_preference.
- Definir mensajes y codigos de error.

---
## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Creacion de meta exitosa

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario autenticado con bank activo
  - bank_id valido y perteneciente al usuario
  - base_amount = 100.00
  - target_amount = 150.00
  - deadline = 2026-04-15
  - stake_preference = 5
  - strategy = conservative

- **When:**
  - Envia POST /api/goals con parametros validos

- **Then:**
  - Responde 201 Created
  - goal_id generado
  - daily_profit calculado
  - suggested_odds calculado
  - goal.status = active

---

### Scenario 2: Target menor o igual a base

**Type:** Negative
**Priority:** High

- **Given:** usuario autenticado
- **When:** target_amount <= base_amount
- **Then:**
  - Responde 400 Bad Request
  - Error code: GOAL_TARGET_INVALID
  - No se crea goal

---

### Scenario 3: Deadline pasada

**Type:** Negative
**Priority:** High

- **Given:** usuario autenticado
- **When:** deadline < hoy
- **Then:**
  - Responde 400 Bad Request
  - Error code: GOAL_DEADLINE_PAST
  - No se crea goal

---

### Scenario 4: Stake preference fuera de rango

**Type:** Boundary
**Priority:** Medium

- **Given:** usuario autenticado
- **When:** stake_preference fuera de rango permitido
- **Then:**
  - Responde 400 Bad Request
  - Error code: GOAL_STAKE_RANGE

---

### Scenario 5: Precision y redondeo

**Type:** Edge Case
**Priority:** Medium

- **Given:** valores con precision alta
- **When:** base_amount = 100.123, target_amount = 150.789
- **Then:**
  - daily_profit y suggested_odds redondeados segun regla
  - **Note:** requiere confirmacion PO/Dev

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 7

**Breakdown:**

- Positive: 2
- Negative: 3
- Boundary: 1
- Integration: 1
- API: 3

**Rationale for This Number:** validaciones + formula + persistencia.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Validaciones de input

- **Base Scenario:** POST /api/goals
- **Parameters to Vary:** target_amount, deadline, stake_preference
- **Test Data Sets:**

| target_amount | deadline   | stake_preference | Expected Result         |
| ------------ | ---------- | ---------------- | ----------------------- |
| 100          | 2026-04-15 | 5                | 400 GOAL_TARGET_INVALID |
| 99.99        | 2026-04-15 | 5                | 400 GOAL_TARGET_INVALID |
| 150          | 2026-03-20 | 5                | 400 GOAL_DEADLINE_PAST  |
| 150          | 2026-04-15 | 0                | 400 GOAL_STAKE_RANGE    |

**Total Tests from Parametrization:** 4
**Benefit:** reduce duplicacion de casos negativos.

---

### Test Outlines

#### **Validar creacion de meta con parametros validos**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:**

- Usuario autenticado
- Bank creado

**Test Steps:**

1. Enviar POST /api/goals
   - **Data:** base_amount 100.00, target_amount 150.00, deadline 2026-04-15, stake_preference 5, strategy conservative
2. Verificar respuesta

**Expected Result:**

- **API Response:** 201 Created
- Body incluye goal_id, daily_profit, suggested_odds
- **Database:** goals creado con status active

**Test Data:**

```json
{
  "input": {
    "bankId": "{bank_id}",
    "baseAmount": 100.0,
    "targetAmount": 150.0,
    "deadline": "2026-04-15",
    "stakePreference": 5,
    "strategy": "conservative"
  }
}
```

---

#### **Validar error cuando target <= base**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** 400 GOAL_TARGET_INVALID

---

#### **Validar error cuando deadline pasada**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** 400 GOAL_DEADLINE_PAST

---

#### **Validar error por stake_preference fuera de rango**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** 400 GOAL_STAKE_RANGE

---

#### **Validar redondeo de calculos**

**Related Scenario:** Scenario 5
**Type:** Edge Case
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

**Expected Result:** daily_profit y suggested_odds redondeados segun regla

---
## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend ↔ Backend API (Create Goal)

**Integration Point:** UI Goals → /api/goals
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Completar formulario en UI
2. Enviar y verificar respuesta 201
3. Verificar goal visible en UI

**Expected Result:**

- UI muestra mision diaria y progreso
- Goal persistido en DB

---

## 📊 Edge Cases Summary

| Edge Case                     | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| ---------------------------- | --------------------------- | -------------------- | --------- | -------- |
| Precision alta en montos     | ❌ No                        | ✅ Yes               | TC-05     | Medium   |
| Deadline minimo (hoy + 1 dia) | ❌ No                        | ✅ Yes               | TC-04     | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                  |
| --------------- | ----- | --------------- | ------------------------- |
| Valid data      | 2     | Positive tests  | base 100, target 150      |
| Invalid data    | 3     | Negative tests  | target <= base, deadline  |
| Boundary values | 1     | Boundary tests  | stake_preference fuera    |
| Edge case data  | 1     | Edge case tests | montos con precision alta |

---

## 📋 Test Execution Tracking

**Test Execution Date:** TBD
**Environment:** Staging
**Executed By:** TBD

**Results:**

- Total Tests: 7
- Passed: TBD
- Failed: TBD
- Blocked: TBD

---

**Documentation:**
`.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-22-create-goal/acceptance-test-plan.md`
