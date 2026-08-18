# Fase 5 - UI conectada y cierre de journeys MVP

> Fecha: 2026-08-18. Alcance derivado de FR-001 a FR-025, Business Data Map y auditoría de la UI posterior a Fase 4.

## Objetivo

Convertir las APIs y reglas MVP ya implementadas en journeys utilizables de extremo a extremo. No se añaden proveedores deportivos, scraping, ranking ICP, automatismos de ticket ni migrations de dominio.

## Alcance completo

1. Auth completo: logout con redirección, carga de perfil estable y ruta de actualización de contraseña después del enlace de recuperación.
2. Shell: dashboard operativo, navegación móvil accesible, boundaries globales/dashboard y RBAC con carga, acceso denegado y retry consistentes.
3. Ledger: historial de movimientos y asientos trazables por bank, incluidos depósitos, retiradas, transferencias, reservas y retornos; auditoría de ticket navegable.
4. Tickets: catálogo normalizado usable desde ticket y editorial, sin UUIDs manuales; ticket -> liquidación/cashout -> asientos -> derivado navegable; idempotencia cliente estable para operaciones financieras.
5. Catálogo: endpoints BFF de lectura para los `catalog_events` y `catalog_markets` existentes; no añade schema ni fuentes externas.
6. Goals, admin, recomendaciones y métricas: loading, empty, error, retry, permisos, responsive, accesibilidad y `data-testid` completos para las superficies MVP.
7. Validación: pruebas unitarias/API focalizadas y Playwright con journeys auth, bank/ledger, ticket/funding, catálogo, settlement/cashout, goals/risk, recomendaciones/follow/prefill, métricas y RBAC.

## Decisiones

- Las lecturas nuevas se exponen exclusivamente mediante BFF cookie y RLS existente.
- Los selectores normalizados parten de eventos y mercados activos ya existentes; una leg manual sigue siendo alternativa explícita.
- La clave de idempotencia se mantiene por operación y fingerprint hasta una respuesta confirmada, incluso después de un fallo de red.
- El dashboard agrega datos reales de endpoints existentes; no muestra KPI de marketing como métrica operativa.
- El alcance no modifica grants, RLS, RPCs financieras ni migrations sin una incompatibilidad demostrada.

## Fuera de alcance

- Integraciones de proveedores, scraping, OCR, ranking o personalización de recomendaciones.
- Creación automática de tickets al seguir recomendaciones.
- Cambios de seguridad Supabase, Dependabot y deuda ATP manual como trabajos independientes.
