# Development Roadmap

> Actualizado: 2026-08-17. Fuente de reglas: `.context/business-data-map.md`.

## Baseline verificado

| Área | Estado real |
| --- | --- |
| Auth web | Implementado: BFF con cookies para registro, login, logout y recuperación; perfil creado por trigger. |
| RBAC | Implementado local/remoto: gestión de roles por admin, cookie BFF, RPC restringida y auditoría. |
| Catálogo | Implementado local/remoto: búsqueda, fallback manual y mantenimiento editor/admin. |
| Banks | Implementado: creación atómica, listado, detalle, pockets y saldo operativo=cash. |
| Migrations | Fuente canónica `supabase/migrations/`; 36 versiones locales/remotas sincronizadas hasta `20260817201754_include_incomplete_settled_metrics`. |
| Movimientos | Implementados: depósitos/retiros cash-only con RPC e idempotencia. |
| Transferencias | Implementadas: doble asiento cash atómico, idempotencia y BFF. |
| Metas y riesgo | Fase 4I implementada y verificada local/remotamente. |
| Recomendaciones y métricas | Fase 4J implementada y verificada: migrations sincronizadas, tipos regenerados y journey Playwright específico PASS. |

## Orden de entrega

| Orden | Slice | Stories | Resultado |
| --- | --- | --- | --- |
| 1 | Transferencias | SL-9 | Implementado: `POST /api/banks/{bankId}/transfer`, doble asiento cash y misma divisa. |
| 2 | RBAC administrativo | SL-5 | Implementado: gestión de roles y enforcement admin/editor. |
| 3 | Catálogo local | SL-18, SL-19, SL-20 | Implementado: búsqueda local, fallback manual y mantenimiento editor/admin. |
| 4 | Tickets y financiación | SL-12, SL-13 | Reserva atómica, stake y funding. |
| 5 | Liquidación, cashout y auditoría | SL-14, SL-15, SL-16 | Implementado: RPCs atómicas, retornos por pocket, split cash-only, BFF/UI y evidencia inmutable. |
| 6 | Metas y riesgo | SL-22 a SL-26 | Implementado: RPCs atómicas, API cookie BFF, UI, risk limits, recálculo settlement y tests. |
| 7 | Recomendaciones | SL-28 a SL-30 | Implementado: lifecycle editorial terminal, feed published-only estable y follow persistido con prefill seguro. |
| 8 | Métricas | SL-31 | Implementado: RPC trazable sobre tickets settled y rango UTC inclusivo. |

## Contratos transversales

- APIs web: sesión por cookies BFF; no bearer JWT en contratos internos web.
- Importes monetarios: positivos cuando representan un movimiento, máximo dos decimales y sin redondeo.
- Escritos financieros: `Idempotency-Key` UUID obligatorio; mismo payload devuelve resultado original, distinto payload devuelve `409`.
- Depósitos, retiros y transferencias MVP: solo `cash`.
- Transferencia: origen y destino del mismo usuario, divisa igual, banks distintos y doble asiento atómico.
- Métodos de movimiento: `bank_transfer`, `card`, `cash`.
- Recomendaciones: `POST` crea solo drafts; `PATCH` edita, publica o inactiva; ICP visible, nunca ranking; feed `published_at DESC,id DESC`; follow responde `201` al crear y `200` al repetir con mismo bank, sin crear ticket.
- Métricas: solo `status=settled`; cashout excluido; bank propio y rango UTC inclusivo máximo 366 días.

## Seguridad y configuración

- Antes de cambiar RLS, grants o funciones, consultar `.context/supabase-security-posture.md`.
- Activar manualmente leaked password protection antes del siguiente despliegue de auth.
- No revocar `SELECT authenticated` ni `EXECUTE` de RPCs sin rediseñar BFF: las rutas actuales usan cliente Supabase autenticado.
- Tratar avisos de índices como trabajo de rendimiento posterior, no como bloqueo de movimientos.
- Suite E2E completa acreditada: `phase4i.e2e.ts` y `phase4j.e2e.ts` pasan 2/2 en 53.3 s.

## Paquete de implementación

Cada slice debe incluir: stories, impacto DB/RLS, contrato API, UI, pruebas unitarias/API/E2E/RLS, actualización de tipos si cambia schema y trazabilidad de acceptance criteria.
