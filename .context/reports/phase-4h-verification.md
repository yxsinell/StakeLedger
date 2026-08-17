# Fase 4H — Verificación SL-14, SL-15 y SL-16

Fecha: 2026-08-17

## Alcance verificado

- Liquidación atómica por funding: `won`, `lost`, `void`, `half_won`, `half_lost`.
- Cashout parcial 100% cash con ticket derivado y carryover sin segundo débito.
- Auditoría append-only, trazabilidad transaction/bet/cashout e idempotencia.
- BFF cookie, UI de lista/detalle y acciones reales.
- Contratos Zod, OpenAPI runtime/estático, SRS, PBI y Business Data Map.

## Evidencia

| Verificación | Resultado |
| --- | --- |
| `bun test` | 57 tests, 57 pass, 142 assertions |
| `bun run test:e2e` | 1 Playwright pass: login, settlement UI, audit, cashout UI, audit |
| `bun run repo:check` | lint, Next production build y typecheck pass |
| OpenAPI runtime | Paths settlement, cashout y audit presentes |
| OpenAPI estático | YAML parseado correctamente |
| DB transaccional | Settlement, replay, conflicto, ownership, precisión/rollback, cashout split/carryover y auditoría pass |
| DB concurrencia | Dos sesiones concurrentes obtuvieron el mismo rechazo de precisión; ticket permaneció open sin idempotencias ni audit parcial |
| RLS/grants | Usuario cruzado ve 0 bets/0 audit; `authenticated` sin DML financiero ni EXECUTE de RPCs |
| Test cleanup | 0 usuarios, legs o tickets `Phase 4H` restantes |
| Legacy | 4 bets preservadas; 2 open siguen intactas y no liquidables |

## Supabase remoto

- `20260817045500_implement_settlement_cashout_audit`
- `20260817045542_index_settlement_cashout_references`
- RPCs `SECURITY INVOKER`, `search_path=''`, `EXECUTE` solo `service_role`.
- Advisors posteriores no muestran nuevas FKs sin índice ni nuevas funciones privilegiadas expuestas.
- Avisos RLS-sin-policy de tablas idempotentes son defensa intencional sin grants de aplicación.

## Riesgos preexistentes fuera de Fase 4H

- La ambigüedad previa de `role_version` en `change_user_role` fue corregida mediante `20260817150340_fix_change_user_role_version_ambiguity`.
- Leaked password protection continúa desactivada y requiere acción manual ya documentada.
- Avisos GraphQL/SECURITY DEFINER existentes mantienen clasificación de `.context/supabase-security-posture.md`.
