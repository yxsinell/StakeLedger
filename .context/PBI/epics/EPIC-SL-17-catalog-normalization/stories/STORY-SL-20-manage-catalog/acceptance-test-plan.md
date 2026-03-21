# Plan de Pruebas de Aceptacion: STORY-SL-20 - Gestion de Catalogo

**Fecha:** 2026-03-21
**QA Engineer:** Generado por IA
**Story Jira Key:** SL-20
**Epic:** EPIC-SL-17 - Catalogo y Normalizacion
**Estado:** Borrador

---

## 📋 Paso 1: Analisis Critico

### Contexto de Negocio de esta Story

**Usuario afectado:**

- **Primario:** Miguel Santos - requiere catalogo consistente para recomendaciones y evitar duplicados
- **Secundario:** Laura Rios - necesita datos consistentes para analitica por liga/mercado

**Valor de negocio:**

- **Propuesta de valor:** mantenimiento controlado del catalogo para evitar ruido y duplicidades
- **Impacto de negocio:** mejora trazabilidad del ledger y calidad de recomendaciones

**Recorrido de Usuario relacionado:**

- Recorrido: Registro y primera apuesta
- Paso: Paso 3 (la calidad del catalogo impacta la busqueda/autocompletado)

---

### Contexto Tecnico de esta Story

**Componentes de arquitectura:**

**Frontend:**

- Componentes: UI de mantenimiento de catalogo y alias (admin)
- Paginas/Rutas: seccion admin de catalogo (TBD)
- Estado: validaciones de formulario, manejo de errores, estados de guardado

**Backend:**

- Endpoints API:
  - **TBD**: endpoints admin de upsert/alias no estan documentados en `api-contracts.yaml`
- Servicios: upsert de catalog items, gestion de alias, validacion de permisos
- Base de datos: `catalog_teams`, `catalog_competitions`, `catalog_aliases`, `audit_logs`

**Servicios externos:**

- Proveedor externo de datos (si aplica para actualizaciones periodicas)

**Puntos de integracion:**

- UI ↔ API (mantenimiento admin)
- API ↔ DB (upsert y alias)
- API ↔ Auth/RBAC (solo admin)

---

### Analisis de Complejidad de la Story

**Complejidad general:** Alta

**Factores:**

- Complejidad de negocio: Alta (alias unicos, upsert por proveedor/external_id)
- Complejidad de integracion: Media (API, DB, RBAC)
- Complejidad de validacion de datos: Alta (unicidad, formatos, referencial)
- Complejidad UI: Media (formularios admin + errores)

**Esfuerzo de prueba estimado:** Alto
**Razon:** reglas de unicidad, permisos y preservacion de referencias.

---

### Contexto a Nivel Epic (desde FTP en Jira)

**Riesgos criticos ya identificados:**

- Riesgo: duplicados o alias inconsistentes en catalogo
  - **Relevancia:** SL-20 gestiona alias y puede crear duplicados si no valida unicidad
- Riesgo: upsert admin rompe referencias internas
  - **Relevancia:** cambios deben preservar IDs y relaciones

**Puntos de integracion del epic:**

- UI ↔ API
  - **Aplica a esta story:** ✅ Si
  - **Uso:** UI admin de mantenimiento de catalogo
- API ↔ DB
  - **Aplica a esta story:** ✅ Si
  - **Uso:** upsert y persistencia de alias
- API ↔ Auth/RBAC
  - **Aplica a esta story:** ✅ Si
  - **Uso:** permisos admin/editor
- API ↔ API externa
  - **Aplica a esta story:** ⚠️ Parcial
  - **Uso:** actualizaciones periodicas (si se define proveedor)

**Preguntas criticas ya hechas a nivel epic:**

**Para PO:**

- Proveedor externo y SLA de alternativa
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta story:** define providers permitidos y reglas de update

**Para Dev:**

- Regla exacta de unicidad de alias (por entidad, proveedor o global)
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta story:** define validaciones y errores esperados

**Test Strategy del epic:**

- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Como aplica a esta story:** UI + API + Integracion + validacion de permisos

**Actualizaciones del epic:**

- No hay respuestas nuevas en comentarios del epic

**Resumen: como encaja esta story en la epica:**

- **Rol:** habilita el mantenimiento del catalogo que alimenta autocompletado y normalizacion
- **Riesgos heredados:** duplicados y ruptura de referencias
- **Consideraciones unicas:** reglas de unicidad de alias y permisos admin

