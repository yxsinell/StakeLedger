# Plan de Pruebas de Aceptacion: STORY-SL-19 - Ingreso Manual

**Fecha:** 2026-03-18
**QA Engineer:** Generado por IA
**Story Jira Key:** SL-19
**Epic:** EPIC-SL-17 - Catalogo y Normalizacion
**Estado:** Borrador

---

## 📋 Paso 1: Analisis Critico

### Contexto de Negocio de esta Story

**Usuario afectado:**

- **Primario:** Carlos Vega - necesita registrar apuestas rapido cuando no encuentra resultados
- **Secundario:** Laura Rios - requiere consistencia para analitica aun con registros manuales

**Valor de negocio:**

- **Propuesta de valor:** autocompletado reduce errores y acelera el registro de apuestas
- **Impacto de negocio:** mejora trazabilidad y calidad de datos para KPIs de normalizacion

**Recorrido de Usuario relacionado:**

- Recorrido: Registro y primera apuesta
- Paso: Paso 3 (ingreso manual cuando no hay coincidencias)

---
### Contexto Tecnico de esta Story

**Componentes de arquitectura:**

**Frontend:**

- Componentes: formulario de ingreso manual con campos raw_text, type y country
- Paginas/Rutas: formulario de registro de apuesta
- Estado: validaciones de campos requeridos y errores

**Backend:**

- Endpoints API:
  - `POST /api/catalog/manual`
- Servicios: creacion de item catalogo con estado UNNORMALIZED
- Base de datos: `catalog_teams`, `catalog_competitions`, `catalog_aliases`

**Servicios externos:**

- Ninguno

**Puntos de integracion:**

- UI ↔ API (formulario manual)
- API ↔ DB (creacion de item en catalogo)

---

### Analisis de Complejidad de la Story

**Complejidad general:** Media

**Factores:**

- Complejidad de negocio: Media (estado UNNORMALIZED y reglas de validacion)
- Complejidad de integracion: Baja (solo API y DB)
- Complejidad de validacion de datos: Media (required + enums)
- Complejidad UI: Media (errores y validaciones)

**Esfuerzo de prueba estimado:** Medio
**Razon:** validaciones, estados de error y consistencia de datos creados.

---
### Contexto a Nivel Epic (desde FTP en Jira)

**Riesgos criticos ya identificados:**

- Riesgo: normalizacion incorrecta afecta analitica
  - **Relevancia:** registros manuales unnormalized impactan reporting
- Riesgo: datos duplicados en catalogo
  - **Relevancia:** ingreso manual puede crear duplicados

**Puntos de integracion del epic:**

- UI ↔ API
  - **Aplica a esta story:** ✅ Si
  - **Uso:** envio de formulario manual
- API ↔ DB
  - **Aplica a esta story:** ✅ Si
  - **Uso:** insercion de item en catalogo

**Preguntas criticas ya hechas a nivel epic:**

**Para Dev:**

- Formato de normalization_status y enum permitido
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta story:** define valor exacto guardado

**Estrategia de pruebas del epic:**

- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Como aplica a esta story:** UI + API + Integracion DB

**Actualizaciones del epic:**

- No hay respuestas nuevas en comentarios del epic

**Resumen: como encaja esta story en la epica:**

- **Rol:** habilita flujo manual cuando el autocompletado no encuentra resultados
- **Riesgos heredados:** duplicados y consistencia de datos
- **Consideraciones unicas:** definicion de campos requeridos y validaciones

---
## 🚨 Paso 2: Analisis de Calidad de la Story

### Ambiguedades Identificadas

**Ambiguedad 1:** Reglas de obligatoriedad de country

- **Ubicacion:** Scope / Technical Notes
- **Pregunta para PO/Dev:** country es obligatorio o opcional?
- **Impacto en testing:** no se puede validar errores ni criterios de UI
- **Sugerencia:** definir required/optional y formato

**Ambiguedad 2:** Mensajes de error esperados

- **Ubicacion:** Scenario 2 y 3 (AC)
- **Pregunta para PO:** cual es el mensaje exacto para raw_text requerido y tipo invalido?
- **Impacto en testing:** no se puede validar UX ni copy
- **Sugerencia:** definir textos exactos

**Ambiguedad 3:** Valor exacto de normalization_status

- **Ubicacion:** Business Rules / Technical Notes
- **Pregunta para Dev:** cual es el enum exacto a persistir (UNNORMALIZED u otro)?
- **Impacto en testing:** no se puede validar DB ni API response
- **Sugerencia:** documentar enum en SRS/Story

---

### Informacion Faltante / Gaps

**Gap 1:** Validaciones de longitud y caracteres para raw_text

- **Tipo:** Regla de negocio
- **Por que es critico:** sin limites no se prueban boundary
- **Sugerencia:** definir min/max y caracteres permitidos
- **Impacto:** riesgo de datos basura

**Gap 2:** Respuesta API esperada (estructura y codigos de error)

- **Tipo:** Detalle tecnico
- **Por que es critico:** se requiere para pruebas API
- **Sugerencia:** documentar en api-contracts.yaml
- **Impacto:** ambiguedad en validacion de respuestas

