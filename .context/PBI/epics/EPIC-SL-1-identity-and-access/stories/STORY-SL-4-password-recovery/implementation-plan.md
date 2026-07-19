# Implementation Plan: STORY-SL-4 - Recuperacion de password

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-003
- API contract: `.context/SRS/api-contracts.yaml` `/api/auth/reset-password`

## Estado Actual Verificado

- No existe ruta UI de recuperacion (`/forgot-password`, `/reset-password`) en `src/app`.
- No existe `src/app/api/auth/reset-password/route.ts`.
- `auth-context.tsx` no expone funcion de reset.
- Supabase Auth esta disponible via browser/server clients.

## Alcance

- Crear solicitud de reset con email y mensaje generico.
- Crear flujo para establecer nueva password desde link/token de Supabase.
- No revelar existencia de cuenta.
- Mantener fuera de alcance: MFA/2FA y SMS.

## Archivos a Tocar

- `src/app/api/auth/reset-password/route.ts` - solicitud de reset si se mantiene contrato API.
- `src/app/forgot-password/page.tsx` - formulario de solicitud.
- `src/app/reset-password/page.tsx` - formulario para nueva password desde link.
- `src/contexts/auth-context.tsx` - agregar helpers si UI usa Supabase client directo.
- `src/app/login/page.tsx` - agregar link a recuperacion.
- `src/lib/openapi/schemas/auth.ts` - schemas reset.
- `src/lib/openapi/schemas/index.ts` - exportar schemas.

## DB/RLS Necesarios

- No requiere tabla nueva si se usa Supabase Auth reset flow.
- Configurar redirect URL permitida en Supabase Auth para `/reset-password`.
- Revisar leaked password protection porque la nueva password debe respetar politica fuerte.
- RLS no aplica directamente salvo lectura de perfil tras cambio exitoso.

## API Necesaria

- `POST /api/auth/reset-password` para iniciar recuperacion si se mantiene SRS.
- Request: `{ email }`.
- Success: siempre `200` con mensaje generico para email registrado/no registrado.
- Reset final puede hacerse desde cliente con Supabase session del recovery link o mediante endpoint adicional si se decide documentarlo.
- Errors: `400` solo para payload invalido; no para email inexistente.

## UI Necesaria

- Formulario `forgotPasswordForm` con `email_input`, `reset_request_button`, `form_message`, `form_error`.
- Formulario `resetPasswordForm` con `password_input`, `confirm_password_input`, `reset_password_button`.
- Estados para link invalido/expirado/reutilizado.
- Link desde login: `forgot_password_link`.

## Validaciones Zod

- Solicitud: `email` string email, trim/lowercase, max 254.
- Nueva password: min 8, 1 mayuscula, 1 numero, confirmacion igual.
- Rechazar token/link ausente o invalido con mensaje generico de nueva solicitud.

## Tests Minimos

- Unit: schemas de email y password.
- API: solicitud con email registrado devuelve 200 generico.
- API: solicitud con email inexistente devuelve mismo 200 generico.
- E2E: usuario solicita reset y ve confirmacion generica.
- E2E/manual: link invalido o reutilizado muestra instruccion para solicitar nuevo link.

## Criterios de Cierre

- AC de SL-4 cubiertos: solicitud, email inexistente no enumerable, link invalido/expirado.
- Nueva password respeta misma politica de SL-2.
- Redirect URL de Supabase documentada y configurada.
- Contrato `/api/auth/reset-password` queda implementado o SRS actualizado.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Definir expiracion visible del enlace y criterios de invalidacion.
- Confirmar texto exacto del mensaje generico.
- Decidir si reset final requiere endpoint propio o solo Supabase client.
