## Plan de Pruebas de Aceptacion - Generado 2026-03-15

**Ingeniero QA:** AI-Generated
**Estado:** Borrador - Pendiente de revision PO/Dev

---

# Plan de Pruebas de Aceptacion: STORY-SL-16 - Historial inmutable

**Fecha:** 2026-03-15
**Ingeniero QA:** AI-Generated
**Jira Key de la historia:** SL-16
**Epica:** EPIC-SL-11 - Bets Ledger
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio
**Persona afectada:**
- **Primario:** Laura Rios - necesita auditoria confiable de movimientos.
- **Secundario:** Carlos Vega - quiere revisar historial sin cambios indebidos.

**Valor de negocio:**
- **Propuesta de valor:** trazabilidad inmutable para confianza y control de riesgo.
- **Impacto en KPIs:** reduce disputas y mejora consistencia del ledger.

**Recorrido de usuario relacionado:**
- Recorrido: Registro y primera apuesta
- Paso: Paso de consulta de historial y auditoria

---

### Contexto tecnico
**Componentes de arquitectura:**

**Frontend:**
- Componentes: vista de historial por entidad.
- Paginas/Rutas: por definir (no especificadas en SRS).
- Estado: por definir (no especificado).

**Backend:**
- Endpoints API: GET /api/audit?tipo\-entidad&id\-entidad (por confirmar), GET /api/audit/{id}.
- Servicios: solo append, autorizacion propietario/admin, ordenamiento por fecha.
- Base de datos: audit\-logs.

**Servicios externos:**
- Ninguno.

**Puntos de integracion:**
- Frontend -> Backend API (consulta de historial).
- Backend -> Base de datos (audit\-logs).
- Backend -> Auth/RLS (propietario y permisos).

---

### Analisis de complejidad
**Complejidad general:** Media

**Factores de complejidad:**
- Logica de negocio: Media - inmutabilidad y permisos.
- Integracion: Media - API + DB.
- Validaciones: Alta - permisos y ordenamiento.
- UI: Media - paginacion y filtros.

**Esfuerzo de pruebas estimado:** Medio
**Razon:** reglas de acceso y consistencia de eventos.

---

### Contexto a nivel epic (desde Feature Test Plan)
**Riesgos criticos ya identificados:**
- Auditoria no inmutable o accesos indebidos.
  - **Relevancia:** es el objetivo principal de la historia.

**Puntos de integracion del epic:**
- Backend ↔ Base de datos: ✅ Aplica (audit log).
- Backend ↔ Auth/RLS: ✅ Aplica (permisos).

**Estrategia de pruebas del epic:**
- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Aplicacion en esta historia:** unitarias (solo append), integracion (API-DB), API (consulta), E2E (vista historial).

**Resumen:**
- **Rol en el epic:** habilita auditoria de movimientos.
- **Riesgos heredados:** inmutabilidad y permisos.
- **Consideraciones unicas:** paginacion y orden estable.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas
**Ambiguedad 1:** endpoint de consulta
- **Ubicacion:** Alcance/Notas tecnicas
- **Pregunta:** cual es el endpoint y parametros definitivos?
- **Impacto:** pruebas API no deterministas.
- **Sugerencia:** confirmar en api-contracts.yaml.

**Ambiguedad 2:** alcance de permisos admin
- **Ubicacion:** Reglas de negocio
- **Pregunta:** admin puede ver historiales de otros usuarios?
- **Impacto:** pruebas de seguridad.
- **Sugerencia:** definir matriz de permisos.

**Ambiguedad 3:** retencion de eventos
- **Ubicacion:** Notas
- **Pregunta:** hay politicas de retencion o soft delete?
- **Impacto:** pruebas de consistencia a largo plazo.
- **Sugerencia:** definir politica de retencion.

### Brechas / Informacion faltante
**Brecha 1:** codigos/mensajes de error
- **Tipo:** Criterios de aceptacion
- **Por que es critico:** validacion de errores en API/UI.
- **Sugerencia:** definir codigos por permisos/entidad no encontrada.

**Brecha 2:** ordenamiento y paginacion
- **Tipo:** Regla de negocio
- **Por que es critico:** pruebas de consistencia de resultados.
- **Sugerencia:** definir orden por fecha DESC y parametros de paginacion.

### Casos extremos no cubiertos
**Caso extremo 1:** intento de editar/borrar via API
- **Escenario:** PATCH/DELETE audit log
- **Comportamiento esperado:** bloqueo
- **Criticidad:** Alta
- **Accion:** agregar a casos de prueba

**Caso extremo 2:** consulta de entidad ajena
- **Escenario:** usuario solicita historial de otro user
- **Comportamiento esperado:** 403
- **Criticidad:** Alta
- **Accion:** agregar a AC y casos de prueba

**Caso extremo 3:** timestamps iguales
- **Escenario:** eventos con mismo timestamp
- **Comportamiento esperado:** orden estable
- **Criticidad:** Media
- **Accion:** preguntar a Dev

### Validacion de testeabilidad
**Es testeable como esta?** ⚠️ Parcialmente
**Issues:**
- [ ] Endpoint/paginacion no definidos
- [ ] Permisos admin no definidos
- [ ] Codigos de error no definidos

**Recomendaciones:**
- Definir endpoint y parametros
- Definir permisos admin
- Definir codigos/mensajes de error

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Registrar evento en audit log
**Tipo:** Positivo
**Prioridad:** Critico
- **Dado:** operacion valida de bank o bet
- **Cuando:** se ejecuta la operacion
- **Entonces:** se registra evento inmutable con timestamp y tipo\-entidad/id\-entidad

