## Plan de Pruebas de la Feature - Generado 2026-03-11

**Lider QA:** AI-Generated
**Estado:** Borrador - Pendiente de revision del equipo

---

# Plan de Pruebas de la Feature: EPIC-SL-11 - Bets Ledger

**Fecha:** 2026-03-11
**Lider QA:** AI-Generated
**Jira Key de la Epica:** SL-11
**Estado:** Borrador

---

## Analisis de Contexto de Negocio

### Valor de Negocio
Esta epica habilita el registro y liquidacion end-to-end de apuestas con trazabilidad completa. El valor principal es asegurar balances confiables en cash/bonus/freebet y un historial auditable para decisiones racionales y control de riesgo.

**Propuesta de valor clave:**
- Control real del bank con ledger y auditoria inmutable.
- Registro de apuestas con stake recomendado y reglas de riesgo claras.

**Metricas de exito (KPIs):**
- 200 usuarios activos en 60 dias con al menos 3 registros.
- 30% de usuarios crean bank y registran 5 apuestas en 14 dias.

**Impacto en usuarios:**
- Carlos Vega (recreacional disciplinado): registro simple de tickets y balances claros por pocket.
- Laura Rios (avanzada data-driven): historico auditable con cashouts parciales consistentes.
- Miguel Santos (tipster): trazabilidad confiable para que las apuestas seguidas no distorsionen el ledger.

**Recorridos criticos de usuario:**
- Recorrido 1: Registro y primera apuesta.
- Recorrido 2: Meta dinamica (pasos de registro y liquidacion impactan el recalculo).
- Recorrido 3: Seguir una recomendacion del feed (registro de ticket con datos precargados).

---

## Analisis de Arquitectura Tecnica

### Componentes involucrados
**Frontend:**
- Formulario de registro de ticket con legs, odds y stake recomendado.
- UI de mix de fondos (cash/bonus/freebet).
- UI de liquidacion (selector de resultado y monto).
- UI de cashout parcial.
- Vista de historial/audit log por entidad.

**Backend:**
- POST /api/bets (crear ticket).
- GET /api/bets y GET /api/bets/{betId} (consulta de tickets).
- POST /api/bets/{betId}/settle (liquidacion).
- POST /api/bets/{betId}/cashout (cashout parcial).
- Servicio de stake/cap, settlement y cashout.
- Registro de eventos en audit log.

**Base de datos:**
- Tablas: bets, bet_legs, bet_cashouts, bank_pockets, transactions, audit_logs.
- Queries criticos: validacion cap 40%, actualizacion de pockets y transacciones, append-only en audit_logs.

**Servicios externos:**
- Ninguno.

### Puntos de integracion (criticos para pruebas)
**Puntos internos de integracion:**
- Frontend <-> Backend API (bets/settle/cashout).
- Backend <-> Base de datos (pockets, ledger, audit).
- Backend <-> Auth/RLS (ownership y permisos).

**Puntos externos de integracion:**
- No aplica.

**Flujo de datos:**
```
User -> Frontend -> POST /api/bets -> DB (bets, bet_legs, transactions, audit_logs)
User -> Frontend -> POST /api/bets/{betId}/settle -> DB (pockets, transactions, audit_logs)
User -> Frontend -> POST /api/bets/{betId}/cashout -> DB (bet_cashouts, bets, transactions, audit_logs)
```

---

## Analisis de Riesgos

### Riesgos tecnicos
#### Riesgo 1: Calculo incorrecto de stake/cap y reglas de freebet
- Impacto: Alto
- Probabilidad: Media
- Area afectada: Backend, Base de datos
- Estrategia de mitigacion:
  - Pruebas unitarias para stake/cap y freebet
  - Pruebas de integracion de balances en pockets
- Cobertura requerida: escenarios de cap, odds y funding mix

#### Riesgo 2: Cashout parcial rompe trazabilidad del ledger
- Impacto: Alto
- Probabilidad: Media
- Area afectada: Backend, Base de datos
- Estrategia de mitigacion:
  - Pruebas de integridad (ticket A cerrado, ticket B abierto)
  - Verificacion de transacciones y audit log
- Cobertura requerida: cashout parcial con montos limite y validaciones de estado

