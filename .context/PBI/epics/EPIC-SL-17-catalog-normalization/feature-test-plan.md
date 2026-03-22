## 📋 Plan de Pruebas de Funcionalidad - Generado 2026-03-15

**Lider QA:** Generado por IA
**Estado:** Borrador - Pendiente de Revision del Equipo

---

# Plan de Pruebas de Funcionalidad: EPIC-SL-17 - Catalogo y Normalizacion

**Fecha:** 2026-03-15
**Lider QA:** Generado por IA
**Epic Jira Key:** SL-17
**Estado:** Borrador

---

## 📋 Analisis de Contexto de Negocio

### Valor de Negocio

Esta epica reduce errores en el registro de apuestas y habilita analitica confiable al normalizar equipos y competiciones. Impacta directamente la trazabilidad del ledger y la calidad de recomendaciones.

**Propuesta de Valor Clave:**

- Normalizacion de datos deportivos para analitica por ligas/cuotas
- Reduccion de errores operativos en el registro de apuestas

**Metricas de Exito (KPIs):**

- % de registros normalizados vs unnormalized
- Reduccion de errores en registro de apuestas

**Impacto en Usuarios:**

- Carlos Vega (apostador recreacional disciplinado): autocompletado acelera el registro y reduce errores de escritura
- Laura Rios (apostadora avanzada data-driven): datos consistentes permiten analisis por liga/mercado
- Miguel Santos (administrador/tipster): catalogo consistente evita duplicidades en recomendaciones

**Recorridos Criticos de Usuario:**

- Recorrido 1: Registro y primera apuesta (paso de busqueda/autocompletado + ingreso manual)

---

## 🏗️ Analisis de Arquitectura Tecnica

### Componentes de Arquitectura Involucrados

**Frontend:**

- Componentes a crear/modificar: campo de busqueda con autocompletado, formulario de ingreso manual, UI de mantenimiento de catalogo (admin)
- Paginas/rutas afectadas: formulario de registro de apuesta y seccion admin de catalogo

**Backend:**

- APIs a crear/modificar:
  - `GET /api/catalog/teams`
  - `GET /api/catalog/competitions`
  - `POST /api/catalog/manual`
- APIs faltantes en contrato: actualizacion de catalogo/alias (admin) y upsert por proveedor/external_id

**Base de Datos:**

- Tablas involucradas: `catalog_teams`, `catalog_competitions`, `catalog_aliases`
- Consultas criticas: busqueda por nombre/alias, upsert por proveedor/external_id, validacion de alias unicos

**Servicios Externos:**

- API externa de catalogo (alternativa cuando no hay coincidencia)

### Puntos de Integracion (Criticos para Pruebas)

**Puntos de Integracion Internos:**

- Frontend ↔ Backend API (busqueda/autocompletado, ingreso manual, actualizacion admin)
- Backend ↔ Base de Datos (catalogo y alias)
- Backend ↔ Auth/RBAC (solo admin actualiza catalogo)

**Puntos de Integracion Externos:**

- Backend ↔ API externa de catalogo

**Flujo de Datos:**

```
Usuario → UI → /api/catalog/teams|competitions → DB
                          ↓
                   API externa (alternativa)
```

---
## 🚨 Analisis de Riesgos

### Riesgos Tecnicos

#### Riesgo 1: Duplicados o alias inconsistentes en catalogo

- **Impacto:** Alta
- **Probabilidad:** Media
- **Area Afectada:** Base de Datos / Integracion
- **Estrategia de Mitigacion:**
  - Validaciones de unicidad en alias por entidad
  - Pruebas de upsert y deduplicacion
- **Cobertura de Pruebas Requerida:** Casos de alias duplicado, fusion y referencias

#### Riesgo 2: Alternativa externa inconsistente o lenta

- **Impacto:** Media
- **Probabilidad:** Media
- **Area Afectada:** Integracion
- **Estrategia de Mitigacion:**
  - Cache con TTL definido y manejo de tiempos de espera
  - Pruebas de resiliencia cuando el proveedor falla
- **Cobertura de Pruebas Requerida:** Tiempos de espera, alternativa manual, estados vacio/cargando

#### Riesgo 3: Cache por consulta desactualizado

- **Impacto:** Media
- **Probabilidad:** Media
- **Area Afectada:** Backend
- **Estrategia de Mitigacion:**
  - Invalidador por actualizacion de catalogo
  - Pruebas de coherencia tras upsert
