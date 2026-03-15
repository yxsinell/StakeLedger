## Plan de Pruebas de Aceptacion - Generado 2026-03-11

**Ingeniero QA:** AI-Generated
**Estado:** Borrador - Pendiente de revision PO/Dev

---

# Plan de Pruebas de Aceptacion: STORY-SL-12 - Registro de ticket con stake recomendado

**Fecha:** 2026-03-11
**Ingeniero QA:** AI-Generated
**Jira Key de la historia:** SL-12
**Epica:** EPIC-SL-11 - Bets Ledger
**Estado:** Borrador

---

## Paso 1: Analisis critico

### Contexto de negocio
**Persona afectada:**
- **Primario:** Carlos Vega - necesita registrar apuestas rapido y con control de riesgo.
- **Secundario:** Laura Rios - requiere historico auditable y stake consistente.

**Valor de negocio:**
- **Propuesta de valor:** control de riesgo con stake recomendado y trazabilidad contable.
- **Impacto en KPIs:** impulsa % de usuarios que registran apuestas y uso de stake recomendado.

**Recorrido de usuario relacionado:**
- Recorrido: Registro y primera apuesta
- Paso: Paso 4-5 (ingreso de cuota/importe y confirmacion del registro)

---

### Contexto tecnico
**Componentes de arquitectura:**

**Frontend:**
- Componentes: formulario de ticket con legs, odds y stake recomendado.
- Paginas/Rutas: por definir (no especificadas en SRS).
- Estado: por definir (no especificado).

**Backend:**
- Endpoints API: POST /api/bets, GET /api/bets/{betId} (verificacion).
- Servicios: calculo de stake, validacion de cap, reserva de fondos.
- Base de datos: bets, bet_legs, bank_pockets, transactions, audit_logs.

**Servicios externos:**
- Ninguno.

**Puntos de integracion:**
- Frontend -> Backend API (registro de ticket).
- Backend -> Base de datos (reservas y ledger).
- Backend -> Auth/RLS (propiedad del bank).

---

### Analisis de complejidad
**Complejidad general:** Alta

**Factores de complejidad:**
- Logica de negocio: Alta - stake recomendado y cap 40%.
- Integracion: Media - API + DB + RLS.
- Validaciones: Alta - odds, legs, cap, permisos.
- UI: Media - formulario con feedback de stake.

**Esfuerzo de pruebas estimado:** Alto
**Razon:** multiples validaciones, riesgos de saldo y dependencias con ledger.

---

### Contexto a nivel epic (desde Feature Test Plan)
**Riesgos criticos ya identificados:**
- Calculo de stake/cap puede producir balances incorrectos.
  - **Relevancia:** impacta directamente el registro de ticket.
- Cashout parcial y liquidacion no aplican directamente a esta historia.

**Puntos de integracion del epic:**
- Frontend ↔ Backend API: ✅ Aplica (registro de ticket).
- Backend ↔ Base de datos: ✅ Aplica (pockets, ledger, audit).
- Backend ↔ Auth/RLS: ✅ Aplica (validacion de ownership).

**Preguntas criticas a nivel epic:**
**Para PO:**
- Comportamiento cuando stake recomendado supera cap
  - **Estado:** ⏳ Pendiente
  - **Impacto en esta historia:** define el resultado del Escenario 4.

**Para Dev:**
- No hay preguntas respondidas a nivel epic que cambien esta historia.

**Estrategia de pruebas del epic:**
- Niveles: Unitarias, Integracion, E2E, API
- Herramientas: Playwright, Vitest, Postman
- **Aplicacion en esta historia:** unitarias (stake/cap), integracion (API-DB), E2E (registro), API (POST /api/bets).

**Resumen:**
- **Rol en el epic:** habilita el alta inicial del ticket con stake recomendado.
- **Riesgos heredados:** cap 40% y validaciones de odds/legs.
- **Consideraciones unicas:** definicion de pocket permitido y precedencia stakeAmount/stakeLevel.

---

## Paso 2: Analisis de calidad de la historia

### Ambiguedades identificadas
**Ambiguedad 1:** comportamiento cuando stake recomendado supera cap
- **Ubicacion:** AC Escenario 3
- **Pregunta:** ajustar automaticamente o bloquear el registro?
- **Impacto:** no se puede definir el resultado esperado del caso limite.
- **Sugerencia:** definir una sola regla y mensaje.

**Ambiguedad 2:** pocket seleccionado en SL-12
- **Ubicacion:** Alcance (reservar fondos del pocket seleccionado)
- **Pregunta:** se permite bonus/freebet en esta historia o solo cash?
- **Impacto:** afecta precondiciones y validaciones.
- **Sugerencia:** limitar a cash en SL-12 y dejar mix para SL-13.

