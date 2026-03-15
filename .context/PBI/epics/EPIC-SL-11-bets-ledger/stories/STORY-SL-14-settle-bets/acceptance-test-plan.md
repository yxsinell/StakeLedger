## Plan de Pruebas de Aceptacion - Generado 2026-03-15

**Ingeniero QA:** AI-Generated
**Estado:** Borrador - Pendiente de revision PO/Dev

---

# Plan de Pruebas de Aceptacion: STORY-SL-14 - Liquidacion de apuestas

**Fecha:** 2026-03-15
**Ingeniero QA:** AI-Generated
**Jira Key de la historia:** SL-14
**Epica:** EPIC-SL-11 - Bets Ledger
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio
**Persona afectada:**
- **Primario:** Carlos Vega - necesita ver saldos actualizados tras resultados.
- **Secundario:** Laura Rios - requiere trazabilidad y retornos correctos.

**Valor de negocio:**
- **Propuesta de valor:** liquidaciones consistentes que mantienen el bank confiable.
- **Impacto en KPIs:** reduce desbalances y aumenta confianza en el registro.

**Recorrido de usuario relacionado:**
- Recorrido: Registro y primera apuesta
- Paso: Paso de cierre y liquidacion del ticket

---

### Contexto tecnico
**Componentes de arquitectura:**

**Frontend:**
- Componentes: UI de liquidacion con selector de resultado.
- Paginas/Rutas: por definir (no especificadas en SRS).
- Estado: por definir (no especificado).

**Backend:**
- Endpoints API: POST /api/bets/{betId}/settle (segun contratos), GET /api/bets/{betId}.
- Servicios: validacion de estado abierto, calculo de retorno, reglas de freebet.
- Base de datos: bets, transactions, bank_pockets, audit_logs.

**Servicios externos:**
- Ninguno.

**Puntos de integracion:**
- Frontend -> Backend API (liquidacion).
- Backend -> Base de datos (ledger y pockets).
- Backend -> Auth/RLS (propiedad del ticket/bank).

---

### Analisis de complejidad
**Complejidad general:** Alta

**Factores de complejidad:**
- Logica de negocio: Alta - retornos por resultado y reglas freebet.
- Integracion: Alta - actualizacion de pockets y ledger.
- Validaciones: Alta - estado abierto, resultado permitido.
- UI: Media - selector de resultado y feedback.

**Esfuerzo de pruebas estimado:** Alto
**Razon:** multiples resultados y reglas de retorno por tipo.

---

### Contexto a nivel epic (desde Feature Test Plan)
**Riesgos criticos ya identificados:**
- Calculo de retorno puede producir balances incorrectos.
  - **Relevancia:** impacta directamente la liquidacion.
- Cashout parcial no aplica directamente a esta historia.

**Puntos de integracion del epic:**
- Frontend ↔ Backend API: ✅ Aplica (liquidacion).
- Backend ↔ Base de datos: ✅ Aplica (pockets, ledger, audit).
- Backend ↔ Auth/RLS: ✅ Aplica (ownership).

**Preguntas criticas a nivel epic:**
**Para PO:**
- Reglas exactas de retorno de freebet
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta historia:** define retorno en win/void/half.

**Para Dev:**
- No hay respuestas a nivel epic que cambien esta historia.

**Estrategia de pruebas del epic:**
- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Aplicacion en esta historia:** unitarias (retorno), integracion (API-DB), E2E (liquidacion), API (settle).

**Resumen:**
- **Rol en el epic:** actualiza balances al cerrar apuestas.
- **Riesgos heredados:** reglas de freebet y consistencia de ledger.
- **Consideraciones unicas:** half_win/half_loss y coherencia de settlement_amount.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas
**Ambiguedad 1:** reglas de half_win/half_loss
- **Ubicacion:** Notas
- **Pregunta:** como se calcula retorno parcial y redondeos?
- **Impacto:** no se puede validar retorno sin formula definida.
- **Sugerencia:** definir tabla de ejemplos por resultado.

**Ambiguedad 2:** settlement_amount origen
- **Ubicacion:** Workflow (ingresa resultado y monto)
- **Pregunta:** el cliente envia settlement_amount o lo calcula backend?
- **Impacto:** contratos y validaciones no deterministas.
- **Sugerencia:** definir fuente de verdad.

