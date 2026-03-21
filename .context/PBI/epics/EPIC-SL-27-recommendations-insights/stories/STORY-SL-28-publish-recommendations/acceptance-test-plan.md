# Acceptance Test Plan: STORY-SL-28 - Publish Recommendations

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-28
**Epic:** EPIC-SL-27 - Recommendations and Insights
**Status:** In Review

---

## Paso 1: Critical Analysis

### Business Context of This Story
**User Persona Affected:**
- **Primary:** Admin/Editor - Publica recomendaciones para el feed
- **Secondary:** Usuario final - Consume recomendaciones publicadas

**Business Value:**
- **Value Proposition:** Publicacion confiable de recomendaciones normalizadas
- **Business Impact:** Habilita contenido accionable y seguimiento en el feed

**Related User Journey:**
- Journey: Publicacion y consumo de recomendaciones
- Step: Publicar recomendacion normalizada

---

### Technical Context of This Story
**Architecture Components:**

**Frontend:**
- Components: UI de creacion de recomendaciones
- Pages/Routes: Admin/Recommendations (por definir)

**Backend:**
- API Endpoints: Publicacion de recomendacion (segun api-contracts.yaml)
- Services: Normalizacion y validacion de eventos
- Database: Recommendations, Events

**External Services:**
- Ninguno

**Integration Points:**
- UI Admin <-> API de recomendaciones
- API <-> Events normalizados
- API <-> Recommendations DB

---

### Story Complexity Analysis
**Overall Complexity:** High
**Complexity Factors:**
- Business logic complexity: Medium - reglas de normalizacion e ICP
- Integration complexity: High - validacion con eventos normalizados
- Data validation complexity: High - campos requeridos + ICP
- UI complexity: Medium - formulario con validaciones

**Estimated Test Effort:** High
**Rationale:** validaciones estrictas, permisos y dependencias con catalogo normalizado

---

### Epic-Level Context (From Feature Test Plan)
**Critical Risks Already Identified at Epic Level:**
- Datos inconsistentes en recomendaciones por normalizacion/ICP
  - **Relevance to This Story:** afecta la publicacion y calidad del feed
- Precarga sin trazabilidad al ledger
  - **Relevance to This Story:** impacto indirecto (datos correctos desde origen)

**Integration Points from Epic Analysis:**
- Recomendaciones <-> Eventos: Yes (validacion de evento normalizado)
- Recomendaciones <-> Ledger: No (no aplica directo en esta story)
- Feed <-> Metrics: No

**Critical Questions Already Asked at Epic Level:**
- Campos ICP y reglas de validacion: pendiente
- Umbrales de performance: no aplica directo

**Test Strategy from Epic:**
- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Postman/Newman
- **How This Story Aligns:** Unit para validaciones, Integration/API para publicacion

**Summary: How This Story Fits in Epic:**
- **Story Role in Epic:** habilita la publicacion normalizada
- **Inherited Risks:** datos inconsistentes
- **Unique Considerations:** permisos admin/editor y validacion de evento

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified
**Ambiguity 1:** Campos ICP requeridos y validaciones exactas
- **Location in Story:** Notes / Scope / Technical Notes
- **Question for PO/Dev:** Cuales campos ICP son obligatorios y reglas de validacion por campo?
- **Impact on Testing:** no se pueden definir casos boundary ni errores esperados
- **Suggested Clarification:** listar campos, tipos, min/max y formatos

**Ambiguity 2:** Mensajes de error y codigos esperados
- **Location in Story:** AC Scenario 2 y 3
- **Question for PO/Dev:** cual es el mensaje/codigo de error para evento no normalizado y permisos?
- **Impact on Testing:** no hay criterios verificables de error
- **Suggested Clarification:** definir codigos y textos de error

---

### Missing Information / Gaps
**Gap 1:** Endpoint y payload de publicacion
- **Type:** Technical Details
- **Why It's Critical:** necesario para tests API e integration
- **Suggested Addition:** especificar endpoint, payload y response en api-contracts
- **Impact if Not Added:** tests API bloqueados

