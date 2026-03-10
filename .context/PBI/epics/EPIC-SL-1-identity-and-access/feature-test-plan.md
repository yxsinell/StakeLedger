## Plan de Pruebas de Funcionalidad - Generado 2026-03-09

**Lider QA:** Generado por IA
**Estado:** Borrador - Pendiente de revision

---

# Plan de Pruebas de Funcionalidad: EPIC-SL-1 - Identidad y acceso

**Fecha:** 2026-03-09
**Lider QA:** Generado por IA
**Clave Jira de la epica:** SL-1
**Estado:** Borrador - Pendiente de revision

---

## Analisis de contexto de negocio

### Valor de negocio

Esta epica habilita la activacion inicial y el acceso seguro a StakeLedger. Sin registro, inicio de sesion y recuperacion confiables, el usuario no puede gestionar bancos, apuestas ni metas. La correcta gestion de identidad reduce riesgo operacional, evita accesos indebidos y protege datos financieros.

**Propuesta de valor clave:**

- Control de acceso seguro para operaciones financieras sensibles.
- Activacion inicial confiable que habilita activacion temprana y retencion.

**Metricas de exito (KPIs):**

- Tasa de registro exitoso > 95%.
- Tasa de inicio de sesion exitoso > 97%.
- Recuperacion de contrasena exitosa > 90%.

**Impacto en usuarios:**

- **Carlos Vega (apostador recreacional disciplinado):** necesita registro rapido y claro para comenzar a registrar apuestas sin friccion.
- **Laura Rios (apostadora avanzada orientada a datos):** espera inicio de sesion confiable y sesiones estables para analizar su rendimiento.
- **Miguel Santos (administrador/pronosticador):** requiere control de roles para publicar recomendaciones y administrar permisos.

**Viajes de usuario criticos:**

- **Viaje 1: Registro y primera apuesta** (Paso 1: registro con email y contrasena).
- **Viaje 3: Seguir una recomendacion del flujo** (acceso al flujo requiere autenticacion y permisos).

---

## Analisis de arquitectura tecnica

### Componentes involucrados

**Interfaz:**

- Formularios de registro, inicio de sesion y recuperacion de contrasena.
- Rutas protegidas (panel y secciones de administracion).
- Estados de sesion (carga, error, exito) y mensajes consistentes.

**API:**

- **/api/auth/register** (registro)
- **/api/auth/login** (inicio de sesion)
- **/api/auth/reset-password** (recuperacion)
- Puntos finales protegidos por RBAC (admin/editor/user)

**Base de datos:**

- Tabla `users` (segun Supabase Auth).
- Perfil de usuario con rol (campo `role` o tabla relacionada).
- Auditoria basica de cambios de rol (si aplica mas adelante).

**Servicios externos:**

- Supabase Auth (registro/inicio de sesion/recuperacion).
- Proveedor de email para recuperacion.

### Puntos de integracion (criticos para testing)

**Integraciones internas:**

- Interfaz ↔ API (formularios de autenticacion).
- API ↔ Supabase Auth.
- API ↔ Base de datos (perfil/rol).

**Integraciones externas:**

- API ↔ Proveedor de email (recuperacion).

**Flujo de datos critico:**

```
Usuario -> Interfaz -> API de autenticacion -> Supabase Auth -> Base de datos Perfil/Rol
                         |
                         -> Proveedor de email (recuperacion)
```

---

## Analisis de riesgos

### Riesgos tecnicos

#### Riesgo 1: Configuracion incorrecta de Supabase Auth

- **Impacto:** Alto
- **Probabilidad:** Media
- **Area afectada:** API / Integracion
- **Mitigacion:**
  - Pruebas de integracion por punto final de autenticacion
  - E2E temprano de registro/inicio de sesion/recuperacion
- **Cobertura requerida:** pruebas de contrato y flujos extremo a extremo

#### Riesgo 2: Manejo incorrecto de sesion y expiracion

- **Impacto:** Alto
- **Probabilidad:** Media
- **Area afectada:** Interfaz / API
- **Mitigacion:**
  - Validar expiracion de token de acceso y token de refresco
  - Verificar cierre de sesion e invalidacion de sesion
