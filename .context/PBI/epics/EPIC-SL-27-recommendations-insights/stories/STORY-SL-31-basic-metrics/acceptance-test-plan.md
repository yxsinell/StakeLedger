# Acceptance Test Plan: STORY-SL-31 - Basic Metrics

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-31
**Epic:** EPIC-SL-27 - Recommendations and Insights
**Status:** In Review

---

## Paso 1: Critical Analysis

### Business Context of This Story
**User Persona Affected:**
- **Primary:** Usuario final - Monitorea rendimiento

**Business Value:**
- **Value Proposition:** Visibilidad de rendimiento basico
- **Business Impact:** Mejora decisiones y retencion

**Related User Journey:**
- Journey: Seguimiento de performance
- Step: Consultar metricas por bank y rango

---

### Technical Context of This Story
**Architecture Components:**

**Frontend:**
- Components: vista de metricas, filtros de rango
- Pages/Routes: Metrics

**Backend:**
- API Endpoints: metricas por bank/rango (segun api-contracts.yaml)
- Services: calculo de yield y win rate
- Database: Ledger, Bets

**External Services:**
- Ninguno

**Integration Points:**
- UI Metrics <-> API de metricas
- API <-> Ledger/Bets DB

---

### Story Complexity Analysis
**Overall Complexity:** Medium
**Complexity Factors:**
- Business logic complexity: High - formulas de yield
- Integration complexity: Medium - dependencia con liquidacion
- Data validation complexity: Medium - rango de fechas
- UI complexity: Medium - filtros y estados vacio

**Estimated Test Effort:** Medium
**Rationale:** requiere validacion de calculos y data sets

---

### Epic-Level Context (From Feature Test Plan)
**Critical Risks Already Identified at Epic Level:**
- Metricas incorrectas afectan decisiones
  - **Relevance to This Story:** riesgo directo de calculo

**Integration Points from Epic Analysis:**
- Feed <-> Metrics: No
- Recomendaciones <-> Ledger: Indirecto

**Critical Questions Already Asked at Epic Level:**
- Formulas exactas de yield: pendiente

**Test Strategy from Epic:**
- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Postman/Newman
- **How This Story Aligns:** API/UI con datos controlados

**Summary: How This Story Fits in Epic:**
- **Story Role in Epic:** expone metricas basicas por bank
- **Inherited Risks:** calculos y consistencia
- **Unique Considerations:** usuarios sin apuestas

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified
**Ambiguity 1:** Formulas exactas de yield cash y yield operativo
- **Location in Story:** Notes / Technical Notes
- **Question for PO/Dev:** cuales son las formulas exactas y rounding?
- **Impact on Testing:** no se puede validar resultados
- **Suggested Clarification:** definir formulas y precision

**Ambiguity 2:** Definicion de apuestas liquidadas
- **Location in Story:** Business Rules
- **Question for PO/Dev:** que estados de apuesta se consideran liquidadas?
- **Impact on Testing:** dataset invalido
- **Suggested Clarification:** lista de estados validos

---

### Missing Information / Gaps
**Gap 1:** Rango de fechas valido
- **Type:** Business Rule
- **Why It's Critical:** afecta validacion de filtros
- **Suggested Addition:** formato, max rango, y timezone
- **Impact if Not Added:** tests de rango bloqueados

**Gap 2:** Comportamiento de cache
- **Type:** Technical Details
- **Why It's Critical:** impacta consistencia de resultados
- **Suggested Addition:** TTL y criterio de invalidacion
- **Impact if Not Added:** no se validan escenarios de cache

---

### Edge Cases NOT Covered in Original Story
**Edge Case 1:** Apuestas liquidadas en rango parcial
- **Scenario:** algunas apuestas dentro y otras fuera
- **Expected Behavior:** incluir solo dentro del rango
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** Rango invalido (fin < inicio)
- **Scenario:** fecha fin anterior a inicio
- **Expected Behavior:** error de validacion
- **Criticality:** High
- **Action Required:** Add to story