---

### Casos Borde no cubiertos en la story

**Caso Borde 1:** raw_text solo espacios

- **Escenario:** usuario ingresa "  "
- **Comportamiento esperado:** se trata como vacio y se rechaza
- **Criticidad:** Media
- **Accion:** agregar a criterios refinados

**Caso Borde 2:** type valido en mayusculas

- **Escenario:** type = "TEAM"
- **Comportamiento esperado:** normalizar o rechazar (TBD)
- **Criticidad:** Media
- **Accion:** pedir confirmacion

---

### Validacion de Testeabilidad

**La story es testeable?** ⚠️ Parcialmente

**Issues de testeabilidad:**

- [ ] Mensajes de error no definidos
- [ ] Falta enum exacto de normalization_status
- [ ] Falta validacion de longitudes

**Recomendaciones:**

- Definir mensajes de error
- Definir enum y respuesta API
- Definir min/max de raw_text

---
## ✅ Paso 3: Criterios de Aceptacion Refinados

### Escenario 1: Ingreso manual exitoso

**Tipo:** Positivo
**Prioridad:** Critica

- **Dado:** usuario autenticado en formulario de ingreso manual
- **Cuando:** ingresa raw_text "Barcelona" y type "team" (country **TBD**)
- **Entonces:**
  - Se crea el registro con normalization_status=UNNORMALIZED
  - Se muestra confirmacion de guardado

---

### Escenario 2: Texto requerido

**Tipo:** Negativo
**Prioridad:** Alta

- **Dado:** usuario autenticado
- **Cuando:** intenta guardar con raw_text vacio
- **Entonces:**
  - Se muestra mensaje de error **TBD**
  - No se crea registro

---

### Escenario 3: Tipo invalido

**Tipo:** Negativo
**Prioridad:** Alta

- **Dado:** usuario autenticado
- **Cuando:** ingresa type "league"
- **Entonces:**
  - Se rechaza la operacion
  - Se muestra mensaje de error **TBD**

---

### Escenario 4: raw_text solo espacios

**Tipo:** Limite
**Prioridad:** Media

- **Dado:** usuario autenticado
- **Cuando:** ingresa raw_text "  "
- **Entonces:**
  - Se trata como vacio
  - Se muestra mensaje de error **TBD**

---

### Escenario 5: type en mayusculas

**Tipo:** Caso Borde
**Prioridad:** Media
**Fuente:** Analisis critico (Paso 2)

- **Dado:** usuario autenticado
- **Cuando:** ingresa type "TEAM"
- **Entonces:**
  - **Nota:** requiere confirmacion PO/Dev (normalizar o rechazar)

---
## 🧪 Paso 4: Diseno de Pruebas

### Analisis de Cobertura

**Total de casos necesarios:** 8

**Desglose:**

- Positivos: 2
- Negativos: 3
- Limite: 2
- Integracion: 1
- API: 1

**Razon:** se cubren validaciones clave, errores y persistencia.

---

### Oportunidades de Parametrizacion

**Pruebas parametrizadas recomendadas:** ✅ Si

**Grupo 1: Variaciones de type y country**

- **Escenario base:** ingreso manual valido
- **Parametros:** type, country, raw_text

| Type | Country | Raw Text | Resultado esperado |
| --- | --- | --- | --- |
| team | ES | Barcelona | creado UNNORMALIZED |
| competition | AR | Liga Profesional | creado UNNORMALIZED |

**Total de pruebas:** 2
**Beneficio:** cubre tipos permitidos con un solo outline.

---

### Nomenclatura de Test Outlines

Formato: `Validar <comportamiento> <condicion>`

---

### Esquemas de Prueba (Test Outlines)

#### **Validar creacion manual con datos validos**

**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critica
**Nivel:** UI
**Parametrizado:** ✅ Si (Grupo 1)

**Precondiciones:**

- Usuario autenticado
- Formulario manual visible

**Pasos:**

1. Ingresar raw_text "Barcelona"
2. Seleccionar type "team"
3. Seleccionar country "ES" (si aplica)
4. Guardar

**Resultado esperado:**

- **UI:** confirmacion de guardado
- **API:** 201 Created
- **DB:** registro creado con normalization_status=UNNORMALIZED

---

#### **Validar rechazo por raw_text vacio**

**Escenario relacionado:** Escenario 2
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel:** UI
**Parametrizado:** ❌ No

**Precondiciones:**

- Usuario autenticado

**Pasos:**

1. Dejar raw_text vacio
2. Guardar

**Resultado esperado:**

- **UI:** mensaje de error **TBD**
- **API:** sin llamada
- **DB:** sin cambios

---

#### **Validar rechazo por type invalido**

**Escenario relacionado:** Escenario 3
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel:** API
**Parametrizado:** ❌ No

**Precondiciones:**

- Token valido

**Pasos:**

1. POST `/api/catalog/manual` con type "league"

**Resultado esperado:**

- **Status:** 400 Bad Request
- **Body:** error code **TBD**
- **DB:** sin cambios

---

#### **Validar raw_text con espacios se rechaza**

