# Postura de Seguridad Supabase

> Actualizado: 2026-08-03. Evidencia: advisors del proyecto remoto `ziqbjajprkoukezhgidr` y 13 migrations en `supabase/migrations/`.

## Principios operativos

- `supabase/migrations/` es fuente canónica de cambios de schema, RLS, grants y funciones.
- El schema remoto se consulta para verificar aplicación de migrations; no se modifica manualmente salvo configuración de Auth documentada aquí.
- Las APIs web usan cliente Supabase autenticado por cookie BFF. Revocar grants o RPCs sin rediseñar esa capa rompería rutas existentes.

## Acción manual requerida

### Activar protección contra contraseñas filtradas

1. Abrir Supabase Dashboard del proyecto StakeLedger.
2. Ir a **Auth settings**.
3. Activar **Prevent use of leaked passwords**.
4. Revisar en la misma pantalla la longitud mínima y requisitos de contraseña para que coincidan con el contrato de registro.
5. Guardar y registrar fecha, operador y resultado en el control de cambios del proyecto.

La protección usa comprobación contra Have I Been Pwned. Es una configuración de Auth; no requiere migration ni cambio de código. Guía: <https://supabase.com/docs/guides/auth/password-security>.

## Avisos clasificados

| Aviso | Clasificación | Decisión |
| --- | --- | --- |
| Leaked password protection desactivada | Riesgo real | Activación manual requerida antes de siguiente despliegue de Auth. |
| Tablas visibles en schema GraphQL para `authenticated` | Exposición de metadatos, no bypass de RLS | Aceptado temporalmente. RLS limita filas por ownership; no revocar `SELECT` mientras BFF consulte con sesión autenticada. |
| `create_bank_with_pockets` SECURITY DEFINER ejecutable por `authenticated` | Exposición intencional con superficie a vigilar | Aceptado temporalmente: valida `auth.uid()`, parámetros y usa search path seguro. La ruta BFF y el cliente autenticado necesitan ejecutarla. |
| `is_admin` e `is_catalog_editor` SECURITY DEFINER ejecutables por `authenticated` | Helper RLS intencional | Aceptado temporalmente: devuelven booleano del usuario actual y permiten políticas RLS. |
| FKs sin índice e índices sin uso | Rendimiento, no seguridad | Diferir hasta que los flujos correspondientes tengan tráfico y planes de consulta reales. |

## Estrategia GraphQL

No deshabilitar GraphQL mediante grants de tablas: las rutas BFF usan los mismos grants `authenticated` para consultar datos propios.

Estrategia futura, tras prueba en entorno aislado:

1. Confirmar que ninguna aplicación llama `/graphql/v1`.
2. Preparar una migration revisada que ejecute `DROP EXTENSION pg_graphql`.
3. Verificar registro, sesión, lectura de banks y RPCs por `/rest/v1`.
4. Aplicar con autorización explícita y volver a ejecutar advisors.

Deshabilitar GraphQL no deshabilita REST ni RPCs REST. Guías: <https://supabase.com/docs/guides/graphql> y <https://supabase.com/docs/guides/api/securing-your-api>.

## Estrategia SECURITY DEFINER

No revocar `EXECUTE` de las tres funciones actuales mientras las rutas BFF empleen token autenticado: la revocación rompería creación de banks y evaluación RLS.

Para cada función privilegiada futura:

1. Preferir `SECURITY INVOKER` si RLS puede expresar la operación.
2. Si necesita `SECURITY DEFINER`, fijar `search_path`, cualificar objetos, validar `auth.uid()` y otorgar solo `EXECUTE` al rol necesario.
3. Mover funciones que no deban ser RPC a schema no expuesto y no otorgar `EXECUTE` a `authenticated`.
4. Tratar cambios de grants, schema expuesto y función como una sola migration con pruebas BFF/RLS.

Guías: <https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0029_authenticated_security_definer_function_executable> y <https://supabase.com/docs/guides/auth/row-level-security#helper-functions>.

## Verificación previa a una migration de seguridad

- Confirmar las 13 versiones locales contra remoto.
- Probar acceso BFF de usuario propio y rechazo cruzado.
- Probar RPC de creación de bank si se modifican grants o funciones.
- Revisar advisors de seguridad y rendimiento tras aplicación.
