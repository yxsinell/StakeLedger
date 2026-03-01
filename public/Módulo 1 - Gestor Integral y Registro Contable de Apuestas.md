Memoria Descriptiva y Funcional: Módulo 1 - Gestor Integral y Registro Contable de Apuestas (Ledger)

1. Objetivo Principal del Módulo

El Módulo 1 es el motor contable y la base de datos central de la aplicación. Su función es registrar con trazabilidad absoluta (formato Ledger) cada movimiento financiero y cada selección deportiva realizada por el usuario. Debe garantizar que la información esté estandarizada para alimentar posteriormente los módulos de predicción (Módulo 3) y gestión de metas (Módulo 2), operando bajo una arquitectura multiusuario donde cada usuario visualiza exclusivamente sus propios datos de forma privada.

2. Arquitectura de Carteras (Multi-Bank y Gestión de Saldos)

El sistema debe permitir a cada usuario crear y gestionar múltiples "Banks" (ej. Bank Principal, Bank Fútbol, Bank Retos).

Transferencias: Se debe permitir mover fondos entre distintos banks del mismo usuario, registrando el movimiento como "Transferencia" (no como depósito/retiro externo).

Separación de Bolsillos: Dentro de cada Bank, el sistema debe separar estrictamente el Saldo Cash (dinero real) del Saldo Promo (Bonos y Freebets).

Modelo de 3 Bolsillos (Cash / Bonus / Freebet) y “Saldo Operativo” en UI:

- Internamente, el sistema mantendrá tres bolsillos separados por bank: Cash, Bonus y Freebet (cada uno con reglas contables propias).

- En UI, para reducir fricción, podrá mostrarse un “Saldo Operativo” agregado (Cash + Bonus + Freebet nominal), pero será obligatorio ofrecer el desglose detallado en un solo tap/click.

- Nota operativa: El “Saldo Operativo” es una vista de conveniencia; las reglas de riesgo y stake se calculan únicamente con Cash disponible.

Financiación Mixta: Un mismo ticket de apuesta puede pagarse combinando saldo Cash y saldo Promo. El sistema debe calcular el retorno respetando la naturaleza de cada saldo (ej. en las Freebets el stake no es retornable, solo se suma la ganancia neta al disponible).

3. El Motor de Riesgo (Sistema de Stake 0-20)

El cálculo de inversión por apuesta se basará en un sistema de confianza dinámico:

Escala: Del 0 al 20. (Nota: El Stake 0 funciona como registro de seguimiento sin riesgo financiero).

Riesgo Máximo (Cap único):

- El Stake 20 representará exactamente el 40% del CASH disponible en el momento de crear la apuesta.

- El cálculo de stake se realizará siempre sobre el CASH disponible actual (descontando bank comprometido).

- Fórmula base recomendada (lineal y transparente): Importe Recomendado = Cash_Disponible _ (Stake / 20) _ 0,40.

Cálculo bidireccional: El usuario puede seleccionar el número de Stake (y el sistema calcula los euros a invertir) o escribir los euros (y el sistema calcula a qué número de Stake equivale, reflejándolo con un decimal).

Reserva de fondos: Al abrir una apuesta, el importe pasa a "Bank Comprometido" y se resta del "Bank Disponible" instantáneamente.

4. Entrada de Datos Inteligente (API y OCR)

Para garantizar la estandarización absoluta de la base de datos, el ingreso de las selecciones deportivas contará con dos tecnologías de apoyo:

Buscador Interactivo (Integración API Deportiva): Un buscador conectado en tiempo real a una base de datos deportiva externa. Al introducir un país o competición (ej. "Rumanía"), desplegará un árbol con sus ligas oficiales. Al introducir letras de un equipo, el sistema autocompletará y mostrará los partidos oficiales disponibles, evitando duplicados o errores de tipeo en los nombres.

Normalización robusta de Equipo/Competición (Autocompletado + API con fallback):

- Los campos Equipo y Competición se implementan como selectores con búsqueda (autocompletado), priorizando resultados locales (catálogo interno + alias) y consultando la API deportiva solo cuando sea necesario (fallback).

- Persistencia canónica: se guardará team_internal_id como identificador principal propio, manteniendo una tabla de mapeo team_identifiers para IDs del proveedor (provider, external_team_id).

- Seed incremental: si el usuario selecciona un equipo/competición proveniente de la API que no existe en el catálogo local, el sistema debe crearlo/actualizarlo automáticamente (incluyendo su mapeo provider/external_id).

- Modo manual (salida de emergencia): si no se encuentra el dato en catálogo/API, se permite texto libre, pero el registro se guardará con raw_text y normalization_status = “UNNORMALIZED”, quedando pendiente de normalización posterior.

