# Functional Specs - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## FR-001: El sistema debe permitir registro de usuarios con email y password

- **Relacionado a:** EPIC-SL-01, US 1.1
- **Input:**
  - email (string, format email, max 254)
  - password (string, min 8, 1 mayuscula, 1 numero)
- **Processing:**
  - Validar formato y fortaleza
  - Verificar email unico
  - Crear usuario en Supabase Auth
- **Output:**
  - Success: user_id (uuid), email, created_at
  - Error: codigo y mensaje
- **Validations:**
  - Email unico y valido
  - Password cumple policy

## FR-002: El sistema debe permitir inicio de sesion

- **Relacionado a:** EPIC-SL-01, US 1.2
- **Input:** email, password
- **Processing:** autenticar contra Supabase Auth
- **Output:** session token, user profile
- **Validations:** credenciales validas

## FR-003: El sistema debe permitir recuperacion de password

- **Relacionado a:** EPIC-SL-01, US 1.3
- **Input:** email
- **Processing:** generar link de reset y enviar email
- **Output:** confirmacion de envio
- **Validations:** email registrado

## FR-004: El sistema debe aplicar roles y permisos

- **Relacionado a:** EPIC-SL-01, US 1.4
- **Input:** role (admin, editor, user)
- **Processing:** aplicar RBAC en endpoints y UI
- **Output:** acceso permitido o denegado
- **Validations:** role valido, policy definida

## FR-005: El sistema debe permitir crear banks con bolsillos cash/bonus/freebet

- **Relacionado a:** EPIC-SL-02, US 2.1
- **Input:** bank_name, currency, initial_cash, initial_bonus, initial_freebet
- **Processing:** crear bank y pockets, registrar transaccion inicial
- **Output:** bank_id, saldos iniciales
- **Validations:** bank_name requerido, montos >= 0

## FR-006: El sistema debe mostrar saldo operativo y desglose por bolsillo

- **Relacionado a:** EPIC-SL-02, US 2.2
- **Input:** bank_id
- **Processing:** sumar cash/bonus/freebet y calcular saldo operativo
- **Output:** saldo_operativo, cash, bonus, freebet
- **Validations:** bank pertenece al usuario

## FR-007: El sistema debe permitir transferencias entre banks del mismo usuario

- **Relacionado a:** EPIC-SL-02, US 2.3
- **Input:** from_bank_id, to_bank_id, amount, pocket_type
- **Processing:** debitar y acreditar, registrar transaccion tipo transfer
- **Output:** nuevo saldo en ambos banks
- **Validations:** bancos del mismo usuario, monto > 0

## FR-008: El sistema debe registrar depositos y retiros

- **Relacionado a:** EPIC-SL-02, US 2.4
- **Input:** bank_id, amount, type (deposit|withdraw), method
- **Processing:** actualizar pockets y registrar ledger
- **Output:** transaccion_id, saldo actualizado
- **Validations:** monto > 0, retiro no supera cash disponible

## FR-009: El sistema debe registrar tickets con legs y stake calculado

- **Relacionado a:** EPIC-SL-03, US 3.1
- **Input:** bank_id, legs[], odds, stake_amount o stake_level
- **Processing:** calcular stake o monto, validar cap 40% cash, reservar fondos
- **Output:** bet_id, stake_level, stake_amount
- **Validations:** legs >= 1, odds > 1.0, monto <= cap

## FR-010: El sistema debe permitir mix de fondos en una apuesta

- **Relacionado a:** EPIC-SL-03, US 3.2
- **Input:** cash_amount, bonus_amount, freebet_amount
- **Processing:** validar sumatoria = stake_amount, aplicar reglas de freebet
- **Output:** desglose de financiacion
- **Validations:** montos >= 0, reglas de retorno configuradas

## FR-011: El sistema debe liquidar apuestas con resultados completos y parciales

- **Relacionado a:** EPIC-SL-03, US 3.3
- **Input:** bet_id, result (win|lose|void|half_win|half_loss), settlement_amount
- **Processing:** calcular retorno, actualizar pockets, registrar ledger
- **Output:** estado final, retorno, beneficio
- **Validations:** bet en estado abierto, result valido

## FR-012: El sistema debe soportar cashout parcial dividiendo el ticket