---

### Testability Validation
**Is this story testeable as written?** Partially
**Testability Issues:**
- [x] Expected results are not specific enough
- [x] Missing test data examples

**Recommendations to Improve Testability:**
- Definir formulas, precision y rounding
- Definir rango valido y timezone
- Definir estados liquidados

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Ver metricas
**Type:** Positive
**Priority:** Critical
- **Given:** usuario con apuestas liquidadas en el rango
- **When:** accede a la vista de metricas
- **Then:** se muestran yield cash, yield operativo y win rate

---

### Scenario 2: Sin apuestas
**Type:** Negative
**Priority:** Medium
- **Given:** usuario sin apuestas liquidadas
- **When:** accede a metricas
- **Then:** se muestran ceros o estado vacio definido

---

### Scenario 3: Rango invalido
**Type:** Negative
**Priority:** High
- **Given:** usuario en la vista de metricas
- **When:** selecciona un rango invalido
- **Then:** se muestra error de validacion

---

### Scenario 4: Solo apuestas dentro del rango
**Type:** Boundary
**Priority:** Medium
- **Given:** usuario con apuestas dentro y fuera del rango
- **When:** consulta metricas
- **Then:** solo se consideran apuestas dentro del rango

---

## Paso 4: Test Design

### Test Coverage Analysis
**Total Test Cases Needed:** 11
**Breakdown:**
- Positive: 3
- Negative: 4
- Boundary: 3
- Integration: 1

**Rationale for This Number:** cubre calculos, rangos y estados vacios

---

### Parametrization Opportunities
**Parametrized Tests Recommended:** Yes
**Parametrized Test Group 1: Rangos de fechas**
- **Base Scenario:** consulta de metricas
- **Parameters to Vary:** rango valido, rango vacio, rango invalido
- **Test Data Sets:**

| rango | apuestas | Expected Result |
| ----- | -------- | --------------- |
| valido | con apuestas | metricas calculadas |
| valido | sin apuestas | ceros/estado vacio |
| invalido | n/a | error |

**Total Tests from Parametrization:** 3
**Benefit:** cubre reglas de rango con menos duplicacion

---

## Test Outlines

#### **Validar visualizacion de metricas**
**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** API
**Parametrized:** Yes (Group 1)

**Preconditions:**
- Apuestas liquidadas con datos conocidos

**Test Steps:**
1. Consultar metricas por bank y rango
2. Verificar valores calculados

**Expected Result:**
- Yield cash, yield operativo y win rate correctos

---

#### **Validar usuario sin apuestas**
**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** Medium
**Test Level:** UI
**Parametrized:** No

**Preconditions:**
- Usuario sin apuestas liquidadas

**Test Steps:**
1. Abrir vista de metricas
2. Verificar estado vacio/ceros

**Expected Result:**
- Estado vacio o ceros definidos

---

#### **Validar rango invalido**
**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** Yes (Group 1)

**Preconditions:**
- Vista de metricas disponible

**Test Steps:**
1. Seleccionar rango invalido
2. Verificar mensaje

**Expected Result:**
- Error de validacion

---

#### **Validar inclusion por rango**
**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** No

**Preconditions:**
- Apuestas dentro y fuera del rango

**Test Steps:**
1. Consultar metricas
2. Verificar inclusion solo dentro del rango

**Expected Result:**
- Calculos excluyen apuestas fuera del rango

---

## Edge Cases Summary
| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------- | -------------------------- | -------------------- | --------- | -------- |
| Apuestas parciales en rango | No | Yes (Scenario 4) | TC-04 | Medium |
| Rango invalido (fin < inicio) | No | Yes (Scenario 3) | TC-03 | High |

---

## Test Data Summary
### Data Categories
| Data Type | Count | Purpose | Examples |
| --------- | ----- | ------- | -------- |
| Valid data | 3 | Positive tests | apuestas liquidadas con resultados conocidos |
| Invalid data