#### Riesgo 3: Auditoria no inmutable o acceso indebido
- Impacto: Alto
- Probabilidad: Baja
- Area afectada: Base de datos, Integracion
- Estrategia de mitigacion:
  - Pruebas de permisos (RLS) y append-only
  - Verificacion de bloqueo a edit/delete
- Cobertura requerida: intentos de modificacion, acceso por owner

### Riesgos de negocio
#### Riesgo 1: Balances incorrectos por settlement o freebet
- Impacto en negocio: reduce confianza y adopcion
- Impacto en usuarios: recreacionales y avanzados pierden trazabilidad
- Probabilidad: Media
- Estrategia de mitigacion:
  - Validaciones de calculo y consistencia de datos
  - Reglas de negocio explicitas en SRS
- Validacion de criterios de aceptacion: asegurar cobertura de win/lose/void/half

#### Riesgo 2: Cashout parcial mal interpretado por el usuario
- Impacto en negocio: confusion y soporte elevado
- Impacto en usuarios: usuarios avanzados no confian en el historial
- Probabilidad: Media
- Estrategia de mitigacion:
  - UX claro sobre ticket A vs B
  - Pruebas de UI y mensajes

### Riesgos de integracion
#### Riesgo de integracion 1: Operaciones no atomicas en ledger/pockets
- Punto de integracion: API <-> Base de datos
- Que puede fallar: desbalance por fallos parciales en transacciones
- Impacto: Alto
- Mitigacion:
  - Pruebas de integracion con fallos simulados
  - Validar transacciones en DB

---
## Analisis critico y preguntas para PO/Dev

### Ambiguedades identificadas
**Ambiguedad 1:** Comportamiento cuando stake recomendado supera cap
- Encontrado en: STORY-SL-12
- Pregunta para PO: se ajusta automaticamente el stake o se bloquea el registro?
- Impacto si no se aclara: UX inconsistente y pruebas ambiguas

**Ambiguedad 2:** Reglas exactas de retorno de freebet
- Encontrado en: STORY-SL-13 / STORY-SL-14
- Pregunta para PO: el retorno incluye stake o solo ganancia? como aplica en half_win/half_loss?
- Impacto si no se aclara: balances incorrectos y fallos de settlement

**Ambiguedad 3:** Validacion y origen de settlementAmount
- Encontrado en: STORY-SL-14
- Pregunta para Dev: el backend calcula settlementAmount o valida el recibido del cliente?
- Impacto si no se aclara: inconsistencias entre UI y backend

**Ambiguedad 4:** Logica de division en cashout parcial
- Encontrado en: STORY-SL-15
- Pregunta para Dev: como se asignan odds/legs y funding al ticket B? se hereda el ticket original?
- Impacto si no se aclara: trazabilidad y resultados incorrectos

**Ambiguedad 5:** Exposicion del audit log
- Encontrado en: STORY-SL-16
- Pregunta para Dev: cual es el endpoint y modelo de acceso para consultar audit_logs?
- Impacto si no se aclara: imposibilidad de probar UI/API de historial

### Informacion faltante
**Falta 1:** Reglas de redondeo y precision monetaria
- Necesario para: validacion de balances y settlement
- Sugerencia: definir precision por currency en SRS

**Falta 2:** Limites de numero de legs por ticket
- Necesario para: pruebas de limites y performance
- Sugerencia: explicitar en story o SRS

**Falta 3:** Matriz de permisos para auditoria
- Necesario para: seguridad y RLS
- Sugerencia: detallar roles/acciones permitidas

### Mejoras sugeridas (antes de implementar)
**Mejora 1:** Agregar regla explicita para cap en stake recomendado
- Historia afectada: STORY-SL-12
- Estado actual: indica "ajusta o bloquea" sin decision
- Cambio sugerido: definir comportamiento unico y mensaje UI
- Beneficio: reduce ambiguedad y simplifica pruebas

**Mejora 2:** Documentar reglas de freebet y resultados parciales
- Historia afectada: STORY-SL-13 / STORY-SL-14
- Estado actual: reglas incompletas
- Cambio sugerido: tabla de ejemplos con retorno esperado
- Beneficio: evita desbalances y bugs de settlement

**Mejora 3:** Definir modelo de cashout parcial y trazabilidad
- Historia afectada: STORY-SL-15
- Estado actual: no define asignacion de legs/odds
- Cambio sugerido: especificar estructura del ticket B y ledger entries
- Beneficio: asegura consistencia y auditoria

