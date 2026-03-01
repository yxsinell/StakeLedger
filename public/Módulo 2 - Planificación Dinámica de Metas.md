Memoria Descriptiva y Funcional: Módulo de Planificación Dinámica de Metas

1. Objetivo Principal del Módulo

El objetivo de este módulo es dotar a la aplicación de un "Asesor Financiero Racional" automatizado. El sistema permitirá al usuario trazar una meta económica con una fecha límite y le calculará diariamente el esfuerzo exacto (cuota y dinero) que necesita para alcanzarla. Su propósito principal es eliminar la toma de decisiones basada en emociones (desesperación por recuperar pérdidas o exceso de confianza en rachas ganadoras), ajustando el riesgo de forma matemática según la realidad de su saldo día a día.

Para el cálculo del capital base, el sistema utilizará estrictamente el saldo real del usuario, es decir, solo el cash disponible , y los cálculos de riesgo se realizarán siempre sobre el disponible actual en ese instante. Además, dado que la arquitectura es privada, cada usuario verá y gestionará estas metas de forma aislada exclusivamente en su propio bank.

+2

2. Parámetros de Creación (Datos de Entrada)

Para iniciar una proyección, el sistema debe solicitar al usuario los siguientes datos obligatorios:

Capital Base Inicial: La cantidad de dinero con la que empieza el reto (Ejemplo: 100€).

Meta de Capital: La cantidad de dinero a la que desea llegar (Ejemplo: 300€).

Fecha Límite: El día exacto en el que desea alcanzar la meta.

Stake Habitual / Riesgo Preferido: El importe promedio que el usuario suele apostar (Ejemplo: 10€) o el porcentaje de su bank que desea usar por movimiento.

Estrategia de Ruta: El usuario debe elegir cómo quiere que el sistema actúe si le va bien:

Opción A (Conservadora): "Si gano y voy adelantado, bájame la exigencia diaria para arriesgar menos".

Opción B (Acelerada): "Si gano y voy adelantado, mantén la exigencia para llegar a la meta antes de la fecha límite".

3. El Motor de Cálculo Inicial (Día 1)

Una vez guardados los parámetros, el sistema debe hacer una operación matemática simple para trazar la "Ruta Ideal":

Calcula la Brecha de Dinero: Meta de Capital menos Capital Base Inicial (Ej: 300€ - 100€ = 200€ a conseguir).

Calcula los Días Disponibles: Fecha Límite menos Fecha Actual (Ej: 10 días).

Calcula el Beneficio Diario Requerido: Divide la Brecha entre los Días (Ej: 200€ / 10 = 20€ diarios).

Genera la Cuota Sugerida: Cruzando el Beneficio Diario con el Stake Habitual del usuario, le indica qué cuota matemática necesita acertar hoy (Ej: "Si apuestas 10€, hoy necesitas acertar una cuota @3.0 para conseguir tus 20€ de beneficio").

4. El Recálculo Dinámico (Actualización Diaria)

El corazón de este módulo es que no es estático. El sistema debe recalcular los números automáticamente después de que cada apuesta vinculada a la meta finalice (ya sea ganada o perdida).

Si el usuario gana (Sube el bank): La brecha de dinero disminuye. El sistema debe recalcular y mostrar que la cuota sugerida para el día siguiente es más baja y segura (si eligió estrategia conservadora) o que la fecha de éxito se ha adelantado (si eligió estrategia acelerada).

Si el usuario pierde (Baja el bank): La brecha de dinero aumenta. El sistema recalcula y la exigencia para los días restantes sube.

5. Reglas de Protección (Cortafuegos del Sistema)

El programador debe incluir condicionantes estrictos para evitar que el sistema sugiera locuras matemáticas.

Tope de Riesgo Diario: El sistema nunca podrá sugerir apostar un importe que ponga en riesgo de quiebra el bankroll en un solo día. Si el usuario está en una mala racha, el importe sugerido debe reducirse proporcionalmente al capital que le queda.

