# Design System - StakeLedger

## Version

- Version: v1.0.0 (primera version del frontend)

## Vision general

StakeLedger usa un estilo moderno/bold con contrastes claros, superficies profundas y acentos inspirados en el logotipo (azul-cian + verde lima). El sistema prioriza legibilidad, seguridad y foco operativo.

## Paleta de colores (HSL)

- Primary: 199 88% 46% (azul-cian, confianza + precision)
- Secondary: 84 60% 55% (verde lima, crecimiento + accion)
- Accent: 174 56% 32% (teal profundo, estabilidad)
- Background: 216 50% 98% (fondo claro, baja fatiga)
- Foreground: 222 47% 11% (texto principal)
- Muted: 214 32% 93% (superficies suaves)
- Border/Input: 214 28% 88% (separacion sutil)
- Sidebar: 222 50% 12% (foco operativo, alto contraste)

## Tipografia

- Display: Space Grotesk (titulares, fuerte y tecnica)
- Body: Manrope (lectura fluida, UI clara)

## Layout principal

- Sidebar collapsible (icon/collapsed)
- Header sticky con CTA y menu de usuario
- Contenido en columnas fluidas

## Componentes UI (shadcn/ui)

- Button (default, secondary, outline, ghost, destructive)
- Card (header/content/footer)
- Badge
- Input / Textarea
- Select
- Checkbox
- Radio Group
- Switch
- Dialog / Sheet / Popover / Tooltip
- Dropdown Menu
- Avatar
- Separator
- Skeleton

## Patrones de uso

- CTA principal: Button primary + sombra glow
- Acciones secundarias: Button secondary/outline
- Mensajes de error: borde destructive + fondo suave
- Listas de datos: Card + badges por estado

## Logo

- Archivo: public/imageSL.png
- Uso: sidebar, login, signup, landing

## Accesibilidad

- Contraste >= 4.5:1 en textos
- Focus ring visible (ring)
- Labels explicitas en inputs
- data-testid en elementos interactivos
