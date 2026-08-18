# Master Implementation Plan

> Actualizado: 2026-08-18. Este plan parte del estado verificable, no de la planificación histórica.

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
| DB/RLS | 36 migrations locales y remotas sincronizadas hasta `20260817201754_include_incomplete_settled_metrics`; operaciones sensibles solo mediante RPC con ownership e idempotencia. |
| API | Transferencias, tickets, settlement, catálogo, metas, recomendaciones y métricas implementados mediante BFF/RPC. |
| Seguridad | Sesiones protegidas validadas server-side y refresh cookies persistido. Leaked password protection sigue desactivada; GraphQL y SECURITY DEFINER documentados como postura aceptada temporalmente. |

## Estado de fase exacto

1. SL-9 implementado sobre ledger validado: RPC atómica, idempotencia, BFF, UI y E2E de transferencia con doble asiento visible.
2. SL-12/SL-13 implementados y cubiertos en Fase 6: funding mixto, reservas enlazadas, idempotencia, ownership, normalized UI y carreras viables de clave/saldo.

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
| RBAC | Implementado local/remoto | Administración de roles y permisos de editor/admin. |
| Catálogo | Implementado local/remoto | Catálogo local, entrada manual y alias. |
| Bets | Implementado y verificado Fase 6 | Tickets, financiación, reservas, idempotencia, ownership y concurrencia. |
| Settlement | Implementado Fase 4H | Retornos por pocket, cashout cash-only y auditoría append-only. |
| Goals | Implementado local/remoto Fase 4I | Metas, riesgo y recálculo atómico verificados. |
| Recommendations | Implementado local/remoto Fase 4J | Lifecycle editorial, feed published-only y prefill sin creación implícita de ticket. |
| Metrics | Implementado local/remoto Fase 4J | Métricas settled-only derivadas mediante RPC interna. |

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

## Fase 4I implementada local y remotamente

- SL-22/23: creación, update, misión diaria exacta, progreso, history y UI real.
- SL-24: vínculo opcional `bets.goal_id` y recálculo dentro de settlement con deduplicación por bet.
- SL-25: cap fijo 40%, max odds/max daily loss opt-in, API de configuración y alternativas sin ajuste automático.
- SL-26: cierre explícito completed/cancelled con confirmación, history, audit y estado final.
- Migration `20260817160357_implement_goals_and_risk.sql` aplicada remotamente; tipos Supabase regenerados y verificados.

## Fase 4J implementada local y remotamente

- SL-28: `POST` crea solo `draft`; `PATCH` edita, publica o inactiva; ICP v1 visible, `inactive` terminal y sin delete físico.
- SL-29: feed solo published, filtros `type|sport|leagueId`, orden estable y cursor 20/50.
- SL-30: follow persistido e idempotente con bank propio; `201` al crear, `200` al repetir con mismo bank, prefill normalizada y cero creación de ticket.
- SL-31: métricas settled-only por bank/rango UTC inclusivo máximo 366 días, con fórmulas cerradas.
- Seguridad: cookie BFF; escrituras/RPC de métricas `SECURITY INVOKER` solo `service_role`; lectura RLS.
- Migrations Fase 4J aplicadas y reconciliadas hasta `20260817201754_include_incomplete_settled_metrics`; total local/remoto: 36. Tipos Supabase regenerados.
- Evidencia: 84 unit tests/222 assertions PASS, `bun run repo:check` PASS, `git diff --check` PASS, SQL rollback y seguridad PASS, suite Playwright 4I/4J PASS 2/2 en 53.3 s y residuo 4J cero.
- Suite E2E completa acreditada: Fases 4I y 4J pasan 2/2. Los ATP manuales completos no se ejecutaron uno a uno.

## Fase 6 release candidate

- Veredicto: `PASS WITH RISKS`; evidencia completa en `.context/reports/phase-6-release-candidate.md`.
- Checks: 92 unit tests, 9 Playwright E2E, frozen install, lint, production build, typecheck y diff check pasan.
- Trifuerza: UI, BFF/API y DB/RLS cubren flujos MVP; lifecycle SL-28 y follow real SL-30 se ejecutaron dirigidos con cleanup administrativo y residuo cero.
- Dependabot: 8 alerts abiertas comparten fix Next.js 15.5.21; parche aplicado localmente, pendiente push/reescaneo.
- Bloqueos externos antes de producción: activar leaked-password protection y verificar Redirect URL `/auth/callback` en Supabase Dashboard.