**Gap 2:** Definicion de "evento normalizado"
- **Type:** Business Rule
- **Why It's Critical:** condicion principal de validacion
- **Suggested Addition:** criterios de normalizacion y fuente de verdad
- **Impact if Not Added:** resultados no verificables

---

### Edge Cases NOT Covered in Original Story
**Edge Case 1:** Evento normalizado pero mercado/odds inconsistentes
- **Scenario:** evento existe, pero mercado/odds no cumplen reglas
- **Expected Behavior:** rechazo con error de validacion
- **Criticality:** High
- **Action Required:** Add to story

**Edge Case 2:** Duplicado de recomendacion para mismo evento/mercado
- **Scenario:** admin intenta publicar recomendacion duplicada
- **Expected Behavior:** bloquear o versionar segun regla
- **Criticality:** Medium
- **Action Required:** Ask PO

---

### Testability Validation
**Is this story testeable as written?** Partially
**Testability Issues:**
- [ ] Acceptance criteria are vague or subjective
- [x] Expected results are not specific enough
- [x] Missing test data examples
- [x] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**
- Definir campos ICP y reglas de validacion
- Documentar endpoint/payload/errores
- Definir manejo de duplicados

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Publicacion exitosa con datos normalizados
**Type:** Positive
**Priority:** Critical
- **Given:** admin autenticado con rol editor
- **When:** crea una recomendacion con evento normalizado, mercado valido, odds validas, type (pre/live) e ICP completo
- **Then:**
  - la recomendacion se guarda en Recommendations
  - queda asociada al evento normalizado
  - aparece en el feed

---

### Scenario 2: Evento no normalizado
**Type:** Negative
**Priority:** High
- **Given:** admin autenticado
- **When:** intenta publicar con evento no normalizado
- **Then:**
  - la publicacion es rechazada
  - se retorna error de validacion
  - no se crea registro en Recommendations

---

### Scenario 3: Usuario sin permisos
**Type:** Negative
**Priority:** High
- **Given:** usuario sin rol admin/editor
- **When:** intenta publicar una recomendacion
- **Then:**
  - la accion es rechazada por permisos
  - no se crea registro

---

### Scenario 4: Datos ICP incompletos
**Type:** Boundary
**Priority:** High
- **Given:** admin autenticado
- **When:** intenta publicar sin uno o mas campos ICP obligatorios
- **Then:**
  - se rechaza con error de validacion
  - no se publica en el feed
  - no se crea registro

---

### Scenario 5: Recomendacion duplicada
**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis
- **Given:** existe una recomendacion publicada para mismo evento/mercado/type
- **When:** admin intenta publicar otra igual
- **Then:**
  - **Expected Behavior:** requiere definicion (rechazar o versionar)
  - **Note:** necesita confirmacion PO/Dev

---

## Paso 4: Test Design

### Test Coverage Analysis
**Total Test Cases Needed:** 12
**Breakdown:**
- Positive: 3
- Negative: 5
- Boundary: 3
- Integration: 1

**Rationale for This Number:** cubre happy path, permisos, validaciones ICP y evento normalizado

---

### Parametrization Opportunities
**Parametrized Tests Recommended:** Yes
**Parametrized Test Group 1: Validaciones de ICP**
- **Base Scenario:** publicacion con ICP
- **Parameters to Vary:** campos ICP obligatorios, formatos, min/max
- **Test Data Sets:**

| icp_field_a | icp_field_b | type | Expected Result |
| ----------- | ----------- | ---- | --------------- |
| valid       | valid       | pre  | published       |
| missing     | valid       | pre  | validation error|
| valid       | invalid     | live | validation error|

**Total Tests from Parametrization:** 3
**Benefit:** reduce duplicacion en validaciones de ICP

---

## Test Outlines

#### **Validar publicacion exitosa con datos normalizados y ICP completo**
**Related Scenario:** Scenario 1
**Type:** Positive
**Pri
