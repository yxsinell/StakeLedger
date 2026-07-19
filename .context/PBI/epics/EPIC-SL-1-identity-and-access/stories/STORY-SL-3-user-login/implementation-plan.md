# Implementation Plan: STORY-SL-3 - Inicio de sesion

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-002
- API contract: `.context/SRS/api-contracts.yaml` `/api/auth/login`

## Estado Actual Verificado

- `src/app/login/page.tsx` existe y usa `useAuth().login()`.
- `src/contexts/auth-context.tsx` usa `supabase.auth.signInWithPassword()` desde cliente.
- No existe `src/app/api/auth/login/route.ts`.
- `middleware.ts` tiene `PROTECTED_ROUTES: []`; `/dashboard` no redirecciona a login, solo muestra card anonima.
- `src/lib/supabase/server.ts` soporta cookie auth y bearer token en API.

## Alcance

- Alinear login con SRS: credenciales, session token/perfil, dashboard protegido.
- Normalizar email antes de autenticar.
- Definir arquitectura auth: API `/api/auth/login` o Supabase client directo con SRS actualizado.
- Mantener fuera de alcance: login social, MFA, remember-me avanzado.

## Archivos a Tocar

- `src/app/api/auth/login/route.ts` - crear si se mantiene contrato API.
- `src/app/login/page.tsx` - conservar UI y conectar al flujo decidido.
- `src/contexts/auth-context.tsx` - ajustar `login()` y carga de perfil.
- `middleware.ts` - proteger `/dashboard` y futuras rutas privadas.
- `src/lib/api/responses.ts` - unificar errores auth/validation con contrato.
- `src/lib/openapi/schemas/auth.ts` - schemas login.
- `src/lib/openapi/schemas/index.ts` - exportar schemas.
- Test setup files - pendiente porque no hay Vitest/Playwright configurado.

## DB/RLS Necesarios

- No requiere nueva tabla si `users` sigue como perfil.
- RLS debe permitir al usuario leer su perfil y denegar perfiles ajenos.
- Hardening recomendado: cambiar policies que usan `auth.uid()` directo por `(select auth.uid())`.
- Revocar exposicion GraphQL para `users` si no es intencional.

## API Necesaria

- `POST /api/auth/login` si se mantiene SRS.
- Request: `{ email, password }`.
- Success: `200` con token valido y perfil; si se usan cookies Supabase, documentar respuesta real.
- Errors: mensaje generico para credenciales invalidas para evitar enumeracion.
- Rate limit/bloqueo temporal debe definirse antes de implementar bloqueo real.

## UI Necesaria

- `loginForm`, `email_input`, `password_input`, `login_button`, `form_error` ya existen.
- Agregar link visible a recuperacion de password cuando SL-4 se implemente.
- Redireccionar a `redirect` param o `/dashboard` tras login exitoso.
- Mostrar estado bloqueado si se implementa limite de intentos.

## Validaciones Zod

- `email`: string email, trim/lowercase, max 254.
- `password`: string min 8.
- Rechazar JSON invalido y payload incompleto.

## Tests Minimos

- Unit: schema normaliza email y rechaza payload invalido.
- API: login exitoso devuelve sesion/token o set-cookie segun decision.
- API: password incorrecto y email inexistente devuelven error generico sin sesion.
- E2E: usuario valido accede a `/dashboard`.
- E2E/middleware: usuario anonimo en `/dashboard` redirecciona a `/login?redirect=/dashboard`.

## Criterios de Cierre

- AC de SL-3 cubiertos: login exitoso, password incorrecto, email no registrado.
- Dashboard queda protegido por middleware o guard equivalente.
- Error no permite enumerar usuarios.
- Contrato API/SRS queda consistente con implementacion real.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Confirmar si se devuelven bearer tokens en API o se usan cookies Supabase como contrato oficial.
- Definir limite de intentos y duracion de bloqueo.
- Confirmar mensaje generico de credenciales invalidas.