**Ambiguedad 3:** precedencia stakeAmount vs stakeLevel
- **Ubicacion:** contrato de API permite ambos
- **Pregunta:** que campo prevalece si se envian ambos? se permite ninguno?
- **Impacto:** pruebas no deterministas.
- **Sugerencia:** definir regla de precedencia o validar exclusividad.

### Brechas / Informacion faltante
**Gap 1:** mensajes y codigos de error esperados
- **Tipo:** Criterios de aceptacion
- **Por que es critico:** se necesita para validar errores en API/UI.
- **Sugerencia:** definir codigos y mensajes por validacion.

**Gap 2:** rango oficial de stake_level
- **Tipo:** Regla de negocio
- **Por que es critico:** pruebas de limites.
- **Sugerencia:** confirmar rango 0-20 del SRS.

**Gap 3:** limite maximo de legs por ticket
- **Tipo:** Regla de negocio
- **Por que es critico:** pruebas de limites y performance.
- **Sugerencia:** explicitar en historia/SRS.

### Casos extremos no cubiertos
**Caso extremo 1:** legs vacias
- **Escenario:** legs = []
- **Comportamiento esperado:** rechazo por validacion
- **Criticidad:** Alta
- **Accion:** agregar a AC y casos de prueba

**Caso extremo 2:** odds de leg <= 1.0 con odds de ticket valido
- **Escenario:** odds del ticket > 1.0 pero una leg invalida
- **Comportamiento esperado:** rechazo (por definir)
- **Criticidad:** Media
- **Accion:** preguntar a PO/Dev

**Caso extremo 3:** bank no pertenece al usuario
- **Escenario:** bank_id de otro usuario
- **Comportamiento esperado:** 403
- **Criticidad:** Alta
- **Accion:** agregar a casos de prueba

### Validacion de testeabilidad
**Es testeable como esta?** ⚠️ Parcialmente
**Issues:**
- [ ] ACs no definen mensajes/codigos de error
- [ ] Regla de cap (ajustar vs bloquear) indefinida
- [ ] Precedencia stakeAmount/stakeLevel no definida

**Recomendaciones:**
- Definir regla unica para cap
- Definir codigos/mensajes de error
- Definir precedencia o exclusividad de inputs

---

## Paso 3: Criterios de aceptacion refinados

### Escenario 1: Registro exitoso con stake recomendado
**Tipo:** Positivo
**Prioridad:** Critico
- **Given:**
  - Usuario autenticado con bank activo y cash >= 100
  - Cap calculado = 40% del cash disponible
  - Legs validas (>=1) con odds > 1.0
- **When:**
  - POST /api/bets con bankId, legs (2), odds 1.85, stakeLevel 8, pocket cash
- **Then:**
  - Codigo de estado 201
  - Respuesta incluye bet_id, stake_level, stake_amount
  - stake_amount <= cap
  - Se reserva cash y se crea transaccion en ledger + audit log

---

### Escenario 2: Rechazo por odds invalidas
**Tipo:** Negativo
**Prioridad:** Alta
- **Given:** usuario autenticado
- **When:** registra ticket con odds <= 1.0
- **Then:**
  - Codigo de estado 400
  - Mensaje/codigo de error por definir
  - No se crea ticket ni movimientos en DB

---

### Escenario 3: Stake recomendado igual al cap
**Tipo:** Limite
**Prioridad:** Media
- **Given:** cash disponible 100, cap 40
- **When:** stake recomendado = 40
- **Then:** se acepta y reserva fondos

---

### Escenario 4: Stake recomendado supera cap
**Tipo:** Caso extremo
**Prioridad:** Media
**Origen:** Analisis critico
- **Given:** cash disponible 50, cap 20
- **When:** stake recomendado > 20
- **Then:** comportamiento por definir (ajustar o bloquear)
- **Nota:** requiere confirmacion PO/Dev

---

### Escenario 5: Legs vacias
**Tipo:** Negativo
**Prioridad:** Alta
- **Given:** usuario autenticado
- **When:** legs = []
- **Then:** 400 por validacion, sin cambios en DB

---

### Escenario 6: Bank no pertenece al usuario
**Tipo:** Negativo
**Prioridad:** Alta
- **Given:** usuario autenticado con bank ajeno
- **When:** POST /api/bets con bankId de otro usuario
- **Then:** Codigo de estado 403 y sin cambios

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

**Razon:** valida reglas de odds, legs, cap y permisos, mas integracion API-DB.

---

### Oportunidades de parametrizacion
**Recomendada:** ✅ Si

**Grupo 1: Validar variaciones de odds**
- **Base:** registro exitoso
- **Parametros:** odds del ticket, odds por leg

| Odds ticket | Odds leg 1 | Odds leg 2 | Resultado esperado |
| ---------- | ---------- | ---------- | ------------------ |
| 1.01       | 1.20       | 1.30       | Acepta             |
| 1.50       | 1.10       | 1.40       | Acepta             |
| 2.50       | 1.80       | 2.00       | Acepta             |