- **Cobertura requerida:** pruebas de sesion y acceso a rutas protegidas

#### Riesgo 3: Limitacion de intentos insuficiente en inicio de sesion/recuperacion

- **Impacto:** Medio
- **Probabilidad:** Media
- **Area afectada:** API / Seguridad
- **Mitigacion:**
  - Definir limites en SRS/infra
  - Pruebas negativas de fuerza bruta simulada
- **Cobertura requerida:** pruebas de intentos fallidos y bloqueo temporal

### Riesgos de negocio

#### Riesgo 1: Friccion en activacion inicial reduce activacion

- **Impacto en negocio:** menor conversion a usuario activo
- **Impacto en usuarios:** abandono temprano (Carlos)
- **Probabilidad:** Media
- **Mitigacion:**
  - Validar mensajes claros y tiempos de respuesta
  - Pruebas de experiencia de usuario en registro/inicio de sesion
- **Validacion de AC:** asegurar mensajes y estados claros

#### Riesgo 2: Enumeracion de cuentas en recuperacion de contrasena

- **Impacto en negocio:** riesgo reputacional y seguridad
- **Impacto en usuarios:** exposicion de existencia de cuentas
- **Probabilidad:** Media
- **Mitigacion:**
  - Mensaje generico para email inexistente
  - Pruebas negativas con emails no registrados
- **Validacion de AC:** Escenario 2 de SL-4

### Riesgos de integracion

#### Riesgo 1: Fallo de proveedor de email en recuperacion

- **Punto de integracion:** API ↔ Proveedor de email
- **Que puede fallar:** entrega tardia/no entregada, errores 500
- **Impacto:** Medio
- **Mitigacion:**
  - Pruebas con proveedor en staging
  - Manejo de reintentos y mensajes al usuario

---

## Analisis critico y preguntas para PO/Dev

### Ambiguedades identificadas

**Ambiguedad 1:** Confirmacion de email en registro

- **Encontrado en:** SL-2
- **Pregunta para PO:** ?Se requiere verificacion de email antes de permitir inicio de sesion?
- **Impacto si no se aclara:** no podemos definir el flujo post-registro ni el estado del usuario

**Ambiguedad 2:** Politica exacta de expiracion de recuperacion

- **Encontrado en:** SL-4
- **Pregunta para Dev:** ?Cual es la duracion del link de recuperacion y como se invalida?
- **Impacto si no se aclara:** no se pueden disenar pruebas de expiracion reales

**Ambiguedad 3:** Alcance de roles y permisos

- **Encontrado en:** SL-5
- **Pregunta para PO/Dev:** ?Que puntos finales y pantallas especificas quedan restringidos por rol?
- **Impacto si no se aclara:** pruebas de RBAC incompletas

### Informacion faltante

**Falta 1:** Mensajes de error estandar

- **Necesario para:** validar experiencia de usuario y evitar fugas de informacion
- **Sugerencia:** definir catalogo de mensajes para autenticacion/recuperacion

**Falta 2:** Limitacion de intentos y bloqueo temporal

- **Necesario para:** pruebas de seguridad y resiliencia
- **Sugerencia:** especificar limites (ej: 5 intentos/10 min)

### Mejoras sugeridas (antes de implementar)

**Mejora 1:** Documentar flujo de verificacion de email (si aplica)

- **Historia afectada:** SL-2
- **Estado actual:** no se menciona verificacion
- **Cambio sugerido:** agregar AC para verificacion y bloqueo de inicio de sesion hasta confirmar
- **Beneficio:** reduce ambiguedad y mejora seguridad

**Mejora 2:** Detallar matriz de permisos por rol

- **Historia afectada:** SL-5
- **Estado actual:** roles definidos sin matriz de permisos
- **Cambio sugerido:** agregar tabla de puntos finales/pantallas por rol
- **Beneficio:** RBAC testeable y consistente

---

## Estrategia de testing

### Alcance de pruebas

**En alcance:**

- Pruebas funcionales (interfaz, API, base de datos) de registro/inicio de sesion/recuperacion
- Integracion con Supabase Auth y proveedor de email
- Validaciones de seguridad (politica de contrasena, no enumeracion)
- RBAC en interfaz y puntos finales
- Compatibilidad con navegadores (Chrome, Firefox, Safari)
- Responsividad (iOS Safari, Android Chrome)

