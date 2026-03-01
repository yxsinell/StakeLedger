# Business Model - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## Problem Statement

Los apostadores que intentan llevar control serio de su bank no tienen una fuente unica de verdad. Mezclan cash, bonus y freebets en notas, hojas de calculo o historiales incompletos de la casa, lo que rompe la trazabilidad y distorsiona el rendimiento real.

La falta de normalizacion (equipos, ligas, mercados) impide consultas utiles como "donde acierto mas" o "que cuota promedio me funciona", y la ausencia de reglas de riesgo deja la gestion en manos de la emocion. Esto deriva en decisiones impulsivas, rachas mal gestionadas y perdida de capital.

No existe un sistema que combine contabilidad tipo ledger, gestion de riesgo (stake) y asesoramiento racional diario, manteniendo privacidad, multi-bank y auditoria completa en una sola plataforma.

---

## Customer Segments

### Segmento 1: Apostador recreacional con disciplina

- **Perfil:** Adultos que apuestan por entretenimiento, con interes en ordenar su dinero.
- **Objetivo:** No perder el control del bank y entender su rendimiento real.
- **Pain Points:**
  - No sabe cuanto gana o pierde realmente.
  - Mezcla promociones con dinero real.
  - No tiene reglas claras de riesgo.

### Segmento 2: Apostador avanzado / semi-pro

- **Perfil:** Usuarios data-driven que apuestan con frecuencia y analizan estadisticas.
- **Objetivo:** Optimizar rendimiento por ligas/mercados/cuotas.
- **Pain Points:**
  - Historico poco confiable y sin normalizacion.
  - Dificultad para auditar cambios y cashouts parciales.
  - Falta de insights accionables desde su propio historial.

### Segmento 3: Administrador / tipster

- **Perfil:** Analistas que publican recomendaciones a otros usuarios.
- **Objetivo:** Distribuir pronosticos estructurados y medir seguimiento.
- **Pain Points:**
  - Feed sin integracion contable.
  - Dificil medir adopcion y resultados reales.
  - Necesita datos normalizados para evitar duplicidades.

---

## Value Propositions

### Para el apostador recreacional

- **Problema que resolvemos:** No sabe su rentabilidad real ni controla su riesgo.
- **Nuestra solucion:** Ledger contable con separacion cash/bonus/freebet + stake 0-20 con cap 40% cash.
- **Beneficio principal:** Control del capital y decisiones menos emocionales.
- **Diferenciador:** Trazabilidad completa y reglas de riesgo transparentes.

### Para el apostador avanzado

- **Problema que resolvemos:** Historico inconsistente y sin datos consultables.
- **Nuestra solucion:** Normalizacion de eventos/mercados + analytics por ligas/cuotas.
- **Beneficio principal:** Insights reales de eficiencia y rendimiento.
- **Diferenciador:** Base de datos consultable con auditoria y cashout parcial limpio.

### Para el administrador / tipster

- **Problema que resolvemos:** Feed de recomendaciones aislado del registro real.
- **Nuestra solucion:** Feed integrado que precarga el ledger del usuario.
- **Beneficio principal:** Mayor adopcion y medicion del seguimiento.
- **Diferenciador:** Integracion directa con contabilidad y reglas de riesgo del usuario.

---

## Channels

| Fase | Canal | Descripcion |
| ---- | ----- | ----------- |
| Awareness | Comunidad | Foros y grupos de apuestas responsables |
| Awareness | Contenido | Blog/YouTube sobre gestion y analisis de apuestas |
| Evaluacion | Demo | Version web con datos demo y casos reales |
| Compra | Self-service | Suscripcion en web/app |
| Entrega | SaaS | Acceso inmediato en web y movil |
| Post-venta | Soporte | Base de conocimiento + soporte en chat |

---

## Customer Relationships

- **Usuarios Free:** Self-service + base de conocimiento.
- **Usuarios Pro:** Asistencia personal ligera (chat/email).
- **Administradores:** Onboarding guiado + documentacion avanzada.

---

## Revenue Streams

### Modelo propuesto: Freemium + Suscripcion

| Tier | Precio | Incluye |
| ---- | ------ | ------- |
| Free | 0 EUR | 1 bank, tracking basico, export limitado |
| Pro | 9-19 EUR/mes | Multi-bank, metas, analytics avanzadas |
| Pro+ | 29-39 EUR/mes | OCR, panel admin, reportes fiscales |

**Notas:**
- En fase inicial el producto se usa de forma personal, pero el roadmap apunta a monetizacion por suscripcion.
- Precios y conversion deben validarse con MVP.

---

## Key Resources

### Fisicos

- Infraestructura cloud (hosting, storage, backups)
- Dominio y SSL

### Intelectuales

- Modelo contable ledger y reglas de riesgo
- Catalogo normalizado de deportes/ligas/equipos
- Algoritmos de metas y recomendaciones

### Humanos

- Producto/negocio
- Desarrollo full-stack
- Data/analytics

### Financieros

- Presupuesto para APIs deportivas y OCR
- Presupuesto de adquisicion de usuarios (cuando se publique)

---

## Key Activities

- Desarrollo del producto y UX de registro rapido
- Normalizacion de datos deportivos (catalogo + alias + API)
- Motor de riesgo y metas dinamicas
- Analitica y reportes fiscales
- Soporte y mantenimiento

---

## Key Partners

| Partner | Tipo | Valor |
| ------- | ---- | ----- |
| Proveedor de datos deportivos | Proveedor | API de eventos y ligas |
| Proveedor OCR | Proveedor | Extraccion de datos de tickets |
| Plataforma cloud | Proveedor | Hosting, auth, storage |
| Pasarela de pago | Proveedor | Cobro de suscripciones |
| Comunidad / tipsters | Distribucion | Adopcion temprana y feedback |

---

## Cost Structure

### Costos Fijos (mensuales estimados MVP)

| Concepto | Costo |
| -------- | ----- |
| Hosting y base de datos | 50-150 EUR |
| APIs deportivas | 100-300 EUR |
| OCR | 50-200 EUR |
| Herramientas (analytics, email) | 50-150 EUR |

### Costos Variables

- Storage y bandwidth por usuario activo
- Costos por transaccion de pago
- Consumo de API por volumen de usuarios

---

## MVP Hypotheses

### Hipotesis 1: Demanda

Creemos que apostadores con disciplina adoptaran un ledger especializado
porque necesitan trazabilidad real de su bank.
**Validacion:** 200 usuarios activos en 60 dias.

### Hipotesis 2: Valor

Creemos que los usuarios mejoraran su gestion de riesgo
porque el stake 0-20 con cap y metas reduce decisiones emocionales.
**Validacion:** 60% de usuarios usan metas o stake al menos 3 veces por semana.

### Hipotesis 3: Monetizacion

Creemos que 3-5% de usuarios free migraran a Pro
porque los analytics avanzados y OCR ahorran tiempo.
**Validacion:** Conversion free a Pro >= 3% en 90 dias.

---

**Siguiente paso:** Crear `market-context.md` (Fase 1.2)