---

### Escenario 2: Intento de modificar evento
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** evento existente
- **Cuando:** intenta editar o borrar
- **Entonces:** se bloquea y no se modifica el registro

---

### Escenario 3: Consulta por entidad propia
**Tipo:** Positivo
**Prioridad:** Alta
- **Dado:** usuario autenticado propietario
- **Cuando:** solicita historial de entidad propia
- **Entonces:** devuelve eventos ordenados por fecha DESC

---

### Escenario 4: Consulta de entidad ajena
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** usuario autenticado
- **Cuando:** solicita historial de entidad ajena
- **Entonces:** se rechaza por permisos (403)

---
## Paso 4: Diseno de pruebas

### Cobertura
**Total de casos:** 9
**Desglose:**
- Positivos: 2
- Negativos: 4
- Limites: 1
- Integracion: 1
- API: 1

**Razon:** cubre inmutabilidad, permisos y ordenamiento.

---

### Oportunidades de parametrizacion
**Recomendada:** ✅ Si

**Grupo 1: Tipos de entidad**
- **Base:** consulta de historial
- **Parametros:** tipo\-entidad, id\-entidad

| tipo\-entidad | Resultado esperado |
| ----------- | ------------------ |
| bank        | Acepta             |
| bet         | Acepta             |

**Grupo 2: Permisos de acceso**
- **Base:** consulta de historial
- **Parametros:** rol\-usuario, propietario

| rol\-usuario | propietario | Resultado esperado |
| ---------- | ----- | ------------------ |
| propietario      | si    | Acepta             |
| otro       | no    | Rechaza            |

**Beneficio:** cubre tipos de entidad y permisos.

---

### Nomenclatura de esquemas de prueba
Formato: "Validar <comportamiento> <condicion>"

### Esquemas de prueba

#### Validar registro de evento en audit log con operacion valida
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critico
**Nivel de prueba:** Integracion
**Parametrizado:** ❌ No

**Resultado esperado:**
- Evento creado con timestamp y referencia a entidad

---

#### Validar bloqueo de edicion/borrado de evento
**Escenario relacionado:** Escenario 2
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 403/405 (por definir)
- Evento permanece intacto

---

#### Validar consulta de historial por entidad propia
**Escenario relacionado:** Escenario 3
**Tipo:** Positivo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Resultado esperado:**
- Lista ordenada por fecha DESC

---

#### Validar rechazo de consulta por entidad ajena
**Escenario relacionado:** Escenario 4
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 2)

**Resultado esperado:**
- Codigo de estado 403

---

#### Validar ordenamiento estable con timestamps iguales
**Escenario relacionado:** Escenario 3
**Tipo:** Limite
**Prioridad:** Media
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Orden estable (por definir criterio)

---

## Casos de integracion

### Integracion 1: Backend ↔ Base de datos
**Punto:** API -> audit\-logs
**Tipo:** Integracion
**Prioridad:** Alta

**Resultado esperado:**
- Escritura solo append y sin modificaciones

---

## Resumen de casos extremos

| Caso extremo                         | En historia original | Agregado a AC | Caso | Prioridad |
| ----------------------------------- | -------------------- | ------------- | ---- | --------- |
| Intento de editar/borrar via API    | ❌ No               | ✅ Si         | ATP-EC01 | Alta |
| Consulta de entidad ajena           | ✅ Si               | ✅ Si         | ATP-EC02 | Alta |
| Timestamps iguales                  | ❌ No               | ⚠️ Pendiente  | TBD  | Media |

---

## Resumen de datos de prueba

### Categorias
| Tipo            | Cantidad | Proposito        | Ejemplos |
| --------------- | -------- | ---------------- | -------- |
| Datos validos   | 2        | Casos positivos  | bank, bet |
| Datos invalidos | 2        | Casos negativos  | entidad ajena, metodo no permitido |
| Limites         | 1        | Casos limite     | timestamps iguales |
| Casos extremos  | 1        | Casos extremos   | delete en audit log |

### Estrategia
- Datos estaticos: id\-entidad, propietario\-id
- Datos dinamicos: timestamps con Faker.js
- Limpieza: no aplica (solo append)

---
## Seguimiento de ejecucion

**Fecha de ejecucion:** Por definir
**Ambiente:** Previsualizacion (Vercel) - https://stake-ledger-git-main-ws-01.vercel.app
**Ejecutado por:** Por definir

**Resultados:**
- Total: [X]
- Aprobadas: [Y]
- Fallidas: [Z]
- Bloqueadas: [W]

**Bugs encontrados:**
- [Bug ID 1]: [Descripcion]

---

## Accion requerida

**@PO:**
- [ ] Definir permisos admin (acceso a historiales ajenos)
- [ ] Definir politica de retencion
- [ ] Definir mensajes/codigos de error

**@Dev:**
- [ ] Confirmar endpoint/paginacion y parametros
- [ ] Definir criterio de orden estable con timestamps iguales
- [ ] Confirmar bloqueo de DELETE/PATCH

**@QA:**
- [ ] Revisar parametrizacion propuesta
- [ ] Preparar datos de prueba en previsualizacion
- [ ] Ajustar casos cuando haya respuestas

---

**Proximos pasos:**
1. PO/Dev responden preguntas criticas
2. QA ajusta ACs y casos
3. Dev inicia implementacion con reglas claras

---

**Documentacion:**
`.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-16-immutable-history/acceptance-test-plan.md`
