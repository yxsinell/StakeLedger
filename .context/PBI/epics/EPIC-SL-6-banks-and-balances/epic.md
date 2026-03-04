# Banks and Balances

**Jira Key:** SL-6
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Foundation

---

## Epic Description

Esta epica permite a los usuarios crear y administrar banks con bolsillos cash/bonus/freebet. Establece el ledger de movimientos base para depositos, retiros y transferencias internas.

Incluye vistas de saldo operativo y desglose por bolsillo, asegurando consistencia contable. Es el fundamento financiero sobre el que se registran apuestas y metas.

**Business Value:**
Sin banks y saldos confiables no es posible calcular stakes ni medir rendimiento. Esta epica habilita el core financiero del producto.

---

## User Stories

1. **SL-7** - Como usuario, quiero crear banks con bolsillos cash/bonus/freebet para separar saldos.
2. **SL-8** - Como usuario, quiero ver saldo operativo y desglose por bolsillo en un bank.
3. **SL-9** - Como usuario, quiero transferir fondos entre mis banks como transaccion interna.
4. **SL-10** - Como usuario, quiero registrar depositos y retiros para mantener el ledger completo.

---

## Scope

### In Scope

- Creacion de banks con pockets cash/bonus/freebet
- Calculo de saldo operativo y desglose por bolsillo
- Transferencias internas entre banks del mismo usuario
- Registro de depositos y retiros en ledger

### Out of Scope (Future)

- Integraciones directas con casas de apuestas
- Colaboracion multiusuario en un bank
- Conciliacion automatica con proveedores externos

---

## Acceptance Criteria (Epic Level)

1. ✅ Usuarios pueden crear banks con pockets iniciales y ver saldos consistentes.
2. ✅ Transferencias internas actualizan ambos banks y quedan registradas.
3. ✅ Depositos y retiros actualizan saldos con validaciones de monto.

---

## Related Functional Requirements

- **FR-005:** Crear banks con bolsillos cash/bonus/freebet
- **FR-006:** Mostrar saldo operativo y desglose
- **FR-007:** Transferencias entre banks
- **FR-008:** Depositos y retiros

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Ledger y Balances

- Registrar cada movimiento como transaccion inmutable
- Calcular saldo operativo a partir de pockets

### Database Schema

**Tables:**
- Banks
- Pockets (cash/bonus/freebet)
- Transactions / ledger

**IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP para schema real.

### Security Requirements

- Banks solo accesibles por su owner
- Validaciones de monto y tipo de pocket

---

## Dependencies

### External Dependencies

- Ninguna

### Internal Dependencies

- EPIC-SL-1 Identity and Access

### Blocks

- EPIC-SL-03 Bets Ledger
- EPIC-SL-05 Goals and Risk Advisor
- EPIC-SL-06 Recommendations and Insights

---

## Success Metrics

### Functional Metrics

- Saldos consistentes sin desbalances
- Transferencias con doble asiento correcto

### Business Metrics

- Usuarios con al menos 1 bank creado
- Uso recurrente de depositos/retiros

---

## Risks & Mitigations

| Risk                           | Impact | Probability | Mitigation                         |
| ------------------------------ | ------ | ----------- | ---------------------------------- |
| Desbalance en ledger           | High   | Medium      | Tests de integracion y conciliacion|
| Validaciones de monto incompletas | High | Medium      | Reglas estrictas y tests negativos |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-6-banks-and-balances/feature-test-plan.md`

### Test Coverage Requirements

- **Unit Tests:** calculos de saldo y validaciones
- **Integration Tests:** transferencias y ledger
- **E2E Tests:** crear bank, depositar, transferir

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SL-6-banks-and-balances/feature-implementation-plan.md`

### Recommended Story Order

1. [SL-7] - Crear banks con pockets
2. [SL-8] - Ver saldo operativo y desglose
3. [SL-9] - Transferir fondos entre banks
4. [SL-10] - Registrar depositos y retiros

### Estimated Effort

- **Development:** 1-2 sprints
- **Testing:** 1 sprint
- **Total:** 2 sprints

---

## Notes

- Definir reglas de saldo operativo con precision

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-005 a FR-008)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