- **Cobertura de Pruebas Requerida:** Pruebas de coherencia entre busqueda y actualizacion

---

### Riesgos de Negocio

#### Riesgo 1: Normalizacion incorrecta afecta analitica y recomendaciones

- **Impacto en el Negocio:** distorsiona KPIs y rendimiento por liga/mercado
- **Impacto en Usuarios:** Laura/Miguel pierden confianza en datos
- **Probabilidad:** Media
- **Estrategia de Mitigacion:**
  - Validaciones de datos y control de alias
  - Pruebas de consistencia de resultados normalizados
- **Validacion de Criterios de Aceptacion:** asegurar que los AC incluyen criterios de normalizacion

#### Riesgo 2: Ingreso manual abusivo degrada calidad del catalogo

- **Impacto en el Negocio:** aumenta ruido y retrabajo de limpieza
- **Impacto en Usuarios:** peores sugerencias y resultados duplicados
- **Probabilidad:** Media
- **Estrategia de Mitigacion:**
  - Validaciones estrictas y permisos
  - Pruebas de seguridad y validacion de campos

---

### Riesgos de Integracion

#### Riesgo de Integracion 1: API externa no responde o devuelve datos incompletos

- **Punto de Integracion:** Backend ↔ API externa
- **Que Puede Salir Mal:** tiempos de espera, esquema incompleto, datos con nombres no normalizados
- **Impacto:** Alta
- **Mitigacion:**
  - pruebas de integracion con mocks y tiempos de espera
  - Alternativa a ingreso manual

#### Riesgo de Integracion 2: Upsert admin rompe referencias internas

- **Punto de Integracion:** Backend ↔ Base de Datos
- **Que Puede Salir Mal:** cambio de IDs o alias invalida relaciones
- **Impacto:** Alta
- **Mitigacion:**
  - Pruebas de integridad referencial y migracion de alias

---

## ⚠️ Analisis Critico y Preguntas para PO/Dev

### Ambiguedades Identificadas

**Ambiguedad 1:** Proveedor externo y politica de alternativa no definida

- **Encontrado en:** EPIC-SL-17 / STORY-SL-18
- **Pregunta para PO:** Que proveedor externo se usara y que SLA/limitaciones aplica?
- **Impacto si no se aclara:** incertidumbre en cobertura de resiliencia y rendimiento

**Ambiguedad 2:** Reglas exactas de deduplicacion y alias

- **Encontrado en:** STORY-SL-20
- **Pregunta para Dev:** Cual es la regla de unicidad de alias (por entidad, por proveedor o global)?
- **Impacto si no se aclara:** riesgo alto de duplicados o bloqueos indebidos

**Ambiguedad 3:** Formato de normalizacion_status y campos requeridos

- **Encontrado en:** STORY-SL-19
- **Pregunta para Dev:** Campo exacto y enum permitido para normalization_status?
- **Impacto si no se aclara:** errores de validacion y queries inconsistentes

---

### Informacion Faltante

**Faltante 1:** Endpoint(s) de admin para upsert y gestion de alias

- **Necesario para:** pruebas API e integracion
- **Sugerencia:** documentar en `api-contracts.yaml` rutas y esquemas

**Faltante 2:** Lista de proveedores permitidos y validaciones de pais

- **Necesario para:** validaciones y datos de prueba
- **Sugerencia:** definir enums y reglas minimas en SRS/Story

**Faltante 3:** Estrategia de cache (TTL, invalidacion, keys)

- **Necesario para:** cobertura de coherencia y rendimiento
- **Sugerencia:** agregar nota tecnica o AC adicional

---

### Mejoras Sugeridas (Antes de Implementar)

**Mejora 1:** Agregar AC de manejo de alternativa externa y tiempos de espera

- **Story Afectada:** SL-18
- **Estado Actual:** no define comportamiento ante fallas del proveedor
- **Cambio Sugerido:** AC que explicite timeout, mensaje y opcion manual
- **Beneficio:** reduce ambiguedad y mejora UX

**Mejora 2:** Agregar AC de unicidad de alias y reglas de upsert

- **Story Afectada:** SL-20
- **Estado Actual:** no define scope de unicidad
- **Cambio Sugerido:** AC con regla de unicidad y respuesta de error
- **Beneficio:** previene duplicados y errores de integridad