**Mejora 4:** Especificar API de audit log
- Historia afectada: STORY-SL-16
- Estado actual: sin endpoint en api-contracts
- Cambio sugerido: agregar endpoint y permisos
- Beneficio: habilita pruebas y uso de UI

---

## Estrategia de pruebas

### Alcance
**En alcance:**
- Pruebas funcionales (UI, API, Base de datos) para bets, funding, settlement, cashout, audit log
- Pruebas de integracion (frontend-backend, backend-db, auth/RLS)
- Pruebas no funcionales (performance, seguridad, accesibilidad)
- Cross-browser (Chrome, Firefox, Safari, Edge)
- Responsividad movil (iOS Safari, Android Chrome)
- Validacion de contrato API para endpoints de bets

**Fuera de alcance (para esta epica):**
- OCR de tickets
- Integraciones con casas de apuestas
- Liquidacion automatica externa y disputas
- Exportaciones avanzadas de auditoria

### Niveles de prueba
#### Pruebas unitarias
- Meta de cobertura: > 80% de coverage
- Foco:
  - Calculo de stake/cap
  - Reglas de freebet y settlement
  - Validaciones de monto/estado
- Responsabilidad: Dev (QA valida que existan)

#### Pruebas de integracion
- Meta de cobertura: todos los puntos de integracion identificados
- Foco:
  - Frontend <-> Backend API (bets/settle/cashout)
  - Backend <-> Base de datos (pockets, ledger, audit)
  - Backend <-> Auth/RLS
- Responsabilidad: QA + Dev

#### Pruebas end-to-end (E2E)
- Meta de cobertura: recorridos criticos completos
- Herramienta: Playwright
- Foco:
  - Registro de ticket con stake recomendado
  - Liquidacion de apuestas
  - Cashout parcial con division de tickets
- Responsabilidad: QA

#### Pruebas de API
- Meta de cobertura: 100% de endpoints de esta epica (api-contracts.yaml)
- Herramienta: Postman/Newman o Playwright API
- Foco:
  - Validacion de contrato (request/response)
  - Codigos de estado y errores
  - Auth/Authorization
- Responsabilidad: QA

### Tipos de prueba por historia
**Positivas:**
- Happy path
- Variaciones validas de datos

**Negativas:**
- Inputs invalidos
- Faltan campos requeridos
- Acceso no autorizado
- Violaciones de limites

**De limites:**
- Valores min/max
- Cero y null
- Edge cases de dominio

**Exploratorias:**
- Calculo de stake/cap y reglas de freebet
- Cashout parcial con combinaciones de funding
- Auditoria y trazabilidad post-settlement

---

## Resumen de casos por historia

### STORY-SL-12: Registro de ticket con stake
**Complejidad:** Alta
**Casos estimados:** 14
- Positivos: 4
- Negativos: 5
- Limites: 3
- Integracion: 1
- API: 1

**Razon del estimado:** reglas de stake/cap, validaciones de odds/legs y reservas de fondos con ledger.
**Pruebas parametrizadas recomendadas:** Si (odds, stake levels, cash disponible)

---

### STORY-SL-13: Financiacion con mix
**Complejidad:** Media
**Casos estimados:** 10
- Positivos: 3
- Negativos: 3
- Limites: 2
- Integracion: 1
- API: 1

**Razon del estimado:** combinaciones de pockets y reglas de freebet.
**Pruebas parametrizadas recomendadas:** Si (mix de cash/bonus/freebet)

---

### STORY-SL-14: Liquidacion de apuestas
**Complejidad:** Alta
**Casos estimados:** 14
- Positivos: 4
- Negativos: 4
- Limites: 3
- Integracion: 2
- API: 1

**Razon del estimado:** multiples resultados, reglas de retorno y actualizacion de balances.
**Pruebas parametrizadas recomendadas:** Si (resultados win/lose/void/half)

---

### STORY-SL-15: Cashout parcial
**Complejidad:** Alta
**Casos estimados:** 12
- Positivos: 3
- Negativos: 4
- Limites: 3
- Integracion: 1
- API: 1

