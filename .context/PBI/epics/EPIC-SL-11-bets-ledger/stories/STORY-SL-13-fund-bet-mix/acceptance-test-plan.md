## Plan de Pruebas de Aceptacion - Generado 2026-03-11

**Ingeniero QA:** AI-Generated
**Estado:** Borrador - Pendiente de revision PO/Dev

---

# Plan de Pruebas de Aceptacion: STORY-SL-13 - Financiacion con mix de pockets

**Fecha:** 2026-03-11
**Ingeniero QA:** AI-Generated
**Jira Key de la historia:** SL-13
**Epica:** EPIC-SL-11 - Bets Ledger
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio
**Persona afectada:**
- **Primario:** Carlos Vega - necesita flexibilidad para financiar apuestas segun disponibilidad.
- **Secundario:** Laura Rios - optimiza pockets con reglas claras de freebet.

**Valor de negocio:**
- **Propuesta de valor:** financiamiento mixto para optimizar uso de fondos.
- **Impacto en KPIs:** aumenta uso de pockets y consistencia del ledger.

**Recorrido de usuario relacionado:**
- Recorrido: Registro y primera apuesta
- Paso: Paso de confirmacion de financiamiento

---

### Contexto tecnico
**Componentes de arquitectura:**

**Frontend:**
- Componentes: UI de mix de fondos con validacion de sumas.
- Paginas/Rutas: por definir (no especificadas en SRS).
- Estado: por definir (no especificado).

**Backend:**
- Endpoints API: POST /api/bets/{betId}/fund (por confirmar en contratos), GET /api/bets/{betId}.
- Servicios: validacion de sumatoria, reglas de freebet, reserva por pocket.
- Base de datos: bet_funding, bank_pockets, transactions, audit_logs.

**Servicios externos:**
- Ninguno.

**Puntos de integracion:**
- Frontend -> Backend API (financiacion).
- Backend -> Base de datos (desglose por pocket, ledger).
- Backend -> Auth/RLS (propiedad del ticket/bank).

---

### Analisis de complejidad
**Complejidad general:** Media

**Factores de complejidad:**
- Logica de negocio: Alta - reglas de freebet y sumatoria exacta.
- Integracion: Media - API + DB + ledger.
- Validaciones: Alta - sumas, negativos, balances.
- UI: Media - inputs multiples con validacion.

**Esfuerzo de pruebas estimado:** Medio-Alto
**Razon:** multiples validaciones y dependencia del ledger.

---

### Contexto a nivel epic (desde Feature Test Plan)
**Riesgos criticos ya identificados:**
- Reglas de freebet pueden producir balances incorrectos.
  - **Relevancia:** impacta directamente la financiacion y retornos.

**Puntos de integracion del epic:**
- Frontend ↔ Backend API: ✅ Aplica (financiacion).
- Backend ↔ Base de datos: ✅ Aplica (pockets, ledger, audit).
- Backend ↔ Auth/RLS: ✅ Aplica (ownership).

**Preguntas criticas a nivel epic:**
**Para PO:**
- Reglas exactas de retorno de freebet
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta historia:** define validacion y resultados de freebet.

**Para Dev:**
- No hay respuestas a nivel epic que cambien esta historia.

**Estrategia de pruebas del epic:**
- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Aplicacion en esta historia:** unitarias (sumatoria/reglas), integracion (API-DB), E2E (mix), API (fund).

**Resumen:**
- **Rol en el epic:** define el desglose de financiamiento.
- **Riesgos heredados:** reglas de freebet y consistencia de ledger.
- **Consideraciones unicas:** tolerancia de redondeo y mixes extremos.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas
**Ambiguedad 1:** reglas de retorno de freebet
- **Ubicacion:** AC Escenario 3
- **Pregunta:** como se calcula retorno y en que casos se bloquea?
- **Impacto:** no se puede validar freebet sin reglas claras.
- **Sugerencia:** definir tabla de ejemplos de retorno.

**Ambiguedad 2:** tolerancia de redondeo
- **Ubicacion:** Reglas de negocio (sumatoria exacta)
- **Pregunta:** se permite tolerancia por centavos?
- **Impacto:** pruebas de sumatoria en decimales.
- **Sugerencia:** definir precision y tolerancia.

