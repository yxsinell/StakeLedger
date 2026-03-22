## 🧪 Acceptance Test Plan - Generated 2026-03-21

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-25 - Protecciones de riesgo

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-25
**Epic:** EPIC-SL-21 - Goals and Risk Advisor
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita limites claros para evitar sobre-riesgo.
- **Secondary:** Laura Rios - requiere umbrales configurables y consistentes.

**Business Value:**

- **Value Proposition:** bloquea cuotas peligrosas y guia reconfiguracion.
- **Business Impact:** reduce riesgo de ruina y mejora confianza.

**Related User Journey:**

- Journey 2: Meta dinamica con recalculo diario
- Step: Protecciones y ajustes de riesgo

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- UI de alertas y recomendaciones
- CTA de reconfiguracion

**Backend:**

- Evaluacion de suggested_odds vs limites
- Persistencia de limites por usuario
- Log de bloqueos

**Database:**

- goals, risk_limits, goal_history

**Integration Points:**

- Goals calculation ↔ Risk limits
- Backend ↔ Database (Risk limits)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - umbrales y reglas.
- Integration complexity: Medium - limites por usuario.
- Data validation complexity: Medium - defaults y overrides.
- UI complexity: Medium - mensajes y bloqueo.

**Estimated Test Effort:** Medium
**Rationale:** requiere validar limites, bloqueos y recomendaciones.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Protecciones mal calibradas (bloqueo excesivo o permisivo).

**Integration Points from Epic Analysis:**

- Backend ↔ Database (Risk limits): ✅ Yes

**Critical Questions Already Asked at Epic Level:**

- Limites por defecto y unidades.

**Test Strategy from Epic:**

- Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Postman
- **How This Story Aligns:** UI + API + reglas de negocio.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** aplica protecciones antes de ejecutar la mision.
- **Inherited Risks:** umbrales y defaults.
- **Unique Considerations:** reconfiguracion sugerida.

---
## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Limites por defecto de cuota suicida.

- **Location in Story:** Notes / Business Rules
- **Question for PO/Dev:** cual es el limite por defecto y unidad?
- **Impact on Testing:** no se pueden validar umbrales.
- **Suggested Clarification:** definir min/max y redondeo.

**Ambiguity 2:** Reglas de reconfiguracion.

- **Location in Story:** Acceptance Criteria
- **Question for PO/Dev:** que recomendaciones se muestran y como se calculan?
- **Impact on Testing:** no se puede validar salida.
- **Suggested Clarification:** definir opciones y prioridad.

---

### Missing Information / Gaps

**Gap 1:** Mensajes exactos de bloqueo y advertencia.

- **Type:** Acceptance Criteria
- **Why It's Critical:** validar UX consistente.
- **Suggested Addition:** textos y codigos.
- **Impact if Not Added:** pruebas ambiguas.

**Gap 2:** Persistencia de limites por usuario.

- **Type:** Technical Details
- **Why It's Critical:** validar defaults vs overrides.
- **Suggested Addition:** campo y jerarquia de configuracion.
- **Impact if Not Added:** inconsistencias en reglas.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Cuota exactamente en el limite.

- **Scenario:** suggested_odds = limite_max
- **Expected Behavior:** permitido sin bloqueo
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** Limites no configurados (usar default).

- **Scenario:** usuario sin limites personalizados
- **Expected Behavior:** aplicar default global
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

- Definir limites por defecto y mensajes.
- Definir reconfiguraciones posibles.

---
## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Cuota dentro de limites

**Type:** Positive
**Priority:** Critical

- **Given:** goal activa con suggested_odds dentro de limite
- **When:** sistema valida limite
- **Then:** permite continuar sin alertas

---

### Scenario 2: Cuota suicida

**Type:** Negative
**Priority:** High

- **Given:** goal activa con suggested_odds > limite
- **When:** sistema valida limite
- **Then:** bloquea accion y muestra advertencia

---

### Scenario 3: Reconfiguracion sugerida

**Type:** Positive
**Priority:** High

- **Given:** goal activa con cuota fuera de rango
- **When:** sistema evalua alternativas
- **Then:** muestra recomendaciones de reconfiguracion

---

### Scenario 4: Cuota en el limite

**Type:** Boundary
**Priority:** Medium

- **Given:** suggested_odds = limite_max
- **When:** sistema valida limite
- **Then:** permite continuar

---

### Scenario 5: Limites no configurados

**Type:** Edge Case
**Priority:** Medium

- **Given:** usuario sin limites personalizados
- **When:** sistema valida suggested_odds
- **Then:** aplica limites por defecto

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

**Breakdown:**

- Positive: 2
- Negative: 2
- Boundary: 2
- Integration: 1
- API: 3

**Rationale for This Number:** umbrales + defaults + UX.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Limites de cuota

- **Base Scenario:** Validacion de suggested_odds
- **Parameters to Vary:** suggested_odds, limite_max
- **Test Data Sets:**

| suggested_odds | limite_max | Expected Result        |
| -------------- | ---------- | ---------------------- |
| 2.0            | 2.5        | permitir continuar     |
| 2.5            | 2.5        | permitir continuar     |
| 2.6            | 2.5        | bloquear y advertir    |

**Total Tests from Parametrization:** 3
**Benefit:** cubre umbrales sin duplicacion.

---

### Test Outlines

#### **Validar cuota dentro de limites**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** sin alertas

---

#### **Validar bloqueo por cuota suicida**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** bloqueo y advertencia

---

#### **Validar reconfiguracion sugerida**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Expected Result:** recomendaciones visibles

---

#### **Validar cuota en limite maximo**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Expected Result:** permitido

---

#### **Validar limites por defecto**

**Related Scenario:** Scenario 5
**Type:** Edge Case
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Expected Result:** aplica default global

---
## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Suggested odds → Risk limits

**Integration Point:** calculo de suggested_odds → validacion de limites
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Calcular suggested_odds
2. Validar contra limites del usuario
3. Mostrar resultado en UI

**Expected Result:**

- Bloqueo o permit segun umbral

---

## 📊 Edge Cases Summary

| Edge Case            | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| ------------------- | --------------------------- | -------------------- | --------- | -------- |
| Cuota en el limite  | ❌ No                        | ✅ Yes               | TC-04     | Medium   |
| Limites por defecto | ❌ No                        | ✅ Yes               | TC-05     | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples            |
| --------------- | ----- | --------------- | ------------------- |
| Valid data      | 2     | Positive tests  | odds 2.0, 2.5       |
| Invalid data    | 1     | Negative tests  | odds 2.6            |
| Boundary values | 1     | Boundary tests  | odds = limite       |
| Edge case data  | 1     | Edge case tests | usuario sin limites |

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
`.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-25-risk-protections/acceptance-test-plan.md`
