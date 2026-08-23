# Auditoría integral de producto y usabilidad

> Fecha: 2026-08-23. Alcance: repositorio, especificaciones, UI, BFF/API, Supabase, Vercel, pruebas y experiencia pública.

## Veredicto ejecutivo

StakeLedger no es un esqueleto técnico. Backend, base de datos y gran parte de los flujos de dominio están implementados. El problema principal es otro: el sistema fue construido y validado como conjunto de capacidades técnicas, no como recorrido continuo para una persona nueva.

Estado correcto: **release candidate técnico conectado, todavía no producto público operable**.

La aplicación compila, despliega y responde. Sin embargo, no cumple todavía condiciones de producto vivo porque:

- No existe onboarding funcional que lleve desde registro hasta primer bank, primer movimiento y primer ticket.
- Varios flujos dependen de datos preparados con `service_role` durante E2E.
- El catálogo no ofrece creación de eventos y mercados desde la aplicación.
- El entorno llamado producción comparte Supabase con pruebas y datos de fixtures.
- No existe staging separado, CI remoto ni monitoreo de activación.
- Health, documentación y estados de Jira comunican una madurez superior o diferente a la experiencia real.

## Semáforo actual

| Área | Estado | Evidencia |
| --- | --- | --- |
| Repositorio Git | Verde | `main` limpio, `origin/main` en `fb6fd7a`, divergencia 0/0. |
| Despliegue Vercel | Verde técnico | Producción `READY`, alias `stake-ledger.vercel.app`, commit `fb6fd7a`. |
| Supabase/PostgreSQL | Verde técnico | Proyecto `ACTIVE_HEALTHY`, 36 migraciones y 23 tablas públicas con RLS. |
| Backend/BFF | Verde | Auth, banks, ledger, bets, settlement, goals, recomendaciones y métricas implementados. |
| Build y calidad funcional | Verde | ESLint, build, TypeScript secuencial y 92 unit tests pasan. |
| Usabilidad y activación | Rojo | No existe recorrido guiado completo ni recuperación contextual desde estados vacíos. |
| Catálogo operativo | Rojo | Eventos y mercados se consumen, pero no se producen desde UI/BFF. |
| Realismo E2E | Ámbar/Rojo | Fixtures privilegiados preparan usuarios, catálogo y publicaciones; algunos pasos no prueban operación humana real. |
| Seguridad operativa | Ámbar | Leaked-password protection desactivada y RPC/GraphQL expuestos bajo postura temporal aceptada. |
| Entornos y release | Rojo | Sin staging aislado, CI ni separación entre datos de prueba y producción. |
| Documentación/traceability | Rojo | README declara Fase 3 y UI pendiente, mientras `main` y Vercel contienen Fase 6. |

## Mapa de creación: dónde está

```text
Especificaciones y dominio
        |
        v
Supabase real + RLS + RPCs atómicas          IMPLEMENTADO
        |
        v
Next.js BFF cookie-authenticated             IMPLEMENTADO
        |
        v
Pantallas por módulo                         IMPLEMENTADO
        |
        v
Recorrido humano entre módulos               INCOMPLETO
        |
        v
Activación, datos operativos y soporte        AUSENTE
        |
        v
Producto público medible                      NO ALCANZADO
```

La construcción llegó hasta “pantallas conectadas por módulo”. Lo que falta no es volver a crear backend: falta ensamblar capacidades en journeys de producto.

## Capacidades reales

| Journey | Estado |
| --- | --- |
| Registro, login, logout y recuperación PKCE | Implementado; depende de configuración Redirect URL y confirmación de email. |
| Crear bank y bolsillos | Implementado mediante RPC atómica. |
| Depósito, retirada y transferencia | Implementado con idempotencia y ledger de doble asiento. |
| Ticket manual | Implementado con financiación cash/bonus/freebet. |
| Ticket normalizado | Implementado si existen eventos y mercados activos. |
| Settlement y cashout | Implementado con auditoría append-only. |
| Metas y límites de riesgo | Implementado. |
| Recomendaciones y follow | Implementado si editor y catálogo ya prepararon publicaciones. |
| Métricas | Implementado para tickets liquidados. |
| RBAC admin/editor/user | Implementado. |

## Brechas de usabilidad prioritarias

### P0 - Bloqueos de producto vivo

1. **Health engañoso**: `src/app/api/health/route.ts` devuelve `healthy` sin consultar DB, Auth ni RPC. Conectividad aparente no prueba capacidad funcional.
2. **Sin first-run**: usuario nuevo entra a módulos vacíos sin guía para crear bank, financiarlo y registrar primer ticket.
3. **Entorno contaminado por pruebas**: Supabase contiene 111 perfiles, 18 banks y 488 audit logs. E2E usa `service_role` contra el mismo proyecto.
4. **Sin staging**: `.agents/project.yaml` mantiene dominio y staging como `null`, aunque Vercel ya sirve producción.
5. **Catálogo no autosuficiente**: hay 5 eventos y 5 mercados, pero no existen UI/BFF de escritura para renovarlos.

### P1 - Fricción severa

1. `src/components/bets/bet-ticket-form.tsx` deshabilita submit mediante múltiples reglas, pero no resume qué falta.
2. Ticket empieza en modo manual, aunque producto pretende normalización.
3. Éxito de creación muestra UUID y limpia formulario; no conduce al detalle recién creado.
4. `src/app/dashboard/catalog/page.tsx` conserva selección local sin convertirla en acción útil.
5. Feed filtra liga mediante UUID técnico.
6. Follow usa `sessionStorage`; recarga o nueva pestaña pierde prefill.
7. Alternativas de riesgo/metas se muestran como texto, no como acciones aplicables.
8. AuthProvider llama `/api/auth/profile` en páginas públicas; 401 esperado aparece como error de consola.