**Razon del estimado:** division de ticket, consistencia de ledger y validaciones de estado.
**Pruebas parametrizadas recomendadas:** Si (cashout_amount, remaining_stake)

---

### STORY-SL-16: Historial inmutable
**Complejidad:** Media
**Casos estimados:** 9
- Positivos: 3
- Negativos: 3
- Limites: 1
- Integracion: 2
- API: 0

**Razon del estimado:** controles de inmutabilidad y permisos sobre audit log.
**Pruebas parametrizadas recomendadas:** No (enfocado en permisos y estados)

---

### Total estimado de casos para la epica
**Total:** 59
**Desglose:**
- Positivos: 17
- Negativos: 19
- Limites: 12
- Integracion: 7
- API: 4

---
## Requisitos de datos de prueba

### Estrategia de datos
**Datos validos:**
- Usuarios recreacionales y avanzados con banks activos.
- Banks con pockets (cash/bonus/freebet) y balance suficiente.
- Tickets con 1-3 legs, odds > 1.0, stake dentro de cap.

**Datos invalidos:**
- Odds <= 1.0
- Montos negativos o suma distinta al stake
- cashout_amount <= 0 o > stake
- Acceso a tickets de otro usuario

**Datos de limites:**
- Cap 40% del cash exacto
- Stake en 0 o valores minimos
- Valores altos de odds

**Gestion de datos de prueba:**
- Usar Faker.js para datos realistas
- Crear data factories para banks, bets y legs
- No hardcodear datos estaticos
- Limpiar data de prueba al finalizar

---