---
## 🎯 Estrategia de Pruebas

### Alcance de Pruebas

**En Alcance:**

- pruebas funcionales (UI, API, Base de Datos)
- pruebas de integracion (servicios internos + externos)
- pruebas no funcionales (Rendimiento, Seguridad segun RNF)
- pruebas cross-browser (Chrome, Firefox, Safari)
- responsividad mobile (iOS Safari, Android Chrome)
- validacion de contratos de API (segun api-contracts.yaml)
- validacion de datos (entrada/salida segun SRS)

**Fuera de Alcance (Para esta Epica):**

- Normalizacion automatica avanzada por IA
- Sincronizacion en tiempo real con proveedores
- Pruebas de penetracion externas profundas

---

### Niveles de Prueba

#### Pruebas Unitarias

- **Objetivo de Cobertura:** > 80% cobertura de codigo
- **Areas de Enfoque:**
  - Normalizacion y emparejamiento
  - Validaciones de entrada (longitud de consulta, tipo)
  - Utilidades de cache
- **Responsabilidad:** equipo Dev (QA valida existencia)

#### Pruebas de Integracion

- **Objetivo de Cobertura:** Todos los puntos de integracion listados
- **Areas de Enfoque:**
  - UI ↔ API (autocompletado, manual, actualizacion admin)
  - API ↔ DB (catalogo y alias)
  - API ↔ Externo (alternativa)
- **Responsabilidad:** QA + Dev

#### Pruebas End-to-End (E2E)

- **Objetivo de Cobertura:** Recorrido 1 completo (registro de apuesta con busqueda/manual)
- **Herramienta:** Playwright
- **Areas de Enfoque:**
  - flujo feliz completo
  - escenarios de error criticos
- **Responsabilidad:** equipo QA

#### Pruebas de API

- **Objetivo de Cobertura:** 100% de endpoints de esta epica
- **Herramienta:** Postman/Newman o Playwright API
- **Areas de Enfoque:**
  - Validacion de contrato
  - Codigos de estado correctos
  - manejo de errores
  - Autenticacion/Autorizacion
- **Responsabilidad:** equipo QA

---

### Tipos de Prueba por Story

**Casos de Prueba Positivos:**

- flujo feliz (flujo exitoso)
- Variaciones de datos validos

**Casos de Prueba Negativos:**

- Entrada invalida
- Campos requeridos faltantes
- Intentos de acceso no autorizados
- Violaciones de limites

**Casos de Prueba de Limite:**

- Valores min/max
- Valores vacios/null
- Casos borde especificos

**Pruebas Exploratorias:**

- Busqueda/autocompletado con resultados inesperados y latencia
- Ingreso manual con datos ambiguos o similares
- Actualizacion admin con alias preexistentes

---

## 📊 Resumen de Casos de Prueba por Story

### STORY-SL-18: Autocompletado de Busqueda

**Complejidad:** Media
**Casos de Prueba Estimados:** 10

- Positivos: 3
- Negativos: 3
- Limite: 2
- Integracion: 1
- API: 1

**Razon del estimado:** busqueda con validaciones, alternativa externa y estados UI (cargando/vacio).

**Pruebas Parametrizadas Recomendadas:** Si
Cobertura con variaciones de consulta, tipo y resultados.

---

### STORY-SL-19: Ingreso Manual

**Complejidad:** Media
**Casos de Prueba Estimados:** 8

- Positivos: 2
- Negativos: 3
- Limite: 2
- Integracion: 0
- API: 1

**Razon del estimado:** validaciones de campos requeridos y tipo, mas estado UNNORMALIZED.

**Pruebas Parametrizadas Recomendadas:** Si
Variaciones de tipo, pais y raw_text.

---

### STORY-SL-20: Gestionar Catalogo

**Complejidad:** Alta
**Casos de Prueba Estimados:** 12

- Positivos: 3
- Negativos: 3
- Limite: 2
- Integracion: 2
- API: 2

**Razon del estimado:** upsert por proveedor/external_id, alias unicos y permisos admin.

**Pruebas Parametrizadas Recomendadas:** Si
Variaciones de proveedor, external_id y alias.

---

### Total de Casos de Prueba Estimados para la Epica

**Total:** 30
**Desglose:**

- Positivos: 8
- Negativos: 9
- Limite: 6
- Integracion: 3
- API: 4