- Proceso de normalización posterior: el sistema intentará normalizar registros UNNORMALIZED mediante API y, si hay ambigüedad, los enviará a una cola de revisión.

- Sincronización periódica: se incorporará sincronización periódica del catálogo (equipos/ligas) para mantener consistencia por temporadas (altas, cambios de nombre, ascensos/descensos, inactivos).

Lector de Tickets (OCR): Opción para subir captura de pantalla de la casa de apuestas e intentar pre-rellenar los datos de cuota e importe.

Validación Humana: El sistema siempre obligará al usuario a validar y confirmar la selección final, permitiendo edición manual.

5. Estructura de Apuestas y Liquidación

El registro debe soportar la complejidad real de la operativa, dividiendo la información en Ticket (Cabecera) y Legs (Selecciones/Detalle), contemplando Sencillas, Combinadas, Sistemas y "Crear Apuesta/Bet Builder". Los resultados contemplados incluyen Ganada, Perdida, Nula (Void) y resoluciones fraccionadas para Hándicaps Asiáticos.

Metadatos auditables en ajustes y promociones (especialmente combinadas):

- Cuando exista corrección manual o ajuste de condiciones (boost, promo especial, ajuste de la casa, corrección de cuota/retorno, etc.), el sistema debe exigir registrar el “motivo del ajuste” como metadato auditable.

- Campos mínimos recomendados: adjustment_flag (sí/no), adjustment_reason (boost/ajuste_casa/error_carga/otro), adjustment_notes (texto breve), adjusted_by (usuario/rol), adjusted_at (timestamp).

- Objetivo: preservar trazabilidad y evitar distorsión silenciosa de métricas.

Gestión Avanzada de Cierres Anticipados (Cash Out)

Para mantener la integridad de las estadísticas de rentabilidad (Yield) y acierto (Win Rate), el sistema procesará los cierres anticipados sin sobrescribir los datos de compra iniciales:

Regla de Cash Out Total:

El estado de la apuesta pasa a "Cash Out".

Conservación de Datos: La Cuota Original pactada se mantiene intacta en la base de datos (Ej. @2.00).

Contabilidad: Se registra el Retorno Final real obtenido (Ej. 150€) y el Beneficio Neto (Ej. +50€).

Cuota Efectiva (Cálculo Interno): El sistema divide el Retorno Final entre el Stake original para calcular la "Cuota Efectiva" (Ej. 150€ / 100€ = @1.50). Esta Cuota Efectiva es la que utilizarán los Módulos 2 y 3 para evaluar el rendimiento histórico del usuario.

Regla de Cash Out Parcial (División de Ticket):

Al ejecutar un cierre parcial, el sistema dividirá automáticamente el ticket original en dos registros independientes.

Ticket A (Parte Cerrada): Se liquida bajo las reglas del "Cash Out Total", registrando el importe retirado, calculando su cuota efectiva y liberando ese dinero al Bank Disponible.

Ticket B (Parte Viva): Se genera como una nueva apuesta abierta, manteniendo la Cuota Original intacta, pero operando únicamente con la fracción del Stake que el usuario decidió dejar corriendo.

Sistema de Métricas “Honestas” (definiciones obligatorias)

Para evitar mezclar dinero real con promociones, el sistema calculará y mostrará al menos tres métricas diferenciadas:

1. Yield Cash:

- Se calcula exclusivamente sobre apuestas financiadas con Cash (stake cash real).

- Objetivo: medir rentabilidad real del capital propio.

2. Yield Operativo:

- Se calcula sobre Cash + la parte promocional que realmente implique riesgo de cash (si aplica por reglas de financiación mixta).

- Objetivo: reflejar la operativa completa sin inflar resultados por freebets.

3. Eficiencia (Win Rate):

- Incluye también apuestas realizadas con Freebet (tal como se requiere), pero se mostrará explícitamente como “métrica de acierto, no de rentabilidad”.

- Objetivo: medir precisión/efectividad sin confundirla con retorno financiero.

UX de registro para uso diario (alta frecuencia)

- Entrada rápida en 2 pasos:

Paso 1: evento/mercado/cuota (con autocompletado y normalización).

Paso 2: importe + fuente de fondos (cash/bonus/freebet) + stake (0-20).

- “Últimas apuestas” clonables: permitir copiar/pegar un ticket reciente y modificar solo cuota e importe.

- Modo móvil one-hand: interfaz optimizada para registrar apuestas en vivo con una sola mano (inputs grandes, mínima fricción, confirmación rápida).

6. Sincronización y Trazabilidad (Ledger)

Auditoría: Todo cambio en el bank (ingreso, apuesta, corrección, liquidación, cash out) generará un registro inmutable en el historial.

Modo Offline: Si la app funciona sin conexión, al sincronizar aplicará la regla Last write wins (gana la última edición guardada en caso de conflicto).
