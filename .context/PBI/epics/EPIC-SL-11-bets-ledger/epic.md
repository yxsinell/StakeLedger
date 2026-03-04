# Bets Ledger

**Jira Key:** SL-11
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Core Features

---

## Epic Description

Esta epica cubre el registro de tickets con legs y el calculo de stake recomendado. Define el financiamiento mixto (cash/bonus/freebet), la liquidacion de resultados y el cashout parcial que divide tickets.

Incluye un historial inmutable de movimientos y ajustes para auditoria. Es el nucleo operativo del producto para gestionar apuestas end-to-end.

**Business Value:**
Permite registrar y liquidar apuestas con trazabilidad completa, habilitando calculos de rendimiento y control de riesgo.

---

## User Stories

1. **SL-12** - Como usuario, quiero registrar un ticket con legs y que el sistema calcule el stake recomendado.
2. **SL-13** - Como usuario, quiero financiar una apuesta con mix cash/bonus/freebet.
3. **SL-14** - Como usuario, quiero liquidar apuestas con resultados win/lose/void/half_win/half_loss.
4. **SL-15** - Como usuario, quiero ejecutar cashout parcial y que el ticket se divida en dos.
5. **SL-16** - Como usuario, quiero un historial inmutable de movimientos y ajustes.

---

## Scope

### In Scope

- Registro de tickets con legs, odds y stake recomendado
- Financiamiento mixto por pockets cash/bonus/freebet
- Liquidacion con resultados completos y parciales
- Cashout parcial con division de tickets
- Auditoria inmutable de movimientos

### Out of Scope (Future)

- OCR de tickets
- Integraciones directas con casas de apuestas

---

## Acceptance Criteria (Epic Level)

1. ✅ Tickets pueden registrarse con stake calculado y validaciones de cap.
2. ✅ Liquidacion actualiza pockets y ledger correctamente.
3. ✅ Cashout parcial divide tickets sin perder trazabilidad.
4. ✅ Auditoria registra movimientos y ajustes sin modificaciones posteriores.

---

## Related Functional Requirements

- **FR-009:** Registrar tickets con legs y stake calculado
- **FR-010:** Mix de fondos en una apuesta
- **FR-011:** Liquidar apuestas con resultados
- **FR-012:** Cashout parcial con division de ticket
- **FR-013:** Auditoria inmutable de movimientos

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Stake y Resultados

- Calculo de stake con cap 40% sobre cash
- Aplicar reglas de freebet en retorno

### Database Schema

**Tables:**
- Bets/Tickets
- Bet Legs
- Ledger/Transactions
- Audit Log

**IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP para schema real.

### Security Requirements

- Solo owner puede operar sus tickets
- Auditoria inmutable y con timestamps

---

## Dependencies

### External Dependencies

- Ninguna

### Internal Dependencies

- EPIC-SL-6 Banks and Balances

### Blocks

- EPIC-SL-05 Goals and Risk Advisor
- EPIC-SL-06 Recommendations and Insights

---

## Success Metrics

### Functional Metrics

- Liquidaciones consistentes sin desbalances
- Cashout parcial mantiene trazabilidad completa

### Business Metrics

- % de tickets registrados vs apuestas reales
- Uso de stake recomendado

---

## Risks & Mitigations

| Risk                                  | Impact | Probability | Mitigation                          |
| ------------------------------------- | ------ | ----------- | ----------------------------------- |
| Calculo de stake incorrecto           | High   | Medium      | Tests con casos limite y regresion  |
| Reglas de freebet mal aplicadas       | High   | Medium      | Validaciones y test de retornos     |
| Auditoria editable                    | High   | Low         | Permisos y write-once en backend    |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-11-bets-ledger/feature-test-plan.md`

### Test Coverage Requirements

- **Unit Tests:** calculo de stake y settlement
- **Integration Tests:** ledger + pockets
- **E2E Tests:** registro, liquidacion, cashout parcial

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SL-11-bets-ledger/feature-implementation-plan.md`

### Recommended Story Order

1. [SL-12] - Registrar ticket con stake recomendado
2. [SL-13] - Financiar apuesta con mix de pockets
3. [SL-14] - Liquidar apuestas con resultados
4. [SL-15] - Cashout parcial y division de ticket
5. [SL-16] - Auditoria inmutable

### Estimated Effort

- **Development:** 2 sprints
- **Testing:** 1 sprint
- **Total:** 3 sprints

---

## Notes

- Alinear reglas de cap 40% con SRS

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-009 a FR-013)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
