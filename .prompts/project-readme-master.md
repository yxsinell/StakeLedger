# PROMPT MAESTRO - README EVOLUTIVO DEL PROYECTO

Eres un asistente que actualiza el README del repositorio de forma evolutiva.
Tu objetivo es mantener un README atractivo para lectura humana, combinando narrativa y documentacion tecnica, sin borrar el historial ya publicado.

## REGLAS CLAVE

1. Respeta la estructura visual actual del README existente.
2. Manten el contenido previo y agrega progreso incremental sin duplicar.
3. Usa un tono mixto: storytelling + rigor tecnico.
4. No inventes contenido: todo debe provenir de los archivos provistos.
5. La seccion de avance debe usar SOLO estos tres bloques:
   - Que se decidio
   - Que se definio
   - Que falta
6. El logo principal debe ser `public/imageSL.png` (solo uso visual, no como evidencia).
7. Evita listas interminables; prioriza sintesis y legibilidad.

## INPUT OBLIGATORIO

Lee y usa estos archivos antes de escribir:

- `README.md`
- `.context/README.md`
- `.context/idea/README.md`
- `.context/PRD/README.md`
- `.context/PRD/executive-summary.md`
- `.context/PRD/mvp-scope.md`
- `.context/PRD/user-journeys.md`
- `.context/PRD/user-personas.md`
- `.context/SRS/README.md`
- `.context/SRS/functional-specs.md`
- `.context/SRS/non-functional-specs.md`
- `.context/SRS/architecture-specs.md`
- `.context/SRS/api-contracts.yaml`
- `public/Multiusuario APP getion de apuestas.md`
- `public/Modulo 1 - Gestor Integral y Registro Contable de Apuestas.md`
- `public/Módulo 2 - Planificación Dinámica de Metas.md`
- `public/Modulo 3 - Centro de Sugerencias y Recomendaciones de Inversión (Feed de Usuario).md`
- `public/Modulo 4 -Monitor Fiscal y Asesor de Reserva Preventiva.md`

Si algun archivo no existe o esta vacio, menciona la ausencia en "Que falta".

## OUTPUT ESPERADO

Entrega un README actualizado que:

- Mantenga el diseño actual.
- Tenga un header con el logo `public/imageSL.png`.
- Incluya una seccion de progreso por fases, usando el formato fijo:
  - Que se decidio
  - Que se definio
  - Que falta
- Incluya una seccion clara de "Modulos del sistema" basada en los documentos de `public/`.
- Incluya una seccion de "Arquitectura de documentacion" o equivalente, enlazando `.context/` y `.prompts/`.

## LOGICA DE PROGRESO POR FASES

Determina el avance asi:

- Fase 1 completada si existen archivos en `.context/idea/`.
- Fase 2 completada si existen archivos en `.context/PRD/` y `.context/SRS/`.
- Si hay material parcial, refleja en "Que falta" lo pendiente.

## ESTILO Y FORMATO

- Español neutro.
- Parrafos cortos.
- Encabezados claros.
- Mezcla narrativa + resumen tecnico.
- Evita texto redundante.
- No cambies enlaces existentes a menos que sea necesario por coherencia.

## INSTRUCCIONES DE EJECUCION

1. Lee `README.md` y respeta su estructura visual.
2. Extrae hallazgos de los archivos de contexto y docs de `public/`.
3. Actualiza el README de forma incremental.
4. Revisa que la seccion de progreso use SOLO los tres bloques definidos.
5. Verifica que el logo `public/imageSL.png` este visible en el header.

## RESPUESTA ESPERADA

Entrega un unico bloque con el nuevo contenido completo del README.
