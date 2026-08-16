# Plan de Pruebas de Aceptación: SL-12 - Registro atómico de ticket

**Fecha de diseño:** 2026-08-16
**Estado:** Implementación técnica verificada; E2E manual y concurrencia multisesión pendientes
**Fase:** 4G

## Objetivo

Demostrar que `POST /api/bets` crea un ticket completo, idempotente y sin estados parciales, aplica el cap sobre cash previo y distingue legs normalizadas y manuales.

## Matriz de cobertura

| ID | Nivel | Caso | Resultado esperado |
| --- | --- | --- | --- |
| SL12-U01 | Unit | Cuotas `>1` con hasta 4 decimales | Acepta límites válidos; rechaza `<=1` y precisión mayor |
| SL12-U02 | Unit | Legs entre 1 y 20 | Acepta límites; rechaza 0 y 21 |
| SL12-U03 | Unit | Stake amount positivo con hasta 2 decimales | Acepta; rechaza cero, negativos y precisión mayor |
| SL12-U04 | Unit | Stake level `0.1..20.0`, paso `0.1` | Acepta límites; rechaza valores fuera del rango o paso |
| SL12-U05 | Unit | Fórmula de nivel | Usa `cash × (level/20) × 0.40` sin redondeo |
| SL12-U06 | Unit | Fórmula produce más de 2 decimales | Rechaza; no ajusta el importe |
| SL12-U07 | Unit | Stake igual o superior al cap | Igual acepta; superior rechaza |
| SL12-U08 | Unit | Discriminación de stake | Exige exactamente `amount` o `level` |
| SL12-U09 | Unit | Leg normalized | Exige `eventId`, `marketId`, `selection`, `odds` |
| SL12-U10 | Unit | Leg manual | Exige `eventName`, `marketName`, `selection`, `odds`; IDs nulos |
| SL12-A01 | API | Creación válida | `201`, agregado completo y status `open` |
| SL12-A02 | API | Replay equivalente | `200`, mismo `betId`, sin duplicados |
| SL12-A03 | API | Misma clave con payload distinto | `409`, sin cambios |
| SL12-A04 | API | Payload inválido | `400`, sin cambios |
| SL12-A04b | API | `Idempotency-Key` ausente, no UUID o inválida | `400`, sin cambios |
| SL12-A05 | API | Sin cookie válida | `401`, sin invocar creación |
| SL12-A06 | API/RLS | Bank inexistente o ajeno | `404` genérico, sin enumeración |
| SL12-A07 | API | Referencia de catálogo inexistente o inconsistente | `404`, sin cambios |
| SL12-D01 | DB/RPC | Fallo al insertar una leg | Rollback de ticket, legs, funding, reservas e idempotencia |
| SL12-D02 | DB/RPC | Fallo al insertar funding o reserva | Rollback completo; ningún ticket `open` |
| SL12-C01 | Concurrencia | Dos requests compiten por cap/saldo | Solo resultados compatibles con cash bloqueado; conflicto `409` para el perdedor |
| SL12-C02 | Concurrencia | Dos requests con misma clave | Un único agregado; uno `201` y replay `200` |
| SL12-E01 | E2E manual | Crear ticket manual desde UI | Confirmación visible, ticket abierto y balance actualizado |

## Datos de prueba canónicos

### Stake por nivel

| Cash previo | Level | Cálculo | Resultado |
| ---: | ---: | ---: | --- |
| 100.00 | 0.1 | 0.20 | Acepta |
| 100.00 | 10.0 | 20.00 | Acepta |
| 100.00 | 20.0 | 40.00 | Acepta, cap exacto |
| 10.01 | 10.0 | 2.002 | `400`, no redondea |

### Cuotas

| Valor | Resultado |
| ---: | --- |
| 1.0001 | Acepta |
| 2.3456 | Acepta |
| 1.0000 | Rechaza |
| 2.34567 | Rechaza |

### Referencias de leg

- Normalized válida: `referenceType=normalized`, `eventId`, `marketId` perteneciente al evento, `selection`, `odds`.
- El evento normalizado está `scheduled|live` y el mercado está `active`.
- Normalized inválida: mercado existente de otro evento.
- Manual válida: `referenceType=manual`, `eventName`, `marketName`, `selection`, `odds`.
- Manual inválida: incluye IDs normalizados o carece de nombres.

## Verificaciones de persistencia

Para cada creación válida:

- Existe un ticket con 1..20 legs y `status=open`.
- `stake_amount` coincide exactamente con importe o fórmula.
- Funding y reservas corresponden al mismo ticket.
- No existe ventana observable con ticket `open` sin funding o reservas.

Para cada rechazo:

- No cambian `bets`, `bet_legs`, `bet_funding`, `transactions`, pockets ni tabla de idempotencia.

## Prueba E2E manual

1. Abrir `/dashboard/bets/new` con sesión válida.
2. Seleccionar un bank propio.
3. Añadir una leg manual y otra normalizada.
4. Elegir stake por nivel y comprobar preview exacta.
5. Completar funding y enviar.
6. Verificar confirmación, ticket `open` y saldos actualizados.

Selectores estáticos mínimos: `betTicketForm`, `bank_select`, `ticket_odds_input`, `stake_mode_select`, `stake_amount_input`, `stake_level_input`, `stake_cap_warning`, `add_leg_button`, `remove_leg_button`, `bet_leg_item`, `leg_reference_type_select`, `leg_event_select`, `leg_market_select`, `manual_event_input`, `manual_market_input`, `leg_selection_input`, `leg_odds_input`, `submit_bet_button`, `bet_error`, `bet_success`.

## Criterio de aprobación

Todos los casos críticos API/DB/RLS/concurrencia pasan y ninguna prueba negativa deja cambios parciales. Settlement y cashout no forman parte de este plan.
