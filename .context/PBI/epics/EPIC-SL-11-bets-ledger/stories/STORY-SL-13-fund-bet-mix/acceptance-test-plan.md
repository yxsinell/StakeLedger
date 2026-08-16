# Plan de Pruebas de Aceptación: SL-13 - Funding y reservas por pocket

**Fecha de diseño:** 2026-08-16
**Estado:** Implementación técnica verificada; E2E manual y concurrencia multisesión pendientes
**Fase:** 4G

## Objetivo

Demostrar que el funding obligatorio cubre exactamente el stake, acepta cash/bonus/freebet puros o mezclados y genera reservas enlazadas sin duplicados ni estados parciales.

## Matriz de cobertura

| ID | Nivel | Caso | Resultado esperado |
| --- | --- | --- | --- |
| SL13-U01 | Unit | Montos `>=0` con hasta 2 decimales | Acepta; rechaza negativos o precisión mayor |
| SL13-U02 | Unit | Al menos un monto positivo | Rechaza los tres en cero |
| SL13-U03 | Unit | Suma decimal exacta | Acepta igualdad; rechaza diferencia de cualquier magnitud |
| SL13-U04 | Unit | Sin tolerancia ni redondeo | No corrige residuo ni distribuye centavos |
| SL13-U05 | Unit | Funding requerido | Rechaza ausencia o propiedad omitida |
| SL13-A01 | API | 100% cash | `201`, una reserva cash enlazada |
| SL13-A02 | API | 100% bonus | `201`, una reserva bonus enlazada |
| SL13-A03 | API | 100% freebet | `201`, una reserva freebet enlazada |
| SL13-A04 | API | Mix de tres pockets | `201`, tres reservas y tres funding enlazados |
| SL13-A05 | API | Suma distinta del stake | `400`, sin cambios |
| SL13-A06 | API | Monto inválido | `400`, sin cambios |
| SL13-A07 | API | Saldo insuficiente al confirmar | `409`, rollback completo |
| SL13-A08 | API | Funding promocional con cash bajo | Aplica cap sobre cash previo; `409` si stake supera el 40% |
| SL13-A09 | API | Replay equivalente | `200`, mismo ticket y mismas reservas |
| SL13-A10 | API | Funding distinto con misma clave | `409`, sin cambios |
| SL13-R01 | RLS/grants | Lectura de funding propio | Permitida por ownership |
| SL13-R02 | RLS/grants | Funding ajeno o DML directo authenticated | Denegado sin filtrar existencia |
| SL13-D01 | DB/RPC | Falla segunda de tres reservas | Revierte primera reserva, ticket, legs y funding |
| SL13-D02 | DB/RPC | Funding positivo | Exactamente un `bet_reserve` y enlace por pocket positivo |
| SL13-C01 | Concurrencia | Dos tickets consumen mismo pocket | Locks serializan; saldo nunca negativo, perdedor `409` |
| SL13-E01 | E2E manual | Mix cash/bonus/freebet | UI confirma suma, crea ticket y actualiza saldos |

## Datos de prueba canónicos

Para `stake=20.00`, todos los casos positivos usan cash previo mínimo de `50.00`, de modo que el cap exacto sea al menos `20.00` aunque el funding sea 100% bonus o freebet:

| Cash | Bonus | Freebet | Resultado |
| ---: | ---: | ---: | --- |
| 20.00 | 0.00 | 0.00 | Acepta, 1 reserva |
| 0.00 | 20.00 | 0.00 | Acepta, 1 reserva |
| 0.00 | 0.00 | 20.00 | Acepta, 1 reserva |
| 5.00 | 5.00 | 10.00 | Acepta, 3 reservas |
| 19.99 | 0.00 | 0.00 | `400`, suma distinta |
| 20.001 | 0.00 | 0.00 | `400`, precisión inválida |
| 0.00 | 0.00 | 0.00 | `400`, ningún monto positivo |
| -1.00 | 21.00 | 0.00 | `400`, monto negativo |

## Verificaciones de ledger

- Cada funding positivo tiene `pocket_type`, importe exacto y `transaction_id` no nulo.
- La transacción enlazada es `bet_reserve`, pertenece al mismo bank/pocket y tiene mismo importe.
- Funding cero no crea filas ni transacciones.
- El saldo debitado por pocket coincide exactamente con su funding.
- Replay no altera balances ni crea nuevas filas.

## Verificaciones de atomicidad y concurrencia

- Inyectar fallo después de cada inserción relevante y comprobar rollback total.
- Ejecutar requests concurrentes contra cash, bonus y freebet compartidos.
- Comprobar locks en orden determinista y ausencia de saldos negativos.
- Comprobar que ticket `open` nunca existe sin todas sus reservas.

## Prueba E2E manual

1. Abrir `/dashboard/bets/new` con bank que tenga los tres pockets disponibles.
2. Definir ticket y stake válido.
3. Introducir funding cash/bonus/freebet que sume exactamente el stake.
4. Verificar total y submit habilitado.
5. Crear ticket y comprobar confirmación y saldos.
6. Repetir con suma incorrecta y comprobar error sin request exitoso.

Selectores estáticos mínimos: `fundingMixForm`, `cash_amount_input`, `bonus_amount_input`, `freebet_amount_input`, `funding_total_label`, `funding_sum_error`, `submit_bet_button`.

## Criterio de aprobación

Todos los mixes permitidos funcionan, cualquier desviación se rechaza con el código previsto y ninguna carrera o fallo deja reservas parciales. No se prueba retorno de freebet, settlement ni cashout en Fase 4G.