Bloqueo de Cuotas Suicidas: Si debido a las pérdidas, la matemática dice que el usuario necesita acertar una cuota absurda (Ejemplo: @35.0) para llegar a la meta a tiempo, el sistema debe ocultar esa sugerencia.

Válvulas de Escape: Cuando se active el bloqueo anterior, el sistema debe mostrar obligatoriamente un mensaje de reconfiguración: "Para mantener un riesgo seguro, debes aplazar la fecha límite X días más, o reducir tu meta final de ganancias a X euros".

Juego Responsable (cortafuegos adicionales obligatorios)

- Límites configurables por el usuario (por bank y/o global):

A) Stake máximo diario (porcentaje del Cash disponible).

B) Pérdida máxima diaria (tope de pérdida acumulada).

C) Recordatorios/alertas de sesión (tiempo y número de apuestas).

- “Cool-off” voluntario:

El usuario podrá activar una pausa temporal (24h/48h/7d) durante la cual el sistema bloqueará la creación de nuevas apuestas o exigirá confirmación reforzada.

- Detección de patrón “chasing” (persecución de pérdidas):

Si se detecta incremento de importe/stake tras pérdidas consecutivas o reducción de tiempo entre apuestas, el sistema mostrará una alerta explícita y recomendará pausa o reconfiguración de meta/ruta.

- Coherencia con motor de riesgo:

En cualquier sugerencia del módulo, el riesgo nunca podrá superar el cap definido del sistema (Stake 20 = 40% del Cash disponible).

6. Visualización y Entendimiento (Interfaz de Usuario)

Para que el usuario comprenda su estado sin confundirse, la pantalla del módulo debe mostrar siempre:

Una barra de progreso visual (Porcentaje completado hacia la meta).

Un texto claro con la "Misión del Día" (Ej: "Para mantener tu proyección hoy, necesitas un beneficio de +20€. Cuota ideal sugerida: @1.85").

Un botón de "Cerrar Meta Anticipadamente" por si el usuario alcanza su objetivo antes de tiempo por una racha de suerte y desea bloquear sus ganancias y finalizar el reto.

Anexo 1: Casos de Uso y Escenarios de Prueba (Módulo de Metas)

Parámetros Base para todos los escenarios:

Capital Base Inicial: 100€ (Cálculo basado únicamente en saldo Cash disponible ).

Meta de Capital: 300€ (Beneficio objetivo: +200€).

Fecha Límite: 10 días a partir de hoy.

Ritmo Ideal Teórico: +20€ netos diarios.

Stake Habitual: 10€ (El stake se calcula siempre sobre el disponible actual en ese instante ).

Cuota Sugerida Inicial: @3.00 (Si se hace 1 apuesta al día) o dos apuestas a @2.00.

Escenario de Prueba 1: Racha Positiva Temprana (Over-performing)

Contexto: El usuario tiene un excelente primer día y gana mucho más de lo planificado.

Acción del Usuario (Trigger): El Día 1, el usuario realiza y acierta apuestas que le generan +60€ de beneficio neto. El bankroll sube a 160€.

Cálculo Interno: Faltan 140€ para la meta. Faltan 9 días. Nuevo ritmo ideal: +15.55€/día.

Comportamiento Esperado del Sistema (Output): El sistema debe leer la preferencia de estrategia del usuario (Strategy_Preference) y bifurcar la respuesta:

Si la estrategia es "Conservadora": El sistema reduce la exigencia. Muestra un mensaje: "¡Excelente colchón! A partir de hoy, tu cuota sugerida baja a @2.55 para tus 10€ de stake. Puedes asumir menos riesgo".

Si la estrategia es "Acelerada": El sistema mantiene la sugerencia de cuota @3.00 pero actualiza la proyección: "A este ritmo, alcanzarás los 300€ en el Día 7 en lugar del Día 10".