---
## 🗂️ Requisitos de Datos de Prueba

### Estrategia de Datos de Prueba

**Conjuntos de Datos Validos:**

- Datos de usuario: usuario estandar y admin
- Datos de catalogo: equipos/competiciones reales por pais
- Datos de alias: nombres alternativos validos por proveedor

**Conjuntos de Datos Invalidos:**

- raw_text vacio
- tipo fuera de enum
- external_id nulo
- payloads con strings maliciosos (SQLi/XSS)

**Conjuntos de Datos de Limite:**

- Longitud de consulta 1 vs 2
- raw_text con longitud maxima definida (pendiente de definicion)
- caracteres especiales

**Gestion de Datos de Prueba:**

- ✅ Usar Faker.js para datos realistas
- ✅ Crear fabricas de datos para catalog items y alias
- ❌ No hardcodear datos estaticos en pruebas
- ✅ Limpiar data de prueba post-ejecucion

---

### Entornos de Prueba

**Entorno de Staging:**

- URL: https://staging.example.com
- Base de Datos: Supabase (staging)
- Servicios Externos: mockeados o staging del proveedor
- **Proposito:** entorno principal de pruebas

**Entorno de Produccion:**

- URL: https://api.example.com
- **Proposito:** solo pruebas smoke post-despliegue
- **Restricciones:** sin pruebas destructivas, sin creacion de datos de prueba

---

## ✅ Criterios de Entrada/Salida

### Criterios de Entrada (Por Story)

Las pruebas pueden iniciar cuando:

- [ ] Story implementada y desplegada en staging
- [ ] Revision de codigo aprobada por 2+ revisores
- [ ] Pruebas unitarias existen y pasan (>80% cobertura)
- [ ] Pruebas smoke de Dev realizadas
- [ ] Sin bugs bloqueantes en dependencias
- [ ] Datos de prueba preparados
- [ ] Documentacion de API actualizada (si hay cambios)

### Criterios de Salida (Por Story)

La story se considera terminada cuando:

- [ ] Todos los casos de prueba ejecutados
- [ ] Pruebas criticas/altas: 100% aprobadas
- [ ] Pruebas medias/bajas: >= 95% aprobadas
- [ ] Bugs criticos/altos resueltos
- [ ] Pruebas de regresion pasadas si aplica
- [ ] RNF validados
- [ ] Reporte de pruebas generado

### Criterios de Salida de la Epica

- [ ] Todas las stories cumplen criterios de salida
- [ ] pruebas de integracion entre stories completadas
- [ ] Pruebas E2E de recorridos criticos pasadas
- [ ] Pruebas de contrato de API completas
- [ ] RNF validados
- [ ] Sesion de pruebas exploratorias completada
- [ ] No hay bugs criticos/altos abiertos

---

## 📝 Validacion de Requisitos No Funcionales

### Requisitos de Rendimiento

**NFR-P-001:** tiempo de respuesta de API p95 < 500ms en endpoints de busqueda

- **Objetivo:** p95 < 500ms
- **Enfoque de Prueba:** medir en staging con datos reales
- **Herramientas:** k6/Lighthouse (API)

**NFR-P-002:** LCP p75 < 2.5s en pagina de registro de apuesta

- **Objetivo:** LCP p75 < 2.5s
- **Enfoque de Prueba:** Lighthouse en desktop/mobile

### Requisitos de Seguridad

**NFR-S-001:** RBAC admin/editor para mantenimiento de catalogo

- **Requisito:** solo admin/editor puede modificar catalogo
- **Enfoque de Prueba:** intentos de acceso con rol user

### Requisitos de Usabilidad

**NFR-U-001:** Autocompletado con feedback de estado (cargando/vacio)

- **Requisito:** estados visibles y no bloqueantes
- **Enfoque de Prueba:** validacion de UI en navegadores soportados

---
## 🔄 Estrategia de Pruebas de Regresion

**Alcance de Regresion:**

- [ ] Registro de apuestas: puede afectarse por cambios en busqueda
- [ ] Recomendaciones/feed: depende de catalogo normalizado
- [ ] Analitica: depende de datos consistentes

**Ejecucion de Pruebas de Regresion:**

- Ejecutar conjunto de regresion automatizada antes de pruebas de epica
- Re-ejecutar despues de completar todas las stories
- Enfocar en puntos de integracion

