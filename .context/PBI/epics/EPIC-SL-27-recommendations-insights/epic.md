# Recommendations and Insights

**Jira Key:** SL-27
**Status:** ASSIGNED
**Priority:** MEDIUM
**Phase:** Growth and Insights

---

## Epic Description

Esta epica permite publicar recomendaciones con datos normalizados e ICP, y provee un feed filtrable por pre-match y live. Incluye la adhesion a recomendaciones con precarga de apuesta y metricas basicas de rendimiento.

Aporta visibilidad de insights y facilita seguir recomendaciones con trazabilidad hacia el ledger.

**Business Value:**
Impulsa la retencion con contenido accionable y habilita medicion de rendimiento para mejorar decisiones.

---

## User Stories

1. **SL-28** - Como admin, quiero publicar recomendaciones con datos normalizados y ICP.
2. **SL-29** - Como usuario, quiero ver un feed filtrable por pre-match y live.
3. **SL-30** - Como usuario, quiero seguir una recomendacion y precargar el registro de apuesta.
4. **SL-31** - Como usuario, quiero ver metricas basicas (yield cash, yield operativo, win rate).

---

## Scope

### In Scope

- Publicacion de recomendaciones normalizadas
- Feed filtrable por tipo (pre/live)
- Adhesion a recomendacion con precarga
- Metricas basicas de rendimiento

### Out of Scope (Future)

- Notificaciones push en tiempo real
- Analiticas avanzadas y segmentadas

---

## Acceptance Criteria (Epic Level)

1. ✅ Admin puede publicar recomendaciones con datos normalizados.
2. ✅ Feed permite filtrar por pre-match y live.
3. ✅ Usuario puede seguir recomendacion y precargar apuesta.
4. ✅ Metricas basicas visibles por bank.

---

## Related Functional Requirements

- **FR-022:** Publicar recomendaciones normalizadas
- **FR-023:** Feed filtrable por tipo
- **FR-024:** Adhesion de recomendacion
- **FR-025:** Metricas basicas de rendimiento

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Recomendaciones

- Validar normalizacion antes de publicar
- Asociar recomendaciones a eventos

### Database Schema

**Tables:**
- Recommendations
- Recommendation Events
- Metrics

**IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP para schema real.

### Security Requirements

- Solo admin/editor puede publicar

---

## Dependencies

### External Dependencies

- Ninguna

### Internal Dependencies

- EPIC-SL-17 Catalog and Normalization
- EPIC-SL-11 Bets Ledger

### Blocks

- Ninguna

---

## Success Metrics

### Functional Metrics

- % de recomendaciones con datos normalizados
- Tiempo de respuesta del feed

### Business Metrics

- Usuarios que siguen recomendaciones
- Impacto en retencion semanal

---

## Risks & Mitigations

| Risk                               | Impact | Probability | Mitigation                         |
| ---------------------------------- | ------ | ----------- | ---------------------------------- |
| Recomendaciones con datos inconsistentes | High | Medium   | Validaciones de normalizacion      |
| Feed lento por filtros             | Medium | Medium      | Indexes y paginacion               |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-27-recommendations-insights/feature-test-plan.md`

### Test Coverage Requirements

- **Unit Tests:** validaciones de recomendacion
- **Integration Tests:** feed + filtros
- **E2E Tests:** seguir recomendacion y precarga

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SL-27-recommendations-insights/feature-implementation-plan.md`

### Recommended Story Order

1. [SL-28] - Publicar recomendaciones
2. [SL-29] - Feed filtrable
3. [SL-30] - Adhesion y precarga
4. [SL-31] - Metricas basicas

### Estimated Effort

- **Development:** 2 sprints
- **Testing:** 1 sprint
- **Total:** 3 sprints

---

## Notes

- Definir campos ICP en SRS

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-022 a FR-025)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
