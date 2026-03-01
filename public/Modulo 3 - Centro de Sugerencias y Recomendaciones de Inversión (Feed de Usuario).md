Módulo 3: Centro de Sugerencias y Recomendaciones de Inversión (Feed de Usuario)

1. Objetivo y Filosofía del Módulo

El Módulo 3 transforma el análisis técnico de alta complejidad en una herramienta de ejecución simplificada para el usuario final. Actúa como un canal receptor donde el administrador (experto) deposita pronósticos validados, permitiendo al usuario adherirse a estrategias profesionales sin necesidad de realizar la investigación por cuenta propia. El control final siempre permanece en el usuario, quien decide si acepta o ignora la sugerencia.

2. Visualización y Acceso (El "Feed" de Sugerencias)

La aplicación dispondrá de una pestaña dedicada o sección destacada denominada "Sugerencias de Hoy".

Interfaz de Usuario (UI): Se presentará como un tablero de fichas interactivas, donde cada ficha representa una oportunidad de inversión única.

Filtros Temporales: El usuario podrá filtrar las recomendaciones entre:

Apuestas Pre-partido: Pronósticos cargados con antelación para eventos futuros.

Apuestas EN VIVO (Live): Recomendaciones en tiempo real para eventos en curso, donde el factor velocidad es determinante.

3. Estructura de la Recomendación Adherida

Cada sugerencia que el administrador cargue en el sistema se mostrará al usuario con los siguientes campos normalizados:

Datos del Evento: Nombre de los equipos, liga y deporte (estandarizados mediante la conexión API del Módulo 1).

Normalización obligatoria de datos en el Feed

- Toda recomendación publicada en el Feed debe usar datos normalizados (IDs canónicos del catálogo): team_internal_id y competition_internal_id (o equivalentes).

- No se permitirá publicar recomendaciones con datos “UNNORMALIZED”; si existe ambigüedad, debe resolverse antes de su publicación para evitar duplicidades y estadísticas incorrectas.

Mercado Sugerido: Selección exacta del pronóstico (ej. Over 2.5, Hándicap Asiático +1, etc.).

Cuota Objetivo: Precio sugerido para realizar la entrada.

Tipo de Apuesta: Etiqueta clara indicando si es Pre-partido o EN VIVO.

Índice de Confianza (ICP): Porcentaje de seguridad (0-100%) generado por el análisis externo del administrador, indicando la solidez de la recomendación.

4. Flujo de Adhesión Automática (Integración con el Ledger)

La funcionalidad clave de este módulo es la capacidad de "pegar" el pronóstico directamente en la contabilidad del usuario.

Botón "Seguir Apuesta": Al presionar este botón, el sistema importa todos los datos de la sugerencia (evento, mercado, cuota) y los precarga automáticamente en el formulario de registro del Módulo 1 (Ledger).

Cálculo de Inversión: Una vez adherida la apuesta, el usuario solo debe introducir el importe que desea apostar. El sistema, utilizando el saldo disponible y la configuración de riesgo de ese usuario, validará si el monto es coherente con su plan de metas antes de confirmar el registro.

UX de adhesión rápida (especialmente Live)

- Adhesión en 2 pasos: (1) confirmar evento/mercado/cuota (ya precargados) y (2) introducir importe + fuente (cash/bonus/freebet) + stake.

- Clonado de recomendación: permitir replicar una apuesta adherida anterior y modificar únicamente cuota e importe.

- Modo one-hand en móvil: botones y controles optimizados para ejecución rápida en vivo sin fricción.

5. Sistema de Notificaciones y Entrega

Para asegurar que el usuario no pierda oportunidades de valor, especialmente en las opciones en vivo, se implementará un sistema de alertas:

Notificaciones Push: Alertas inmediatas al dispositivo móvil cada vez que el administrador publique una nueva sugerencia.

Alertas de Urgencia: Las apuestas en vivo tendrán un indicador visual parpadeante o de color diferenciado para señalar que la oportunidad requiere ejecución inmediata antes de que la cuota o el mercado cambien.

6. Interfaz de Inyección de Datos (Uso del Administrador)

La aplicación contará con un panel de administración restringido (Back-end) donde el creador podrá introducir los datos de las recomendaciones analizadas en su programa privado.

Formulario de Publicación: Interfaz simplificada para cargar los parámetros del pronóstico (Evento, Mercado, Cuota, Tipo e ICP). Una vez guardado, el pronóstico queda automáticamente adherido al feed público de todos los usuarios de la aplicación.