---

## 📅 Estimacion del Cronograma de Pruebas

**Duracion Estimada:** 1 sprint (2 semanas)

**Desglose:**

- Diseno de casos de prueba: 2 dias
- Preparacion de datos de prueba: 1 dia
- Ejecucion de pruebas: 2 dias por story
- Pruebas de regresion: 2 dias
- Buffer de correccion de bugs: 2 dias
- pruebas exploratorias: 1 dia

**Dependencias:**

- Depende de: SL-12 (registro de ticket) para flujo completo
- Bloquea: EPIC-SL-06 Recommendations and Insights

---

## 🛠️ Herramientas e Infraestructura

**Herramientas de Prueba:**

- Pruebas E2E: Playwright
- Pruebas de API: Postman/Newman o Playwright API
- Pruebas Unitarias: Vitest (frontend), Jest (backend)
- Pruebas de Rendimiento: Lighthouse
- Pruebas de Seguridad: OWASP ZAP (si aplica)
- Datos de Prueba: Faker.js

**Integracion CI/CD:**

- [ ] Pruebas corren en creacion de PR
- [ ] Pruebas corren al fusionar a main
- [ ] Pruebas corren en despliegue a staging
- [ ] Pruebas smoke corren en despliegue a produccion

**Gestion de Pruebas:**

- Jira Xray (si aplica) o Jira nativo
- Reportes de ejecucion de pruebas en Jira
- Seguimiento de bugs en Jira

---

## 📊 Metricas y Reportes

**Metricas de Prueba a Seguir:**

- Casos de prueba ejecutados vs total
- Tasa de aprobacion de pruebas
- Tasa de deteccion de bugs
- Tasa de correccion de bugs
- Cobertura de pruebas (unitarias)
- Tiempo de prueba por story

**Frecuencia de Reporte:**

- Diario: estado de ejecucion de pruebas
- Por story: reporte de finalizacion de pruebas
- Por epica: reporte de aprobacion QA

---

## 🎓 Notas y Supuestos

**Supuestos:**

- Ninguno. Confirmaciones pendientes listadas en Preguntas Criticas.

**Restricciones:**

- contratos de API no incluyen endpoints admin de catalogo/alias
- Proveedor externo y SLA no definidos

**Limitaciones Conocidas:**

- No se puede validar integracion real con proveedor externo hasta definirlo

**Sesiones de Pruebas Exploratorias:**

- Recomendado: 2 sesiones ANTES de implementacion
  - Sesion 1: Validar UX de autocompletado con maquetas/prototipos
  - Sesion 2: Casos borde de duplicados y alias

---

## 📎 Documentacion Relacionada

- **Epic:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/stories/STORY-*/story.md`
- **Modelo de Negocio:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/`
- **SRS:** `.context/SRS/`
- **Arquitectura:** `.context/SRS/architecture-specs.md`
- **Contratos de API:** `.context/SRS/api-contracts.yaml`

---

## 📢 Acciones Requeridas

**@PO:**

- [ ] Revisar ambiguedades e informacion faltante (ver seccion de Analisis Critico)
- [ ] Responder preguntas criticas para PO
- [ ] Validar analisis de riesgos e impacto de negocio
- [ ] Confirmar que el alcance de pruebas es completo y correcto

**@Dev Lead:**

- [ ] Revisar riesgos tecnicos y estrategias de mitigacion
- [ ] Validar puntos de integracion identificados
- [ ] Confirmar que el analisis de arquitectura es correcto
- [ ] Responder preguntas tecnicas

**@QA:**

- [ ] Revisar estrategia de pruebas y estimaciones
- [ ] Validar niveles de prueba y tipos por story
- [ ] Confirmar requisitos de datos de prueba
- [ ] Preparar entornos de prueba y herramientas

---

**Proximos Pasos:**

1. El equipo discute preguntas criticas y ambiguedades en refinement
2. PO/Dev proporcionan respuestas y aclaraciones
3. QA inicia diseno de casos de prueba por story (usar acceptance-test-plan.md)
4. El equipo valida criterios de entrada/salida antes del inicio del sprint
5. Dev inicia implementacion SOLO despues de resolver preguntas criticas

---

**Documentacion:** Plan completo tambien disponible en:
`.context/PBI/epics/EPIC-SL-17-catalog-normalization/feature-test-plan.md`
