# Feature Test Plan: EPIC-SL-27 - Recommendations and Insights

**Fecha:** 2026-03-21
**QA Lead:** AI-Generated
**Epic Jira Key:** SL-27
**Status:** In Review

---

## Contexto y objetivo
Esta epica habilita la publicacion de recomendaciones con datos normalizados e ICP, un feed filtrable por pre-match y live, adhesion a recomendaciones con precarga de apuesta y metricas basicas. El objetivo del testing es garantizar calidad de datos, performance del feed, trazabilidad hacia el ledger y una UX confiable para seguir recomendaciones.

---

## Alcance de pruebas
**In scope**
- Publicacion de recomendaciones normalizadas (SL-28)
- Feed filtrable por pre-match y live (SL-29)
- Adhesion y precarga de apuesta desde recomendacion (SL-30)
- Metricas basicas (yield cash, yield operativo, win rate) (SL-31)

**Out of scope (esta epica)**
- Notificaciones push en tiempo real
- Analiticas avanzadas y segmentadas

---

## Estrategia QA
**Niveles de prueba**
- Unit: validaciones de normalizacion y reglas de negocio
- Integration: feed + filtros, precarga con ledger, metrics por bank
- E2E: flujos principales por rol (admin/publicar, usuario/consumir/seguir)
- API: endpoints de recomendaciones, feed, adhesion y metricas

**Tipos de prueba**
- Positive, negative y boundary en cada story
- Validacion de roles (admin/editor vs usuario)
- Performance basico del feed (tiempo de respuesta)
- Seguridad basica de permisos (publicacion solo admin/editor)

---

## Areas criticas
- Normalizacion e ICP: consistencia de datos publicados
- Feed filtrable: exactitud del filtro pre-match/live
- Adhesion y precarga: trazabilidad correcta hacia el ledger
- Metricas: calculo y visualizacion correctos por bank
- Permisos: solo admin/editor publica recomendaciones

---

## Riesgos y mitigaciones
**Riesgo tecnico 1: datos inconsistentes en recomendaciones**
- Impacto: Alto | Probabilidad: Media
- Mitigacion: pruebas de validacion/normalizacion + API contract tests

**Riesgo tecnico 2: feed lento por filtros**
- Impacto: Medio | Probabilidad: Media
- Mitigacion: pruebas de performance basicas y limites en filtros

**Riesgo de negocio 1: recomendaciones no trazables al ledger**
- Impacto: Alto | Probabilidad: Media
- Mitigacion: integration tests entre recomendacion y precarga de apuesta

**Riesgo de negocio 2: metricas incorrectas afectan decisiones**
- Impacto: Alto | Probabilidad: Media
- Mitigacion: casos de prueba con datos controlados y validacion de calculos

**Riesgo de integracion: recomendacion -> precarga -> ledger**
- Impacto: Alto | Probabilidad: Media
- Mitigacion: pruebas E2E y verificacion de registros creados

---

## Dependencias
**Internas**
- EPIC-SL-17 Catalog and Normalization
- EPIC-SL-11 Bets Ledger

**Externas**
- Ninguna

---

## Enfoque de pruebas por story
### SL-28 Publicar recomendaciones
- Enfasis: validaciones de normalizacion, campos ICP, permisos admin/editor
- Pruebas: UI + API + integration con eventos asociados

### SL-29 Feed filtrable
- Enfasis: exactitud de filtros pre-match/live, orden y paginacion si aplica
- Pruebas: UI + API + performance basica

### SL-30 Adhesion y precarga
- Enfasis: precarga correcta, mapeo de campos, trazabilidad hacia ledger
- Pruebas: E2E + integration + API

### SL-31 Metricas basicas
- Enfasis: calculos de yield cash, yield operativo, win rate por bank
- Pruebas: UI + API + validacion con datos controlados

---

## Resumen de casos de prueba estimados
### SL-28 (Publicar recomendaciones)
**Complejidad:** Alta
**Estimados:** 16
- Positive: 5
- Negative: 5
- Boundary: 3
- Integration/API: 3
**Parametrizacion recomendada:** Si, para combinaciones de datos normalizados e ICP

### SL-29 (Feed filtrable)
**Complejidad:** Media
**Estimados:** 13
- Positive: 4
- Negative: 4
- Boundary: 3
- Integration/API: 2
**Parametrizacion recomendada:** Si, para variantes de filtro y estados pre/live

### SL-30 (Adhesion y precarga)
**Complejidad:** Alta
**Estimados:** 16
- Positive: 5
- Negative: 5
- Boundary: 3
- Integration/API: 3
**Parametrizacion recomendada:** Si, para combinaciones de seleccion y montos

### SL-31 (Metricas basicas)
**Complejidad:** Media
**Estimados:** 12
- Positive: 4
- Negative: 4
- Boundary: 2
- Integration/API: 2
**Parametrizacion recomendada:** No, pocos escenarios con reglas distintas

### Total estimado epica
**Total:** 57 casos

---

## Datos de prueba
- Roles: admin/editor para publicacion, usuario para consumo
- Datos normalizados con variaciones de ICP (definir campos y validaciones)
- Eventos asociados a recomendaciones
- Bets de prueba para precarga y calculo de metricas
- Datos limite: campos requeridos vacios, valores min/max, formatos invalidos

---

## Ambiguedades y vacios
- Definicion exacta de campos ICP y reglas de validacion
- Formato esperado de precarga (campos obligatorios y mapeo al ledger)
- Definicion exacta de calculos para yield cash, yield operativo y win rate
- Umbrales de performance aceptables para el feed (tiempo de respuesta)

---

## Entry/Exit criteria
**Entry**
- Story implementada y desplegada en staging
- Unit tests pasando para validaciones criticas
- Datos de prueba disponibles (recomendaciones, eventos, bets)

**Exit**
- Casos criticos/alta prioridad 100% passing
- Sin bugs criticos/altos abiertos
- Validacion de integraciones clave completada

---

## Riesgos abiertos
- Dependencias con EPIC-SL-17 y EPIC-SL-11 pueden bloquear pruebas end-to-end
- Sin definicion de ICP y formulas de metricas no se puede cerrar testing

---

## Herramientas sugeridas
- UI/E2E: Playwright
- API: Postman/Newman o Playwright API
- Datos: factories/Faker.js

---

## Documentos relacionados
- `.context/PBI/epics/EPIC-SL-27-recommendations-insights/epic.md`
- `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-28-*/story.md`
- `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-29-*/story.md`
- `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-30-*/story.md`
- `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-31-*/story.md`
