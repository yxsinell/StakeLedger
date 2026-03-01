# MVP Scope - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## In Scope (Must Have)

### EPIC-SL-01: Identity and Access
- **US 1.1:** Como usuario, quiero registrarme con email y password para acceder a la plataforma.
- **US 1.2:** Como usuario, quiero iniciar sesion para ver mis banks y apuestas.
- **US 1.3:** Como usuario, quiero recuperar mi password si lo olvido.
- **US 1.4:** Como admin, quiero gestionar roles (admin, editor, user) para controlar permisos.

### EPIC-SL-02: Banks and Balances
- **US 2.1:** Como usuario, quiero crear banks con bolsillos cash/bonus/freebet para separar saldos.
- **US 2.2:** Como usuario, quiero ver saldo operativo y desglose por bolsillo en un bank.
- **US 2.3:** Como usuario, quiero transferir fondos entre mis banks como transaccion interna.
- **US 2.4:** Como usuario, quiero registrar depositos y retiros para mantener el ledger completo.

### EPIC-SL-03: Bets Ledger
- **US 3.1:** Como usuario, quiero registrar un ticket con legs y que el sistema calcule el stake recomendado.
- **US 3.2:** Como usuario, quiero financiar una apuesta con mix cash/bonus/freebet.
- **US 3.3:** Como usuario, quiero liquidar apuestas con resultados win/lose/void/half.
- **US 3.4:** Como usuario, quiero ejecutar cashout parcial y que el ticket se divida en dos.
- **US 3.5:** Como usuario, quiero un historial inmutable de movimientos y ajustes.

### EPIC-SL-04: Catalog and Normalization
- **US 4.1:** Como usuario, quiero buscar equipos y competiciones con autocompletado.
- **US 4.2:** Como usuario, quiero introducir datos manuales si no existen, marcando el registro como unnormalized.
- **US 4.3:** Como admin, quiero mantener un catalogo con alias y actualizaciones periodicas.

### EPIC-SL-05: Goals and Risk Advisor
- **US 5.1:** Como usuario, quiero crear una meta con capital base, objetivo, fecha limite y stake habitual.
- **US 5.2:** Como usuario, quiero ver la mision diaria (beneficio y cuota sugerida).
- **US 5.3:** Como usuario, quiero que la meta se recalcule despues de cada apuesta finalizada.
- **US 5.4:** Como usuario, quiero protecciones que bloqueen cuotas suicidas y propongan reconfiguracion.
- **US 5.5:** Como usuario, quiero cerrar la meta anticipadamente al alcanzar el objetivo.

### EPIC-SL-06: Recommendations and Insights
- **US 6.1:** Como admin, quiero publicar recomendaciones con datos normalizados y ICP.
- **US 6.2:** Como usuario, quiero ver un feed filtrable por pre-match y live.
- **US 6.3:** Como usuario, quiero seguir una recomendacion y precargar el registro de apuesta.
- **US 6.4:** Como usuario, quiero ver metricas basicas (yield cash, yield operativo, win rate).

---

## Out of Scope (Nice to Have)

- OCR de tickets y pre-llenado automatico.
- Notificaciones push y alertas live en tiempo real.
- Modulo fiscal completo con exportacion PDF/CSV.
- Sistemas de apuestas con generacion automatica de combinaciones.
- Integraciones con casas de apuestas para importacion directa.
- Colaboracion multiusuario sobre un mismo bank.

---

## Success Criteria (MVP)

- Registro y liquidacion de apuestas con auditoria completa funcionando end-to-end.
- 90% de apuestas con datos normalizados o marcadas como unnormalized.
- Calculo de stake y metas coherente con cap 40% sobre cash disponible.
- Feed de recomendaciones operable con adhesion en 2 pasos.
- KPI inicial: 200 usuarios activos y 30% de retencion semanal en 60 dias.
