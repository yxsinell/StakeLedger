# Plan de Pruebas de Aceptacion: STORY-SL-5 - Gestion de roles

**Fecha:** 2026-03-09
**Ingeniero QA:** Generado por IA
**Clave Jira de la historia:** SL-5
**Epica:** EPIC-SL-1 - Identidad y acceso
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio de esta historia

**Persona afectada:**

- **Primaria:** Miguel Santos (admin/pronosticador) - necesita controlar permisos.
- **Secundaria:** Laura Rios - su acceso depende del rol asignado.

**Valor de negocio:**

- **Propuesta de valor:** control de permisos para operaciones sensibles.
- **Impacto en negocio:** reduce riesgos de acceso indebido.

**Viaje de usuario relacionado:**

- Viaje: Seguir recomendacion del flujo
- Paso: Acceso condicionado por rol

---

### Contexto tecnico de esta historia

**Interfaz:**

- Gestion de usuarios con selector de rol.
- Estados claros de permisos y confirmaciones.

**Servidor:**

- Endpoints de administracion protegidos por RBAC.
- Persistencia del rol en perfil.

**Base de datos:**

- Campo `role` en perfil o tabla de roles.

**Puntos de integracion:**

- Interfaz ↔ API de gestion de roles.
- API ↔ Base de datos.

---

### Analisis de complejidad de la historia

**Complejidad general:** Alta

**Factores:**

- Matriz de permisos por rol.
- Cambios de rol con impacto en UI y API.
- Seguridad y auditoria basica.

**Esfuerzo de pruebas estimado:** Alto

---

### Contexto a nivel epica (Plan de Pruebas de Funcionalidad)

**Riesgos relevantes:**

- Ambiguedad en matriz de permisos.
- Acceso no autorizado a endpoints sensibles.

**Aplicacion a esta historia:**

- API: validacion de permisos en endpoints.
- E2E: acceso a pantallas protegidas segun rol.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas

**Ambiguedad 1:** Matriz exacta de permisos

- **Pregunta para PO/Dev:** que pantallas y endpoints corresponden a cada rol?
- **Impacto:** define cobertura de pruebas RBAC.

**Ambiguedad 2:** Mensajes de error por permisos

- **Pregunta para PO:** cual es el mensaje estandar de error de permisos?
- **Impacto:** validacion UX.

### Informacion faltante

- Matriz de permisos detallada por rol.
- Endpoints exactos protegidos.

### Casos extremos no cubiertos

- Cambio de rol mientras el usuario tiene sesion activa.
- Admin intenta asignar rol invalido.

### Validacion de testabilidad

**Testeable?** ⚠️ Parcialmente

**Problemas:**

- No se define matriz de permisos.
- No se define mensaje de error de permisos.

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Admin asigna rol a usuario

- **Given:** admin autenticado y usuario existente.
- **When:** asigna rol valido (admin/editor/user).
- **Then:** el sistema guarda rol y actualiza permisos.

### Escenario 2: Usuario sin permisos intenta asignar rol

- **Given:** usuario no admin autenticado.
- **When:** intenta modificar rol.
- **Then:** rechazo con error de permisos.

### Escenario 3: Acceso protegido por rol

- **Given:** usuario con rol limitado.
- **When:** intenta acceder a endpoint protegido.
- **Then:** bloqueo de acceso segun rol.

### Escenario 4: Rol invalido

- **Given:** admin autenticado.
- **When:** intenta asignar rol fuera de catalogo.
- **Then:** error de validacion y no se guarda.

---

## Paso 4: Diseno de pruebas

### Analisis de cobertura

**Total de casos necesarios:** 10

- Positivas: 3
- Negativas: 5
- Limite: 1
- Integracion: 1
- API: 2

---

### Parametrizacion recomendada

**Grupo 1: Roles validos**

| Rol | Resultado esperado |
| --- | --- |
| admin | Acceso total |
| editor | Acceso parcial |
| user | Acceso limitado |

---

### Esquemas de prueba

#### Validar asignacion de rol por admin

- **Nivel:** Interfaz / API
- **Resultado esperado:** rol actualizado y permisos aplicados.

#### Validar rechazo por usuario sin permisos

- **Nivel:** Interfaz / API
- **Resultado esperado:** error de permisos y sin cambios.

#### Validar acceso protegido por rol

- **Nivel:** Interfaz / API
- **Resultado esperado:** acceso bloqueado cuando no corresponde.

#### Validar rechazo por rol invalido

- **Nivel:** API
- **Resultado esperado:** error de validacion.

---

## Casos de integracion (si aplica)

### Integracion 1: Interfaz ↔ API de roles

- **Punto de integracion:** endpoints de administracion.
- **Resultado esperado:** contrato OpenAPI valido y persistencia de rol.

---

## Resumen de casos extremos

| Caso extremo | Cubierto en historia? | Agregado a AC? | Caso de prueba | Prioridad |
| --- | --- | --- | --- | --- |
| Rol invalido | ❌ No | ✅ Si (Escenario 4) | TC-04 | Media |
| Cambio de rol con sesion activa | ❌ No | ⚠️ Pendiente | TBD | Media |

---

## Resumen de datos de prueba

| Tipo de dato | Cantidad | Proposito | Ejemplos |
| --- | --- | --- | --- |
| Validos | 3 | Roles validos | admin, editor, user |
| Invalidos | 1 | Rol invalido | owner |

---

## Seguimiento de ejecucion de pruebas

**Fecha de ejecucion:** Por definir
**Ambiente:** Staging
**Ejecutado por:** Por definir

**Resultados:**

- Total: Por definir
- Aprobadas: Por definir
- Fallidas: Por definir
- Bloqueadas: Por definir

**Bugs encontrados:**

- Por definir

**Aprobacion:** Por definir

---

## Accion requerida

**@PO:**

- [ ] Definir matriz de permisos por rol.
- [ ] Confirmar mensajes de error por permisos.

**@Dev:**

- [ ] Definir endpoints protegidos por rol.
- [ ] Confirmar comportamiento de sesion al cambiar rol.

**@QA:**

- [ ] Revisar cobertura y parametrizacion propuesta.
- [ ] Preparar datos de prueba y ambiente.

---

**Documentacion:**
`.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-5-manage-roles/acceptance-test-plan.md`
