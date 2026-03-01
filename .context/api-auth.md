# API Authentication - StakeLedger

## Metodos de autenticacion

- Supabase Auth con sesiones basadas en cookies.
- AuthContext maneja login/signup/logout en cliente.

## Para desarrolladores

### Acceder al usuario autenticado en server components

- Usar createServerClient en src/lib/supabase/server.ts
- Luego supabase.auth.getUser()

### Proteger rutas

- middleware.ts protege rutas en PROTECTED_ROUTES.
- Redirect a /login si no hay sesion.

### AuthContext

- src/contexts/auth-context.tsx expone login/signup/logout.
- Sincroniza usuario y perfil en public.users.

## Para QA/Testing

- Las rutas protegidas requieren cookies sb-* validas.
- Iniciar sesion en la web y reutilizar cookies.

## Consideraciones de seguridad

- RLS habilitado en todas las tablas.
- Nunca exponer SUPABASE_SERVICE_ROLE_KEY en cliente.
- Validar ownership en cada query con RLS.
