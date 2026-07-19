# Implementation Plan: STORY-SL-12 - Registrar ticket con legs

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-009
- API contract: `.context/SRS/api-contracts.yaml` `/api/bets`, `/api/bets/{betId}`

## Estado Actual Verificado

- No existe `src/app/api/bets/route.ts` ni `src/app/api/bets/[betId]/route.ts`.
- `src/types/supabase.ts` contiene `bets` y `bet_legs`, pero `bets` solo tiene `bank_id`, `odds`, `stake_amount`, `status` y `created_at`.
- No existe campo `stake_level`, funding, reserved amount, goal link, idempotency key ni relacion con catalogo normalizado.
- `src/app/dashboard/page.tsx` lista bets recientes desde Supabase, pero no crea tickets ni muestra stake recomendado real.
- No hay test infra automatizada detectada.

## Dependencias

- Depende de Identity SL-2/SL-3 para usuario autenticado y ownership.
- Depende de Banks SL-7/SL-8/SL-10 para bank, cash disponible, pockets y ledger confiable.
- Depende de decisiones SL-18/SL-20 si las legs deben referenciar catalogo normalizado desde el primer MVP.

## Alcance

- Crear ticket con una o mas legs, odds validas y stake calculado o explicitado.
- Validar cap 40% sobre cash disponible.
- Reservar fondos del pocket definido y registrar ledger/audit.
- Mantener fuera de alcance OCR, importacion automatica y funding mixto avanzado de SL-13.

## Archivos a Tocar

- `src/app/api/bets/route.ts` - `GET` list y `POST` create.
- `src/app/api/bets/[betId]/route.ts` - detalle por ownership.
- `src/lib/bets/schemas.ts` - Zod para create/list/detail.
- `src/lib/bets/stake.ts` - calculo de stake, cap y validaciones.
- `src/lib/bets/service.ts` - persistencia atomica bet+legs+reservation.
- `src/lib/banks/balance.ts` - cash disponible reutilizable desde SL-8/SL-10.
- `src/lib/openapi/schemas/bets.ts` - schemas de contrato.
- `src/components/bets/bet-ticket-form.tsx` - formulario de ticket.
- `src/app/dashboard/page.tsx` o ruta dedicada de bets - integrar UI real.

## DB/RLS Necesarios

- Migration-first: requiere migracion aun no existente localmente para completar `bets` con `stake_level`, `result`, `return_amount`, `profit_amount`, `funding_status` y/o `reserved_transaction_id` si se aprueba.
- Definir si `bet_legs` guarda texto libre MVP o FK a catalogo normalizado.
- Definir constraint de `status` (`open|settled|cashed_out|void` o equivalente) y `odds > 1.0`.
- Requiere transaccion DB/RPC para crear bet, legs, reservar pocket y crear transaction/audit sin estado parcial.
- RLS: owner solo puede leer/crear bets de banks propios; bank ajeno debe devolver `403` o `404` consistente.

## API Necesaria

- `POST /api/bets` con `{ bankId, legs, odds, stakeLevel?, stakeAmount?, pocketType? }`.
- `GET /api/bets?bankId=` para listar bets del usuario.
- `GET /api/bets/{betId}` para detalle con legs y ledger summary.
- Success create: `201` con `{ success, bet }` alineado a OpenAPI.
- Errors: `400` odds/legs/stake invalido, `401`, `403` bank ajeno, `409` cap/saldo si se decide bloquear.

## UI Necesaria

- Formulario de ticket con bank, pocket, legs, odds, stake level/amount y preview de stake recomendado.
- Mostrar cap 40%, cash disponible y mensaje cuando el stake supera cap.
- `data-testid`: `betTicketForm`, `bank_select`, `pocket_select`, `ticket_odds_input`, `stake_level_input`, `stake_amount_input`, `add_leg_button`, `submit_bet_button`, `stake_cap_warning`.

## Validaciones Zod

- `bankId`: UUID.
- `legs`: array min 1; cada leg con `market`, `selection`, `odds > 1.0`.
- `odds`: number finite, > 1.0.
- `stakeLevel`: rango pendiente de confirmacion; ATP sugiere validar 0/limites.
- `stakeAmount`: number finite, > 0, precision aprobada.
- Definir exclusividad o precedencia entre `stakeLevel` y `stakeAmount`.

## Tests Minimos

- Unit: odds > 1.0, legs vacias, cap 40%, precedencia stake.
- API: crea bet+legs+reservation+audit con cash suficiente.
- API: odds invalidas y legs vacias devuelven `400` sin cambios DB.
- API/RLS: bank ajeno no permite crear bet.
- E2E: formulario muestra stake recomendado y confirma creacion.

## Criterios de Cierre

- AC SL-12 cubiertos: ticket exitoso, odds invalidas, cap aplicado.
- Dependencias SL-7/SL-8/SL-10 cerradas o mockeadas solo en tests unitarios.
- Ledger y audit explican la reserva de fondos.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Ajustar automaticamente vs bloquear si stake recomendado supera cap.
- Pocket permitido en SL-12: solo cash o cualquier pocket.
- Rango oficial de `stakeLevel` y precedencia contra `stakeAmount`.
- Idempotencia para doble envio.
