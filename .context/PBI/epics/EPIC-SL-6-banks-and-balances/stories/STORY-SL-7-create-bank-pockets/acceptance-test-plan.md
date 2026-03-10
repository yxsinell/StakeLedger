## Acceptance Test Plan - Generated 2026-03-10

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SL-7 - Create bank with pockets

**Fecha:** 2026-03-10
**QA Engineer:** AI-Generated
**Story Jira Key:** SL-7
**Epic:** EPIC-SL-6 - Banks and Balances
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos Vega - necesita separar cash/bonus/freebet para ver su balance real.
- **Secondary:** Laura Rios - requiere ledger auditable con saldos consistentes.

**Business Value:**

- **Value Proposition:** separacion clara de saldos por pocket con trazabilidad.
- **Business Impact:** impulsa el KPI de usuarios que crean al menos 1 bank en 14 dias.

**Related User Journey:**

- Journey: Registro y primera apuesta
- Step: Crear un bank principal y definir saldos iniciales

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: formulario de creacion de bank, validaciones client-side
- Pages/Routes: /banks (create), /banks/[bankId]
- State Management: n/a (pendiente de definicion)

**Backend:**

- API Endpoints: POST /api/banks
- Services: creacion de bank, inicializacion de pockets, ledger inicial
- Database: banks, bank_pockets, transactions

**External Services:**

- N/A

**Integration Points:**

- Frontend -> Backend API (POST /api/banks)
- Backend -> Database (creacion atomica + ledger)
- Backend -> Auth/RLS (ownership)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - validaciones y ledger inicial
- Integration complexity: Medium - API + DB + Auth
- Data validation complexity: Medium - montos y currency
- UI complexity: Low - formulario simple

**Estimated Test Effort:** Medium
**Rationale:** requiere validaciones, atomicidad y seguridad.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: Ledger desbalanceado por operaciones no atomicas
  - **Relevance to This Story:** la creacion debe ser atomica para evitar pockets/ledger incompletos
- Risk 2: Ownership/RLS incorrecto
  - **Relevance to This Story:** solo el owner puede crear/leer su bank

**Integration Points from Epic Analysis:**

- Integration Point 1: Frontend <-> Backend API
  - **Applies to This Story:** ✅ Yes - POST /api/banks
- Integration Point 2: Backend <-> Database
  - **Applies to This Story:** ✅ Yes - banks/pockets/transactions
- Integration Point 3: Backend <-> Auth/RLS
  - **Applies to This Story:** ✅ Yes - ownership

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Question 1: Se permiten transferencias entre banks con distinta moneda?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** define si currency es restrictiva por usuario

**Questions for Dev:**

- Question 1: Transferencias permiten pocket destino distinto?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** no aplica directamente, pero afecta reglas de pockets

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Postman
- **How This Story Aligns:** requiere unit tests de validaciones, integration/API para creacion atomica y E2E para formulario

**Updates and Clarifications from Epic Refinement:**

- Sin updates posteriores en comentarios del epic.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** habilita el ledger base creando bank + pockets + ledger inicial
- **Inherited Risks:** atomicidad y ownership
- **Unique Considerations:** currency validation y reglas de nombre

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Validacion de currency (formato y lista permitida)

- **Location in Story:** Scope/Business Rules
- **Question for PO/Dev:** Currency debe ser ISO 4217? Se limita a una lista (EUR/USD)?
- **Impact on Testing:** no podemos validar input ni mensajes de error
- **Suggested Clarification:** definir lista y formato permitido

**Ambiguity 2:** Regla de nombre duplicado por usuario

- **Location in Story:** Acceptance criteria
- **Question for PO:** Se permite crear banks con el mismo nombre para un mismo usuario?
- **Impact on Testing:** afecta casos negativos y UX
- **Suggested Clarification:** definir regla de unicidad

---

### Missing Information / Gaps

**Gap 1:** Precision y redondeo de montos iniciales

- **Type:** Business Rule
- **Why It's Critical:** afecta validacion de montos y asserts de balance
- **Suggested Addition:** definir precision (2 decimales) y regla de redondeo
- **Impact if Not Added:** discrepancias contables

**Gap 2:** Mensajes/codigos de error esperados

- **Type:** Acceptance Criteria
- **Why It's Critical:** tests de error no pueden validar respuestas
- **Suggested Addition:** especificar error code y message minimo
- **Impact if Not Added:** tests menos confiables

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Todos los montos iniciales = 0

