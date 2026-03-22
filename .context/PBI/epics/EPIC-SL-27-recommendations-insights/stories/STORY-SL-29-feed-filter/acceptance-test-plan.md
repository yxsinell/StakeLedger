# Acceptance Test Plan: STORY-SL-29 - Feed Filter

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-29
**Epic:** EPIC-SL-27 - Recommendations and Insights
**Status:** In Review

---

## Paso 1: Critical Analysis

### Business Context of This Story
**User Persona Affected:**
- **Primary:** Usuario final - Navega recomendaciones

**Business Value:**
- **Value Proposition:** Navegacion rapida y confiable del feed
- **Business Impact:** Mejora descubrimiento y conversion a seguimiento

**Related User Journey:**
- Journey: Consumo de recomendaciones
- Step: Filtrar feed por tipo y categoria

---

### Technical Context of This Story
**Architecture Components:**

**Frontend:**
- Components: filtros de feed, estado vacio, loading
- Pages/Routes: Feed

**Backend:**
- API Endpoints: listado/filtrado de recomendaciones (segun api-contracts.yaml)
- Services: query de feed y paginacion
- Database: Recommendations

**External Services:**
- Ninguno

**Integration Points:**
- UI Feed <-> API de recomendaciones
- API <-> Recommendations DB

---

### Story Complexity Analysis
**Overall Complexity:** Medium
**Complexity Factors:**
- Business logic complexity: Low - filtros simples
- Integration complexity: Medium - paginacion y ordenamiento
- Data validation complexity: Medium - filtros opcionales
- UI complexity: Medium - estados vacio/loading

**Estimated Test Effort:** Medium
**Rationale:** combina UI, API y reglas de orden/filtrado

---

### Epic-Level Context (From Feature Test Plan)
**Critical Risks Already Identified at Epic Level:**
- Feed lento por filtros
  - **Relevance to This Story:** riesgo directo del filtrado y orden

**Integration Points from Epic Analysis:**
- Feed <-> Metrics: No
- Recomendaciones <-> Eventos: No

**Critical Questions Already Asked at Epic Level:**
- Umbrales de performance del feed: pendiente

**Test Strategy from Epic:**
- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Postman/Newman
- **How This Story Aligns:** UI/API para filtros y orden

**Summary: How This Story Fits in Epic:**
- **Story Role in Epic:** expone el feed filtrable para consumo
- **Inherited Risks:** performance del feed
- **Unique Considerations:** combinaciones de filtros y paginacion

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified
**Ambiguity 1:** Paginacion por defecto
- **Location in Story:** Notes / Technical Notes
- **Question for PO/Dev:** cual es el page size y el comportamiento al cambiar filtros?
- **Impact on Testing:** no se pueden definir boundary de paginacion
- **Suggested Clarification:** definir page size, offset y reset de pagina

**Ambiguity 2:** Orden por fecha desc
- **Location in Story:** Business Rules
- **Question for PO/Dev:** que campo de fecha se usa y que pasa con empates?
- **Impact on Testing:** resultados no verificables
- **Suggested Clarification:** definir campo y tie-breaker

---

### Missing Information / Gaps
**Gap 1:** Lista valida de sport/league
- **Type:** Business Rule
- **Why It's Critical:** filtros opcionales requieren valores validos
- **Suggested Addition:** catalogo de deportes/ligas permitidos
- **Impact if Not Added:** tests de filtros bloqueados

**Gap 2:** Manejo de estado vacio
- **Type:** UX/Copy
- **Why It's Critical:** AC Scenario 4 requiere estado vacio verificable
- **Suggested Addition:** texto/estructura del estado vacio
- **Impact if Not Added:** resultados subjetivos

---

### Edge Cases NOT Covered in Original Story
**Edge Case 1:** Combinacion de filtros sin resultados
- **Scenario:** pre + sport + league sin matches
- **Expected Behavior:** estado vacio consistente
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** Filtros invalidos
- **Scenario:** valor no permitido en sport/league
- **Expected Behavior:** error 400 o fallback a sin filtro
- **Criticality:** Medium
- **Action Required:** Ask PO/Dev

