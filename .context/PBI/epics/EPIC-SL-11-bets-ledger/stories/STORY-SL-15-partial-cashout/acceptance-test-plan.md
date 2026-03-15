## Plan de Pruebas de Aceptacion - Generado 2026-03-15

**Ingeniero QA:** AI-Generated
**Estado:** Borrador - Pendiente de revision PO/Dev

---

# Plan de Pruebas de Aceptacion: STORY-SL-15 - Cashout parcial

**Fecha:** 2026-03-15
**Ingeniero QA:** AI-Generated
**Jira Key de la historia:** SL-15
**Epica:** EPIC-SL-11 - Bets Ledger
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio
**Persona afectada:**
- **Primario:** Carlos Vega - necesita liquidez parcial sin perder trazabilidad.
- **Secundario:** Laura Rios - requiere division clara del ticket para analisis.

**Valor de negocio:**
- **Propuesta de valor:** permite cashout parcial con trazabilidad completa.
- **Impacto en KPIs:** mejora uso del cashout y consistencia del ledger.

**Recorrido de usuario relacionado:**
- Recorrido: Registro y primera apuesta
- Paso: Paso de cashout parcial y division del ticket

---

### Contexto tecnico
**Componentes de arquitectura:**

**Frontend:**
- Componentes: UI de cashout parcial con validacion de monto.
- Paginas/Rutas: por definir (no especificadas en SRS).
- Estado: por definir (no especificado).

**Backend:**
- Endpoints API: POST /api/bets/{betId}/cashout (segun contratos), GET /api/bets/{betId}.
- Servicios: validacion de estado, division de ticket, movimientos en ledger.
- Base de datos: bets, bet_cashouts, transactions, audit_logs.

**Servicios externos:**
- Ninguno.

**Puntos de integracion:**
- Frontend -> Backend API (cashout parcial).
- Backend -> Base de datos (tickets A/B, ledger).
- Backend -> Auth/RLS (propiedad del ticket).

---

### Analisis de complejidad
**Complejidad general:** Alta

**Factores de complejidad:**
- Logica de negocio: Alta - division de ticket y saldo restante.
- Integracion: Alta - ledger y trazabilidad cruzada.
- Validaciones: Alta - montos, estado, ownership.
- UI: Media - inputs y feedback de division.

**Esfuerzo de pruebas estimado:** Alto
**Razon:** requiere validar split, ledger y consistencia entre tickets.

---

### Contexto a nivel epic (desde Feature Test Plan)
**Riesgos criticos ya identificados:**
- Cashout parcial puede romper trazabilidad y ledger si no es atomico.
  - **Relevancia:** impacta directamente esta historia.

**Puntos de integracion del epic:**
- Frontend ↔ Backend API: ✅ Aplica (cashout).
- Backend ↔ Base de datos: ✅ Aplica (tickets, ledger, audit).
- Backend ↔ Auth/RLS: ✅ Aplica (ownership).

**Preguntas criticas a nivel epic:**
**Para Dev:**
- Logica de division en cashout parcial
  - **Estado:** ⏳ Pendiente
  - **Impacto:** define herencia de legs/odds y funding.

**Estrategia de pruebas del epic:**
- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Aplicacion en esta historia:** unitarias (division), integracion (API-DB), E2E (cashout), API (cashout).

**Resumen:**
- **Rol en el epic:** divide tickets en cashout parcial.
- **Riesgos heredados:** trazabilidad y coherencia del ledger.
- **Consideraciones unicas:** herencia de legs/odds y funding en ticket B.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas
**Ambiguedad 1:** herencia de legs/odds
- **Ubicacion:** Alcance / Notas tecnicas
- **Pregunta:** ticket B hereda legs/odds y estado del ticket original?
- **Impacto:** no se pueden definir resultados esperados.
- **Sugerencia:** documentar estructura de ticket B.

**Ambiguedad 2:** cashout_amount y remaining_stake
- **Ubicacion:** Reglas de negocio
- **Pregunta:** se permite cashout_amount == stake_amount? (cashout total)
- **Impacto:** limites y rechazo.
- **Sugerencia:** definir reglas exactas.

**Ambiguedad 3:** funding heredado
- **Ubicacion:** Alcance
- **Pregunta:** el mix cash/bonus/freebet se copia a ticket B?
- **Impacto:** afecta ledger y retornos posteriores.
- **Sugerencia:** definir regla de herencia.

### Brechas / Informacion faltante
**Brecha 1:** codigos/mensajes de error
- **Tipo:** Criterios de aceptacion
- **Por que es critico:** validacion de errores en API/UI.
- **Sugerencia:** definir codigos por monto invalido y estado.

**Brecha 2:** reglas de trazabilidad en ledger
- **Tipo:** Regla de negocio
- **Por que es critico:** pruebas de auditoria e integracion.
- **Sugerencia:** definir relaciones entre ticket A y B.

### Casos extremos no cubiertos
**Caso extremo 1:** cashout_amount = 0
- **Escenario:** monto cero
- **Comportamiento esperado:** rechazo
- **Criticidad:** Alta
- **Accion:** agregar a AC y casos de prueba

**Caso extremo 2:** cashout_amount >= stake_amount
- **Escenario:** monto igual o mayor al stake
- **Comportamiento esperado:** rechazo
- **Criticidad:** Alta
- **Accion:** agregar a AC y casos de prueba

**Caso extremo 3:** ticket ya cerrado
- **Escenario:** estado cerrado
- **Comportamiento esperado:** rechazo
- **Criticidad:** Alta
- **Accion:** cubrir en AC

### Validacion de testeabilidad
**Es testeable como esta?** ⚠️ Parcialmente
**Issues:**
- [ ] Reglas de herencia no definidas
- [ ] Reglas de trazabilidad en ledger no definidas
- [ ] Codigos de error no definidos

