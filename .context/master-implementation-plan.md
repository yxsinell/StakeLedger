# Master Implementation Plan

> Actualizado: 2026-08-03. Este plan parte del estado verificable, no de la planificación histórica.

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
| DB/RLS | 13 migrations locales y remotas sincronizadas; escrituras financieras directas aún no existen. |
| API futura | Transacciones, transferencias, catálogo, tickets, metas, recomendaciones y métricas no implementados. |
| Seguridad | Leaked password protection desactivada; GraphQL y SECURITY DEFINER documentados como postura pendiente. |

## Próxima fase exacta

1. Diseñar SL-10 contra contrato de movimientos y reglas canónicas.
2. Implementar y verificar SL-10.
3. Diseñar, implementar y verificar SL-9 sobre ledger de movimientos ya validado.

SL-5 no bloquea SL-10 ni SL-9: sus operaciones son siempre del titular. Sí bloquea escritura de catálogo y recomendaciones por editor/admin.

## Modelo de movimientos

| Operación | Regla |
| --- | --- |
| Depósito | Acredita `cash`; método requerido; crea un asiento `deposit`. |
| Retiro | Debita `cash` si hay saldo suficiente; método requerido; crea un asiento `withdraw`. |
| Transferencia | Debita y acredita `cash` entre banks propios de misma divisa; crea `transfer_debit` y `transfer_credit` enlazados. |
| Idempotencia | Cabecera `Idempotency-Key` UUID obligatoria; retry equivalente devuelve operación previa; reutilización distinta devuelve `409`. |

## Fases posteriores

| Fase | Dependencia cerrada | Objetivo |
| --- | --- | --- |
| RBAC | Auth implementada | Administración de roles y permisos de editor/admin. |
| Catálogo | RBAC | Catálogo local, entrada manual y alias. |
| Bets | Movimientos y catálogo | Tickets, financiación y reservas. |
| Settlement | Bets | Retornos por pocket, cashout y auditoría. |
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