**Fuera de alcance:**

- Inicio de sesion social
- MFA/2FA
- SSO empresarial
- Auditoria avanzada de accesos

### Niveles de prueba

**Pruebas unitarias:**

- Meta de cobertura > 80%
- Validaciones de input, utilidades de autenticacion

**Pruebas de integracion:**

- Interfaz ↔ API, API ↔ Supabase Auth, API ↔ base de datos

**Pruebas E2E (Playwright):**

- Registro -> inicio de sesion -> acceso panel
- Recuperacion de contrasena -> inicio de sesion con nueva contrasena
- Acceso protegido por rol (admin vs user)

**Pruebas de API:**

- /api/auth/register
- /api/auth/login
- /api/auth/reset-password

### Tipos de pruebas por historia

**Positivas:** rutas exitosas de registro/inicio de sesion/recuperacion/roles

**Negativas:** credenciales invalidas, email existente, permisos insuficientes

**Limite:** contrasena minima, email max 254, expiracion token

**Exploratorias:** flujo de mensajes y experiencia de usuario en errores de autenticacion

---

## Resumen de casos de prueba por historia

### SL-2: Registro con email y contrasena

**Complejidad:** Media
**Casos estimados:** 10

- Positivas: 3
- Negativas: 4
- Limite: 2
- API: 1

**Razonamiento:** incluye validacion de email unico, politica de contrasena, experiencia de usuario de mensajes y contrato API.
**Parametrizacion recomendada:** Si (variantes de contrasena y email)

---

### SL-3: Inicio de sesion

**Complejidad:** Media
**Casos estimados:** 9

- Positivas: 2
- Negativas: 4
- Limite: 1
- Integracion: 1
- API: 1

**Razonamiento:** requiere validacion de sesion, mensajes de error y limitacion de intentos.
**Parametrizacion recomendada:** Si (credenciales invalidas)

---

### SL-4: Recuperacion de contrasena

**Complejidad:** Media
**Casos estimados:** 10

- Positivas: 3
- Negativas: 4
- Limite: 2
- Integracion: 1

**Razonamiento:** incluye no enumeracion, expiracion de link y flujo email.
**Parametrizacion recomendada:** Si (email existente/no existente, tokens invalidos)

---

### SL-5: Gestion de roles

**Complejidad:** Alta
**Casos estimados:** 12

- Positivas: 3
- Negativas: 5
- Limite: 2
- Integracion: 1
- API: 1

**Razonamiento:** RBAC requiere verificar multiples puntos finales y estados interfaz.
**Parametrizacion recomendada:** Si (roles y puntos finales)

---

### Total estimado de casos de prueba para la epica

**Total:** 41

- Positivas: 11
- Negativas: 17
- Limite: 7
- Integracion: 3
- API: 3

---

## Requerimientos de datos de prueba

### Estrategia de datos

**Datos validos:**

- Emails validos: `carlos@example.com`, `laura.rios@dominio.com`
- Contrasenas validas: `ValidPass1`, `Stake2026A`

**Datos invalidos:**

- Email invalido: `user@`, `user.com`
- Contrasena debil: `abc`, `contrasena`
- Email no registrado para recuperacion

**Datos limite:**

- Email max 254 caracteres
- Contrasena min 8 caracteres
- Expiracion de token (limite exacto a definir)

**Gestion de datos:**

- Usar Faker.js para generar emails y contrasenas validas
- No hardcodear datos estaticos en pruebas automatizadas
- Limpiar usuarios de prueba al finalizar

---

## Criterios de entrada y salida

### Criterios de entrada (por historia)

- Historia implementada y desplegada en staging
- Revision de codigo aprobado
- Pruebas unitarias aprobadas (>80% cobertura)
- Datos de prueba listos
- Documentacion de API actualizada

### Criterios de salida (por historia)

- Todos los casos de prueba ejecutados
- Casos criticos/alto al 100% aprobadas
- Bugs criticos/alto resueltos
- NFRs aplicables validados

### Criterios de salida (epica)