### Entornos de prueba
**Preview (Vercel):**
- URL: https://stake-ledger-git-main-ws-01.vercel.app
- Base de datos: Supabase (proyecto: StakeLedger DDBB; URL de proyecto: https://ziqbjajprkoukezhgidr.supabase.co)
- Servicios externos: Mocked
- Proposito: Entorno principal de pruebas

**Produccion:**
- URL: Por definir
- Proposito: Solo smoke tests post-deployment
- Restricciones: Sin pruebas destructivas

---

## Criterios de entrada y salida

### Criterios de entrada (por historia)
Se puede iniciar QA cuando:
- [ ] Historia implementada y desplegada en preview
- [ ] Code review aprobado por 2+ reviewers
- [ ] Pruebas unitarias pasando (>80% coverage)
- [ ] Dev hizo smoke testing
- [ ] Sin bugs bloqueantes en dependencias
- [ ] Datos de prueba disponibles
- [ ] Documentacion API actualizada (si aplica)

### Criterios de salida (por historia)
Historia queda "Done" desde QA cuando:
- [ ] Todos los casos ejecutados
- [ ] Casos criticos/altos: 100% passing
- [ ] Casos medios/bajos: >=95% passing
- [ ] Bugs criticos/altos resueltos y verificados
- [ ] Bugs medios con plan de mitigacion
- [ ] Regresion aprobada
- [ ] NFRs validados
- [ ] Reporte de ejecucion compartido
- [ ] Issues conocidos documentados

### Criterios de salida de la epica
- [ ] Todas las historias cumplen criterios de salida
- [ ] Integracion entre historias completa
- [ ] E2E de recorridos criticos completo y passing
- [ ] Pruebas de contrato API completas
- [ ] Pruebas NFR completas
- [ ] Pruebas exploratorias completadas
- [ ] Sin bugs criticos/altos abiertos
- [ ] Aprobacion de QA

---

## Validacion de requisitos no funcionales

### Performance
**NFR-P-001:** Carga de pagina y tiempos de API
- Target: LCP p75 < 2.5s, TTI < 3.5s, API p95 < 500ms
- Enfoque: Lighthouse + monitoreo API en preview
- Herramientas: Lighthouse, Postman

### Seguridad
**NFR-S-001:** Auth y autorizacion
- Requisito: JWT, RBAC, RLS ownership
- Enfoque: pruebas negativas de auth y control de acceso
- Herramientas: Postman, pruebas manuales

### Usabilidad
**NFR-U-001:** WCAG 2.1 AA para formularios
- Requisito: navegacion por teclado, aria labels, contraste
- Enfoque: auditoria manual de accesibilidad

---

## Estrategia de regresion
**Alcance de regresion:**
- Banks y balances: depositos/retiros y calculos por pocket
- Metas: impacto del settlement en recalculo
- Recomendaciones: follow -> registro de bet
- Catalogo: datos de evento usados en legs

**Ejecucion de regresion:**
- Ejecutar suite automatizada antes de iniciar QA
- Re-ejecutar al finalizar todas las historias
- Enfocar en puntos de integracion identificados

---

## Estimacion de timeline de pruebas
**Duracion estimada:** 1 sprint (2 semanas)
**Desglose:**
- Diseno de casos: 3 dias
- Preparacion de datos: 2 dias
- Ejecucion por historia: 2 dias
- Regresion: 2 dias
- Buffer para fixes: 2 dias
- Pruebas exploratorias: 1 dia

**Dependencias:**
- Depende de: EPIC-SL-6 Banks and Balances
- Bloquea: EPIC-SL-05 Goals and Risk Advisor, EPIC-SL-06 Recommendations and Insights

---

## Herramientas e infraestructura
**Herramientas de QA:**
- E2E: Playwright
- API: Postman/Newman o Playwright API
- Unitarias: Vitest (frontend), Jest (backend)
- Performance: Lighthouse, WebPageTest
- Seguridad: OWASP ZAP (si aplica)
- Datos de prueba: Faker.js

**Integracion CI/CD:**
- [ ] Pruebas al crear PR
- [ ] Pruebas al hacer merge a main
- [ ] Pruebas al desplegar a preview
- [ ] Smoke tests al desplegar a produccion

**Gestion de pruebas:**
- Jira Xray para casos de prueba
- Reportes de ejecucion en Xray
- Bugs en Jira

---

## Metricas y reporting
**Metricas a trackear:**
- Casos ejecutados vs total
- Tasa de aprobacion
- Tasa de deteccion de bugs
- Tasa de fix
- Cobertura de unitarias
- Tiempo por historia

**Cadencia de reportes:**
- Diario: estado de ejecucion
- Por historia: reporte de cierre
- Por epica: sign-off de QA

---

## Notas y supuestos
**Supuestos:**
- Entorno preview disponible antes de iniciar pruebas
- Reglas de freebet y comportamiento del cap aclarados antes de ejecucion
- Endpoint/queries del audit log definidos

**Restricciones:**
- Sin integraciones externas para settlement/cashout
- Datos reales limitados en el MVP

**Limitaciones conocidas:**
- Sin cobertura OCR en esta epica
- Sin settlement automatico de proveedores

**Sesiones exploratorias:**
- Recomendadas: 2 sesiones antes de implementar
  - Sesion 1: validar stake/cap y funding mix con flujos mock
  - Sesion 2: validar split de cashout y trazabilidad

---

## Documentacion relacionada
- Epica: .context/PBI/epics/EPIC-SL-11-bets-ledger/epic.md
- Historias: .context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-*/story.md
- Business Model: .context/idea/business-model.md
- PRD: .context/PRD/
- SRS: .context/SRS/
- Arquitectura: .context/SRS/architecture-specs.md
- Contratos API: .context/SRS/api-contracts.yaml

---

## Accion requerida

**@PO:**
- [ ] Revisar ambiguedades e informacion faltante (Analisis critico)
- [ ] Responder preguntas criticas para PO
- [ ] Validar analisis de riesgos e impacto de negocio
- [ ] Confirmar alcance de pruebas

**@Dev:**
- [ ] Revisar riesgos tecnicos y mitigaciones
- [ ] Validar puntos de integracion
- [ ] Confirmar analisis de arquitectura
- [ ] Responder preguntas tecnicas

**@QA:**
- [ ] Revisar estrategia de pruebas y estimaciones
- [ ] Validar niveles y tipos de prueba por historia
- [ ] Confirmar requisitos de datos
- [ ] Preparar entornos y herramientas

---

**Proximos pasos:**
1. Equipo discute preguntas criticas en refinement
2. PO/Dev brindan respuestas y aclaraciones
3. QA inicia diseno de casos por historia (acceptance-test-plan.md)
4. Equipo valida criterios de entrada/salida antes del sprint
5. Dev inicia implementacion solo despues de resolver preguntas criticas

---

**Documentacion:** Plan completo tambien disponible en:
`.context/PBI/epics/EPIC-SL-11-bets-ledger/feature-test-plan.md`
