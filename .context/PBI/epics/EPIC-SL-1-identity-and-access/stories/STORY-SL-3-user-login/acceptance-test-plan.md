# Plan de Pruebas de Aceptacion: STORY-SL-3 - Inicio de sesion con correo electronico

**Fecha:** 2026-03-09
**Ingeniero QA:** Generado por IA
**Clave Jira de la historia:** SL-3
**Epica:** EPIC-SL-1 - Identidad y acceso
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio de esta historia

**Persona afectada:**

- **Primaria:** Laura Rios - requiere acceso rapido y confiable a sus datos.
- **Secundaria:** Carlos Vega - necesita entrar sin friccion para registrar actividad.

**Valor de negocio:**

- **Propuesta de valor:** habilita acceso seguro a funcionalidades clave.
- **Impacto en negocio:** aumenta retencion y reduce friccion de acceso.

**Viaje de usuario relacionado:**

- Viaje: Registro y primera apuesta
- Paso: Inicio de sesion

---

### Contexto tecnico de esta historia

**Interfaz:**

- Formulario de inicio de sesion, validaciones en linea, mensajes de error.
- Ruta /login (o equivalente).

**Servidor:**

- Punto final: /api/auth/login.
- Servicio: Supabase Auth.
- Perfil vinculado a Auth.

**Puntos de integracion:**

- Interfaz ↔ API.
- API ↔ Supabase Auth.
- API ↔ Base de datos.

---

### Analisis de complejidad de la historia

**Complejidad general:** Media

**Factores:**

- Validacion de credenciales y bloqueo por intentos.
- Integracion con Supabase Auth y tokens.
- Mensajes de error consistentes y redireccion.

**Esfuerzo de pruebas estimado:** Medio

---

### Contexto a nivel epica (Plan de Pruebas de Funcionalidad)

**Riesgos relevantes:**

- Manejo de sesion y expiracion.
- Limitacion de intentos insuficiente en inicio de sesion.

**Aplicacion a esta historia:**

- Unitarias: validaciones.
- API: autenticacion.
- E2E: acceso a panel.

**Estado de preguntas en epica:**

- Verificacion de correo electronico en registro: ⏳ Pendiente.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas

**Ambiguedad 1:** Mensaje de error para correo no registrado

- **Pregunta para PO:** el mensaje debe ser generico para evitar enumeracion?
- **Impacto:** define el mensaje esperado.

**Ambiguedad 2:** Bloqueo por intentos fallidos

- **Pregunta para Dev:** limite de intentos y duracion del bloqueo?
- **Impacto:** define casos negativos y limites.

### Informacion faltante

- Resultado posterior al inicio de sesion (ruta de redireccion y estado de sesion).
- Catalogo de mensajes de error.

### Casos extremos no cubiertos

- Correo con mayusculas/espacios.
- Contrasena con longitud alta (ej: 64).

### Validacion de testabilidad

**Testeable?** ⚠️ Parcialmente

**Problemas:**

- Mensajes de error no definidos.
- Limite de intentos no especificado.
- Redireccion posterior al inicio de sesion no detallada.

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Inicio de sesion exitoso

- **Given:** usuario registrado con `laura.rios@example.com` y contrasena `Stake2026A`.
- **When:** inicia sesion con credenciales correctas.
- **Then:** sesion activa, redireccion a panel, respuesta 200 con token valido.

### Escenario 2: Contrasena incorrecta

- **Given:** usuario registrado.
- **When:** ingresa `Incorrecta1`.
- **Then:** error estandar y sin sesion.

### Escenario 3: Correo no registrado

- **Given:** correo `no.existe@example.com`.
- **When:** intenta iniciar sesion.
- **Then:** mensaje generico y sin sesion.

### Escenario 4: Limite de intentos fallidos

- **Given:** usuario registrado.
- **When:** supera limite de intentos fallidos.
- **Then:** bloqueo temporal y mensaje de bloqueo.

### Escenario 5: Correo con mayusculas/espacios

- **Given:** correo `Laura.Rios@Example.com `.
- **When:** intenta iniciar sesion.
- **Then:** normalizacion y validacion de credenciales (confirmar).

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

**Grupo 1: Credenciales invalidas**

| Correo | Contrasena | Resultado esperado |
| --- | --- | --- |
| laura.rios@example.com | Incorrecta1 | Error de credenciales |
| no.existe@example.com | Stake2026A | Error generico |

---

### Esquemas de prueba

#### Validar inicio de sesion exitoso con credenciales validas

- **Nivel:** Interfaz / API
- **Resultado esperado:** acceso al panel y respuesta 200 con token.

#### Validar rechazo por contrasena incorrecta

- **Nivel:** Interfaz / API
- **Resultado esperado:** mensaje de error estandar y sin sesion.

#### Validar rechazo por correo no registrado

- **Nivel:** Interfaz / API
- **Resultado esperado:** mensaje generico y sin sesion.

#### Validar bloqueo por intentos fallidos

- **Nivel:** Interfaz / API
- **Resultado esperado:** bloqueo temporal activo.

---

## Casos de integracion (si aplica)

### Integracion 1: Interfaz ↔ API de inicio de sesion

- **Punto de integracion:** /api/auth/login.
- **Resultado esperado:** contrato OpenAPI valido y sesion activa.

---

## Resumen de casos extremos

| Caso extremo | Cubierto en historia? | Agregado a AC? | Caso de prueba | Prioridad |
| --- | --- | --- | --- | --- |
| Correo con mayusculas/espacios | ❌ No | ✅ Si (Escenario 5) | TC-05 | Media |

---

## Resumen de datos de prueba

| Tipo de dato | Cantidad | Proposito | Ejemplos |
| --- | --- | --- | --- |
| Validos | 2 | Pruebas positivas | laura.rios@example.com |
| Invalidos | 2 | Errores de credenciales | no.existe@example.com |
| Limite | 1 | Bloqueo por intentos | 5 intentos fallidos |

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

- [ ] Definir mensaje generico para correo no registrado.
- [ ] Confirmar resultado esperado posterior al inicio de sesion.

**@Dev:**

- [ ] Definir limite de intentos y duracion de bloqueo.
- [ ] Confirmar normalizacion de correo electronico.
- [ ] Validar respuesta del punto final /api/auth/login.

**@QA:**

- [ ] Revisar cobertura y parametrizacion propuesta.
- [ ] Preparar datos de prueba y ambiente.

---

**Documentacion:**
`.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-3-user-login/acceptance-test-plan.md`