---

## 🚨 Paso 2: Analisis de Calidad de la Story

### Ambiguedades Identificadas

**Ambiguedad 1:** Lista de providers permitidos

- **Ubicacion:** Business Rules
- **Pregunta para PO/Dev:** cuales providers son validos y en que entorno?
- **Impacto en testing:** no se puede cubrir validaciones ni datos reales
- **Sugerencia:** definir enum de providers en SRS/Story

**Ambiguedad 2:** Alcance de unicidad de alias

- **Ubicacion:** Business Rules
- **Pregunta para Dev:** alias unico por entidad, por provider o global?
- **Impacto en testing:** no se puede definir caso de duplicado correctamente
- **Sugerencia:** explicitar regla en AC y en DB constraints

**Ambiguedad 3:** Permisos admin vs editor

- **Ubicacion:** Business Rules vs NFR-S-001
- **Pregunta para PO/Dev:** editor puede modificar catalogo o solo admin?
- **Impacto en testing:** no se puede definir matriz de permisos
- **Sugerencia:** definir roles permitidos en story

**Ambiguedad 4:** Formato y obligatoriedad de season

- **Ubicacion:** Scope
- **Pregunta para PO/Dev:** season es requerido? formato (2024/2025, 2024)?
- **Impacto en testing:** no se pueden cubrir limites ni validaciones
- **Sugerencia:** definir formato y reglas

---

### Informacion Faltante / Gaps

**Gap 1:** Endpoints admin no definidos en API contract

- **Tipo:** Detalle tecnico
- **Por que es critico:** se necesitan rutas y schemas para pruebas API
- **Sugerencia:** agregar endpoints admin en `api-contracts.yaml`
- **Impacto:** incertidumbre en pruebas de API e integracion

**Gap 2:** Esquema de errores estandar para alias duplicado

- **Tipo:** Detalle tecnico
- **Por que es critico:** se requiere validar codigo/mensaje exacto
- **Sugerencia:** definir error code y estructura en contrato
- **Impacto:** pruebas negativas incompletas

**Gap 3:** Regla de preservacion de referencias en upsert

- **Tipo:** Regla de negocio
- **Por que es critico:** evita romper historico y reportes
- **Sugerencia:** definir si se mantiene ID y como se maneja merge
- **Impacto:** riesgo alto de inconsistencias

---

### Casos Borde no cubiertos en la story

**Caso Borde 1:** Alias con diferencias de mayusculas/espacios

- **Escenario:** alias "Barcelona" vs " barcelona "
- **Comportamiento esperado:** normalizar o rechazar (TBD)
- **Criticidad:** Media
- **Accion:** pedir confirmacion y agregar a AC

**Caso Borde 2:** Upsert concurrente del mismo external_id

- **Escenario:** dos admins guardan al mismo tiempo
- **Comportamiento esperado:** ultima escritura gana o bloqueo optimista (TBD)
- **Criticidad:** Media
- **Accion:** definir regla de concurrencia

---

### Validacion de Testeabilidad

**La story es testeable?** ⚠️ Parcialmente

**Issues de testeabilidad:**

- [ ] Endpoints admin no definidos
- [ ] Regla de unicidad de alias no definida
- [ ] Permisos admin/editor ambiguos
- [ ] Mensajes de error no definidos

**Recomendaciones:**

- Definir endpoints y schemas en `api-contracts.yaml`
- Definir reglas de unicidad y permisos
- Definir codigos/mensajes de error

---

## ✅ Paso 3: Criterios de Aceptacion Refinados

### Escenario 1: Upsert exitoso de item existente

**Tipo:** Positivo
**Prioridad:** Critica

- **Dado:** admin autenticado y existe item con provider "opta" y external_id "OPTA-123"
- **Cuando:** actualiza name "FC Barcelona" y season "2024/2025"
- **Entonces:**
  - Se actualizan los campos del item
  - Se mantiene el mismo ID y referencias asociadas
  - Se registra audit_log de actualizacion

---

### Escenario 2: Creacion de item nuevo con alias

**Tipo:** Positivo
**Prioridad:** Alta

- **Dado:** admin autenticado
- **Cuando:** crea item con provider "sportmonk", external_id "SM-987", name "Liga Profesional", season "2024" y alias "LPF"
- **Entonces:**
  - Se crea item y alias asociado
  - Respuesta 201 con itemId

