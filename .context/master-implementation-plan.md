# Master Implementation Plan

> Actualizado: 2026-08-16. Este plan parte del estado verificable, no de la planificación histórica.

## Guardrails

- Leer story, ATP, plan, Business Data Map y OpenAPI antes de implementar.
- Mantener API web con cookie BFF. Las rutas no aceptan bearer JWT como contrato público web.
- `supabase/migrations/` es fuente canónica; remoto solo valida que todas las versiones fueron aplicadas.
- No cambiar RLS, grants, GraphQL ni funciones SECURITY DEFINER sin una fase específica y pruebas de BFF.

## Baseline

| Capa | Estado |
| --- | --- |
| Business Data Map | Implementado y canónico para reglas de dominio. |
| Auth | BFF y UI implementados; perfil automático activo. |
| Banks | RPC atómica, APIs, UI y saldo operativo implementados. |
| DB/RLS | 21 migrations locales y remotas sincronizadas; movimientos y reservas financieras solo mediante RPC con ownership e idempotencia. |
| API | Transferencias y tickets implementados mediante BFF y RPC. Catálogo, metas, recomendaciones y métricas permanecen futuros. |
| Seguridad | Leaked password protection desactivada; GraphQL y SECURITY DEFINER documentados como postura pendiente. |

## Estado de fase exacto

1. SL-9 implementado sobre el ledger validado: RPC atómica, idempotencia, BFF, UI y documentación. Pendiente cobertura de integración/E2E cuando exista infraestructura de pruebas adecuada.
2. SL-12/SL-13 implementados: RPC atómica, funding por pocket, idempotencia, BFF, UI y documentación. Pendientes E2E manual, concurrencia multisesión y normalized end-to-end cuando exista catálogo de aplicación.

SL-5 no bloquea SL-10 ni SL-9: sus operaciones son siempre del titular. Sí bloquea escritura de catálogo y recomendaciones por editor/admin.

## Modelo de movimientos

| Operación | Regla |
| --- | --- |
| Depósito | Acredita `cash`; método requerido; crea un asiento `deposit`. |
| Retiro | Debita `cash` si hay saldo suficiente; método requerido; crea un asiento `withdraw`. |
| Transferencia | Debita y acredita `cash` entre banks propios de misma divisa; crea `transfer_debit` y `transfer_credit` enlazados. |
| Idempotencia | Cabecera `Idempotency-Key` UUID obligatoria; retry equivalente devuelve operación previa; reutilización distinta devuelve `409`. |

## Estado de dominios

| Dominio | Estado | Objetivo |
| --- | --- | --- |
| RBAC | Auth implementada | Administración de roles y permisos de editor/admin. |
| Catálogo | RBAC | Catálogo local, entrada manual y alias. |
| Bets | Implementado Fase 4G; validación manual pendiente | Tickets, financiación y reservas. |
| Settlement | Implementado Fase 4H | Retornos por pocket, cashout cash-only y auditoría append-only. |
| Goals | Settlement | Metas y riesgo sobre resultados fiables. |
| Recommendations | RBAC, catálogo, bets | Feed y prefill sin creación implícita de ticket. |
| Metrics | Settlement | Métricas derivadas trazables. |

## Definition Of Ready

- Reglas de negocio cerradas en Business Data Map.
- Contrato API cookie BFF actualizado.
- Impacto DB/RLS conocido y decisión de migration explícita.
- Plan de pruebas cubre happy path, validación, idempotencia, ownership y acceso cruzado.

## Definition Of Done

- Acceptance criteria y contrato runtime coinciden.
- RLS deniega acceso cruzado.
- Elementos interactivos incluyen `data-testid`.
- Tipos Supabase se regeneran tras cambios de schema.
- Postura de seguridad revisada si se alteran grants, RLS o RPCs.

## Fase 4H implementada

- SL-14: liquidación canónica por funding, precisión exacta, idempotencia y RPC transaccional.
- SL-15: cashout parcial 100% cash, original cerrado, derivado open, legs copiadas y carryover trazable.
- SL-16: auditoría append-only reforzada, lectura owner/admin y detalle de ticket conectado.
- Migrations remotas: `20260817045500_implement_settlement_cashout_audit` y `20260817045542_index_settlement_cashout_references`.
- Legacy se conserva y permanece no liquidable sin reservas modernas.
