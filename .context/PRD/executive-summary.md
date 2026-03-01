# Executive Summary - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## Problem Statement

Los apostadores que buscan gestionar su bank con disciplina no tienen un sistema unico que consolide cash, bonus y freebets con trazabilidad real. La operativa se registra en notas, hojas de calculo o historiales incompletos de la casa, generando errores y decisiones basadas en percepcion, no en datos.

La ausencia de normalizacion de equipos, ligas y mercados impide analitica confiable. Sin reglas de stake ni protecciones, el riesgo se gestiona de forma emocional y el rendimiento se distorsiona.

---

## Solution Overview (MVP)

- Ledger contable multi-bank con tres bolsillos internos (cash, bonus, freebet) y auditoria completa.
- Registro de apuestas con tickets y legs, calculo de stake 0-20 con cap 40% sobre cash disponible.
- Normalizacion de datos deportivos con busqueda/autocompletado y fallback manual marcado.
- Metas dinamicas con recalculo diario, cortafuegos de riesgo y sugerencias de cuota.
- Feed de recomendaciones con adhesion rapida al registro del usuario.

---

## Success Metrics

- 200 usuarios activos en 60 dias (usuarios con al menos 3 registros de apuesta).
- 40% de WAU/MAU en el primer trimestre del MVP.
- 30% de usuarios crean al menos 1 bank y registran 5 apuestas en 14 dias.
- 20% de usuarios crean una meta y la usan al menos 5 dias.
- Conversion Free -> Pro >= 3% en 90 dias (si se habilita monetizacion).

---

## Target Users

- **Apostador recreacional disciplinado:** quiere control y trazabilidad sin complejidad.
- **Apostador avanzado data-driven:** busca analitica por ligas, cuotas y mercados.
- **Administrador / tipster:** publica recomendaciones y necesita seguimiento estructurado.
