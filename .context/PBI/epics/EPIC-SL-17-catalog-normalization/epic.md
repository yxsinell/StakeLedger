# Catalog and Normalization

**Jira Key:** SL-17
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Core Features

---

## Epic Description

Esta epica gestiona el catalogo de equipos y competiciones con busqueda y autocompletado. Permite ingresar datos manuales cuando no existen y marcarlos como unnormalized.

Incluye el mantenimiento del catalogo con alias y actualizaciones periodicas por parte de admin. Asegura datos consistentes para recomendaciones y registro de apuestas.

**Business Value:**
Datos normalizados reducen errores de registro y habilitan recomendaciones confiables y metricas consistentes.

---

## User Stories

1. **SL-18** - Como usuario, quiero buscar equipos y competiciones con autocompletado.
2. **SL-19** - Como usuario, quiero introducir datos manuales si no existen, marcando el registro como unnormalized.
3. **SL-20** - Como admin, quiero mantener un catalogo con alias y actualizaciones periodicas.

---

## Scope

### In Scope

- Busqueda con autocompletado por equipos y competiciones
- Ingreso manual con estado unnormalized
- Actualizacion de catalogo y alias por admin

### Out of Scope (Future)

- Integracion directa con proveedores externos en tiempo real
- Normalizacion automatica avanzada por IA

---

## Acceptance Criteria (Epic Level)

1. ✅ Busqueda responde con resultados normalizados y sugerencias.
2. ✅ Registros manuales quedan marcados como unnormalized.
3. ✅ Admin puede actualizar catalogo y alias sin romper referencias.

---

## Related Functional Requirements

- **FR-014:** Busqueda con autocompletado
- **FR-015:** Ingreso manual unnormalized
- **FR-016:** Actualizacion de catalogo y alias

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Normalizacion

- Catalogo con alias por entidad
- Fallback a API externa cuando no hay match

### Database Schema

**Tables:**
- Catalog Items
- Aliases

**IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP para schema real.

### Security Requirements

- Solo admin puede actualizar catalogo

---

## Dependencies

### External Dependencies

- API externa de equipos/competiciones (si aplica)

### Internal Dependencies

- EPIC-SL-11 Bets Ledger (para uso en tickets)

### Blocks

- EPIC-SL-06 Recommendations and Insights

---

## Success Metrics

### Functional Metrics

- % de registros normalizados vs unnormalized
- Tiempo promedio de autocompletado

### Business Metrics

- Reduccion de errores en registro de apuestas

---

## Risks & Mitigations

| Risk                                | Impact | Probability | Mitigation                         |
| ----------------------------------- | ------ | ----------- | ---------------------------------- |
| Datos duplicados en catalogo        | High   | Medium      | Reglas de deduplicacion y alias    |
| Fallback externo inconsistente      | Medium | Medium      | Cache y validacion de respuestas   |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-17-catalog-normalization/feature-test-plan.md`

### Test Coverage Requirements

- **Unit Tests:** normalizacion y matching
- **Integration Tests:** API externa y alias
- **E2E Tests:** autocompletado + ingreso manual

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SL-17-catalog-normalization/feature-implementation-plan.md`

### Recommended Story Order

1. [SL-18] - Busqueda con autocompletado
2. [SL-19] - Ingreso manual unnormalized
3. [SL-20] - Mantenimiento de catalogo y alias

### Estimated Effort

- **Development:** 1-2 sprints
- **Testing:** 1 sprint
- **Total:** 2 sprints

---

## Notes

- Definir proveedores de datos en SRS

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-014 a FR-016)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