Escenario de Prueba 2: Racha Negativa Peligrosa (Under-performing)

Contexto: El usuario pierde durante 3 días consecutivos y su capital empieza a mermar significativamente.

Acción del Usuario (Trigger): En los Días 1, 2 y 3, el usuario pierde un total de -40€. El bankroll cae a 60€.

Cálculo Interno: Faltan 240€ para la meta (300€ - 60€). Faltan 7 días. Nuevo ritmo ideal: +34.28€/día. Con un stake de 10€, la cuota necesaria salta a @4.42.

Comportamiento Esperado del Sistema (Output): 1. Bloqueo Visual: El tacómetro de viabilidad entra en zona "Roja" (Riesgo Alto).

2.  Activación del Cortafuegos: El sistema detecta que exigir una cuota @4.42 diaria sostenida rompe los parámetros de seguridad.

3.  Sugerencia de Redirección: El sistema emite una alerta obligatoria: "Atención: Tu bank ha bajado a 60€. Intentar llegar a 300€ en 7 días requiere un riesgo extremo. Opciones recomendadas: A) Extender la meta 5 días más. B) Reducir la meta final a 200€".

Escenario de Prueba 3: Ajuste de Stake por Protección (Efecto Derivada)

Contexto: El usuario sufre pérdidas severas y su bankroll se acerca a 0. El sistema debe proteger lo que queda.

Acción del Usuario (Trigger): El bankroll del usuario cae a 30€.

Cálculo Interno: El usuario tiene configurado que el stake máximo recomendado no supere el 15% de su bankroll disponible. 15% de 30€ = 4.5€.

Comportamiento Esperado del Sistema (Output): El sistema ya no le permite basar sus proyecciones en su stake habitual de 10€.

El sistema ajusta el plan: "Por protección de capital, tu stake máximo sugerido hoy baja a 4.50€. La meta actual es matemáticamente inviable bajo estos parámetros seguros. Por favor, reconfigura tu objetivo".

Escenario de Prueba 4: Cierre Anticipado de Meta (Take Profit)

Contexto: Una apuesta combinada o de cuota alta se acierta, haciendo que el usuario alcance o supere la meta de dinero antes de la fecha límite.

Acción del Usuario (Trigger): El Día 6, el usuario gana una apuesta que dispara su bankroll a 315€ (superando los 300€ de meta).

Comportamiento Esperado del Sistema (Output):

El sistema detiene inmediatamente los cálculos de exigencia diaria.

Lanza una notificación de éxito visual (Ej: "¡Meta Alcanzada!").

Cambia el estado de la meta (Status) a "Completada".

Muestra el botón "Asegurar Beneficios", recomendando al usuario retirar fondos o pausar su actividad para no devolver las ganancias al mercado por euforia.

Anexo 2: Estructura de Datos y Motor de Sugerencias (Asesoramiento No Restrictivo y Camino Dorado)

1. Filosofía del Módulo: Asesoramiento vs. Restricción

El sistema actuará exclusivamente como un consultor analítico y un gestor de inversión en apuestas. En ningún caso bloqueará la introducción de una apuesta ni impedirá al usuario arriesgar su capital. Su función es cruzar la exigencia matemática de la "Meta Actual" con el rendimiento histórico del usuario para emitir Sugerencias (Insights) y Advertencias (Warnings). La decisión final de ejecución recae 100% en el usuario. Si el usuario decide ignorar las advertencias, el sistema simplemente registrará el resultado y reajustará el perfil de riesgo futuro.

2. Normalización de Atributos (Estructura de la Base de Datos)

Para que el sistema pueda lanzar estas alertas en tiempo real y funcionar como una base de datos consultable, cada apuesta registrada en el Ledger debe categorizarse con atributos normalizados.

La tabla de detalle de apuestas debe contener al menos los siguientes campos indexados para consultas rápidas:

Rango_de_Cuota: Categorización automática (Ej: <1.50, 1.51-2.00, 2.01-3.00, >3.00).

Deporte: (Ej: Fútbol, Baloncesto, Tenis).

Competición_Liga: (Ej: La Liga, NBA, Premier League).

Mercado: (Ej: Resultado Final, Over/Under Goles, Hándicap Asiático).

Resultado_Final: (Ganada, Perdida, Nula, Ganada 50%, Perdida 50%).

3. El Motor de "Warnings" y Sugerencias (Lógica de Interfaz)

Cuando el usuario visualiza su "Misión del Día" (ejemplo: necesita acertar una cuota @2.50), el sistema consultará silenciosamente la base de datos y generará etiquetas visuales.

A. Sistema de Semáforo (Indicador de Viabilidad)

🟢 Verde (Zona de Confort): Si la cuota requerida está en un rango donde el usuario tiene un porcentaje de acierto histórico rentable.

🟡 Amarillo (Zona de Precaución): Si la cuota requerida es superior a su media habitual o pertenece a un mercado donde su rentabilidad es neutra o ligeramente negativa.

🔴 Rojo (Warning Crítico): Si la cuota requerida pertenece a un rango donde el usuario tiene un historial de pérdidas severas (Ej: porcentaje de acierto < 10%).

B. Generación de Textos Dinámicos (Insights)

El sistema utilizará los datos para formular textos interactivos que inviten a la reflexión, reflejándolo tanto en cuantificables como porcentuales:

Warning por Cuota: "Atención: Para cumplir la meta de hoy necesitas una cuota @3.00. Históricamente, tu porcentaje de acierto en cuotas superiores a @2.50 es del 15%. Considera asumir este riesgo con precaución o ajustar la fecha límite de tu meta."

Sugerencia por Mercado: "Sugerencia de Eficiencia: Tienes que buscar valor hoy. Según tu historial, tus mercados más sólidos son Fútbol (Premier League) y Tenis (ATP), donde mantienes un acierto superior al 55%."

4. El "Camino Dorado" (Proyección Proactiva de Mayor Éxito)

Además de evaluar la cuota matemáticamente requerida para cumplir la meta, el sistema cuenta con un módulo de Consulta Proactiva. El objetivo es identificar y mostrar al usuario su segmento operativo más eficiente para que sepa hacia dónde va conduciendo su propio éxito.

A. Lógica de Extracción de la "Zona Óptima"

El algoritmo buscará el segmento donde el usuario tenga el mayor volumen de apuestas ganadas combinadas con el mejor rendimiento, cruzando variables para determinar cosas como cuál es la liga donde acierta más. Este cruce genera la "Zona Óptima" del usuario.

B. Sugerencia de Reconfiguración Inversa (Pivotaje)

El sistema ofrecerá una ruta alternativa para llegar a la meta monetaria diaria basándose en el mayor porcentaje de éxito histórico.

El Mensaje Dinámico: "Tu Camino de Mayor Éxito: Históricamente, tu mayor tasa de acierto (72%) se encuentra en cuotas alrededor de @1.60 en el mercado de Goles. Para conseguir los 15€ que necesitas hoy utilizando tu mejor estrategia, te sugerimos buscar una apuesta en este rango y ajustar tu stake a 25€ (siempre respetando tu límite de protección de bank)."

5. Bucle de Retroalimentación (Feedback Loop)

Dado que el sistema no es restrictivo, aprende constantemente de las acciones del usuario:

Si el usuario asume un riesgo contra un Warning Rojo y gana, el sistema procesará la transacción, mejorará las estadísticas de acierto de ese rango y requerirá menos alertas rojas para escenarios similares futuros.

Si el usuario asume el riesgo irracional y pierde, el sistema agravará el Warning para la próxima vez y recalculará la meta exigiendo aún más esfuerzo para el día siguiente.