**Recomendaciones:**
- Definir reglas de herencia (legs/odds/funding)
- Definir relaciones de ledger entre ticket A/B
- Definir codigos/mensajes de error

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Cashout parcial exitoso
**Tipo:** Positivo
**Prioridad:** Critico
- **Dado:** ticket abierto con stake_amount definido
- **Cuando:** cashout_amount valido y remaining_stake > 0
- **Entonces:** ticket A se cierra, ticket B se crea con remaining_stake y se registran movimientos

---

### Escenario 2: Cashout con monto invalido
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** ticket abierto
- **Cuando:** cashout_amount <= 0 o cashout_amount >= stake_amount
- **Entonces:** se rechaza con error de validacion

---

### Escenario 3: Ticket ya cerrado
**Tipo:** Negativo
**Prioridad:** Alta
- **Dado:** ticket cerrado
- **Cuando:** intenta cashout parcial
- **Entonces:** se rechaza por estado invalido

---

### Escenario 4: Herencia de legs/odds/funding en ticket B
**Tipo:** Limite
**Prioridad:** Media
- **Dado:** ticket abierto con legs y funding mixto
- **Cuando:** se ejecuta cashout parcial
- **Entonces:** ticket B hereda estructura (por definir)

---
## Paso 4: Diseno de pruebas

### Cobertura
**Total de casos:** 10
**Desglose:**
- Positivos: 2
- Negativos: 4
- Limites: 2
- Integracion: 1
- API: 1

**Razon:** cubre validaciones de monto, estado y trazabilidad.

---

### Oportunidades de parametrizacion
**Recomendada:** ✅ Si

**Grupo 1: Montos de cashout**
- **Base:** cashout parcial valido
- **Parametros:** cashout_amount, stake_amount

| stake_amount | cashout_amount | Resultado esperado |
| ------------ | -------------- | ------------------ |
| 100          | 10             | Acepta             |
| 100          | 99             | Acepta             |
| 100          | 100            | Rechaza            |

**Grupo 2: Estados de ticket**
- **Base:** cashout por estado
- **Parametros:** estado_ticket

| Estado ticket | Resultado esperado |
| ------------ | ------------------ |
| abierto      | Acepta             |
| cerrado      | Rechaza            |

**Beneficio:** cubre limites y estados clave.

---

### Nomenclatura de esquemas de prueba
Formato: "Validar <comportamiento> <condicion>"

### Esquemas de prueba

#### Validar cashout parcial con monto valido
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critico
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Precondiciones:**
- Ticket abierto
- stake_amount definido

**Pasos:**
1. Enviar POST /api/bets/{betId}/cashout con cashout_amount valido
2. Verificar creacion de ticket B y cierre de ticket A

**Resultado esperado:**
- Codigo de estado 200/201 (segun contrato)
- Ticket A cerrado, ticket B creado
- Ledger actualizado

---

#### Validar rechazo por monto invalido
**Escenario relacionado:** Escenario 2
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Resultado esperado:**
- Codigo de estado 400
- Mensaje/codigo de error por definir

---

#### Validar rechazo por ticket cerrado
**Escenario relacionado:** Escenario 3
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 2)

**Resultado esperado:**
- Codigo de estado 409/422 (por definir)

---

#### Validar herencia de legs/odds/funding en ticket B
**Escenario relacionado:** Escenario 4
**Tipo:** Limite
**Prioridad:** Media
**Nivel de prueba:** Integracion
**Parametrizado:** ❌ No

**Resultado esperado:**
- Comportamiento por definir

---

#### Validar cashout desde UI con confirmacion de split
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Media
**Nivel de prueba:** E2E
**Parametrizado:** ❌ No

**Resultado esperado:**
- UI muestra ticket A cerrado y ticket B abierto

---

## Casos de integracion

### Integracion 1: Backend ↔ Base de datos
**Punto:** API -> bets/transactions
**Tipo:** Integracion
**Prioridad:** Alta

**Resultado esperado:**
- Split atomico: ticket A cerrado, ticket B creado, ledger consistente

---

## Resumen de casos extremos

| Caso extremo                             | En historia original | Agregado a AC | Caso | Prioridad |
| --------------------------------------- | -------------------- | ------------- | ---- | --------- |
| cashout_amount = 0                      | ❌ No               | ✅ Si         | ATP-EC01 | Alta |
| cashout_amount >= stake_amount          | ✅ Si               | ✅ Si         | ATP-EC02 | Alta |
| Ticket cerrado                          | ✅ Si               | ✅ Si         | ATP-EC03 | Alta |
| Herencia legs/odds/funding sin definir  | ❌ No               | ⚠️ Pendiente  | TBD  | Media |

---

## Resumen de datos de prueba

### Categorias
| Tipo            | Cantidad | Proposito        | Ejemplos |
| --------------- | -------- | ---------------- | -------- |
| Datos validos   | 2        | Casos positivos  | cashout parcial valido |
| Datos invalidos | 3        | Casos negativos  | monto 0, monto >= stake, ticket cerrado |
| Limites         | 2        | Casos limite     | stake 100, cashout 99 |
| Casos extremos  | 1        | Casos extremos   | herencia sin definir |

### Estrategia
- Datos estaticos: bet_id, stake_amount
- Datos dinamicos: cashout_amount con Faker.js
- Limpieza: revertir tickets creados

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
- [ ] Definir herencia de legs/odds/funding en ticket B
- [ ] Confirmar reglas de retorno del cashout parcial
- [ ] Definir mensajes/codigos de error

**@Dev:**
- [ ] Confirmar split atomico y transacciones en DB
- [ ] Definir codigos de error por estado
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
`.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-15-partial-cashout/acceptance-test-plan.md`
