# Market Context - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## Competitive Landscape

### Competidor 1: Apps de tracking de apuestas (categoria)

- **Website:** Por validar
- **Descripcion:** Apps que registran apuestas y muestran estadisticas basicas.
- **Pricing:** Suscripcion mensual baja (rango 5-20 EUR, por validar).
- **Target:** Apostadores recreacionales y semi-pro.
- **Fortalezas:**
  - Alta adopcion por simplicidad.
  - Historial centralizado.
- **Debilidades:**
  - Poca normalizacion de datos.
  - Sin reglas formales de riesgo ni metas.

### Competidor 2: Plataformas de tipsters / feed

- **Website:** Por validar
- **Descripcion:** Sistemas de recomendaciones con seguimiento de pronosticos.
- **Pricing:** Suscripcion por tipster o por plataforma (por validar).
- **Target:** Usuarios que buscan copiar picks.
- **Fortalezas:**
  - Contenido curado por expertos.
  - Velocidad en recomendaciones live.
- **Debilidades:**
  - No integran contabilidad personal.
  - No controlan riesgo ni reglas de stake del usuario.

### Competidor 3: Hojas de calculo y plantillas

- **Website:** N/A
- **Descripcion:** Google Sheets/Excel con plantillas manuales.
- **Pricing:** Gratis o pago unico por plantilla.
- **Target:** Usuarios autodidactas.
- **Fortalezas:**
  - Flexibilidad total.
  - Costo cero.
- **Debilidades:**
  - Entrada manual lenta y propensa a errores.
  - Sin normalizacion ni auditoria automatica.

### Competidor 4: Historial basico de la casa

- **Website:** N/A
- **Descripcion:** Historial que ofrece cada casa de apuestas.
- **Pricing:** Incluido.
- **Target:** Todos los usuarios de la casa.
- **Fortalezas:**
  - Datos oficiales de la casa.
  - Sin esfuerzo de entrada.
- **Debilidades:**
  - No unifica multiples casas.
  - No permite analitica avanzada ni segmentacion.

---

## Competidores Indirectos

| Alternativa | Como resuelven | Por que lo eligen |
| ----------- | -------------- | ----------------- |
| Apps de finanzas personales | Registran ingresos/gastos | Ya las usan para presupuesto |
| Notion/Notas | Registro manual | Flexibilidad y rapidez |
| No hacer nada | Aceptar el status quo | Resistencia al cambio |

---

## Matriz de Posicionamiento

**Ejes:**

- X: Complejidad (Simple -> Avanzado)
- Y: Enfoque (Solo tracking -> Gestion integral con riesgo/fiscal)

```
                Gestion integral (riesgo + fiscal)
                            |
                            |          StakeLedger  ★
                            |
                            |
Solo tracking  -------------+-------------------------------
                            |
                            |   Apps tracking basico
                            |
                            |   Sheets
                            |
                            +--------------------------------> Complejidad
```

**Nuestra posicion objetivo:** Gestion integral con alta trazabilidad y analitica, sin perder UX rapida.

---

## Market Opportunity

**Metodo:** Bottom-up (estimaciones preliminares, validar)

### TAM

- Usuarios globales con apuestas online regulares (estimacion): 30-60M
- ARPU potencial anual: 12-36 EUR
- **TAM estimado:** 360M - 2.1B EUR / anio

### SAM

- Usuarios objetivo inicial (ES + LATAM, apostadores digitales activos): 3-8M
- **SAM estimado:** 36M - 288M EUR / anio

### SOM

- Objetivo 3 anos: 0.5% - 1% del SAM
- **SOM estimado:** 180k - 2.9M EUR / anio

---

## Trends & Insights

### Tendencia 1: Crecimiento del betting online y mobile

- **Impacto:** Mayor volumen de usuarios, necesidad de control rapido en movil.
- **Para nosotros:** UX one-hand y registro en 2 pasos.

### Tendencia 2: Data-driven betting

- **Impacto:** Usuarios buscan analitica por ligas, cuotas y mercados.
- **Para nosotros:** Normalizacion de datos y consultas avanzadas.

### Tendencia 3: Regulacion y fiscalidad

- **Impacto:** Mayor interes por reportes fiscales y trazabilidad.
- **Para nosotros:** Modulo fiscal y exportacion de reportes.

### Tendencia 4: Responsible gambling

- **Impacto:** Demanda de limites y alertas de riesgo.
- **Para nosotros:** Motor de stake, metas y cortafuegos.

---

## Nuestra Diferenciacion

- **Ledger contable real:** separacion cash/bonus/freebet y auditoria completa.
- **Riesgo transparente:** stake 0-20 con cap 40% cash y calculo bidireccional.
- **Metas dinamicas:** asesoramiento diario y cortafuegos de riesgo.
- **Normalizacion fuerte:** catalogo de ligas/equipos/mercados con API fallback.
- **Integracion feed:** recomendaciones precargadas al ledger.
- **Modulo fiscal:** reserva preventiva y reporte anual.

---

## Barriers to Entry

**Barreras que enfrentamos:**

| Barrera | Severidad | Mitigacion |
| ------- | --------- | ---------- |
| Coste de APIs deportivas | Media | Fallback local + cache + limites |
| Confianza del usuario en datos | Alta | Auditoria, export, transparencia |
| Regulacion por jurisdiccion | Media | Perfiles fiscales configurables |
| Calidad OCR variable | Media | Validacion humana obligatoria |

**Barreras que nos protegen (una vez dentro):**

| Barrera | Como nos protege |
| ------- | ----------------- |
| Switching costs | Historial y analitica propia dificil de migrar |
| Normalizacion y catalogo | Base de datos consolidada con alias y mapeos |
| UX de registro rapido | Habito de uso diario | 

---

## Risks & Assumptions

**Riesgos de mercado:**

1. **Riesgo:** Competidores integran funciones similares
   - **Probabilidad:** Media
   - **Impacto:** Alto
   - **Mitigacion:** Foco en contabilidad + fiscal + riesgo integrado

2. **Riesgo:** TAM real menor al estimado
   - **Probabilidad:** Media
   - **Impacto:** Medio
   - **Mitigacion:** Validar early adopters antes de escalar

3. **Riesgo:** Cambios regulatorios
   - **Probabilidad:** Media
   - **Impacto:** Alto
   - **Mitigacion:** Configuracion por pais y actualizacion anual

**Assumptions a validar:**

- [ ] Usuarios valoran separar cash/bonus/freebet
- [ ] Metas dinamicas reducen decisiones emocionales
- [ ] Reporte fiscal incrementa retencion en usuarios avanzados
- [ ] OCR aporta valor suficiente para justificar costo

---

**Siguiente paso:** Proceder a Fase 2 - Architecture (PRD y SRS)