---

### Escenario 3: Alias duplicado

**Tipo:** Negativo
**Prioridad:** Alta

- **Dado:** existe alias "LPF" para la misma entidad (scope de unicidad **TBD**)
- **Cuando:** admin intenta crear el mismo alias
- **Entonces:**
  - Se rechaza la operacion
  - Error de duplicado con codigo **TBD**
  - No se crean cambios en DB

---

### Escenario 4: Usuario sin permisos

**Tipo:** Negativo
**Prioridad:** Critica

- **Dado:** usuario con rol "user"
- **Cuando:** intenta modificar catalogo
- **Entonces:**
  - API responde 403 Forbidden
  - UI bloquea la accion
  - No hay cambios en DB

---

### Escenario 5: Provider invalido

**Tipo:** Negativo
**Prioridad:** Media

- **Dado:** admin autenticado
- **Cuando:** usa provider "unknown"
- **Entonces:**
  - Se rechaza por validacion
  - Error 400 con mensaje **TBD**

---

### Escenario 6: External_id requerido

**Tipo:** Negativo
**Prioridad:** Media

- **Dado:** admin autenticado
- **Cuando:** envia external_id vacio
- **Entonces:**
  - Se rechaza por campo requerido
  - No se crea ni actualiza el item

---

### Escenario 7: Alias con espacios o mayusculas

**Tipo:** Limite
**Prioridad:** Media
**Fuente:** Analisis critico (Paso 2)

- **Dado:** admin autenticado
- **Cuando:** ingresa alias " barcelona " o "BARCELONA"
- **Entonces:**
  - **Nota:** requiere confirmacion PO/Dev (normalizar o rechazar)

---

### Escenario 8: Concurrencia en upsert

**Tipo:** Caso Borde
**Prioridad:** Media
**Fuente:** Analisis critico (Paso 2)

- **Dado:** dos admins editan el mismo external_id
- **Cuando:** guardan cambios con pocos segundos de diferencia
- **Entonces:**
  - **Nota:** requiere definicion de politica de concurrencia

---

## 🧪 Paso 4: Diseno de Pruebas

### Analisis de Cobertura

**Total de casos necesarios:** 12

**Desglose:**

- Positivos: 3
- Negativos: 3
- Limite: 2
- Integracion: 2
- API: 2

**Razon:** upsert con reglas de unicidad, permisos, integridad referencial y validacion de datos.

---

### Oportunidades de Parametrizacion

**Pruebas parametrizadas recomendadas:** ✅ Si

**Grupo 1: Variaciones de provider y external_id**

- **Escenario base:** upsert exitoso
- **Parametros:** provider, external_id, entity_type

| Provider | External ID | Entity Type | Resultado esperado |
| --- | --- | --- | --- |
| opta | OPTA-123 | team | upsert OK (200) |
| sportmonk | SM-987 | competition | create OK (201) |

**Total de pruebas:** 2
**Beneficio:** cubre providers permitidos con un solo outline.

---

**Grupo 2: Variaciones de alias**

- **Escenario base:** creacion de alias
- **Parametros:** alias, normalizacion

| Alias | Variante | Resultado esperado |
| --- | --- | --- |
| LPF | exacto | creado |
|  LPF  | espacios | TBD (normalizar o rechazar) |
| lpf | case-insensitive | TBD |

**Total de pruebas:** 3
**Beneficio:** valida reglas de normalizacion y duplicados.

---

### Nomenclatura de Test Outlines

Formato: `Validar <comportamiento> <condicion>`

---

### Esquemas de Prueba (Test Outlines)

#### **Validar upsert admin con provider permitido**

**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critica
**Nivel:** UI
**Parametrizado:** ✅ Si (Grupo 1)

**Precondiciones:**

- Usuario admin autenticado
- Item existente para provider/external_id

**Pasos:**

1. Abrir UI de catalogo admin
2. Editar item con provider "opta" y external_id "OPTA-123"
3. Cambiar name y season
4. Guardar

**Resultado esperado:**

- **UI:** confirmacion de guardado
- **API:** 200 OK
- **DB:** item actualizado, ID intacto, audit_log creado

---

#### **Validar creacion de item con alias**