- **Scenario:** crear bank con 0 en cash/bonus/freebet
- **Expected Behavior:** permitir creacion y pockets en 0
- **Criticality:** Medium
- **Action Required:** Add to story + tests

**Edge Case 2:** Montos con precision alta (0.005)

- **Scenario:** monto con mas de 2 decimales
- **Expected Behavior:** redondeo o rechazo segun regla
- **Criticality:** High
- **Action Required:** Ask PO/Dev

**Edge Case 3:** Nombre duplicado

- **Scenario:** crear bank con nombre existente
- **Expected Behavior:** permitir o bloquear segun regla
- **Criticality:** Medium
- **Action Required:** Ask PO

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [ ] Acceptance criteria are vague or subjective
- [x] Missing error messages/codes
- [x] Missing test data examples
- [x] Missing precision rules
- [x] Missing business rule for currency

**Recommendations to Improve Testability:**

- Definir formato y lista de currency
- Especificar precision/rounding
- Especificar codigos/mensajes de error

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Creacion exitosa con montos iniciales validos

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario autenticado con role=user
  - No existe bank con nombre "Bank Principal" para el usuario

- **When:**
  - Envia POST /api/banks con:
    - name="Bank Principal"
    - currency="EUR"
    - initialCash=100
    - initialBonus=20
    - initialFreebet=10

- **Then:**
  - Se crea bank y retorna bank_id
  - Se crean 3 pockets con balances 100/20/10
  - Se registra transaccion inicial en ledger
  - Status code: 201 Created

---

### Scenario 2: Rechazo por monto inicial negativo

**Type:** Negative
**Priority:** High

- **Given:** usuario autenticado
- **When:** envia initialCash=-10
- **Then:**
  - Status code: 400 Bad Request
  - Error de validacion por monto < 0
  - No se crea bank ni pockets

---

### Scenario 3: Rechazo por nombre requerido

**Type:** Negative
**Priority:** High

- **Given:** usuario autenticado
- **When:** envia name=""
- **Then:**
  - Status code: 400 Bad Request
  - Error de validacion por nombre requerido
  - No se crea bank ni pockets

---

### Scenario 4: Montos iniciales en cero

**Type:** Boundary
**Priority:** Medium

- **Given:** usuario autenticado
- **When:** crea bank con initialCash=0, initialBonus=0, initialFreebet=0
- **Then:**
  - Bank creado, pockets en 0
  - Status code: 201 Created

---

### Scenario 5: Precision de montos (edge case)

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis

- **Given:** usuario autenticado
- **When:** crea bank con initialCash=0.005
- **Then:**
  - Comportamiento esperado depende de regla de precision
  - **Note:** requiere confirmacion PO/Dev

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

**Breakdown:**

- Positive: 3
- Negative: 3
- Boundary: 2
- Integration: 1
- API: 1

**Rationale for This Number:**

Cubre validaciones clave, atomicidad de DB, y edge cases de montos/nombre.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Montos iniciales validos

- **Base Scenario:** creacion exitosa con montos >= 0
- **Parameters to Vary:** initialCash, initialBonus, initialFreebet, currency
- **Test Data Sets:**

| initialCash | initialBonus | initialFreebet | currency | Expected Result |
| ----------- | ------------ | -------------- | -------- | --------------- |
| 0           | 0            | 0              | EUR      | 201 Created     |
| 100         | 20           | 10             | EUR      | 201 Created     |
| 50.5        | 0            | 0              | USD      | 201 Created     |

**Total Tests from Parametrization:** 3
**Benefit:** reduce duplicacion y mejora coverage de montos/currency

---

### Test Outlines

#### Validar creacion de bank con montos iniciales validos

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Usuario autenticado (role=user)
- No existe bank con name "Bank Principal"

**Test Steps:**

1. POST /api/banks
   - **Data:** name="Bank Principal", currency="EUR", initialCash=100, initialBonus=20, initialFreebet=10
2. Verificar respuesta
3. Verificar DB

**Expected Result:**

- **API Response:** 201 Created
- **Database:**
  - banks: nuevo registro con name="Bank Principal" y currency="EUR"
  - bank_pockets: 3 registros con balances 100/20/10
  - transactions: 1 registro inicial asociado al bank

---

#### Validar rechazo por monto inicial negativo

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:** usuario autenticado

**Test Steps:**

1. POST /api/banks con initialCash=-10
2. Verificar respuesta de error