**Grupo 2: Inputs de stake**
- **Base:** registro con stake
- **Parametros:** stakeLevel, stakeAmount

| stakeLevel | stakeAmount | Resultado esperado |
| ---------- | ----------- | ------------------ |
| 8          | null        | Acepta             |
| null       | 15          | Acepta             |
| 8          | 15          | Por definir        |

**Beneficio:** reduce duplicacion y cubre reglas de validacion.

---

### Nomenclatura de esquemas de prueba
Formato: "Validar <comportamiento> <condicion>"

### Esquemas de prueba

#### Validar registro de ticket con stake recomendado con odds validas
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critico
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Precondiciones:**
- Usuario autenticado
- Bank con cash >= 100

**Pasos:**
1. Enviar POST /api/bets con legs validas y odds 1.85
2. Verificar respuesta y movimientos

**Resultado esperado:**
- Codigo de estado 201
- Se crea bet_id y stake_amount <= cap
- Ledger y audit log registrados

---

#### Validar registro desde UI con visualizacion de stake recomendado
**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Alto
**Nivel de prueba:** E2E
**Parametrizado:** ❌ No

**Precondiciones:**
- Usuario autenticado en preview
- Bank con cash suficiente

**Pasos:**
1. Completar formulario de ticket
2. Verificar stake recomendado visible
3. Confirmar registro

**Resultado esperado:**
- UI muestra confirmacion
- Balance actualizado

---

#### Validar rechazo por odds invalidas
**Escenario relacionado:** Escenario 2
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ✅ Si (Grupo 1)

**Pasos:**
1. Enviar POST /api/bets con odds <= 1.0
2. Verificar error

**Resultado esperado:**
- Codigo de estado 400
- Mensaje/codigo de error por definir
- Sin cambios en DB

---

#### Validar rechazo por legs vacias
**Escenario relacionado:** Escenario 5
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 400
- Sin creacion de ticket

---

#### Validar comportamiento cuando stake recomendado iguala el cap
**Escenario relacionado:** Escenario 3
**Tipo:** Limite
**Prioridad:** Media
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 201
- stake_amount == cap

---

#### Validar comportamiento cuando stake recomendado supera cap
**Escenario relacionado:** Escenario 4
**Tipo:** Caso extremo
**Prioridad:** Media
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Por definir (ajustar vs bloquear)

---

#### Validar rechazo por bank no perteneciente al usuario
**Escenario relacionado:** Escenario 6
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** API
**Parametrizado:** ❌ No

**Resultado esperado:**
- Codigo de estado 403
- Sin cambios en DB

---

## Casos de integracion

### Integracion 1: Frontend ↔ Backend API
**Punto:** UI -> POST /api/bets
**Tipo:** Integracion
**Prioridad:** Alta

**Flujo:**
1. UI envia request
2. API valida y persiste
3. UI recibe respuesta

**Validacion de contrato:**
- Request/Response cumplen OpenAPI: ✅ Si
- Codigos de estado: ✅ Si

**Resultado esperado:**
- Flujo completo sin perdida de datos

---

## Resumen de casos extremos

| Caso extremo                                      | En historia original | Agregado a AC | Caso | Prioridad |
| ---------------------------------------------- | ----------------- | ------------- | -------- | --------- |
| Legs vacias                                     | ❌ No             | ✅ Si         | ATP-EC01 | Alta      |
| Odds de leg <= 1.0                              | ❌ No             | ⚠️ Pendiente  | TBD      | Media     |
| Bank no perteneciente al usuario                | ❌ No             | ✅ Si         | ATP-EC02 | Alta      |
| Stake recomendado > cap (ajustar vs bloquear)   | ⚠️ Parcial        | ✅ Si         | ATP-EC03 | Media     |

---

## Resumen de datos de prueba

### Categorias
| Tipo             | Cantidad | Proposito        | Ejemplos |
| ---------------- | -------- | ---------------- | -------- |
| Datos validos    | 3        | Casos positivos  | odds > 1.0, legs >=1 |
| Datos invalidos  | 3        | Casos negativos  | odds <=1.0, legs=[] |
| Limites          | 2        | Casos limite     | stake = cap, cash minimo |
| Casos extremos       | 2        | Casos extremos       | bank ajeno, stake > cap |

### Estrategia
- Datos estaticos: bank_id, user_id de prueba
- Datos dinamicos: odds y legs con Faker.js
- Limpieza: eliminar bets creadas en pruebas

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
- [ ] Definir comportamiento cuando stake recomendado supera cap
- [ ] Confirmar pocket permitido en SL-12 (solo cash vs cualquier pocket)
- [ ] Definir mensajes/codigos de error

**@Dev:**
- [ ] Definir precedencia stakeAmount vs stakeLevel
- [ ] Confirmar validacion de odds por leg
- [ ] Confirmar manejo de idempotencia en doble envio

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
`.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-12-register-ticket/acceptance-test-plan.md`
