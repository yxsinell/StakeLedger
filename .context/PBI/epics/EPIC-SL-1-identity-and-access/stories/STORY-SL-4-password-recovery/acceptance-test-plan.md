# Plan de Pruebas de Aceptacion: STORY-SL-4 - Recuperacion de contrasena

**Fecha:** 2026-03-09
**Ingeniero QA:** Generado por IA
**Clave Jira de la historia:** SL-4
**Epica:** EPIC-SL-1 - Identidad y acceso
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio de esta historia

**Persona afectada:**

- **Primaria:** Carlos Vega - necesita recuperar acceso rapido si olvida su contrasena.
- **Secundaria:** Laura Rios - requiere restablecer acceso sin friccion.

**Valor de negocio:**

- **Propuesta de valor:** recuperacion segura reduce abandono y soporte.
- **Impacto en negocio:** disminuye perdida de usuarios por bloqueo de acceso.

**Viaje de usuario relacionado:**

- Viaje: Registro y primera apuesta
- Paso: Recuperacion de contrasena

---

### Contexto tecnico de esta historia

**Interfaz:**

- Formulario de solicitud de recuperacion y formulario de nueva contrasena.
- Mensajes genericos para evitar enumeracion.

**Servidor:**

- Punto final: /api/auth/reset-password.
- Servicio: Supabase Auth.
- Manejo de tokens de recuperacion.

**Servicios externos:**

- Proveedor de correo electronico.

**Puntos de integracion:**

- Interfaz ↔ API (solicitud de reset).
- API ↔ Supabase Auth.
- API ↔ Proveedor de correo.

---

### Analisis de complejidad de la historia

**Complejidad general:** Media

**Factores:**

- Expiracion de token y seguridad de enlace.
- Mensajes genericos para correo inexistente.
- Integracion con proveedor de correo.

**Esfuerzo de pruebas estimado:** Medio

---

### Contexto a nivel epica (Plan de Pruebas de Funcionalidad)

**Riesgos relevantes:**

- Enumeracion de cuentas en recuperacion.
- Fallo de proveedor de correo.

**Aplicacion a esta historia:**

- API: solicitud de recuperacion y validacion de token.
- E2E: flujo completo de reset.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas

**Ambiguedad 1:** Expiracion del enlace

- **Pregunta para Dev:** cuanto dura el enlace y como se invalida?
- **Impacto:** define pruebas de expiracion.

**Ambiguedad 2:** Mensaje generico

- **Pregunta para PO:** cual es el texto exacto del mensaje generico?
- **Impacto:** verificacion UX.

### Informacion faltante

- Duracion exacta del enlace.
- Mensajes de error estandarizados.

### Casos extremos no cubiertos

- Enlace usado dos veces.
- Token valido pero contrasena no cumple politica.

### Validacion de testabilidad

**Testeable?** ⚠️ Parcialmente

**Problemas:**

- No se define expiracion del enlace.
- No se define mensaje generico.

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Solicitud de recuperacion exitosa

- **Given:** usuario registrado con correo `carlos.vega@example.com`.
- **When:** solicita recuperar contrasena.
- **Then:** se envia correo con enlace de recuperacion.

### Escenario 2: Correo no registrado

- **Given:** correo `no.existe@example.com`.
- **When:** solicita recuperar contrasena.
- **Then:** mensaje generico sin revelar existencia.

### Escenario 3: Enlace expirado o invalido

- **Given:** enlace expirado o invalido.
- **When:** intenta cambiar contrasena.
- **Then:** se rechaza la operacion y solicita nueva solicitud.

### Escenario 4: Reutilizacion de enlace

- **Given:** enlace ya utilizado.
- **When:** intenta usarlo de nuevo.
- **Then:** se rechaza y solicita nuevo enlace.

---

## Paso 4: Diseno de pruebas

### Analisis de cobertura

**Total de casos necesarios:** 8

- Positivas: 2
- Negativas: 4
- Limite: 1
- Integracion: 1
- API: 1

---

### Parametrizacion recomendada

**Grupo 1: Estados de token**

| Estado del token | Resultado esperado |
| --- | --- |
| Valido | Permite actualizar contrasena |
| Expirado | Error y nueva solicitud |
| Invalido | Error y nueva solicitud |

---

### Esquemas de prueba

#### Validar solicitud de recuperacion exitosa

- **Nivel:** Interfaz / API
- **Resultado esperado:** correo enviado y respuesta 200.

#### Validar mensaje generico para correo no registrado

- **Nivel:** Interfaz / API
- **Resultado esperado:** mensaje generico sin revelar existencia.

#### Validar rechazo por enlace expirado

- **Nivel:** Interfaz / API
- **Resultado esperado:** error y solicitud nueva.

#### Validar rechazo por enlace reutilizado

- **Nivel:** Interfaz / API
- **Resultado esperado:** error y solicitud nueva.

---

## Casos de integracion (si aplica)

### Integracion 1: Interfaz ↔ API de recuperacion

- **Punto de integracion:** /api/auth/reset-password.
- **Resultado esperado:** contrato OpenAPI valido y flujo correcto.

---

## Resumen de casos extremos

| Caso extremo | Cubierto en historia? | Agregado a AC? | Caso de prueba | Prioridad |
| --- | --- | --- | --- | --- |
| Enlace reutilizado | ❌ No | ✅ Si (Escenario 4) | TC-04 | Media |

---

## Resumen de datos de prueba

| Tipo de dato | Cantidad | Proposito | Ejemplos |
| --- | --- | --- | --- |
| Validos | 2 | Pruebas positivas | carlos.vega@example.com |
| Invalidos | 2 | Errores | no.existe@example.com |
| Limite | 1 | Enlace expirado | token vencido |

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

- [ ] Confirmar texto de mensaje generico.
- [ ] Confirmar reglas de expiracion visibles para usuario.

**@Dev:**

- [ ] Definir duracion del enlace y criterios de invalidacion.
- [ ] Validar respuesta del punto final /api/auth/reset-password.

**@QA:**

- [ ] Revisar cobertura y parametrizacion propuesta.
- [ ] Preparar datos de prueba y ambiente.

---

**Documentacion:**
`.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-4-password-recovery/acceptance-test-plan.md`
