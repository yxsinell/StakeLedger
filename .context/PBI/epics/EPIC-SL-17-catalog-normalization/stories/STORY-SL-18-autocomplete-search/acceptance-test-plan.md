# Plan de Pruebas de Aceptacion: STORY-SL-18 - Autocompletado de Busqueda

**Fecha:** 2026-03-18
**QA Engineer:** Generado por IA
**Story Jira Key:** SL-18
**Epic:** EPIC-SL-17 - Catalogo y Normalizacion
**Estado:** Borrador

---

## 📋 Paso 1: Analisis Critico

### Contexto de Negocio de esta Story

**Usuario afectado:**

- **Primario:** Carlos Vega - necesita registrar apuestas rapido y sin errores de escritura
- **Secundario:** Laura Rios - requiere datos normalizados para analitica confiable

**Valor de negocio:**

- **Propuesta de valor:** autocompletado reduce errores y acelera el registro de apuestas
- **Impacto de negocio:** mejora trazabilidad y calidad de datos para KPIs de normalizacion

**Recorrido de Usuario relacionado:**

- Recorrido: Registro y primera apuesta
- Paso: Paso 3 (busqueda de equipo y competicion)

---

### Contexto Tecnico de esta Story

**Componentes de arquitectura:**

**Frontend:**

- Componentes: campo de busqueda con autocompletado, lista de sugerencias, estados loading/empty
- Paginas/Rutas: formulario de registro de apuesta
- Estado: manejo de query, resultados y estado de carga

**Backend:**

- Endpoints API:
  - `GET /api/catalog/teams` (q)
  - `GET /api/catalog/competitions` (q)
- Servicios: catalogo local curado
- Base de datos: `catalog_teams`, `catalog_competitions`, `catalog_aliases`

**Servicios externos:**

- Ninguno en MVP

**Puntos de integracion:**

- UI ↔ API (autocompletado)
- API ↔ DB (catalogo/alias)
- API ↔ Servicio externo (alternativa)

---

### Analisis de Complejidad de la Story

**Complejidad general:** Media

**Factores:**

- Complejidad de negocio: Media (normalizacion + comportamiento de alternativa)
- Complejidad de integracion: Media (API local + DB + RBAC)
- Complejidad de validacion de datos: Media (query length, estados UI)
- Complejidad UI: Media (loading/empty/sugerencias)

**Esfuerzo de prueba estimado:** Medio
**Razon:** multiples estados UI, integracion con API y condicion de alternativa.

---

### Contexto a Nivel Epic (desde FTP en Jira)

**Riesgos criticos ya identificados:**

- Riesgo: alternativa externa inconsistente o lenta
  - **Relevancia:** impacta respuesta del autocompletado y UX
- Riesgo: cache por consulta desactualizado
  - **Relevancia:** puede mostrar sugerencias incorrectas

**Puntos de integracion del epic:**

- UI ↔ API
  - **Aplica a esta story:** ✅ Si
  - **Uso:** autocompletado consume `GET /api/catalog/*`
- API ↔ DB
  - **Aplica a esta story:** ✅ Si
  - **Uso:** consulta catalogo local y alias
- API ↔ Servicio externo
  - **Aplica a esta story:** ✅ Si
  - **Uso:** alternativa cuando no hay coincidencias

**Preguntas criticas ya hechas a nivel epic:**

**Para PO:**

- Proveedor externo fuera de alcance MVP; validar empty state e ingreso manual
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta story:** define tiempos de espera y comportamiento de alternativa

**Para Dev:**

- Estrategia de cache (TTL, invalidacion, claves)
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta story:** define coherencia y cobertura de pruebas

**Estrategia de pruebas del epic:**

- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Como aplica a esta story:** UI + API + Integracion con alternativa externa

**Actualizaciones del epic:**

- No hay respuestas nuevas en comentarios del epic

**Resumen: como encaja esta story en la epica:**

- **Rol:** habilita el autocompletado normalizado para registro de apuestas
- **Riesgos heredados:** alternativa externa, cache y consistencia de datos
- **Consideraciones unicas:** validacion de query length y estados UI (loading/empty)

---

## 🚨 Paso 2: Analisis de Calidad de la Story

### Ambiguedades Identificadas

**Ambiguedad 1 resuelta:** Mensaje exacto de validacion para query < 2

- **Ubicacion:** Scenario 2 (AC)
- **Resolución Fase 4F:** mostrar inline bajo el input: `Escribe al menos 2 caracteres para buscar`.
- **Impacto en testing:** copy y ubicacion quedan validables.
- **Sugerencia:** usar `catalog_search_input` como ancla y validar mensaje visible sin llamada API.

**Ambiguedad 2 resuelta:** Comportamiento de alternativa (local vs externo)

