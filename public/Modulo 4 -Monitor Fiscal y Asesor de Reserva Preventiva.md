Módulo 4: Monitor Fiscal y Asesor de Reserva Preventiva

1. Objetivo del Módulo

El objetivo principal es proporcionar al usuario una visión clara del impacto tributario que sus beneficios pueden tener al finalizar el ejercicio fiscal. El sistema no realiza el pago de impuestos, sino que emite recomendaciones de reserva de capital basadas en la normativa vigente de la jurisdicción seleccionada (España o EE. UU.), ayudando a mantener la liquidez necesaria para el momento de la declaración.

2. Configuración de Jurisdicción y Perfil Fiscal

Para que el cálculo sea preciso, el usuario debe definir su perfil en los ajustes del módulo:

A. Contexto España (Hacienda / IRPF)

El sistema aplica la lógica de Ganancias Patrimoniales dentro de la base imponible general:

Fórmula de Cálculo Anual: El sistema calcula el balance neto mediante la fórmula oficial:

$$\text{Beneficio Neto} = (\text{Ganancias} + \text{Bonos}) - (\text{Pérdidas} + \text{Depósitos})$$

Tramos de IRPF 2026: El usuario selecciona su tramo de ingresos por trabajo (salario) para que la app sepa en qué porcentaje empezarán a tributar sus apuestas (desde el 19% hasta el 47% en el tramo estatal y autonómico combinado).

Compensación de Pérdidas: El sistema recordará al usuario que solo puede restar pérdidas de ganancias dentro del mismo año natural (hasta el 31 de diciembre).

B. Contexto Estados Unidos (IRS / State Tax)

El sistema se adapta a la normativa federal y estatal de 2026:

Regla Federal del 90% (2026): El módulo incorpora la restricción que limita la deducción de pérdidas al 90% de las ganancias. El sistema calculará automáticamente la "ganancia imponible fantasma" incluso si el balance es neutro.

Impuesto Estatal: El usuario selecciona su estado de residencia (ej. Nevada, Nueva York, Florida) para aplicar los recargos adicionales correspondientes a la renta estatal.

3. Funcionalidades de Alerta y Operativa

3.1. Recomendador de Reserva tras Retiro

Cada vez que el usuario registre un "Retiro" de fondos desde una casa de apuestas hacia su cuenta bancaria en el Módulo 1, el Módulo 4 generará una sugerencia automática:

Cálculo de Reserva: Si el balance anual es positivo, la app calculará el porcentaje de impuesto estimado según el tramo del usuario.

Notificación: "Has retirado 500€. Según tu beneficio neto actual y tu jurisdicción, se sugiere realizar una reserva preventiva de [X]€ para tu próxima declaración de impuestos".

3.2. Gestión de Apuestas en Efectivo y Locales Físicos

Dado que el dinero en efectivo es más difícil de rastrear pero igualmente tributable si se ingresa en el banco, el sistema ofrece:

Registro de Cobro en Local: Permite marcar premios cobrados en ventanilla física.

Warning de Ingreso Bancario: Si el usuario intenta registrar un depósito al banco proveniente de un premio en efectivo, la app lanzará un aviso: "Alerta: Los ingresos de efectivo de origen desconocido pueden ser auditados por Hacienda/IRS. Se recomienda conservar el ticket físico de cobro como justificante".

4. Reporte Fiscal Anual (Pre-Declaración)

Al finalizar el año, el módulo genera un informe consolidado que el usuario puede exportar en PDF o CSV. Este reporte incluye:

Total de depósitos y retiros por casa de apuestas.

Balance neto de ganancias y pérdidas.

Estimación de la cuota tributaria a pagar basándose en los datos introducidos.

Privacidad y control del dato (alineación GDPR)

- El reporte fiscal anual se integra con el sistema global de exportación y borrado de datos (“export/erase data”), garantizando portabilidad y derecho de supresión según GDPR, sin romper la integridad del cálculo mientras existan obligaciones de conservación aplicables.

5. Descargo de Responsabilidad (Disclaimer Obligatorio)

Es fundamental que la interfaz de este módulo muestre siempre el siguiente aviso legal:

IMPORTANTE: La información y los porcentajes de reserva proporcionados por esta aplicación son meramente orientativos y basados en estimaciones generales de la normativa de 2026. Este módulo NO constituye asesoría fiscal legal. Se recomienda encarecidamente realizar una consulta con un gestor o asesor profesional antes de presentar cualquier declaración oficial, ya que las situaciones personales y las normativas locales pueden variar sustancialmente. El uso de esta herramienta es de carácter voluntario y no vinculante.
