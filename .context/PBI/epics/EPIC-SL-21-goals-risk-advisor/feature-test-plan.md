## 📋 Feature Test Plan - Generated 2026-03-21

**QA Lead:** AI-Generated
**Status:** Draft - Pending Team Review

---

# Feature Test Plan: EPIC-SL-21 - Goals and Risk Advisor

**Fecha:** 2026-03-21
**QA Lead:** AI-Generated
**Epic Jira Key:** SL-21
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

Esta epica habilita metas dinamicas con control de riesgo para que el usuario discipline su bank y reduzca decisiones emocionales. Impacta adopcion de metas, retencion y uso recurrente.

**Key Value Proposition:**

- Control del capital con metas realistas y recalculo diario.
- Reduccion de riesgo con protecciones ante cuotas peligrosas.

**Success Metrics (KPIs):**

- 20% de usuarios crean una meta y la usan al menos 5 dias.
- Retencion semanal mejorada en usuarios con meta activa.

**User Impact:**

- Carlos Vega: controla el riesgo y entiende su progreso diario.
- Laura Rios: valida metas con recalculo y trazabilidad de resultados.

**Critical User Journeys:**

- Journey 2: Meta dinamica con recalculo diario.

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- UI de metas (formulario de creacion, vista de mision diaria, alertas, cierre anticipado).
- Rutas relacionadas a Goals.

**Backend:**

- API Routes de Goals y recalculo.
- Servicio de calculo de mision diaria, cuotas sugeridas y protecciones.

**Database:**

- Tablas: goals, goal_history, bank_pockets, bets.

**External Services:**

- Ninguno.

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend ↔ Backend API (Goals).
- Backend ↔ Database (Goals, Goal History, Banks).
- Backend ↔ Bets settlement (recalculo post-liquidacion).

**Data Flow:**

User → UI Goals → API /api/goals → DB goals → UI (mision diaria)
                               ↓
                        /api/bets/{betId}/settle → /api/goals/{goalId}/recalculate

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Recalculo incorrecto tras liquidacion

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend, Integration
- **Mitigation Strategy:**
  - Unit tests de formulas (brecha, dias restantes).
  - Integration tests: settlement → recalculo.
- **Test Coverage Required:** Casos win/lose/void y apuestas no vinculadas.

#### Risk 2: Protecciones de riesgo mal calibradas

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend, UI
- **Mitigation Strategy:**
  - Tests con limites min/max y defaults.
  - Validar mensajes y bloqueos en UI.
- **Test Coverage Required:** cuotas dentro/fuera de limite y reconfiguracion.

### Business Risks

#### Risk 1: Metas percibidas como inalcanzables

- **Impact on Business:** baja adopcion y abandono.
- **Impact on Users:** frustracion por mision diaria agresiva.
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Validar formula de cuota sugerida y mensajes explicativos.
  - Test de reconfiguracion con fechas y stake alternativos.

#### Risk 2: Cierre anticipado ambiguo

- **Impact on Business:** inconsistencias en progreso y confianza.
- **Impact on Users:** confusion sobre estado final.
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Test de confirmacion y reglas de cierre.

### Integration Risks

#### Integration Risk 1: Settlement no dispara recalculo

- **Integration Point:** Bets settlement ↔ Goals recalculation
- **What Could Go Wrong:** eventos no vinculados, duplicados o fuera de orden.
- **Impact:** High
- **Mitigation:**
  - Tests de idempotencia y filtros por meta_id.
  - Validar goal_history y estado final.

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Formula exacta de cuota sugerida y beneficio diario.

- **Found in:** EPIC-SL-21, SL-22, SL-23
- **Question for PO:** Que formula y redondeos se usan para suggested_odds y daily_profit?
- **Impact if not clarified:** resultados inconsistentes y expectativas incorrectas.

**Ambiguity 2:** Limites por defecto de cuotas suicidas.

- **Found in:** SL-25
- **Question for PO:** Cuales son los limites por defecto y unidades (cuota minima/maxima)?
- **Impact if not clarified:** bloqueos excesivos o permisivos.

**Ambiguity 3:** Vinculo entre apuestas y metas.