**Escenario relacionado:** Escenario 2
**Tipo:** Positivo
**Prioridad:** Alta
**Nivel:** UI
**Parametrizado:** ✅ Si (Grupo 1)

**Precondiciones:**

- Usuario admin autenticado

**Pasos:**

1. Crear item con provider "sportmonk" y external_id "SM-987"
2. Agregar alias "LPF"
3. Guardar

**Resultado esperado:**

- **UI:** confirmacion de guardado
- **API:** 201 Created
- **DB:** item y alias creados

---

#### **Validar rechazo por alias duplicado**

**Escenario relacionado:** Escenario 3
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel:** API
**Parametrizado:** ✅ Si (Grupo 2)

**Precondiciones:**

- Alias "LPF" existente (scope de unicidad definido)

**Pasos:**

1. Enviar request para crear alias "LPF" en otra entidad

**Resultado esperado:**

- **Status:** 409 Conflict (o 400) **TBD**
- **Body:** error code **TBD**
- **DB:** sin cambios

---

#### **Validar bloqueo de usuario sin permisos**

**Escenario relacionado:** Escenario 4
**Tipo:** Negativo
**Prioridad:** Critica
**Nivel:** API
**Parametrizado:** ❌ No

**Precondiciones:**

- Token de usuario no admin

**Pasos:**

1. Enviar request de upsert con token user

**Resultado esperado:**

- **Status:** 403 Forbidden
- **DB:** sin cambios

---

#### **Validar rechazo por provider invalido**

**Escenario relacionado:** Escenario 5
**Tipo:** Negativo
**Prioridad:** Media
**Nivel:** API
**Parametrizado:** ❌ No

**Precondiciones:**

- Token admin

**Pasos:**

1. Enviar payload con provider "unknown"

**Resultado esperado:**

- **Status:** 400 Bad Request
- **Body:** error code **TBD**
- **DB:** sin cambios

---

#### **Validar external_id requerido**

**Escenario relacionado:** Escenario 6
**Tipo:** Negativo
**Prioridad:** Media
**Nivel:** API
**Parametrizado:** ❌ No

**Precondiciones:**

- Token admin

**Pasos:**

1. Enviar payload sin external_id

**Resultado esperado:**

- **Status:** 400 Bad Request
- **Body:** error code **TBD**
- **DB:** sin cambios

---

#### **Validar alias con espacios o mayusculas**

**Escenario relacionado:** Escenario 7
**Tipo:** Limite
**Prioridad:** Media
**Nivel:** UI
**Parametrizado:** ✅ Si (Grupo 2)

**Precondiciones:**

- Usuario admin autenticado

**Pasos:**

1. Agregar alias " barcelona " o "BARCELONA"
2. Guardar

**Resultado esperado:**

- **Nota:** comportamiento por confirmar (normalizar o rechazar)

---

#### **Validar integridad referencial en upsert**

**Escenario relacionado:** Escenario 1
**Tipo:** Integracion
**Prioridad:** Alta
**Nivel:** Integracion
**Parametrizado:** ❌ No

**Precondiciones:**

- Item referenciado por registros dependientes

**Pasos:**

1. Ejecutar upsert del item
2. Consultar referencias asociadas

**Resultado esperado:**

- Referencias intactas
- Ningun FK roto

---

#### **Validar integracion UI → API → DB**

**Escenario relacionado:** Escenario 2
**Tipo:** Integracion
**Prioridad:** Alta
**Nivel:** Integracion
**Parametrizado:** ❌ No

**Precondiciones:**

- UI admin disponible

**Pasos:**

1. Crear item desde UI
2. Verificar response en API
3. Verificar persistencia en DB

**Resultado esperado:**

- Flujo completo sin inconsistencias

---

## 🔗 Casos de Integracion (si aplica)

### Integracion 1: UI → API → DB (Upsert Admin)

**Punto de integracion:** Frontend ↔ Backend API ↔ DB
**Tipo:** Integracion
**Prioridad:** Alta

**Flujo:**

1. UI envia payload admin
2. API valida permisos y datos
3. DB ejecuta upsert
4. UI recibe confirmacion

**Resultado esperado:**

- Respuesta consistente en UI y API
- Persistencia correcta en DB

---

### Integracion 2: API ↔ Auth/RBAC

**Punto de integracion:** Backend ↔ Auth
**Tipo:** Integracion
**Prioridad:** Alta

**Flujo:**