### P2 - Calidad y operación

1. Falta favicon: 404 público.
2. Landing salta niveles de heading; Lighthouse mobile: accesibilidad 98, best practices 96, SEO 100.
3. `format:check` falla en 52 archivos legacy.
4. No existe GitHub Actions.
5. README usa versiones, variables y roadmap obsoletos.
6. Sin métricas de activación, errores por journey ni funnel de onboarding.

## Evidencia técnica actual

| Verificación | Resultado |
| --- | --- |
| `bun run lint` | PASS |
| `bun test` | PASS: 92 tests, 252 assertions |
| `bun run build` | PASS: 47 páginas generadas, rutas UI/API compiladas |
| `bun run typecheck` | PASS al ejecutarse después del build |
| `bun run format:check` | FAIL: 52 archivos legacy |
| `git diff --check` | PASS |
| Vercel runtime errors últimos 7 días | Ningún cluster reportado |
| Vercel build | Completado; warnings de caché webpack y `caniuse-lite` antiguo |
| Supabase | `ACTIVE_HEALTHY`, PostgreSQL 17.6, 36 migraciones |

La primera ejecución paralela de TypeScript y build falló por carrera sobre `.next/types`; ejecución secuencial pasó. `repo:check` ya usa orden secuencial y no presenta ese problema.

## Seguridad y datos

- RLS está activa en las 23 tablas públicas.
- Leaked-password protection permanece desactivada.
- GraphQL descubre objetos concedidos a `authenticated`; Supabase mantiene warnings para tablas y vista del feed.
- Cuatro funciones `SECURITY DEFINER` continúan ejecutables por `authenticated`, incluyendo creación de bank y transacción cash. La postura fue aceptada temporalmente, pero contradice el objetivo declarado de BFF como única superficie pública.
- Cuatro tablas de idempotencia tienen RLS sin policy como deny-by-default intencional.
- Performance advisor reporta 10 foreign keys sin índice; impacto actual bajo por volumen, relevante antes de crecimiento.

Referencias de remediación:

- [Supabase database linter](https://supabase.com/docs/guides/database/database-linter)
- [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Repositorio y sincronización

### Evidencia encontrada

- Único remote local: `origin -> https://github.com/yxsinell/StakeLedger.git`.
- Único repositorio StakeLedger encontrado en cuenta GitHub: `yxsinell/StakeLedger`.
- Vercel `stake-ledger` está vinculado a ese mismo repositorio y rama `main`.
- Último deployment de producción usa exactamente `fb6fd7a`, igual que local y `origin/main`.
- No existe evidencia local, GitHub o Vercel de un “repositorio nuevo” alternativo.

Por tanto, estado actual ya está sincronizado:

```text
workspace/main = origin/main = Vercel production = fb6fd7a
```

Si existe otro repositorio privado o con nombre distinto, no debe clonarse para compararlo. Procedimiento correcto:

```bash
git remote add candidate <URL_DEL_REPOSITORIO>
git fetch candidate
git log --left-right --graph --cherry-pick main...candidate/main
git diff $(git merge-base main candidate/main)..candidate/main
```

Después se integran solo work units útiles mediante cherry-pick o patch revisado. No se reemplaza `main` ni se duplica infraestructura sin demostrar valor diferencial.

## Dirección recomendada

### Fase A - Convertir RC en entorno confiable

- Crear staging separado en Vercel y Supabase.
- Reservar producción para datos reales; limpiar o archivar fixtures conforme a política explícita.
- Implementar health profundo para DB/Auth/RPC.
- Cerrar leaked-password protection y Redirect URLs.
- Añadir CI para lint, unit, build, typecheck y contract drift.

### Fase B - Cerrar activación MVP

- Crear onboarding persistente: cuenta -> bank -> depósito -> primer ticket -> detalle.
- Añadir empty states con CTA y progreso visible.
- Explicar validaciones y razones de botones bloqueados.
- Conducir cada éxito a siguiente acción natural.
- Probar first-run sin storage state ni inserts privilegiados.

### Fase C - Hacer catálogo autosuficiente

- Añadir proceso UI/BFF para eventos y mercados, o integrar fuente/ingesta explícita.
- Sustituir UUIDs por nombres y selectores humanos.
- Persistir relación recommendation -> ticket si sigue siendo requisito de producto.
- Eliminar copy obsoleto y dead ends de catálogo.

### Fase D - Operar producto vivo

- Instrumentar activación: signup confirmado, primer bank, primer depósito, primer ticket.
- Añadir observabilidad por journey y alertas de errores reales.
- Ejecutar pruebas browser/device y performance p75/p95.
- Reconciliar README, Jira, ATP y release definition.

## Criterio de salida

StakeLedger puede considerarse aplicación viva cuando un usuario nuevo, sin datos preparados ni acceso administrativo, completa autónomamente:

1. Registro y confirmación.
2. Creación de bank.
3. Depósito inicial.
4. Registro de ticket.
5. Consulta de detalle y ledger.
6. Liquidación y visualización de métricas.

Ese journey debe pasar en staging aislado, luego producción, con telemetría y sin `service_role` en preparación funcional.
