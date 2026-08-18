# SL-30 - Seguir recomendación y precargar ticket

- **Jira Key:** SL-30
- **Epic:** EPIC-SL-27
- **Estado documental:** Implementado
- **Estado de ejecución:** Cerrado con cobertura automatizada relevante; ATP manual completo no ejecutado

## User Story

Como usuario, quiero seguir una recomendación desde un bank propio y recibir una precarga normalizada para revisar el ticket antes de registrarlo.

## Alcance

- Exigir `bankId` existente y propiedad del usuario.
- Admitir follow solo para recommendation `published` con datos normalizados completos.
- Persistir una fila única por `(user_id,recommendation_id)`.
- Hacer replay idempotente: mismo usuario/recommendation/bank devuelve el follow existente; otro bank propio devuelve `409` y no reemplaza el follow.
- Devolver prefill compatible con SL-12: bank, recommendation, ticket odds y una leg `normalized` con evento, mercado, selection y odds.

## Acceptance Criteria

### AC1 - Follow persistido

Primera llamada válida crea follow y devuelve `201`; replay con mismo bank devuelve la misma identidad y `200`, sin duplicado. Replay con otro bank devuelve `409` sin mutación.

### AC2 - Bank obligatorio y propio

Sin bank o UUID inválido responde `400`; bank ajeno/inexistente responde `404` genérico y no persiste follow.

### AC3 - Estado publicado

Draft o inactive no admite follow. Inactivar luego preserva follows históricos, pero bloquea nuevos.

### AC4 - Prefill normalizada

Respuesta contiene exclusivamente datos normalizados necesarios para abrir formulario de ticket. No incluye stake/funding decidido por servidor.

### AC5 - Sin efectos financieros

Follow no crea bet, legs persistidas, funding, reservas, transactions ni movimientos de pockets. Ticket solo nace tras confirmación explícita en `POST /api/bets`.

### AC6 - Seguridad

Cookie BFF invoca RPC `SECURITY INVOKER` solo `service_role`; lectura de follows aplica ownership RLS.

## Fuera De Alcance

- Ticket automático, seguimiento automático de resultados y sincronización externa.

## Dependencias

- SL-28/29, banks y flujo SL-12.

## Evidencia De Cierre

- Persistencia, RPC, endpoint, prefill y UI implementados mediante migrations Fase 4J sincronizadas hasta `20260817194604_add_follow_creation_status`, que permite responder `201` en creación y `200` en replay.
- SQL rollback verifica follow idempotente, inactive y cero bet; Playwright 4J verifica selector de bank y ausencia de bet adicional.
- Cobertura y gaps: `.context/reports/phase-4j-verification.md`.