- **Ubicacion:** Technical Notes / Workflow
- **Resolución Fase 4F:** no hay alternativa externa; si catalogo local no devuelve resultados, UI muestra empty state con ingreso manual.
- **Impacto en testing:** se elimina cobertura de latencia externa.
- **Sugerencia:** validar que no existe fallback externo ni retry externo en implementación.

---

### Informacion Faltante / Gaps

**Gap 1 resuelto:** Estrategia de cache (TTL, invalidacion, claves)

- **Tipo:** Detalle tecnico
- **Resolución Fase 4F:** no hay cache externa ni persistente en MVP.
- **Sugerencia:** usar estado cliente efimero del componente si hace falta, sin TTL persistente.
- **Impacto:** coherencia queda en DB local y request actual.

**Gap 2 resuelto:** Limites de rendimiento para autocompletado

- **Tipo:** Requisito no funcional
- **Resolución Fase 4F:** NFR-P-001 aplica a `/api/catalog/teams` y `/api/catalog/competitions` con p95 <= 500ms para `limit<=25`.
- **Sugerencia:** cubrir con prueba de integración/performance local cuando exista endpoint.
- **Impacto:** performance queda cerrada para MVP.

---

### Caso Bordes no cubiertos en la story

**Caso Borde 1:** Query con solo espacios o caracteres especiales

- **Escenario:** usuario ingresa "  " o "@@"
- **Comportamiento esperado:** tratar como query invalida
- **Criticidad:** Media
- **Accion:** agregar a criterios refinados

**Caso Borde 2:** Sin resultados locales

- **Escenario:** respuesta > timeout
- **Comportamiento esperado:** mostrar estado de error y opcion manual
- **Criticidad:** Alta
- **Accion:** pedir confirmacion a PO/Dev

---

### Validacion de Testeabilidad

**La story es testeable?** ⚠️ Parcialmente

**Issues de testeabilidad:**

- [ ] Criterios de aceptacion con mensajes no definidos
- [ ] Falta estrategia de cache
- [ ] Falta validar que el empty state habilita ingreso manual

**Recomendaciones:**

- Definir mensaje exacto de validacion
- Definir TTL/clave de cache
- Definir timeout y comportamiento de error

---

## ✅ Paso 3: Criterios de Aceptacion Refinados

### Escenario 1: Autocompletado exitoso con query valida

**Tipo:** Positivo
**Prioridad:** Critica

- **Dado:**
  - Usuario autenticado con formulario de apuesta abierto
  - Catalogo local contiene al menos 2 resultados para "bar"
- **Cuando:**
  - Ingresa la query "bar" (>= 2 caracteres)
- **Entonces:**
  - Se ejecuta la busqueda en el catalogo local
  - Se muestran sugerencias normalizadas por tipo
  - El estado loading desaparece

---

### Escenario 2: Query demasiado corta

**Tipo:** Negativo
**Prioridad:** Alta

- **Dado:** usuario en el campo de busqueda
- **Cuando:** ingresa "b" (1 caracter)
- **Entonces:**
  - No se ejecuta llamada a API
  - Se muestra mensaje de validacion **TBD**
  - Se mantiene el estado sin resultados

---

### Escenario 3: Sin resultados locales con alternativa externa

**Tipo:** Negativo
**Prioridad:** Alta

- **Dado:** catalogo local no tiene coincidencias para "xyl"
- **Cuando:** ingresa "xyl"
- **Entonces:**
  - Se intenta alternativa externa
  - Si tampoco hay resultados, se muestra estado vacio
  - Se muestra CTA para ingreso manual

---

### Escenario 4: Query invalida por espacios

**Tipo:** Limite
**Prioridad:** Media

- **Dado:** usuario en el campo de busqueda
- **Cuando:** ingresa "  "
- **Entonces:**
  - Se trata como query invalida
  - No se ejecutan llamadas
  - Se muestra mensaje de validacion **TBD**

---

### Escenario 5: Timeout de alternativa externa

**Tipo:** Caso Borde
**Prioridad:** Alta
**Fuente:** Analisis critico (Paso 2)

- **Dado:** no hay resultados locales
- **Cuando:** el catalogo local no devuelve resultados
- **Entonces:**
  - Se muestra estado de error controlado
  - Se habilita ingreso manual
  - **Nota:** requiere confirmacion PO/Dev

---

## 🧪 Paso 4: Diseno de Pruebas

### Analisis de Cobertura

**Total de casos necesarios:** 9

**Desglose:**

- Positivos: 2
- Negativos: 3
- Limite: 2
- Integracion: 1
- API: 1

**Razon:** se cubren estados UI, validaciones de query, alternativa y timeout.

---

### Oportunidades de Parametrizacion

**Pruebas parametrizadas recomendadas:** ✅ Si

**Grupo 1: Variaciones de query valida**

- **Escenario base:** autocompletado con query valida
- **Parametros:*