- **Found in:** SL-24
- **Question for Dev:** Como se asocia un bet_id a un goal_id y como se asegura idempotencia?
- **Impact if not clarified:** recalculos incorrectos o repetidos.

### Missing Information

**Missing 1:** Rango permitido de stake_preference.

- **Needed for:** validaciones de creacion de meta y mision diaria.
- **Suggestion:** definir rango y valores permitidos (ej: 1-20) y defaults.

**Missing 2:** Regla de cierre anticipado cuando objetivo no alcanzado.

- **Needed for:** UX y validacion de cierre.
- **Suggestion:** definir si siempre permite con confirmacion o solo con objetivo alcanzado.

---

### Suggested Improvements (Before Implementation)

**Improvement 1:** Especificar formula de suggested_odds y daily_profit en SRS/AC.

- **Story Affected:** SL-22, SL-23
- **Current State:** formula no detallada.
- **Suggested Change:** agregar formula y reglas de redondeo.
- **Benefit:** consistencia de calculos y testabilidad.

**Improvement 2:** Definir limites por defecto y overrides de cuota suicida.

- **Story Affected:** SL-25
- **Current State:** limites configurables sin defaults.
- **Suggested Change:** definir default global y override por usuario.
- **Benefit:** reduce ambiguedad y permite validacion.

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, Database) para Goals.
- Integration testing (bets settlement → recalculo).
- Non-functional (performance y seguridad en endpoints Goals).
- Cross-browser y mobile responsivo en UI de metas.

**Out of Scope (For This Epic):**

- Optimizacion multi-metas.
- Asesoramiento avanzado con IA.

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80% en formulas de metas.
- **Focus Areas:** validaciones, calculo de brecha, daily_profit, suggested_odds.

#### Integration Testing

- **Coverage Goal:** todos los integration points listados.
- **Focus Areas:**
  - /api/bets/{betId}/settle → /api/goals/{goalId}/recalculate
  - persistencia en goals y goal_history

#### End-to-End (E2E) Testing

- **Tool:** Playwright
- **Focus Areas:** crear meta → ver mision → recalcular → protecciones → cierre.

#### API Testing

- **Tool:** Postman o Playwright API
- **Focus Areas:**
  - /api/goals (POST, GET)
  - /api/goals/{goalId}/recalculate
  - /api/goals/{goalId}/close

---

### Test Types per Story

**Positive Test Cases:**

- Creacion de meta con datos validos.
- Visualizacion de mision diaria.
- Recalculo con apuestas vinculadas.
- Cierre anticipado con objetivo alcanzado.

**Negative Test Cases:**

- target <= base, deadline pasada, stake_preference invalido.
- cuota fuera de limites.
- cierre anticipado sin objetivo alcanzado.

**Boundary Test Cases:**

- limites min/max de cuotas y stake.
- fecha limite hoy + 1 dia.

---

## 📊 Test Cases Summary by Story

### STORY-SL-22: Create goal

**Complexity:** Medium
**Estimated Test Cases:** 7

- Positive: 2
- Negative: 3
- Boundary: 1
- Integration: 1

**Rationale for estimate:** validaciones, formula, persistencia y API.
**Parametrized Tests Recommended:** Yes (inputs invalidos y limites).

---

### STORY-SL-23: Daily mission

**Complexity:** Low/Medium
**Estimated Test Cases:** 6

- Positive: 2
- Negative: 2
- Boundary: 1
- Integration: 1

**Rationale for estimate:** visualizacion + calculo diario.
**Parametrized Tests Recommended:** Yes (combinaciones de stake_preference).

---

### STORY-SL-24: Goal recalculation

**Complexity:** Medium/High
**Estimated Test Cases:** 8

- Positive: 3
- Negative: 2
- Boundary: 1
- Integration: 2

**Rationale for estimate:** depende de settlement y reglas de vinculacion.
**Parametrized Tests Recommended:** Yes (win/lose/void).

---

### STORY-SL-25: Risk protections

**Complexity:** Medium
**Estimated Test Cases:** 8

- Positive: 2
- Negative: 3
- Boundary: 2
- Integration: 1

**Rationale for esti
