# Implementation Plan: SL-13 - Funding mixto y reservas

## Fuentes canónicas

- Story y acceptance test plan de esta carpeta.
- Plan SL-12, que define API, RPC, seguridad y preflight compartidos.
- `.context/SRS/api-contracts.yaml` (`BetCreateRequest.funding`).
- `.context/SRS/functional-specs.md` (FR-010).
- `.context/business-data-map.md`.

## Decisión de integración

SL-13 no implementa un flujo posterior. Funding se recibe obligatoriamente en `POST /api/bets` y se persiste en la misma RPC atómica que ticket y legs. No existe endpoint `/api/bets/{betId}/fund`.

## Preflight compartido completado

Resultado del preflight de SL-12:

- Migration RBAC remota y local reconciliada como `20260816145742`.
- Las 4 bets legacy sin reservas permanecen intactas.
- No se aplicó borrado ni backfill dentro de Fase 4G.

## Modelo de datos

- `bet_funding`: una fila por pocket positivo y ticket.
- Constraint único por `bet_id + pocket_type`.
- `amount > 0`, máximo dos decimales.
- `reserved_transaction_id` obligatorio y único, FK a la transacción `bet_reserve` correspondiente.
- Los ceros permanecen solo en payload; no se persisten como funding.
- Transactions conservan `amount` positivo; `type=bet_reserve` expresa débito.

## Flujo RPC

1. Recibir usuario, bank, ticket, stake, legs, funding y clave idempotente ya validados estructuralmente.
2. Resolver idempotencia bajo lock.
3. Bloquear bank y pockets `cash`, `bonus`, `freebet` en orden fijo.
4. Leer cash previo y calcular stake/cap dentro de la transacción.
5. Verificar suma exacta del funding y saldo de cada pocket positivo.
6. Crear ticket y legs.
7. Por cada pocket positivo, debitar saldo, crear `bet_reserve` y crear `bet_funding` enlazado.
8. Marcar ticket `open`, guardar resultado idempotente y devolver agregado.
9. Ante cualquier fallo, revertir toda la llamada.

## Seguridad

- RPC `SECURITY INVOKER`, ejecutada exclusivamente mediante cliente `service_role` del BFF.
- `EXECUTE` solo para `service_role`; sin acceso de `anon` o `authenticated`.
- Revocar DML directo de `authenticated` sobre `bet_funding` y demás tablas financieras modificadas por la RPC.
- RLS activa para lectura propia derivada de bet y bank.
- Probar que editor/admin tampoco pueden operar dinero ajeno por su rol.

## API y errores

- Funding requerido con las tres propiedades `cash`, `bonus`, `freebet`.
- `400`: estructura, precisión, negativos, todos cero o suma distinta.
- `401`: sesión inválida.
- `404`: bank inexistente o ajeno, mensaje genérico.
- `409`: cap/saldo dinámico, conflicto concurrente o clave reutilizada con payload distinto.
- `500`: error inesperado sin detalles internos.
- `201`: agregado nuevo; `200`: replay equivalente.

## UI

- Integrar funding en el mismo formulario de `/dashboard/bets/new`.
- Mostrar saldos por pocket y total exacto.
- Permitir cash, bonus y freebet puros o mezclados.
- No mostrar reglas de retorno promocional ni bloquear freebet por su liquidación futura.
- Mantener `data-testid` estáticos definidos en ATP.

## Pruebas

- Unitarias: importes, igualdad decimal exacta, al menos uno positivo y ausencia de redondeo.
- API: mixes puros/mixtos y todos los códigos del contrato.
- DB: correspondencia uno a uno entre funding positivo y reserva.
- RLS/grants: lectura propia y denegación de DML/acceso cruzado.
- Atomicidad: rollback después de cada pocket.
- Concurrencia: consumo simultáneo de uno o varios pockets.
- Idempotencia: replay equivalente y payload de funding distinto.
- E2E manual: creación con leg manual y mix que incluya freebet.

## Archivos previstos

Los mismos de SL-12. No crear route, schema, servicio o formulario independiente de `/fund` salvo componentes internos reutilizables dentro del formulario de creación.

## Criterios de cierre

- Suma exacta y cap se evalúan con valores bloqueados dentro de la RPC.
- Cada aporte positivo queda reservado y enlazado una sola vez.
- Ticket solo queda `open` con funding completo.
- Ningún comportamiento de settlement o cashout se implementa en Fase 4G.
