# Fase 6 - Release candidate

> Fecha: 2026-08-18. Veredicto: **PASS WITH RISKS**.

## Resumen

StakeLedger queda como release candidate local verificable. No permanecen bugs critical/high reproducidos en código. UI, BFF/API y PostgreSQL/RLS se probaron contra Supabase remoto; checks de código y build pasan. Riesgos restantes son configuración externa o publicación pendiente, no defectos ocultos.

## Estado inicial

| Control | Evidencia |
| --- | --- |
| Git | `main` limpio y sincronizado con `origin/main`; divergencia `0/0` antes de cambios. |
| Migrations | 36 local/remoto sincronizadas hasta `20260817201754_include_incomplete_settled_metrics`. |
| Supabase | Proyecto `ziqbjajprkoukezhgidr` `ACTIVE_HEALTHY`; RLS activa en las 23 tablas públicas. |
| Jira | Stories SL-2..16, SL-18..20, SL-22..26 y SL-28..31 en `Done`; épicas SL-6/17/21/27 siguen `To Do`, SL-11 `In Progress`. Solo lectura. |
| GitHub | Sin runs de Actions en `main`. Dependabot: 26 fixed históricos y 8 abiertas en Next.js 15.5.18. |

## Trifuerza

### UI

- Auth: logout aislado, reset no enumerable, callback inválido y deep-link protegido.
- Dashboard, banks, ledger, ticket normalizado, settlement, cashout, goals/risk, catálogo, recomendaciones, métricas y RBAC.
- Mobile 390x844: apertura/cierre de sidebar y navegación.
- Follow -> prefill: ejecución real dirigida y automatización UI estable con respuesta controlada; nunca crea ticket implícito.

### API

- Cookie BFF: 401 sin sesión; sesión revocada ya no atraviesa middleware.
- SL-12/13: header requerido, mix cash/bonus/freebet, replay `200`, conflicto `409`, bank ajeno `404`, misma clave concurrente `201/200` y saldo competido `201/409`.
- SL-28: create draft, edit, publish, inactive terminal y reactivación `409` ejecutados dirigidos.
- SL-29: cursor opaco, segunda página sin duplicado, cursor inválido y `leagueId` válido.
- SL-30: follow real `201`, prefill normalizada, cross-owner `404`; UI confirma cero bets automáticas.
- SL-31: bank ajeno `404`, 367 días `400`, rango vacío y ratios cero; suite 4J mantiene agregado settled-only.

### DB/RLS

- Funding mixto crea tres `bet_funding`, cada uno con reserva enlazada; pockets nunca negativos.
- Ownership se deniega indirectamente por BFF/RPC y RLS; RPCs financieras/Fase 4J sensibles siguen exclusivas de `service_role` según grants remotos.
- Advisors no reportan critical/high nuevos. Permanecen GraphQL metadata, cuatro SECURITY DEFINER ejecutables intencionales e idempotencias sin policy como defensa deny-by-default.
- Lifecycle/follow son inmutables incluso para PostgREST `service_role`; cleanup dirigido usó una transacción administrativa que deshabilitó y repuso triggers antes de confirmar residuo `0/0`.
- Datos mutables creados por esta fase quedaron en cero. Auditoría append-only y perfiles soft-deleted se conservan por diseño.

## Bugs corregidos

| Severidad | Defecto | Corrección |
| --- | --- | --- |
| High | Cookie con sesión revocada podía renderizar shell `/dashboard/*`; BFF después respondía 401. | Middleware bajo `src/` usa `auth.getUser()` server-side en vez de `getSession()`. |
| Medium | Cliente SSR BFF no persistía cookies refrescadas; Supabase advertía expiración temprana/logout aleatorio. | `createServerClient` implementa `setAll` writable para Route Handlers. |
| Low/local | `.env` tenía comilla abierta en `NEXT_PUBLIC_APP_URL`; Supabase CLI no podía parsear. | Comilla cerrada; `supabase status` llega correctamente al chequeo Docker local. |
| Contract | OpenAPI estático omitía eventos/mercados Fase 5. | Añadidos 2 paths y schemas; runtime/static quedan 36/36. |
| Medium | Markets de UUID inexistente devolvía `200 []` pese a contrato `404`. | Servicio valida evento `scheduled|live`; test unitario cubre recurso ausente. |

## Hardening

| Verificación | Resultado |
| --- | --- |
| `bun install --frozen-lockfile` | PASS: 612 installs, sin cambios. |
| `bun test` | PASS: 92 tests, 252 assertions. |
| `bun run test:e2e` | PASS: 9/9 en 2.8 min, sin retries. |
| `bun run repo:check` | PASS: ESLint, Next 15.5.21 production build, TypeScript. |
| `git diff --check` | PASS; solo warnings CRLF del entorno Windows. |
| OpenAPI runtime/static | PASS: OpenAPI 3.0.3, 36 paths ambos, drift 0. |
| Supabase advisors | PASS WITH RISKS: sin critical/high nuevos; warnings conocidos clasificados. |
| Dependabot | Parche local: Next/plugin 15.5.21. GitHub mantendrá 8 alerts abiertas hasta push/reescaneo. |

## Riesgos aceptados y bloqueos externos

| Riesgo | Severidad | Criterio de cierre |
| --- | --- | --- |
| Leaked password protection desactivada | Medium | Activar **Prevent use of leaked passwords** en Supabase Auth y registrar evidencia. [Remediación](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). |
| Redirect URL no verificable por falta de sesión Dashboard | Medium | Confirmar `http://localhost:3000/auth/callback`; añadir `https://<dominio>/auth/callback` cuando exista dominio. |
| 8 alerts aún abiertas en GitHub | Medium operativo | Publicar commits; esperar reescaneo que detecte Next 15.5.21. |
| GraphQL metadata y SECURITY DEFINER legacy | Low/accepted | Mantener postura de `.context/supabase-security-posture.md`; no cambiar grants sin entorno aislado y regresión BFF/RLS. |
| `caniuse-lite` seis meses antiguo | Low | Actualizar en fase de dependencias; no afecta build ni soporte funcional probado. |
| Sin CI GitHub Actions | Medium operativo | Añadir workflow separado si se requiere gate remoto; no inventar deploy mientras dominio/staging sean `null`. |

## Deuda no bloqueante

- ATP históricos contienen drift ya identificado: SL-9 `403` vs `404`, nombres legacy SL-14/15, providers externos SL-18/20 y endpoint obsoleto SL-24. Contratos canónicos son Business Data Map/SRS reconciliados.
- Performance NFR p75/p95 y navegadores Firefox/WebKit no se acreditan con esta suite Chromium local.
- Auth Redirect URL y leaked-password protection necesitan operador autenticado de Supabase Dashboard.
- Épicas Jira no se transicionaron ni comentaron por falta de autorización explícita.

## Veredicto

**PASS WITH RISKS**. Release candidate apto para commit y revisión local. No apto para release público hasta cerrar configuración Auth externa, publicar patch Dependabot y confirmar reescaneo.