**Escenario relacionado:** Escenario 4
**Tipo:** Limite
**Prioridad:** Media
**Nivel:** UI
**Parametrizado:** ❌ No

**Precondiciones:**

- Usuario autenticado

**Pasos:**

1. Ingresar raw_text "  "
2. Guardar

**Resultado esperado:**

- **UI:** mensaje de error **TBD**
- **DB:** sin cambios

---

#### **Validar type en mayusculas**

**Escenario relacionado:** Escenario 5
**Tipo:** Caso Borde
**Prioridad:** Media
**Nivel:** API
**Parametrizado:** ❌ No

**Precondiciones:**

- Token valido

**Pasos:**

1. POST `/api/catalog/manual` con type "TEAM"

**Resultado esperado:**

- **Nota:** comportamiento por confirmar

---

### Casos de Integracion (si aplica)

#### Integracion 1: UI → API → DB

**Punto de integracion:** Frontend ↔ Backend API
**Tipo:** Integracion
**Prioridad:** Alta

**Flujo:**

1. UI envia payload manual
2. API valida y crea registro
3. DB persiste con UNNORMALIZED
4. UI muestra confirmacion

**Resultado esperado:**

- Respuesta consistente entre API y UI
- Registro persistido correctamente

---

## 📊 Resumen de Casos Borde

| Caso Borde | Cubierto en story? | Agregado a AC refinado? | Caso de prueba | Prioridad |
| --- | --- | --- | --- | --- |
| raw_text con espacios | ❌ No | ✅ Si (Escenario 4) | Outline 4 | Media |
| type en mayusculas | ❌ No | ✅ Si (Escenario 5) | Outline 5 | Media |

---

## 🗂️ Resumen de Datos de Prueba

### Categorias

| Tipo de dato | Cantidad | Proposito | Ejemplos |
| --- | --- | --- | --- |
| Validos | 2 | Positivos | "Barcelona", "Liga Profesional" |
| Invalidos | 2 | Negativos | "", "league" |
| Limite | 1 | Limite | "  " |
| Caso Borde | 1 | Caso Borde | "TEAM" |

### Estrategia de generacion

- **Estaticos:** valores invalidos y limites
- **Dinamicos:** nombres con Faker.js
- **Limpieza:** limpiar registros creados en DB

---
## ✅ Paso 8: Reporte Final QA (para usuario)

### Resumen para PO/Dev

**Calidad de story:** ⚠️ Necesita Mejora

**Hallazgos clave:**

1. Falta definir mensajes de error
2. Falta enum exacto de normalization_status
3. Falta definir country requerido u opcional

---

### Preguntas criticas para PO

**Pregunta 1:** country es obligatorio u opcional?

- **Contexto:** impacta validaciones del formulario
- **Impacto:** no se puede cerrar casos de error

**Pregunta 2:** mensaje exacto para raw_text requerido y type invalido?

- **Contexto:** validacion UX
- **Impacto:** no se puede validar copy

---

### Preguntas tecnicas para Dev

**Pregunta 1:** enum exacto de normalization_status?

- **Contexto:** validacion de DB y API
- **Impacto:** no se puede validar persistencia

---

### Mejoras sugeridas

**Mejora 1:** agregar AC con validacion de country

- **Estado actual:** no definido
- **Cambio sugerido:** definir required/optional + mensaje
- **Beneficio:** mejora testabilidad

---

### Recomendaciones de testing

- Validar contrato de API con Dev
- Pruebas de seguridad (auth requerida)
- Pruebas de rendimiento si aplica

---

### Riesgos y mitigacion

**Riesgo 1:** datos manuales inconsistentes

- **Probabilidad:** Media
- **Impacto:** Media
- **Mitigacion:** validaciones estrictas y tests negativos

---

## 🎯 Definicion de Hecho (QA)

- [ ] Ambiguedades resueltas
- [ ] Story actualizada con mejoras
- [ ] Casos de prueba ejecutados y aprobados
- [ ] Pruebas criticas/altas 100% aprobadas
- [ ] Pruebas medias/bajas >= 95% aprobadas
- [ ] Bugs criticos/altos resueltos
- [ ] Pruebas de integracion aprobadas
- [ ] Validacion de contrato de API aprobada
- [ ] RNF validados
- [ ] Regresion aprobada
- [ ] Exploratorias completadas
- [ ] Reporte de ejecucion generado

---

## 📎 Documentacion Relacionada

- **Story:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/stories/STORY-SL-19-manual-entry/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/epic.md`
- **FTP:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/feature-test-plan.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/`
- **SRS:** `.context/SRS/`
- **Arquitectura:** `.context/SRS/architecture-specs.md`
- **Contratos de API:** `.context/SRS/api-contracts.yaml`

---

## 📋 Seguimiento de Ejecucion de Pruebas

**Fecha de ejecucion:** TBD
**Entorno:** Staging
**Ejecutado por:** TBD

**Resultados:**

- Total: TBD
- Pasados: TBD
- Fallados: TBD
- Bloqueados: TBD

**Bugs encontrados:**

- TBD

**Sign-off:** TBD
