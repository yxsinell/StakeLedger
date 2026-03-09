# Plan de Pruebas de Aceptacion: STORY-SL-2 - Registro con correo electronico y contrasena

**Fecha:** 2026-03-09
**Ingeniero QA:** Generado por IA
**Clave Jira de la historia:** SL-2
**Epica:** EPIC-SL-1 - Identidad y acceso
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio de esta historia

**Persona afectada:**

- **Primaria:** Carlos Vega - necesita registro rapido y claro para iniciar su uso del sistema.
- **Secundaria:** Laura Rios - espera registro confiable para acceder a analitica y auditoria.

**Valor de negocio:**

- **Propuesta de valor:** habilita activacion inicial y acceso seguro.
- **Impacto en negocio:** mejora conversion a usuarios activos y reduce friccion inicial.

**Viaje de usuario relacionado:**

- Viaje: Registro y primera apuesta
- Paso: Registro con correo electronico y contrasena

---

### Contexto tecnico de esta historia

**Componentes de arquitectura:**

**Interfaz:**

- Componentes: formulario de registro, validaciones en linea, mensajes de error.
- Rutas: /register (o equivalente en App Router).
- Estado: manejo de carga, error, exito.

**Servidor:**

- Punto final: /api/auth/register (registro de usuario).
- Servicio: Supabase Auth (registro).
- Base de datos: tabla users/perfil con rol por defecto.

**Servicios externos:**

- Supabase Auth.
- Proveedor de correo electronico (si hay verificacion de correo electronico).

**Puntos de integracion:**

- Interfaz ↔ API (registro).
- API ↔ Supabase Auth.
- API ↔ Base de datos (perfil/rol inicial).

---

### Analisis de complejidad de la historia

**Complejidad general:** Media

**Factores de complejidad:**

- Logica de negocio: Media - validaciones de correo electronico unico y politica de contrasena.
- Integraciones: Media - Supabase Auth y posible correo electronico.
- Validaciones de datos: Media - formato correo electronico, politica de contrasena.
- interfaz: Media - mensajes de error consistentes.

**Esfuerzo de pruebas estimado:** Medio
**Razon:** validaciones de entrada + flujos de error + integracion de autenticacion.

---

### Contexto a nivel epica (del Plan de Pruebas de Funcionalidad)

**Riesgos criticos identificados a nivel epica:**

- Configuracion incorrecta de Supabase Auth.
  - **Relevancia para esta historia:** afecta el registro y la respuesta de registro.
- Manejo de sesion y expiracion.
  - **Relevancia para esta historia:** aplica solo si el registro inicia sesion automaticamente.
- Limitacion de intentos insuficiente en inicio de sesion/recuperacion.
  - **Relevancia para esta historia:** potencial abuso del punto final de registro.

**Puntos de integracion del analisis de la epica:**

- Interfaz ↔ API: ✅ Aplica (formulario de registro).
- API ↔ Supabase Auth: ✅ Aplica.
- API ↔ Base de datos: ✅ Aplica (perfil/rol inicial).
- API ↔ Proveedor de correo electronico: ⚠️ Aplica solo si hay verificacion de correo electronico.

**Preguntas criticas ya planteadas en la epica:**

**Para PO:**

- Verificacion de correo electronico en registro.
  - **Estado:** ⏳ Pendiente.
  - **Impacto en esta historia:** define si se permite inicio de sesion inmediato.

**Para Dev:**

- Expiracion de link de recuperacion.
  - **Estado:** ❌ No relevante para esta historia.
- Matriz de permisos por rol.
  - **Estado:** ❌ No relevante para esta historia.

**Estrategia de pruebas heredada:**

- Niveles: unitarias, integracion, E2E, API.
- Herramientas: Playwright, Postman/Newman, Vitest/Jest.
- **Aplicacion a esta historia:** unitarias para validaciones, API para registro, E2E para flujo completo.

**Actualizaciones y clarificaciones del epic:**

- No hay respuestas registradas aun.

**Resumen: como encaja esta historia en la epica:**

- **Rol en la epica:** habilita el primer paso del acceso a la plataforma.
- **Riesgos heredados:** configuracion de Auth y validaciones.
- **Consideraciones unicas:** definicion de verificacion de correo electronico y mensajes de error.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas

**Ambiguedad 1:** Confirmacion de registro

- **Ubicacion:** AC Scenario 1 (confirmacion de registro).
- **Pregunta para PO/Dev:** la confirmacion implica inicio de sesion automatico o solo mensaje de exito?
- **Impacto en testing:** cambia expectativas de sesion y redireccion.
- **Sugerencia:** agregar AC con resultado esperado (redirect + sesion o mensaje).

