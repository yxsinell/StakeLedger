# Acceptance Test Plan: STORY-SL-30 - Follow Recommendation

**Fecha:** 2026-03-21
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-30
**Epic:** EPIC-SL-27 - Recommendations and Insights
**Status:** In Review

---

## Paso 1: Critical Analysis

### Business Context of This Story
**User Persona Affected:**
- **Primary:** Usuario final - Sigue recomendaciones y registra apuestas

**Business Value:**
- **Value Proposition:** Registro rapido desde recomendacion
- **Business Impact:** Incrementa adopcion y trazabilidad al ledger

**Related User Journey:**
- Journey: Consumo y seguimiento de recomendaciones
- Step: Seguir recomendacion y precargar apuesta

---

### Technical Context of This Story
**Architecture Components:**

**Frontend:**
- Components: CTA seguir recomendacion, formulario de apuesta
- Pages/Routes: Feed / Bet entry

**Backend:**
- API Endpoints: follow recommendation, prefill bet (segun api-contracts.yaml)
- Services: validacion de estado de recomendacion, precarga
- Database: Recommendations, Bets, Banks

**External Services:**
- Ninguno

**Integration Points:**
- UI <-> API de follow
- API <-> Recommendations DB
- API <-> Bets/Banks DB

---

### Story Complexity Analysis
**Overall Complexity:** High
**Complexity Factors:**
- Business logic complexity: High - estado de recomendacion y precarga
- Integration complexity: High - dependencias con ledger/banks
- Data validation complexity: Medium - datos normalizados
- UI complexity: Medium - precarga y validaciones

**Estimated Test Effort:** High
**Rationale:** integra flujo de apuestas con datos de recomendacion

---

### Epic-Level Context (From Feature Test Plan)
**Critical Risks Already Identified at Epic Level:**
- Recomendacion sin trazabilidad al ledger
  - **Relevance to This Story:** es el punto de integracion clave

**Integration Points from Epic Analysis:**
- Recomendaciones <-> Ledger: Yes
- Recomendaciones <-> Eventos: Indirecto

**Critical Questions Already Asked at Epic Level:**
- Formato esperado de precarga y mapeo al ledger: pendiente

**Test Strategy from Epic:**
- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Postman/Newman
- **How This Story Aligns:** E2E e integration para precarga

**Summary: How This Story Fits in Epic:**
- **Story Role in Epic:** habilita seguir recomendacion y precargar apuesta
- **Inherited Risks:** trazabilidad y calidad de datos
- **Unique Considerations:** usuario sin bank y estado inactivo

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified
**Ambiguity 1:** Campos exactos de precarga
- **Location in Story:** Notes / Scope
- **Question for PO/Dev:** que campos se precargan y con que reglas?
- **Impact on Testing:** no se pueden validar datos precargados
- **Suggested Clarification:** listar campos y origen de datos

**Ambiguity 2:** Mensaje para recomendacion inactiva
- **Location in Story:** AC Scenario 2
- **Question for PO/Dev:** cual es el copy y codigo de error?
- **Impact on Testing:** resultados no verificables
- **Suggested Clarification:** definir mensajes/codigos

---

### Missing Information / Gaps
**Gap 1:** Reglas de seleccion de bank
- **Type:** Business Rule
- **Why It's Critical:** comportamiento cuando hay multiples banks
- **Suggested Addition:** default bank o selector obligatorio
- **Impact if Not Added:** tests de UX y flujo incompletos

**Gap 2:** Endpoint y payload de follow/prefill
- **Type:** Technical Details
- **Why It's Critical:** necesario para tests API
- **Suggested Addition:** endpoints, request/response en api-contracts
- **Impact if Not Added:** tests API bloqueados

---

### Edge Cases NOT Covered in Original Story
**Edge Case 1:** Recomendacion activa pero datos incompletos
- **Scenario:** falta mercado u odds
- **Expected Behavior:** bloquear precarga con error
- **Criticality:** High
- **Action Required:** Add to story

**Edge Case 2:** Usuario con multiples banks
- **Scenario:** tiene varios banks activos
- **Expected Behavior:** elegir bank o usar default
- **Criticality:** Medium
- **Action Required:** Ask PO/Dev

---

### Testability Validation
**Is this story testeable as written?** Partially
**Testability Issues:**
- [x] Expected results are not specific enough
- [x] Missing test data examples
- [x] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**
- Definir campos precargados y reglas
- Definir mensajes de error
- Definir seleccion de bank

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Precarga exitosa
**Type:** Positive
**Priority:** Critical
- **Given:** recomendacion activa con datos normalizados y usuario con bank
- **When:** el usuario selecciona seguir recomendacion
- **Then:** el formulario se precarga con evento, mercado y odds

---

### Scenario 2: Recomendacion inactiva
**Type:** Negative
**Priority:** High
- **Given:** recomendacion inactiva
- **When:** el usuario intenta seguirla
- **Then:** se muestra mensaje y no se precarga

---

### Scenario 3: Usuario sin bank
**Type:** Negative
**Priority:** High
- **Given:** usuario sin banks
- **When:** intenta seguir recomendacion
- **Then:** se solicita crear bank antes de continuar

---

### Scenario 4: Datos incompletos en recomendacion
**Type:** Boundary
**Priority:** High
- **Given:** recomendacion activa con datos faltantes
- **When:** el usuario intenta seguirla
- **Then:** se rechaza la precarga con error

---

### Scenario 5: Usuario con multiples banks
**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis
- **Given:** usuario con multiples banks
- **When:** intenta seguir recomendacion
- **Then:** se solicita seleccionar bank o se usa default definido

---

## Paso 4: Test Design

### Test Coverage Analysis
**Total Test Cases Needed:** 12
**Breakdown:**
- Positive: 3
- Negative: 5
- Boundary: 2
- Integration: 2

**Rationale for This Number:** cubre estados de recomendacion, banks y precarga

---

### Parametrization Opportunities
**Parametrized Tests Recommended:** Yes
**Parametrized Test Group 1: Estados de recomendacion**
- **Base Scenario:** seguir recomendacion
- **Parameters to Vary:** estado (activa/inactiva), datos completos/incompletos
- **Test Data Sets:**

| estado | datos | Expected Result |
| ------ | ----- | --------------- |
| activa | completos | precarga |
| activa | incompletos | error |
| inactiva | completos | mensaje |

**Total Tests from Parametrization:** 3
**Benefit:** reduce duplicacion en validacion de estado y datos

---

## Test Outlines

#### **Validar precarga exitosa**
**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

**Preconditions:**
- Recomendacion activa con datos completos
- Usuario con bank activo

**Test Steps:**
1. Abrir feed
2. Seleccionar seguir recomendacion
3. Verificar precarga en formulario

**Expected Result:**
- Campos precargados correctos
- Formulario listo para confirmar

---

#### **Validar rechazo por recomendacion inactiva**
**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** No

**Preconditions:**
- Recomendacion inactiva

**Test Steps:**
1. Intentar seguir recomendacion
2. Verificar mensaje

**Expected Result:**
- No se precarga el formulario

---

#### **Validar usuario sin bank**
**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** No

**Preconditions:**
- Usuario sin banks

**Test Steps:**
1. Intentar seguir recomendacion
2. Verificar solicitud de crear bank

**Expected Result:**
- Se bloquea el flujo hasta crear bank

---

#### **Validar datos incompletos**
**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** High
**Test Level:** API
**Parametrized:** Yes (Group 1)

**Preconditions:**
- Recomendacion activa con datos incompletos

**Test Steps:**
1. Lla