- Todas las historias cumplen criterios de salida
- E2E de viajes criticos aprobadas
- Pruebas de contrato de API completas
- No hay bugs criticos/alto abiertos

---

## Validacion de NFRs

### Rendimiento

- **NFR-P-001:** LCP < 2.5s en paginas clave
- **Enfoque de prueba:** Lighthouse en inicio de sesion/registro

### Seguridad

- **NFR-S-001:** Politica de contrasena min 8, 1 mayuscula, 1 numero
- **Enfoque de prueba:** validaciones cliente/servidor + pruebas negativas

- **NFR-S-002:** Gestion de sesiones (token de acceso 1h, token de refresco 30d)
- **Enfoque de prueba:** validar expiracion y token de refresco

### Accesibilidad

- **NFR-A-001:** WCAG 2.1 AA en formularios de autenticacion
- **Enfoque de prueba:** auditoria basica de ARIA y focus

---

## Estrategia de regresion

**Alcance:**

- Proteccion de rutas hacia bancos/apuestas/metas
- Accesos a puntos finales protegidos

**Ejecucion:**

- Correr pruebas de humo de autenticacion antes y despues de cambios
- Revalidar permisos en puntos finales sensibles

---

## Estimacion de cronograma

**Duracion estimada:** 1 sprint (2 semanas)

**Desglose:**

- Diseno de casos de prueba: 3 dias
- Preparacion de datos: 1 dia
- Ejecucion por historia: 1-2 dias cada una
- Regresion: 1 dia
- Colchon de fixes: 2 dias

**Dependencias:**

- Depende de Supabase Auth y proveedor de email
- Bloquea inicio de epicas SL-2 a SL-6

---

## Herramientas e infraestructura

**Herramientas:**

- E2E: Playwright
- API: Postman/Newman o Playwright API
- Unitarias: Vitest/Jest
- Rendimiento: Lighthouse
- Datos de prueba: Faker.js

**CI/CD:**

- Pruebas en solicitudes de cambio (PR) y fusion a main
- Pruebas de humo en deploy a staging

---

## Metricas y reporte

- Tasa de ejecucion vs total
- Tasa de aprobacion por historia
- Bugs por severidad
- Cobertura de criterios de aceptacion

---

## Notas y supuestos

**Supuestos:**

- Supabase Auth expone puntos finales segun api-contracts.yaml
- Existe proveedor de email con entorno staging

**Restricciones:**

- No hay mockups definidos (recomendada revision interfaz temprana)

**Limitaciones conocidas:**

- Algunas validaciones de email pueden depender del proveedor

**Pruebas exploratorias recomendadas:**

- 1 sesion corta con prototipo de autenticacion para validar experiencia de usuario y mensajes

---

## Documentacion relacionada

- `.context/PBI/epics/EPIC-SL-1-identity-and-access/epic.md`
- `.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-*/story.md`
- `.context/idea/business-model.md`
- `.context/PRD/executive-summary.md`
- `.context/PRD/user-personas.md`
- `.context/PRD/user-journeys.md`
- `.context/SRS/functional-specs.md`
- `.context/SRS/non-functional-specs.md`
- `.context/SRS/architecture-specs.md`
- `.context/SRS/api-contracts.yaml`

---

## Accion requerida

**@PO:**

- [ ] Revisar ambiguedades y faltantes (ver Analisis critico)
- [ ] Responder preguntas criticas para negocio
- [ ] Validar riesgos y alcance de pruebas

**@Dev:**

- [ ] Revisar riesgos tecnicos y mitigaciones
- [ ] Validar puntos de integracion identificados
- [ ] Responder preguntas tecnicas

**@QA:**

- [ ] Revisar estrategia y estimaciones
- [ ] Validar datos de prueba requeridos
- [ ] Preparar entornos y herramientas

---

**Proximos pasos:**

1. Refinamiento con PO/Dev sobre preguntas criticas
2. Actualizar historias con clarificaciones
3. QA inicia planes de aceptacion por historia
4. Validar criterios de entrada/salida antes del sprint
5. Iniciar implementacion solo con dudas resueltas

---

**Documentacion:**
`.context/PBI/epics/EPIC-SL-1-identity-and-access/feature-test-plan.md`
