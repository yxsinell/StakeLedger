# Implementation Plan: SL-12 - Registrar ticket con legs

## Fuentes canónicas

- Story y acceptance test plan de esta carpeta.
- `.context/SRS/api-contracts.yaml` (`POST /api/bets`).
- `.context/SRS/functional-specs.md` (FR-009 y FR-010).
- `.context/SRS/architecture-specs.md` (flujo Fase 4G).
- `.context/business-data-map.md`.
- `.context/supabase-security-posture.md`.

## Preflight completado

Resultado previo a crear migrations:

1. Drift RBAC reconciliado como `20260816145742_add_admin_role_management.sql` local y remoto.
2. Las 4 bets legacy remotas permanecen intactas, sin `bet_funding`, reserva ni idempotencia.
3. No se borraron, transformaron ni rellenaron esos datos.
4. Schema, constraints, grants, RLS y funciones remotas se inspeccionaron antes y después de aplicar SQL.

El preflight dejó de bloquear migrations Fase 4G; tratamiento histórico de filas legacy sigue fuera de alcance.

## Alcance técnico

- Ruta BFF `POST /api/bets` con cookie de sesión e `Idempotency-Key` UUID.
- Validación Zod discriminada para stake y legs.
- RPC única para crear ticket, 1..20 legs, funding, reservas e idempotencia.
- UI MVP `/dashboard/bets/new`.
- Sin endpoint `/api/bets/{betId}/fund`.
- Sin settlement, cashout ni reglas de retorno de freebet.

## Orden de implementación

### 1. Migration de bets Fase 4G

- Completar modelo de `bets`, `bet_legs`, `bet_funding`, transactions de reserva e idempotencia de bets.
- Representar legs con `reference_type=normalized|manual` y constraints mutuamente excluyentes.
- Para normalized, exigir `event_id` y `market_id`; validar que el market pertenece al event.
- Para manual, exigir nombres de evento y mercado, y mantener IDs nulos.
- Aplicar checks de cuotas `>1` y precisión máxima de cuatro decimales.
- Aplicar checks monetarios y de nivel sin redondeo.
- Enlazar cada fila `bet_funding` con su `bet_reserve` mediante `reserved_transaction_id`.

### 2. Seguridad y RPC

- Implementar una RPC `SECURITY INVOKER` invocada por cliente `service_role` desde BFF.
- No conceder `EXECUTE` de esta RPC a `anon` ni `authenticated`; concederlo solo a `service_role`.
- Revocar DML directo de `authenticated` sobre tablas financieras afectadas, incluido `bet_funding`, y conservar únicamente lecturas propias necesarias.
- Mantener RLS activa con policies de lectura por ownership para bets, legs, funding y transacciones.
- La RPC recibe el `user_id` autenticado validado por BFF y verifica ownership dentro de la transacción.
- Bloquear idempotencia, bank y pockets en orden determinista para evitar carreras y reducir deadlocks.
- Calcular cash previo y cap dentro del bloqueo, nunca desde preview cliente.
- Insertar ticket no abierto, legs, funding y una transacción `bet_reserve` por cada monto positivo.
- Marcar `open` únicamente al final; cualquier excepción revierte todo.

### 3. Idempotencia

- Persistir clave, usuario, hash canónico de payload y resultado de creación.
- Payload equivalente con clave existente devuelve agregado original y `200`.
- Payload distinto con clave existente devuelve `409`.
- Una clave no puede crear más de un ticket bajo concurrencia.

### 4. API BFF

- Validar cookie; ausencia o invalidez devuelve `401`.
- Validar cabecera y body antes de RPC; errores estructurales devuelven `400`.
- Traducir bank ajeno/inexistente a `404` genérico.
- Traducir cap o saldo dinámico insuficiente a `409`.
- Responder `201` en creación, `200` en replay y `500` genérico para fallo inesperado.
- No exponer detalles SQL ni diferencias de ownership.

### 5. UI MVP

- Crear `/dashboard/bets/new` con selección de bank, 1..20 legs, referencia manual/normalized, cuota, stake y funding.
- Preview de stake por nivel sirve como ayuda; servidor conserva autoridad.
- No redondear ni corregir inputs.
- Deshabilitar submit ante validación conocida y mostrar conflicto del servidor sin perder datos ingresados.
- Usar exclusivamente `data-testid` estáticos definidos en ATP.

## Validaciones

- `bankId`: UUID.
- `legs`: 1..20.
- `odds`: ticket y leg `>1`, máximo cuatro decimales.
- `stake`: unión discriminada exclusiva entre `amount` y `level`.
- `amount`: positivo, máximo dos decimales.
- `level`: `0.1..20.0`, múltiplo exacto de `0.1`.
- Fórmula: `cash × (level/20) × 0.40`; si produce más de dos decimales, `400`.
- Cap: `stake <= cash previo × 0.40`, independiente del funding.
- Funding: reglas detalladas en SL-13 y obligatorio en el mismo request.

## Pruebas y verificación

- Unitarias de schemas, precisión, fórmula, cap y discriminantes.
- API para códigos `200/201/400/401/404/409/500`.
- DB/RPC para rollback en cada punto de fallo.
- RLS/grants para lectura propia, denegación cruzada y ausencia de DML/EXECUTE directo.
- Concurrencia para saldo, cap e idempotencia.
- E2E manual de creación con leg manual.
- Regenerar tipos Supabase y ejecutar `bun run repo:check` tras implementación.

## Archivos previstos

- Migration nueva en `supabase/migrations/`, solo después del preflight.
- `src/app/api/bets/route.ts`.
- Schemas y servicio de bets bajo `src/lib/bets/`.
- Schemas OpenAPI runtime bajo `src/lib/openapi/`.
- Página y componentes bajo `src/app/dashboard/bets/new/` y `src/components/bets/`.
- Pruebas en infraestructura existente o aprobada; no inventar runner alternativo.

## Criterios de cierre

- Un request válido produce exactamente un ticket completo y `open`.
- Ningún error deja ticket, leg, funding, reserva, saldo o idempotencia parcial.
- Contrato API, migrations, tipos, RLS/grants, UI y pruebas coinciden con SL-12/SL-13.
