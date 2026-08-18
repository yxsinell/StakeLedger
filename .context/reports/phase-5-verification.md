# Fase 5 - Verificación de UI conectada

> Fecha: 2026-08-18. Veredicto: **PASS**, con acciones externas y límites QA registrados.

## Entrega

| Área | Resultado |
| --- | --- |
| Auth | Logout redirige a login; carga de perfil evita flash de permisos; recuperación canjea PKCE en `/auth/callback` y actualiza contraseña por BFF. |
| Shell | Dashboard opera con datos BFF reales; errores/not-found/loading globales y de dashboard; sidebar móvil usa overlay, Escape y cierre por navegación. |
| Ledger | `GET /api/transactions` BFF paginado y trazable por bank; detalle muestra depósitos, retiradas, transferencias, reservas, retornos y relaciones. |
| Tickets | Selector evento -> mercado normalizado para ticket y recomendación editorial; legs manuales y prefill se mantienen; settlement/cashout conservan clave idempotente hasta respuesta confirmada. |
| Catálogo | Nuevos GET BFF de eventos `scheduled|live` y mercados `active`, sobre schema/RLS existentes y sin migrations. |
| Roles y estados | Pantallas admin/goals/recomendaciones cubren carga, vacío, error, retry, acceso restringido y selectores estables. |
| Landing | CTAs funcionales, copy coherente en español y objetivos de producto sin presentarlos como métricas reales. |

## Verificaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `bun test` | PASS: 91 tests, 251 assertions |
| `bun run test:e2e` | PASS: 6/6 en 1.8 min |
| `bun run repo:check` | PASS: ESLint, build de producción y TypeScript |
| `git diff --check` | PASS |

## Journeys E2E Fase 5

- Ledger: depósito, retirada, transferencia y refresco de historial en origen/destino.
- Ticket normalizado: evento y mercado reales del catálogo, sin UUID técnico manual.
- Dashboard: resumen conectado y deep-link administrativo restringido.
- Auth: logout y redirección a login.
- La suite existente mantiene settlement/cashout, metas/riesgo, catálogo/recomendaciones y métricas.

## Acción externa necesaria

Antes de probar recuperación de contraseña fuera de localhost, registrar el callback permitido de cada entorno en Supabase Auth:

- Local: `http://localhost:3000/auth/callback`
- Producción: `https://<dominio-provisionado>/auth/callback`

No se automatiza desde código porque es configuración de Auth externa. La ruta no acepta redirecciones arbitrarias: siempre termina en `/reset-password`.

## Límites QA conocidos

- Una recomendación publicada genera historial append-only y no se puede borrar como fixture aislado. Por ello el journey E2E follow -> prefill permanece validación manual dirigida; UI/API conservan el contrato verificado Fase 4J.
- Los ATP manuales completos de SL-12/13 y SL-28..31 siguen siendo deuda explícita de Fase 4; no se reclasifican como ejecutados.
- Browserslist avisa que `caniuse-lite` tiene seis meses. No afecta build ni comportamiento; actualizar dependencias es tarea separada.
