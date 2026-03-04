# Product Backlog - Epic Tree

## Overview

Total Epics: 6
Total User Stories: 25
Project Code: SL
Jira Project: https://yxsinell.atlassian.net/browse/SL

---

## Epic Hierarchy

### EPIC 1: Identity and Access

**Planned Jira Key:** SL-1
**Priority:** CRITICAL
**Description:** Autenticacion, registro y recuperacion de acceso para usuarios. Control de permisos y roles administrativos.

**User Stories (estimado: 4):**

1. SL-2 - Como usuario, quiero registrarme con email y password para acceder a la plataforma.
2. SL-3 - Como usuario, quiero iniciar sesion para ver mis banks y apuestas.
3. SL-4 - Como usuario, quiero recuperar mi password si lo olvido.
4. SL-5 - Como admin, quiero gestionar roles (admin, editor, user) para controlar permisos.

---

### EPIC 2: Banks and Balances

**Planned Jira Key:** SL-6
**Priority:** CRITICAL
**Description:** Gestion de banks y saldos con bolsillos cash/bonus/freebet. Movimientos internos y registro de depositos/retiros.

**User Stories (estimado: 4):**

1. SL-7 - Como usuario, quiero crear banks con bolsillos cash/bonus/freebet para separar saldos.
2. SL-8 - Como usuario, quiero ver saldo operativo y desglose por bolsillo en un bank.
3. SL-9 - Como usuario, quiero transferir fondos entre mis banks como transaccion interna.
4. SL-10 - Como usuario, quiero registrar depositos y retiros para mantener el ledger completo.

---

### EPIC 3: Bets Ledger

**Planned Jira Key:** SL-11
**Priority:** CRITICAL
**Description:** Registro de tickets y financiamiento de apuestas. Liquidacion, cashout parcial y auditoria inmutable.

**User Stories (estimado: 5):**

1. SL-12 - Como usuario, quiero registrar un ticket con legs y que el sistema calcule el stake recomendado.
2. SL-13 - Como usuario, quiero financiar una apuesta con mix cash/bonus/freebet.
3. SL-14 - Como usuario, quiero liquidar apuestas con resultados win/lose/void/half_win/half_loss.
4. SL-15 - Como usuario, quiero ejecutar cashout parcial y que el ticket se divida en dos.
5. SL-16 - Como usuario, quiero un historial inmutable de movimientos y ajustes.

---

### EPIC 4: Catalog and Normalization

**Planned Jira Key:** SL-17
**Priority:** HIGH
**Description:** Busqueda y normalizacion de equipos y competiciones. Ingreso manual y mantenimiento del catalogo.

**User Stories (estimado: 3):**

1. SL-18 - Como usuario, quiero buscar equipos y competiciones con autocompletado.
2. SL-19 - Como usuario, quiero introducir datos manuales si no existen, marcando el registro como unnormalized.
3. SL-20 - Como admin, quiero mantener un catalogo con alias y actualizaciones periodicas.

---

### EPIC 5: Goals and Risk Advisor

**Planned Jira Key:** SL-21
**Priority:** HIGH
**Description:** Metas de capital con mision diaria, recalculo automatico y protecciones de riesgo.

**User Stories (estimado: 5):**

1. SL-22 - Como usuario, quiero crear una meta con capital base, objetivo, fecha limite y stake habitual.
2. SL-23 - Como usuario, quiero ver la mision diaria (beneficio y cuota sugerida).
3. SL-24 - Como usuario, quiero que la meta se recalcule despues de cada apuesta finalizada.
4. SL-25 - Como usuario, quiero protecciones que bloqueen cuotas suicidas y propongan reconfiguracion.
5. SL-26 - Como usuario, quiero cerrar la meta anticipadamente al alcanzar el objetivo.

---

### EPIC 6: Recommendations and Insights

**Planned Jira Key:** SL-27
**Priority:** MEDIUM
**Description:** Publicacion de recomendaciones, feed filtrable y metricas basicas de rendimiento.

**User Stories (estimado: 4):**

1. SL-28 - Como admin, quiero publicar recomendaciones con datos normalizados y ICP.
2. SL-29 - Como usuario, quiero ver un feed filtrable por pre-match y live.
3. SL-30 - Como usuario, quiero seguir una recomendacion y precargar el registro de apuesta.
4. SL-31 - Como usuario, quiero ver metricas basicas (yield cash, yield operativo, win rate).

---

## Epic Prioritization

### Phase 1: Foundation (Sprint 1-2)

1. Epic 1 - Identity and Access
2. Epic 2 - Banks and Balances

### Phase 2: Core Features (Sprint 3-4)

1. Epic 3 - Bets Ledger
2. Epic 4 - Catalog and Normalization

### Phase 3: Growth and Insights (Sprint 5-6)

1. Epic 5 - Goals and Risk Advisor
2. Epic 6 - Recommendations and Insights

---

## Next Steps

1. Fase 5: Shift-Left Testing por epica y story
