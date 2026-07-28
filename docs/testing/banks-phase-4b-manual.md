# Verificacion Manual Banks Fase 4B

Usa dos usuarios web autenticados para verificar creacion, ownership y saldos tras aplicar migration Fase 4B.

## Camino Rapido

1. Inicia sesion como usuario A y crea bank unico en `/dashboard/banks/new` con cash, bonus y freebet EUR positivos.
2. Verifica que lista y detalle muestran mismos tres importes y saldo operativo igual a cash.
3. Inicia sesion como usuario B y abre URL de detalle de usuario A. Espera `404` generico sin datos.

## Evidencia Esperada

| Verificacion | Resultado esperado                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Creacion     | `POST /api/banks` devuelve `201`; un bank, tres pockets y tres transacciones `initial_deposit` se crean juntos.             |
| Validacion   | Nombre vacio/duplicado tras trim, moneda no permitida, importe cero/negativo y `0.005` devuelven `400`; no persisten filas. |
| Ownership    | Usuario B recibe `404` generico para bank de usuario A; usuario A solo lista y ve propios banks.                            |
| Saldo        | `operative`, tarjeta de lista y detalle igualan cash; bonus y freebet permanecen separados.                                 |
| Atomicidad   | Fuerza nombre duplicado tras payload valido; verifica ausencia de pockets o transacciones adicionales.                      |

## Limite De Alcance

Transferencias, depositos, retiros, tickets, metas, recomendaciones y flujos administrativos quedan fuera.