**Ambiguedad 3:** freebet en void
- **Ubicacion:** Reglas de negocio / Notas tecnicas
- **Pregunta:** se devuelve stake en freebet void o no?
- **Impacto:** reglas de retorno incompletas.
- **Sugerencia:** documentar reglas freebet por resultado.

### Brechas / Informacion faltante
**Brecha 1:** codigos/mensajes de error
- **Tipo:** Criterios de aceptacion
- **Por que es critico:** validacion de errores en API/UI.
- **Sugerencia:** definir codigos por resultado invalido o estado.

**Brecha 2:** limites de settlement_amount
- **Tipo:** Regla de negocio
- **Por que es critico:** pruebas de limites y coherencia.
- **Sugerencia:** definir rango permitido.

### Casos extremos no cubiertos
**Caso extremo 1:** apuesta ya liquidada
- **Escenario:** estado != abierto
- **Comportamiento esperado:** rechazo
- **Criticidad:** Alta
- **Accion:** agregar a AC y casos de prueba

**Caso extremo 2:** resultado no permitido
- **Escenario:** resultado = "cancelled"
- **Comportamiento esperado:** rechazo con error
- **Criticidad:** Alta
- **Accion:** agregar a casos de prueba

**Caso extremo 3:** freebet con half_loss
- **Escenario:** ticket financiado con freebet
- **Comportamiento esperado:** por definir
- **Criticidad:** Media
- **Accion:** preguntar a PO

### Validacion de testeabilidad
**Es testeable como esta?** ⚠️ Parcialmente
**Issues:**
- [ ] Reglas de half_win/half_loss no definidas
- [ ] Origen de settlement_amount no definido
- [ ] Reglas de freebet por resultado incompletas

**Recomendaciones:**
- Definir formulas de retorno
- Definir si settlement_amount es entrada o calculado
- Documentar freebet en win/void/half

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Liquidacion win
**Tipo:** Positivo
**Prioridad:** Critico
- **Dado:** apuesta abierta con stake_amount definido
- **Cuando:** se liquida como win con settlement_amount valido
- **Entonces:** se calcula retorno, se actualiza pocket y ledger

---

### Escenario 2: Liquidacion void
**Tipo:** Positivo
**Prioridad:** Alto
- **Dado:** apuesta abierta
- **Cuando:** se liquida como void
- **Entonces:** se devuelve el stake al pocket original y se registra en ledger

---

### Escenario 3: Liquidacion half_win/half_loss
**Tipo:** Limite
**Prioridad:** Alta
- **Dado:** apuesta abierta
- **Cuando:** se liquida como half_win o half_loss
- **Entonces:** aplica retorno parcial (por definir)

---

### Escenario 4: Resultado invalido
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** apuesta abierta
- **Cuando:** se envia resultado no permitido
- **Entonces:** se rechaza con error de validacion

---

### Escenario 5: Apuesta ya liquidada
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** apuesta en estado liquidado
- **Cuando:** se intenta liquidar nuevamente
- **Entonces:** se rechaza por estado

---
## Paso 4: Diseno de pruebas

### Cobertura
**Total de casos:** 11
**Desglose:**
- Positivos: 2
- Negativos: 4
- Limites: 2
- Integracion: 2
- API: 1

**Razon:** cubre resultados permitidos, estado de bet y reglas de retorno.

---

### Oportunidades de parametrizacion
**Recomendada:** ✅ Si

**Grupo 1: Resultados permitidos**
- **Base:** liquidacion con resultado valido
- **Parametros:** resultado, settlement_amount

| Resultado | settlement_amount | Resultado esperado |
| --------- | ----------------- | ------------------ |
| win       | 150               | Acepta             |
| lose      | 0                 | Acepta             |
| void      | 100               | Acepta             |

**Grupo 2: Resultados parciales**
- **Base:** half_win / half_loss
- **Parametros:** resultado, settlement_amount

| Resultado  | settlement_amount | Resultado esperado |
| ---------- | ----------------- | ------------------ |
| half_win   | 125               | Por definir        |
| half_loss  | 50                | Por definir        |