**Ambiguedad 2:** Verificacion de correo electronico

- **Ubicacion:** alcance y reglas de negocio.
- **Pregunta para PO:** se requiere confirmar correo electronico antes de habilitar inicio de sesion?
- **Impacto en testing:** define flujo post-registro y estado del usuario.
- **Sugerencia:** agregar AC de verificacion si aplica.

### Informacion faltante / gaps

**Gap 1:** Mensajes de error estandarizados

- **Tipo:** Criterios de aceptacion.
- **Por que es critico:** necesitamos validar UX y evitar fugas de informacion.
- **Sugerencia:** definir catalogo de mensajes para correo electronico duplicado y contrasena debil.
- **Impacto si no se agrega:** pruebas no verificables y UX inconsistente.

**Gap 2:** Reglas de limitacion de intentos para registro

- **Tipo:** Detalle tecnico/seguridad.
- **Por que es critico:** evita abuso del punto final de registro.
- **Sugerencia:** definir limites (ej: 5 intentos/10 min).
- **Impacto si no se agrega:** superficie de abuso sin pruebas definidas.

### Caso extremos no cubiertos en la historia

**Caso extremo 1:** Email con mayusculas/espacios

- **Escenario:** usuario ingresa "Carlos@Example.com " con espacios.
- **Comportamiento esperado:** el sistema normaliza (trim + lowercase) y valida unicidad.
- **Criticidad:** Media.
- **Accion requerida:** Agregar a AC o confirmar con PO/Dev.

**Caso extremo 2:** Email con longitud maxima (254)

- **Escenario:** correo electronico valido en el limite maximo.
- **Comportamiento esperado:** se acepta si cumple formato.
- **Criticidad:** Media.
- **Accion requerida:** Agregar a casos limite.

**Caso extremo 3:** Contrasena valida minima

- **Escenario:** contrasena exactamente 8 caracteres con 1 mayuscula y 1 numero.
- **Comportamiento esperado:** se acepta.
- **Criticidad:** Media.
- **Accion requerida:** Agregar a casos limite.

### Validacion de testabilidad

**La historia es testeable como esta escrita?** ⚠️ Parcialmente

**Problemas de testabilidad:**

- [ ] Criterios de aceptacion no especifican resultado post-registro (inicio de sesion o no).
- [ ] Falta catalogo de mensajes de error.
- [ ] Falta regla de limitacion de intentos.

**Recomendaciones:**

- Agregar resultado esperado detallado del registro exitoso.
- Definir mensajes de error exactos para correo electronico duplicado y contrasena debil.
- Confirmar verificacion de correo electronico.

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Registro exitoso con datos validos

**Tipo:** Positivo
**Prioridad:** Critica

- **Given:**
  - usuario no registrado con correo electronico `carlos.vega+01@example.com`.
  - contrasena valida `Stake2026A`.
- **When:**
  - completa el formulario y confirma el registro.
- **Then:**
  - el sistema crea la cuenta y muestra confirmacion.
  - se crea perfil con rol `user` por defecto.
  - **Nota:** definir si inicia sesion automaticamente o requiere inicio de sesion.

---

### Escenario 2: Email ya registrado

**Tipo:** Negativo
**Prioridad:** Alta

- **Given:**
  - existe usuario con correo electronico `laura.rios@example.com`.
- **When:**
  - intenta registrarse con ese correo electronico.
- **Then:**
  - el sistema rechaza el registro.
  - mensaje de error claro (pendiente de catalogo).
  - no se crea un nuevo usuario.

---

### Escenario 3: Contrasena debil

**Tipo:** Negativo
**Prioridad:** Alta

- **Given:**
  - correo electronico valido `miguel.santos@example.com`.
  - contrasena debil `password`.
- **When:**
  - intenta registrarse.
- **Then:**
  - el sistema muestra errores de validacion.
  - no se crea la cuenta.

---

### Escenario 4: Email con formato invalido

**Tipo:** Negativo
**Prioridad:** Media

- **Given:**
  - correo electronico `user@`.
  - contrasena valida `Stake2026A`.
- **When:**
  - intenta registrarse.
- **Then:**
  - se muestra error de formato.
  - no se crea la cuenta.

---

### Escenario 5: Contrasena en limite minimo

**Tipo:** Limite
**Prioridad:** Media

- **Given:**
  - correo electronico valido `carlos.vega+02@example.com`.
  - contrasena de 8 caracteres con 1 mayuscula y 1 numero: `Abcdef12`.
- **