**Ambiguedad 3:** pockets permitidos en SL-13
- **Ubicacion:** Alcance
- **Pregunta:** se permite 100% freebet/bonus o solo combinaciones?
- **Impacto:** casos positivos/negativos.
- **Sugerencia:** explicitar combinaciones permitidas.

### Brechas / Informacion faltante
**Brecha 1:** endpoint y payload definitivos
- **Tipo:** Detalle tecnico
- **Por que es critico:** no podemos validar contrato API.
- **Sugerencia:** confirmar endpoint en api-contracts.yaml.

**Brecha 2:** mensajes/codigos de error
- **Tipo:** Criterios de aceptacion
- **Por que es critico:** validacion de errores en API/UI.
- **Sugerencia:** definir codigos/mensajes por regla.

### Casos extremos no cubiertos
**Caso extremo 1:** montos negativos
- **Escenario:** cash < 0 o bonus < 0
- **Comportamiento esperado:** rechazo por validacion
- **Criticidad:** Alta
- **Accion:** agregar a AC y casos de prueba

**Caso extremo 2:** mix 100% freebet
- **Escenario:** freebet = stake_amount
- **Comportamiento esperado:** permitido? (por definir)
- **Criticidad:** Media
- **Accion:** preguntar a PO

**Caso extremo 3:** saldo insuficiente por pocket
- **Escenario:** bonus solicitado > balance bonus
- **Comportamiento esperado:** rechazo
- **Criticidad:** Alta
- **Accion:** agregar a casos de prueba

### Validacion de testeabilidad
**Es testeable como esta?** ⚠️ Parcialmente
**Issues:**
- [ ] Reglas de freebet no definidas
- [ ] Tolerancia de redondeo no definida
- [ ] Endpoint/payload no confirmados

**Recomendaciones:**
- Definir reglas de freebet
- Definir precision y tolerancia
- Confirmar contrato API

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Financiacion valida con mix
**Tipo:** Positivo
**Prioridad:** Critico
- **Dado:** ticket con stake_amount definido y balances suficientes
- **Cuando:** cash + bonus + freebet = stake_amount
- **Entonces:** se acepta, se registra desglose y se reservan fondos por pocket

---

### Escenario 2: Sumatoria incorrecta
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** ticket con stake_amount definido
- **Cuando:** la suma de montos != stake_amount
- **Entonces:** se rechaza con error de validacion y sin cambios en DB

---

### Escenario 3: Freebet sin reglas configuradas
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** freebet_amount > 0
- **Cuando:** reglas de retorno no configuradas
- **Entonces:** se bloquea la operacion y se muestra mensaje

---

### Escenario 4: Saldo insuficiente en un pocket
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** ticket con stake_amount definido
- **Cuando:** un pocket no tiene saldo suficiente
- **Entonces:** se rechaza con error de validacion

---

### Escenario 5: Montos negativos o todos en cero
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** ticket con stake_amount definido
- **Cuando:** algun monto < 0 o todos los montos = 0
- **Entonces:** se rechaza con error de validacion

---
## Paso 4: Diseno de pruebas

### Cobertura
**Total de casos:** 10
**Desglose:**
- Positivos: 2
- Negativos: 5
- Limites: 1
- Integracion: 1
- API: 1

**Razon:** cubre reglas de sumatoria, freebet y saldos por pocket.

---

### Oportunidades de parametrizacion
**Recomendada:** ✅ Si

**Grupo 1: Mix de fondos**
- **Base:** financiacion valida
- **Parametros:** cash, bonus, freebet

| Cash | Bonus | Freebet | Resultado esperado |
| ---- | ----- | ------- | ------------------ |
| 50   | 0     | 0       | Acepta             |
| 30   | 20    | 0       | Acepta             |
| 20   | 10    | 20      | Acepta             |

**Grupo 2: Sumatorias invalidas**
- **Base:** sumatoria incorrecta
- **Parametros:** cash, bonus, freebet

| Cash | Bonus | Freebet | Resultado esperado |
| ---- | ----- | ------- | ------------------ |
| 40   | 10    | 0       | Rechaza            |
| 10   | 10    | 10      | Rechaza            |