**Beneficio:** reduce duplicacion y cubre reglas por resultado.

---

### Nomenclatura de esquemas de prueba
Formato: "Validar <comportamiento> <condicion>"

### Esquemas de prueba

#### Validar liquidacion win con retorno correcto
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critico
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Precondiciones:**
- Apuesta abierta
- Ticket con stake_amount definido

**Pasos:**
1. Enviar POST /api/bets/{betId}/settle con resultado win
2. Verificar actualizacion de pocket y ledger

**Resultado esperado:**
- Codigo de estado 200/201 (segun contrato)
- Retorno correcto y ledger actualizado

---

#### Validar liquidacion void con devolucion de stake
**Escenario relacionado:** Escenario 2
**Tipo:** Positivo
**Prioridad:** Alto
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Resultado esperado:**
- Stake devuelto al pocket original
- Ledger actualizado

---

#### Validar liquidacion half_win/half_loss
**Escenario relacionado:** Escenario 3
**Tipo:** Limite
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 2)

**Resultado esperado:**
- Comportamiento por definir (retorno parcial)

---

#### Validar rechazo por resultado invalido
**Escenario relacionado:** Escenario 4
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 400
- Mensaje/codigo de error por definir

---

#### Validar rechazo por apuesta ya liquidada
**Escenario relacionado:** Escenario 5
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 409/422 (por definir)

---

#### Validar liquidacion desde UI con selector de resultado
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Media
**Nivel de prueba:** E2E
**Parametrizado:** ❌ No

**Resultado esperado:**
- UI confirma resultado y balances actualizados

---

#### Validar consistencia de ledger y pockets
**Escenario relacionado:** Escenario 1
**Tipo:** Integracion
**Prioridad:** Alta
**Nivel de prueba:** Integracion
**Parametrizado:** ❌ No

**Resultado esperado:**
- Movimientos y balances consistentes

---

## Casos de integracion

### Integracion 1: Frontend ↔ Backend API
**Punto:** UI -> POST /api/bets/{betId}/settle
**Tipo:** Integracion
**Prioridad:** Alta

**Resultado esperado:**
- Flujo completo sin perdida de datos

### Integracion 2: Backend ↔ Base de datos
**Punto:** API -> transactions/bank_pockets
**Tipo:** Integracion
**Prioridad:** Alta

**Resultado esperado:**
- Actualizaciones atomicas en ledger y pockets

---

## Resumen de casos extremos

| Caso extremo                      | En historia original | Agregado a AC | Caso | Prioridad |
| -------------------------------- | -------------------- | ------------- | ---- | --------- |
| Apuesta ya liquidada             | ❌ No               | ✅ Si         | ATP-EC01 | Alta |
| Resultado no permitido           | ✅ Si               | ✅ Si         | ATP-EC02 | Alta |
| Freebet con half_loss            | ❌ No               | ⚠️ Pendiente  | TBD  | Media |
| Settlement_amount incoherente    | ❌ No               | ⚠️ Pendiente  | TBD  | Media |

---

## Resumen de datos de prueba

### Categorias
| Tipo            | Cantidad | Proposito        | Ejemplos |
| --------------- | -------- | ---------------- | -------- |
| Datos validos   | 3        | Casos positivos  | win/lose/void |
| Datos invalidos | 2        | Casos negativos  | resultado invalido, estado cerrado |
| Limites         | 2        | Casos limite     | half_win/half_loss |
| Casos extremos  | 2        | Casos extremos   | freebet half_loss, settlement incoherente |

### Estrategia
- Datos estaticos: bet_id, bank_id de prueba
- Datos dinamicos: settlement_amount con Faker.js
- Limpieza: revertir movimientos de prueba

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
- [ ] Definir reglas de half_win/half_loss
- [ ] Confirmar reglas de freebet por resultado (win/void/half)
- [ ] Definir mensajes/codigos de error

**@Dev:**
- [ ] Definir si settlement_amount es entrada o calculado
- [ ] Confirmar codigos de error por estado
- [ ] Confirmar idempotencia en doble envio

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
`.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-14-settle-bets/acceptance-test-plan.md`