- **Relacionado a:** EPIC-SL-03, US 3.4
- **Input:** bet_id, cashout_amount, remaining_stake
- **Processing:** cerrar parte A, crear ticket B con stake restante
- **Output:** bet_id_closed, bet_id_open
- **Validations:** cashout_amount > 0, remaining_stake > 0

## FR-013: El sistema debe registrar auditoria de movimientos

- **Relacionado a:** EPIC-SL-03, US 3.5
- **Input:** entity_type, entity_id, action, actor_id
- **Processing:** guardar evento inmutable con timestamp
- **Output:** audit_id
- **Validations:** action en catalogo permitido

## FR-014: El sistema debe permitir busqueda con autocompletado de catalogo

- **Relacionado a:** EPIC-SL-04, US 4.1
- **Input:** query, type (team|competition)
- **Processing:** buscar en catalogo local, fallback API externa
- **Output:** lista de resultados normalizados
- **Validations:** query length >= 2

## FR-015: El sistema debe permitir ingreso manual con estado unnormalized

- **Relacionado a:** EPIC-SL-04, US 4.2
- **Input:** raw_text, type, country
- **Processing:** crear registro con normalization_status=UNNORMALIZED
- **Output:** catalog_item_id
- **Validations:** raw_text requerido

## FR-016: El sistema debe actualizar catalogo y alias

- **Relacionado a:** EPIC-SL-04, US 4.3
- **Input:** provider, external_id, name, season
- **Processing:** upsert en catalogo y tabla de alias
- **Output:** status de actualizacion
- **Validations:** provider permitido, external_id requerido

## FR-017: El sistema debe permitir crear metas con parametros obligatorios

- **Relacionado a:** EPIC-SL-05, US 5.1
- **Input:** bank_id, base_amount, target_amount, deadline, stake_preference, strategy
- **Processing:** calcular brecha, dias disponibles, beneficio diario
- **Output:** goal_id, daily_profit, suggested_odds
- **Validations:** target_amount > base_amount, deadline futura

## FR-018: El sistema debe mostrar la mision diaria

- **Relacionado a:** EPIC-SL-05, US 5.2
- **Input:** goal_id
- **Processing:** calcular cuota sugerida segun stake y brecha
- **Output:** daily_profit, suggested_odds, progress_pct
- **Validations:** goal activa

## FR-019: El sistema debe recalcular metas tras apuestas finalizadas

- **Relacionado a:** EPIC-SL-05, US 5.3
- **Input:** goal_id, bet_result
- **Processing:** actualizar bank actual, recomputar brecha y dias
- **Output:** nueva mision diaria
- **Validations:** bet vinculada a la meta

## FR-020: El sistema debe aplicar protecciones de riesgo

- **Relacionado a:** EPIC-SL-05, US 5.4
- **Input:** goal_id, suggested_odds
- **Processing:** comparar con limites, bloquear cuotas suicidas
- **Output:** alertas y recomendaciones de reconfiguracion
- **Validations:** limites configurados por usuario

## FR-021: El sistema debe permitir cierre anticipado de metas

- **Relacionado a:** EPIC-SL-05, US 5.5
- **Input:** goal_id
- **Processing:** marcar meta como completed, detener calculos
- **Output:** status actualizado
- **Validations:** goal alcanzada o confirmacion explicita

## FR-022: El sistema debe permitir publicar recomendaciones normalizadas

- **Relacionado a:** EPIC-SL-06, US 6.1
- **Input:** event_id, market, odds, type, icp
- **Processing:** validar normalizacion, publicar en feed
- **Output:** recommendation_id
- **Validations:** role admin/editor

## FR-023: El sistema debe mostrar feed filtrable por tipo

- **Relacionado a:** EPIC-SL-06, US 6.2
- **Input:** filter (pre|live), sport, league
- **Processing:** consultar feed y ordenar por fecha
- **Output:** lista de recomendaciones
- **Validations:** filtros validos

## FR-024: El sistema debe permitir adhesion de recomendacion

- **Relacionado a:** EPIC-SL-06, US 6.3
- **Input:** recommendation_id, bank_id
- **Processing:** precargar formulario con datos del evento
- **Output:** payload de apuesta prellenado
- **Validations:** recomendacion activa

## FR-025: El sistema debe mostrar metricas basicas de rendimiento

- **Relacionado a:** EPIC-SL-06, US 6.4
- **Input:** bank_id, date_range
- **Processing:** calcular yield cash, yield operativo, win rate
- **Output:** resumen de metricas
- **Validations:** date_range valido