**Beneficio:** reduce duplicacion y cubre combinaciones clave.

---

### Nomenclatura de esquemas de prueba
Formato: "Validar <comportamiento> <condicion>"

### Esquemas de prueba

#### Validar financiacion con mix valido y sumatoria exacta
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critico
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Precondiciones:**
- Ticket con stake_amount definido
- Balances suficientes por pocket

**Pasos:**
1. Enviar request de financiacion con cash/bonus/freebet
2. Verificar respuesta y desglose

**Resultado esperado:**
- Codigo de estado 200/201 (segun contrato)
- Desglose registrado
- Reservas aplicadas por pocket

---

#### Validar rechazo por sumatoria incorrecta
**Escenario relacionado:** Escenario 2
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 2)

**Resultado esperado:**
- Codigo de estado 400
- Mensaje/codigo de error por definir
- Sin cambios en DB

---

#### Validar bloqueo por freebet sin reglas
**Escenario relacionado:** Escenario 3
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 409/422 (por definir)
- Mensaje de bloqueo

---

#### Validar rechazo por saldo insuficiente
**Escenario relacionado:** Escenario 4
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 400
- Sin cambios en DB

---

#### Validar rechazo por montos negativos o cero
**Escenario relacionado:** Escenario 5
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 400
- Sin cambios en DB

---

#### Validar financiacion desde UI con validacion de suma
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Media
**Nivel de prueba:** E2E
**Parametrizado:** ❌ No

**Resultado esperado:**
- UI muestra sumatoria correcta y confirma financiacion

---

#### Validar tolerancia de redondeo en sumatoria
**Escenario relacionado:** Escenario 2
**Tipo:** Limite
**Prioridad:** Media
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Comportamiento por definir (tolerancia)

---

## Casos de integracion

### Integracion 1: Frontend ↔ Backend API
**Punto:** UI -> endpoint de financiacion
**Tipo:** Integracion
**Prioridad:** Alta

**Resultado esperado:**
- Flujo completo sin perdida de datos

---

## Resumen de casos extremos

| Caso extremo                          | En historia original | Agregado a AC | Caso | Prioridad |
| ------------------------------------ | -------------------- | ------------- | ---- | --------- |
| Montos negativos                      | ❌ No               | ✅ Si         | ATP-EC01 | Alta |
| Mix 100% freebet                      | ❌ No               | ⚠️ Pendiente  | TBD  | Media |
| Saldo insuficiente por pocket         | ❌ No               | ✅ Si         | ATP-EC02 | Alta |
| Tolerancia de redondeo                | ❌ No               | ⚠️ Pendiente  | TBD  | Media |

---

## Resumen de datos de prueba

### Categorias
| Tipo            | Cantidad | Proposito        | Ejemplos |
| --------------- | -------- | ---------------- | -------- |
| Datos validos   | 3        | Casos positivos  | combinaciones cash/bonus/freebet |
| Datos invalidos | 3        | Casos negativos  | sumatoria != stake_amount |
| Limites         | 1        | Casos limite     | redondeo por centavos |
| Casos extremos  | 2        | Casos extremos   | montos negativos, saldo insuficiente |

### Estrategia
- Datos estaticos: ticket_id, bank_id de prueba
- Datos dinamicos: montos con Faker.js
- Limpieza: eliminar registros de financiacion

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
- [ ] Definir reglas de retorno de freebet
- [ ] Definir tolerancia de redondeo de sumas
- [ ] Confirmar si se permite 100% freebet o 100% bonus

**@Dev:**
- [ ] Confirmar endpoint/payload de financiacion en API
- [ ] Definir codigos de error
- [ ] Confirmar idempotencia en doble envio

**@QA:**
- [ ] Revisar parametrizacion propuesta
- [ ] Preparar datos de prueba en preview
- [ ] Ajustar casos cuando haya respuestas

---

**Proximos pasos:**
1. PO/Dev responden preguntas criticas
2. QA ajusta ACs y casos
3. Dev inicia implementacion con reglas claras

---

**Documentacion:**
`.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-13-fund-bet-mix/acceptance-test-plan.md`
