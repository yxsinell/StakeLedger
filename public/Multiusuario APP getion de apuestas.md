Multiusuario: ¿privado o con roles?

privado

¿Cada usuario ve solo sus banks (privado), o quieres algo tipo “equipo” (compartir un bank con otro usuario)?

Cada usuario ve solo su bank

Si hay “equipo”: ¿roles (admin/lector/editor) y auditoría de cambios?

Admin, usuario y editor

2. Multi-bank: separación y movimientos

¿Se permite transferir fondos entre banks (ej. del Bank A al Bank B) y que quede como transacción “transferencia” (sin considerarlo depósito/retiro real)?

Siempre que este el mismo usuario

¿Un usuario puede marcar un bank como “principal” y que el dashboard global sume todo?

Puede ser global o por bank seleccionado

3. Cash vs Bonus vs Freebet: reglas (esto define el 80% de las discusiones futuras)

Cuando dices “incluye bonos y freebets”: ¿quieres separar saldos (cash/promo/freebet) SIEMPRE, o te vale con un campo “fuente” por apuesta y un saldo único?

Saldo único una vez este determinada la apuesta, es decir, cuando marcas la opción de bono o freebets no descuenta del saldo disponible para apuestas y al estar determinada la apuesta obteniendo beneficio se suma ese monto al saldo disponible para apostar y se puede dar el caso de que una apuesta tenga parte de un bono y parte del saldo, ejemplo: si tienes un bono de 10 euros y la apuesta es de 20 euros, se tiene que poder dividir el monto de apuesta en 10 de bono y 10 del saldo disponible, hay que tomar en cuenta que si es una cuota 2, se terminara cobrando 40 euros menos los 10 del bono.

Freebet: ¿confirmas la regla por defecto “stake no retornable” (si gana, cobras solo ganancia; si pierde, 0), con opción de cambiarla por casa de apuestas?

Si, con opción de cambiarla por casa de apuestas

Bonus: cuando una apuesta con bonus gana, ¿el retorno va a promo o a cash? (Esto cambia mucho por bookie; lo normal es configurable).

Debe ser configurable, ya que, no hay una regla escrita y es según la condición del bono

En estadísticas tipo ROI/yield: ¿quieres que las apuestas con freebet cuenten como “apostado” o como “apostado virtual”? (Si cuentas freebet como staked real, el ROI queda “dopado”; si lo separas, queda más honesto.)

No se cuenta como apostado, pero si debe aportar a las estadísticas de acierto o fallido, ya que esto nos brinda un % real de eficiencia en el análisis

4. Stake 25 = 100%: definir exactamente qué bank usa

Ese 100% para stake 25: ¿es sobre bank disponible total (cash + promo + freebet si aplica) o solo sobre cash disponible?

Solo cash disponible

¿El stake se calcula antes o después de comprometer importes de otras apuestas abiertas? (Mi recomendación: siempre sobre disponible actual en ese instante.)

siempre sobre disponible actual en ese instante

5. Curva de stake: redondeos y mínimos

¿Redondeo del importe recomendado? ¿a céntimos exactos, a múltiplos de 0,50€, a 1€?

céntimos exactos

Apuesta mínima: ya dijiste que sí. ¿Quieres una por defecto (1€) y configurable por bank?

Si

Si el usuario introduce importe y la app calcula stake: ¿prefieres round, floor o ceil? (Esto afecta si la app “se pasa” de agresiva.)

Quiero que el stake se vea reflejado en ese caso con un decimal (de 1 a 9), ejemplo: si la unidad del stake es 5€ y hay una apuesta de 17.5€, el stake se vea reflejado como 3.5 y el redondeo del decimal si lo prefiero round

6. Apuestas combinadas / sistemas: cómo se registran (y cómo se liquidan)

En una combinada: ¿vas a guardar las piernas (legs) una por una (mercado/selección/cuota por leg) o solo el ticket total?

Debe tener opción a introducir en la apuesta cada “legs” con su cuota y de esta manera el programa debe calcular la cuota final (siempre con la opción a corrección manual, ya que algunas casas de apuestas no arrojan el calculo exacto o a veces incluyen promociones de % de aumentos en combinadas (ejemplo un 25% si creas una apuesta con 3 opciones combinadas de un mismo partido o competición)

En sistemas (Yankee/Trixie etc.): ¿quieres que el sistema:

a) genere automáticamente todas las combinaciones y sus importes, o

b) se registre como “ticket sistema” con datos agregados y retorno total?

En ese caso debe ofrecer las dos opciones, ya que no se debe limitar, generalmente se registra como ticket de sistema, pero debe existir todas las opciones, te dejo un ejemplo grafico donde se puede hacer apuestas sencillas por cada elección o te da las opciones de mas combinadas entre sencillas, dobles y trixie y se refleja la cantidad por las opciones de combinaciones ofrecidas:

7. Asian Handicap y resultados “fraccionados”

Confirmación: para AH 0.25/0.75 vamos a necesitar resultados tipo half win/half loss.
¿Quieres que el historial muestre eso como:

“Half Win / Half Loss” explícito, o

“Ganada 50% / Perdida 50%” (más claro para la mayoría)?

Ganada 50% / Perdida 50%, sin embargo, siempre tiene que tener la opción de introducir el monto manualmente, ya que no hay una regla escrita para para cada caso

8. Cashout parcial: contabilidad sin dolor

Cashout parcial “reduce exposición”: ¿quieres que la apuesta quede como:

a) una sola apuesta con múltiples eventos (cashout parcial + liquidación final), o

b) se “parta” en dos registros: parte cerrada (cashout) y parte que sigue abierta?

(Yo voto b: luego las estadísticas salen limpias. La opción a es más bonita… hasta que quieres auditar.)

Opción B sin duda

9. Ledger (libro de movimientos): nivel de trazabilidad

¿Quieres que TODO movimiento sea transacción auditable? (depósito, retiro, apuesta abierta, cashout, settlement final, transferencia entre banks).
Esto es lo que evita el clásico: “ayer cuadraba y hoy no sé por qué”.

si

10. Offline + sincronización

Si hay modo offline con sync: ¿qué pasa si el usuario edita el mismo ticket en dos dispositivos?

a) gana el último (last write wins),

b) se generan versiones,

c) se bloquea edición concurrente.

Opción A

11. OCR de tickets: qué esperas realmente

OCR: ¿solo “intentar extraer” cuota/importe/mercado y que el usuario confirme, o quieres automatizar el alta de la apuesta al 80%?
(Te lo digo serio: el OCR perfecto en tickets reales es un unicornio con hipoteca.)

La solución es que SIEMPRE hay que obligar al usuario a validar la selección final antes de procesarla y poder corregirla manualmente

12. Negocio (porque tus docs cargados apuntan a esto)

Tus documentos piden BMC e investigación de mercado

business-model

market-context

, así que: 21) ¿Esto es solo para ti o quieres convertirlo en producto (suscripción freemium, pago único, etc.)?

Inicialmente solo para mi, pero con miras de crear u gestor de finanzas atraves de las apuestas

22. Si es producto: ¿tu usuario objetivo es “apostador recreacional” o “semi-pro” (necesita auditabilidad y exportación seria)?

No puedo encasillar al posible usuario, debe crearse con un entorno seguro de gestión de una cantidad de dinero X, con el fin de poder identificar, como cada usuario a utilizado su dinero, viendo graficas, consultas de historial de ligas, mercados, equipos y hasta jugadores, para que se pueda determinar cosas como por ejemplo % de aciertos en X mercado o liga, etc. Debe funcionar como un gestor de inversión en apuestas y a la vez una base de datos consultable de esa gestión, que se puedan hace consultas como por ejemplo: cual es la liga donde acierto mas y reflejarlo tanto en cuantificables como porcentuales

RESUMEN DE DECISIONES CONSOLIDADAS (Bloque de cierre para evitar ambigüedades)

1. Stake (Escala única y Cap único)

- Escala oficial de Stake: 0 a 20.

- Stake 0: registro de seguimiento sin riesgo financiero (no compromete saldo).

- Cap máximo de exposición por apuesta: el Stake 20 equivale exactamente al 40% del CASH DISPONIBLE en el instante de creación.

- El cálculo de Stake se realiza siempre sobre CASH DISPONIBLE (no sobre bonus/freebet).

2. Modelo contable (3 bolsillos internos + UI simplificada)

- Internamente, cada Bank se compone de 3 bolsillos independientes con reglas:

A) Cash (dinero real)

B) Bonus (saldo promocional)

C) Freebet (saldo promocional no equivalente a cash; por defecto stake no retornable, configurable por casa)

- En la interfaz (UI) se puede mostrar un “Saldo Operativo” unificado para simplicidad, pero siempre con desglose (1 tap) mostrando Cash/Bonus/Freebet por separado.

3. Entrada de datos y normalización (anti-dudas)

- Los campos de Equipo/Competición NO se gestionan como texto libre por defecto: se implementan como selectores con búsqueda (autocompletado).

- Se prioriza búsqueda local (catálogo interno + alias) y se consulta la API deportiva solo como fallback cuando sea necesario.

- Se permite modo manual únicamente como salida de emergencia, quedando el registro marcado como “NO NORMALIZADO” y pendiente de revisión/normalización posterior.

4. Auditoría mínima recomendada (multiusuario/roles)

- Si existen roles (admin/editor/usuario), toda edición crítica debe quedar auditada (quién, qué cambió, cuándo), para trazabilidad.
