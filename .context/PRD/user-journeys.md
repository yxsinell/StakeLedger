# User Journeys - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## Journey 1: Registro y primera apuesta

**Persona:** Carlos Vega
**Scenario:** Quiere registrar su primera apuesta con control de riesgo.

**Step 1:**
- **User Action:** Completa registro con email y password.
- **System Response:** Crea cuenta y solicita verificacion.
- **Pain Point:** Password invalido o email ya usado.

**Step 2:**
- **User Action:** Crea un bank principal y define saldos iniciales.
- **System Response:** Crea bank con bolsillos cash/bonus/freebet.
- **Pain Point:** Confusion entre saldo operativo y desglose.

**Step 3:**
- **User Action:** Busca equipo y competicion para la apuesta.
- **System Response:** Autocompleta desde catalogo y API fallback.
- **Pain Point:** Equipo no encontrado -> usa modo manual (unnormalized).

**Step 4:**
- **User Action:** Introduce cuota, importe y fuente (cash/bonus/freebet).
- **System Response:** Calcula stake 0-20 y valida cap 40%.
- **Pain Point:** Importe supera el cap de riesgo.

**Step 5:**
- **User Action:** Confirma registro de apuesta.
- **System Response:** Guarda ticket, reserva fondos y crea asiento en ledger.
- **Pain Point:** Dudas sobre si el saldo fue actualizado.

**Expected Outcome:** Apuesta registrada con saldo y ledger consistentes.

**Alternative Paths / Edge Cases:**
- Si la API deportiva no responde, se muestra opcion manual.
- Si el usuario no tiene cash suficiente, se bloquea el registro.

---

## Journey 2: Meta dinamica con recalculo diario

**Persona:** Laura Rios
**Scenario:** Quiere alcanzar un objetivo de bank en 10 dias.

**Step 1:**
- **User Action:** Crea meta con capital base, objetivo, fecha limite y stake habitual.
- **System Response:** Calcula brecha y genera mision diaria.
- **Pain Point:** No entiende la cuota sugerida -> tooltip explicativo.

**Step 2:**
- **User Action:** Registra una apuesta vinculada a la meta.
- **System Response:** Vincula ticket a la meta y actualiza progreso.
- **Pain Point:** Confusion si la apuesta fue tomada como cash o bonus.

**Step 3:**
- **User Action:** Liquida la apuesta como ganada o perdida.
- **System Response:** Recalcula brecha y muestra nueva mision.
- **Pain Point:** Recomendacion excede limites de riesgo.

**Step 4:**
- **User Action:** Acepta reconfigurar fecha limite.
- **System Response:** Ajusta la meta y actualiza proyeccion.
- **Pain Point:** Percepcion de complejidad en ajustes.

**Expected Outcome:** Meta recalculada con protecciones activas.

**Alternative Paths / Edge Cases:**
- Si el bank cae bajo el limite de seguridad, se bloquean sugerencias de cuota.
- Si la meta se alcanza antes, se ofrece cierre anticipado.

---

## Journey 3: Seguir una recomendacion del feed

**Persona:** Carlos Vega
**Scenario:** Quiere copiar una apuesta pre-match recomendada.

**Step 1:**
- **User Action:** Entra al feed y filtra pre-match.
- **System Response:** Muestra tarjetas con evento, cuota e ICP.
- **Pain Point:** Demasiadas recomendaciones sin filtro por deporte.

**Step 2:**
- **User Action:** Presiona "Seguir apuesta".
- **System Response:** Precarga evento, mercado y cuota en el formulario.
- **Pain Point:** Cuota desactualizada respecto a la sugerida.

**Step 3:**
- **User Action:** Introduce importe y fuente de fondos.
- **System Response:** Valida limites y muestra stake sugerido.
- **Pain Point:** Saldo insuficiente para el importe deseado.

**Step 4:**
- **User Action:** Confirma el registro.
- **System Response:** Guarda el ticket y marca que proviene del feed.
- **Pain Point:** No queda claro el origen del tip en el historial.

**Expected Outcome:** Apuesta adherida con datos normalizados y trazables.

**Alternative Paths / Edge Cases:**
- Si la recomendacion expira, se bloquea la adhesion.
- Si el usuario no tiene permisos, no ve el feed de admin.
