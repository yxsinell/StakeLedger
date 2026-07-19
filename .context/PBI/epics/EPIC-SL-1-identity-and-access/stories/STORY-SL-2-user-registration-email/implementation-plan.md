# Implementation Plan: STORY-SL-2 - Registro con email y password

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-001
- API contract: `.context/SRS/api-contracts.yaml` `/api/auth/register`

## Estado Actual Verificado

- `src/app/signup/page.tsx` existe y usa `useAuth().signup()`.
- `src/contexts/auth-context.tsx` registra con `supabase.auth.signUp()` y luego sincroniza `public.users` desde cliente.
- No existe `src/app/api/auth/register/route.ts`.
- `src/types/supabase.ts` contiene `public.users` con `email` unico y `role` default `user`.
- Supabase advisor reporta leaked password protection deshabilitado y exposicion GraphQL para `public.users`.

## Alcance

- Alinear registro con SRS: email, password, validacion, usuario Auth y perfil `users` con rol `user`.
- Normalizar email con `trim().toLowerCase()` antes de validar y enviar.
- Definir si el flujo final usa API propia (`/api/auth/register`) o Supabase client directo. Roadmap Fase 2A lo marca como decision abierta.
- Mantener fuera de alcance: login social, MFA, invitaciones.

## Archivos a Tocar

- `src/app/api/auth/register/route.ts` - crear si se confirma arquitectura API SRS.
- `src/lib/api/auth.ts` - reutilizar helpers de sesion si aplica; no mezclar con register si no requiere sesion.
- `src/lib/api/responses.ts` - alinear respuesta de error con SRS `{ success, error }` o documentar cambio de contrato.
- `src/lib/openapi/schemas/auth.ts` - crear schemas Zod/OpenAPI para register.
- `src/lib/openapi/schemas/index.ts` - exportar schemas auth.
- `src/app/signup/page.tsx` - conectar formulario a API o reforzar flujo client actual.
- `src/contexts/auth-context.tsx` - mover/ajustar `signup()` segun decision API vs client.
- `middleware.ts` - no obligatorio para register, pero validar que auth routes redireccionan correctamente.
- Test setup files - crear solo cuando se defina framework (Vitest/Playwright no existen aun).

## DB/RLS Necesarios

- Confirmar fuente de migraciones antes de tocar DB; Fase 2A indica que no hay `supabase/migrations/*` local.
- Mantener `public.users.role` default `user` y check `admin|editor|user`.
- Revisar si perfil debe crearse via trigger `auth.users` -> `public.users` para evitar upsert client-side.
- Corregir RLS de `users` usando `(select auth.uid())` si se hacen migraciones de hardening.
- Revocar grants GraphQL/anon/authenticated segun politica aprobada.

## API Necesaria

- `POST /api/auth/register` segun SRS si se mantiene contrato API.
- Request: `{ email, password }`.
- Success: `201` con `AuthResponse` o respuesta ajustada si Supabase email confirmation no emite session.
- Errors: `400` para validacion/password debil/email duplicado; `500` para errores inesperados.
- No filtrar detalles internos de Supabase al cliente.

## UI Necesaria

- `signupForm`, `email_input`, `password_input`, `signup_button`, `form_error`, `form_message` ya existen.
- Agregar mensajes inline para email invalido y password debil.
- Confirmar UX post-registro: redirect a `/dashboard` con sesion o mensaje para confirmar email.
- Evitar mensaje ambiguo si Supabase requiere confirmacion por correo.

## Validaciones Zod

- `email`: string email, max 254, normalizado trim/lowercase.
- `password`: min 8, al menos 1 mayuscula, al menos 1 numero.
- Rechazar body JSON invalido con error de validacion estructurado.

## Tests Minimos

- Unit: schema acepta `Abcdef12` y rechaza `password`, email invalido y email >254.
- API: registro exitoso crea usuario/perfil con `role=user`.
- API: email duplicado no crea perfil duplicado.
- E2E: formulario muestra confirmacion o redireccion segun decision de email confirmation.
- Security/manual: leaked password protection revisada en Supabase Auth.

## Criterios de Cierre

- AC de SL-2 cubiertos: exito, email existente, password debil.
- Contrato API o decision documentada de Supabase client directo queda consistente con SRS/OpenAPI.
- Perfil queda creado con rol `user` sin depender de comportamiento fragil del cliente.
- Tests minimos definidos/pasando cuando exista test infra.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Confirmar si registro inicia sesion automaticamente o exige verificacion de email.
- Confirmar catalogo exacto de mensajes de error.
- Confirmar rate limiting para abuso de registro.