1. API recibe token admin
2. Valida claims/rol
3. Permite operacion

**Resultado esperado:**

- Admin permitido
- User bloqueado con 403

---

## 📊 Resumen de Casos Borde

| Caso Borde | Cubierto en story? | Agregado a AC refinado? | Caso de prueba | Prioridad |
| --- | --- | --- | --- | --- |
| Alias con espacios/case | ❌ No | ✅ Si (Escenario 7) | Outline 7 | Media |
| Upsert concurrente | ❌ No | ✅ Si (Escenario 8) | TBD | Media |

---

## 🗂️ Resumen de Datos de Prueba

### Categorias

| Tipo de dato | Cantidad | Proposito | Ejemplos |
| --- | --- | --- | --- |
| Validos | 3 | Positivos | provider "opta", external_id "OPTA-123", alias "LPF" |
| Invalidos | 3 | Negativos | provider "unknown", external_id "", alias duplicado |
| Limite | 2 | Limite | alias con espacios, alias en mayusculas |
| Caso Borde | 1 | Concurrencia | upsert simultaneo |

### Estrategia de generacion

- **Estaticos:** providers y external_id definidos para escenarios
- **Dinamicos:** alias y nombres con Faker.js
- **Limpieza:** limpiar items y alias creados en DB

---

## ✅ Paso 8: Reporte Final QA (para usuario)

### Resumen para PO/Dev

**Calidad de story:** ⚠️ Necesita Mejora

**Hallazgos clave:**

1. Falta definir endpoints admin y schemas
2. Falta definir regla de unicidad de alias
3. Falta definir permisos admin/editor y providers validos

---

### Preguntas criticas para PO

**Pregunta 1:** cuales providers son validos para actualizaciones periodicas?

- **Contexto:** define datos de prueba y validaciones
- **Impacto:** pruebas API incompletas

**Pregunta 2:** season es requerido? formato esperado?

- **Contexto:** define validaciones y limites
- **Impacto:** no se pueden diseñar boundary tests

---

### Preguntas tecnicas para Dev

**Pregunta 1:** regla exacta de unicidad de alias?

- **Contexto:** define duplicados y constraints
- **Impacto:** pruebas negativas y DB constraints

**Pregunta 2:** endpoints admin y error codes oficiales?

- **Contexto:** falta en api-contracts.yaml
- **Impacto:** no se pueden validar contratos

**Pregunta 3:** politica de concurrencia en upsert?

- **Contexto:** dos admins pueden editar a la vez
- **Impacto:** riesgo de perdida de datos

---

### Mejoras sugeridas

**Mejora 1:** agregar AC de unicidad de alias con error esperado

- **Estado actual:** no define alcance ni codigo de error
- **Cambio sugerido:** incluir regla (por entidad/proveedor/global) y error code
- **Beneficio:** evita duplicados y facilita pruebas negativas

**Mejora 2:** agregar AC de permisos admin/editor

- **Estado actual:** solo dice "admin"
- **Cambio sugerido:** definir roles exactos
- **Beneficio:** claridad en RBAC y coverage de seguridad

---

### Recomendaciones de testing

- Validar contratos de API de endpoints admin
- Ejecutar pruebas de RBAC (admin vs user)
- Validar integridad referencial tras upsert

---

### Riesgos y mitigacion

**Riesgo 1:** duplicados en catalogo por alias inconsistentes

- **Probabilidad:** Media
- **Impacto:** Alta
- **Mitigacion:** reglas de unicidad + tests de duplicados

**Riesgo 2:** upsert rompe referencias historicas

- **Probabilidad:** Media
- **Impacto:** Alta
- **Mitigacion:** pruebas de integridad y audit logs

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

- **Story:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/stories/STORY-SL-20-manage-catalog/story.md`
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

---

## 📢 Acciones Requeridas

**PO:**

- [ ] Confirmar providers permitidos
- [ ] Definir formato de season

**Dev Lead:**

- [ ] Definir unicidad de alias y constraints
- [ ] Publicar endpoints admin en API contract
- [ ] Definir politica de concurrencia

**QA:**

- [ ] Actualizar casos una vez resueltas las preguntas
- [ ] Preparar datos de prueba admin

---

**Proximos Pasos:**

1. PO/Dev responden preguntas criticas
2. QA ajusta AC refinados y test cases
3. Dev inicia implementacion con AC claros