---

### Testability Validation
**Is this story testeable as written?** Partially
**Testability Issues:**
- [x] Expected results are not specific enough
- [x] Missing test data examples

**Recommendations to Improve Testability:**
- Definir paginacion y ordenamiento exacto
- Listar valores validos de sport/league
- Definir copy del estado vacio

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Filtrar por pre-match
**Type:** Positive
**Priority:** High
- **Given:** usuario en el feed con recomendaciones pre y live
- **When:** aplica filtro pre-match
- **Then:** solo se muestran recomendaciones pre-match

---

### Scenario 2: Filtrar por live
**Type:** Positive
**Priority:** High
- **Given:** usuario en el feed con recomendaciones pre y live
- **When:** aplica filtro live
- **Then:** solo se muestran recomendaciones live

---

### Scenario 3: Filtrar por sport/league
**Type:** Positive
**Priority:** Medium
- **Given:** usuario en el feed con recomendaciones de multiples deportes
- **When:** aplica filtro por sport y/o league
- **Then:** se muestran recomendaciones del filtro seleccionado

---

### Scenario 4: Sin resultados
**Type:** Negative
**Priority:** Medium
- **Given:** usuario aplica filtros
- **When:** no hay recomendaciones
- **Then:** se muestra estado vacio

---

### Scenario 5: Orden por fecha desc
**Type:** Boundary
**Priority:** Medium
- **Given:** usuario en el feed con recomendaciones con fechas cercanas
- **When:** carga el feed
- **Then:** se ordena por fecha desc segun regla definida

---

## Paso 4: Test Design

### Test Coverage Analysis
**Total Test Cases Needed:** 10
**Breakdown:**
- Positive: 4
- Negative: 3
- Boundary: 2
- Integration: 1

**Rationale for This Number:** cubre filtros, combinaciones y estado vacio

---

### Parametrization Opportunities
**Parametrized Tests Recommended:** Yes
**Parametrized Test Group 1: Combinaciones de filtros**
- **Base Scenario:** listado con filtros
- **Parameters to Vary:** type, sport, league
- **Test Data Sets:**

| type | sport | league | Expected Result |
| ---- | ----- | ------ | --------------- |
| pre  | all   | all    | only pre        |
| live | all   | all    | only live       |
| pre  | soccer| all    | pre soccer      |
| live | soccer| league1| live soccer l1  |

**Total Tests from Parametrization:** 4
**Benefit:** reduce duplicacion en filtros

---

## Test Outlines

#### **Validar filtro pre-match**
**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** No

**Preconditions:**
- Feed con recomendaciones pre y live

**Test Steps:**
1. Abrir feed
2. Aplicar filtro pre-match
3. Verificar resultados

**Expected Result:**
- Solo recomendaciones pre-match visibles

---

#### **Validar filtro live**
**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** No

**Preconditions:**
- Feed con recomendaciones pre y live

**Test Steps:**
1. Abrir feed
2. Aplicar filtro live
3. Verificar resultados

**Expected Result:**
- Solo recomendaciones live visibles

---

#### **Validar filtro por sport/league**
**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** Medium
**Test Level:** UI
**Parametrized:** Yes (Group 1)

**Preconditions:**
- Feed con recomendaciones de multiples deportes/ligas

**Test Steps:**
1. Aplicar filtros segun tabla
2. Verificar resultados

**Expected Result:**
- Resultados coinciden con filtros

---

#### **Validar estado vacio**
**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** Medium
**Test Level:** UI
**Parametrized:** No

**Preconditions:**
- Feed sin recomendaciones para el filtro

**Test Steps:**
1. Aplicar filtro sin resultados
2. Verificar estado vacio

**Expected Result:**
- Estado vacio visible con copy definido

---

#### **Validar orden por fecha desc**
**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** No

**Preconditions:**
- 