**Expected Result:**

- Status Code: 400 Bad Request
- **Database:** sin cambios

---

#### Validar rechazo por nombre requerido

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:** usuario autenticado

**Test Steps:**

1. POST /api/banks con name=""
2. Verificar respuesta de error

**Expected Result:**

- Status Code: 400 Bad Request
- **Database:** sin cambios

---

#### Validar creacion con montos iniciales en cero

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:** usuario autenticado

**Test Steps:**

1. POST /api/banks con initialCash=0, initialBonus=0, initialFreebet=0
2. Verificar respuesta

**Expected Result:**

- 201 Created
- pockets en 0

---

#### Validar precision de montos iniciales

**Related Scenario:** Scenario 5
**Type:** Edge Case
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:** usuario autenticado

**Test Steps:**

1. POST /api/banks con initialCash=0.005
2. Verificar comportamiento

**Expected Result:**

- Comportamiento segun regla de precision (pendiente)

---

#### Validar creacion desde UI con datos validos

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:** usuario autenticado en UI

**Test Steps:**

1. Abrir pantalla crear bank
2. Completar formulario con datos validos
3. Confirmar creacion

**Expected Result:**

- UI muestra bank creado y balances

---

## Integration Test Cases (If Applicable)

### Integration Test 1: Frontend -> Backend API (POST /api/banks)

**Integration Point:** Frontend -> Backend API
**Type:** Integration
**Priority:** High

**Preconditions:**

- API disponible
- Usuario autenticado

**Test Flow:**

1. Frontend envia request a POST /api/banks
2. API procesa y crea registros
3. Frontend recibe response

**Contract Validation:**

- Request matches OpenAPI: ✅ Yes
- Response matches OpenAPI: ✅ Yes
- Status codes match spec: ✅ Yes

**Expected Result:**

- Data fluye correctamente y UI refleja balances

---

## Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------- | -------------------------- | --------------------- | --------- | -------- |
| Montos iniciales en 0 | ❌ No | ✅ Yes (Scenario 4) | ATP-EC-01 | Medium |
| Precision 0.005 | ❌ No | ✅ Yes (Scenario 5) | ATP-EC-02 | Medium |
| Nombre duplicado | ❌ No | ❌ Pending | TBD | Medium |

---

## Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
| --------- | ----- | ------- | -------- |
| Valid data | 3 | Positive tests | EUR 100/20/10, EUR 0/0/0, USD 50.5/0/0 |
| Invalid data | 2 | Negative tests | initialCash=-10, name="" |
| Boundary values | 1 | Boundary tests | all zeros |
| Edge case data | 1 | Edge tests | initialCash=0.005 |

### Data Generation Strategy

**Static Test Data:**

- currency="EUR"
- name="Bank Principal"

**Dynamic Test Data (using Faker.js):**

- name: faker.company.name()
- amounts: faker.number.float({ min: 0, max: 1000, precision: 0.01 })

**Test Data Cleanup:**

- ✅ Data limpiada post ejecucion
- ✅ Tests idempotentes
- ✅ Sin dependencias de orden

---

## Definition of Done (QA Perspective)

- [ ] Ambiguedades resueltas (currency, duplicados, precision)
- [ ] Story actualizada con mejoras aceptadas
- [ ] Test cases ejecutados y passing
- [ ] Critical/High 100% passing
- [ ] Integracion y contrato API validados
- [ ] Regression testing pasado

---

## Test Execution Tracking

**Test Execution Date:** TBD
**Environment:** Staging (preview)
**Executed By:** TBD

**Results:**

- Total Tests: 10
- Passed: TBD
- Failed: TBD
- Blocked: TBD

**Bugs Found:**

- TBD

**Sign-off:** TBD

---

## Action Required

**Product Owner:**

- [ ] Confirmar reglas de currency y duplicados
- [ ] Confirmar comportamiento de precision (redondeo vs rechazo)

**Dev Lead:**

- [ ] Validar atomicidad de creacion (bank+pockets+ledger)
- [ ] Confirmar codigos/mensajes de error

**QA Team:**

- [ ] Revisar parametrizacion
- [ ] Preparar ambiente y datos

---

**Next Steps:**

1. PO/Dev responden preguntas criticas
2. QA ajusta test cases con feedback
3. Dev inicia implementacion con AC refinados

---

**Documentation:** Full test cases also available at:
`.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-7-create-bank-pockets/acceptance-test-plan.md`
