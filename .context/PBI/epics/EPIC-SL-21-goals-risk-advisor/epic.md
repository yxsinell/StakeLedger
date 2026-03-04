# Goals and Risk Advisor

**Jira Key:** SL-21
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Growth and Insights

---

## Epic Description

Esta epica permite crear metas de capital con base, objetivo y fecha limite. Calcula la mision diaria y recalcula la meta despues de cada apuesta finalizada.

Incluye protecciones de riesgo para bloquear cuotas suicidas y permitir cierre anticipado al alcanzar objetivos. Habilita disciplina y control de riesgo en la estrategia del usuario.

**Business Value:**
Guia al usuario a metas realistas y reduce riesgo de ruina mediante controles y recalculos constantes.

---

## User Stories

1. **SL-22** - Como usuario, quiero crear una meta con capital base, objetivo, fecha limite y stake habitual.
2. **SL-23** - Como usuario, quiero ver la mision diaria (beneficio y cuota sugerida).
3. **SL-24** - Como usuario, quiero que la meta se recalcule despues de cada apuesta finalizada.
4. **SL-25** - Como usuario, quiero protecciones que bloqueen cuotas suicidas y propongan reconfiguracion.
5. **SL-26** - Como usuario, quiero cerrar la meta anticipadamente al alcanzar el objetivo.

---

## Scope

### In Scope

- Creacion de metas con parametros obligatorios
- Mision diaria con beneficio y cuota sugerida
- Recalculo automatico por resultados
- Protecciones de riesgo y reconfiguracion
- Cierre anticipado de meta

### Out of Scope (Future)

- Optimizacion multi-metas
- Asesoramiento avanzado con IA

---

## Acceptance Criteria (Epic Level)

1. ✅ Metas calculan mision diaria coherente con capital y plazo.
2. ✅ Recalculo tras apuestas ajusta brecha y objetivo diario.
3. ✅ Protecciones bloquean cuotas suicidas y sugieren ajustes.
4. ✅ Meta puede cerrarse al alcanzar objetivo.

---

## Related Functional Requirements

- **FR-017:** Crear metas con parametros obligatorios
- **FR-018:** Mostrar mision diaria
- **FR-019:** Recalcular metas tras apuestas
- **FR-020:** Protecciones de riesgo
- **FR-021:** Cierre anticipado de metas

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Calculo de Metas

- Brecha = target - base actual
- Calculo diario segun dias restantes

### Database Schema

**Tables:**
- Goals
- Goal History

**IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP para schema real.

### Security Requirements

- Metas solo accesibles por su owner

---

## Dependencies

### External Dependencies

- Ninguna

### Internal Dependencies

- EPIC-SL-6 Banks and Balances
- EPIC-SL-11 Bets Ledger

### Blocks

- EPIC-SL-06 Recommendations and Insights (para recomendaciones alineadas)

---

## Success Metrics

### Functional Metrics

- Metas recalculadas sin inconsistencias
- Protecciones disparadas correctamente

### Business Metrics

- % usuarios con meta activa
- Retencion semanal mejorada

---

## Risks & Mitigations

| Risk                               | Impact | Probability | Mitigation                         |
| ---------------------------------- | ------ | ----------- | ---------------------------------- |
| Recalculo incorrecto de metas      | High   | Medium      | Tests con casos de regresion       |
| Protecciones bloquean de mas       | Medium | Medium      | Umbrales configurables             |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/feature-test-plan.md`

### Test Coverage Requirements

- **Unit Tests:** formulas y validaciones
- **Integration Tests:** apuestas -> recalculo
- **E2E Tests:** crear meta, mision diaria, cierre

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/feature-implementation-plan.md`

### Recommended Story Order

1. [SL-22] - Crear meta con parametros
2. [SL-23] - Ver mision diaria
3. [SL-24] - Recalcular tras apuestas
4. [SL-25] - Protecciones de riesgo
5. [SL-26] - Cierre anticipado

### Estimated Effort

- **Development:** 2 sprints
- **Testing:** 1 sprint
- **Total:** 3 sprints

---

## Notes

- Definir umbrales de cuotas suicidas en SRS

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-017 a FR-021)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
