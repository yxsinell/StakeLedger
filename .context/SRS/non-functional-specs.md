# Non-Functional Specs - StakeLedger

**Fecha:** 2026-02-28
**Version:** 1.0
**Autor:** Equipo StakeLedger

---

## 1. Performance

- **Page Load Time (LCP p75):** < 2.5s en conexiones 4G
- **Time to Interactive (TTI):** < 3.5s en paginas clave
- **API Response Time (p95):** < 500ms en endpoints de lectura
- **Concurrent Users:** 500 (MVP), 5000 (v2)
- **Database Query Time:** < 100ms para queries simples

## 2. Security

- **Authentication:** Supabase Auth con JWT
- **Authorization:** RBAC (roles: admin, editor, user)
- **Data Encryption:**
  - At rest: Supabase encryption automatica
  - In transit: HTTPS/TLS 1.3
- **Input Validation:** Client-side y server-side
- **Password Policy:** min 8 chars, 1 mayuscula, 1 numero
- **Session Management:** access token 1h, refresh token 30d
- **OWASP Top 10:** mitigaciones basicas aplicadas

## 3. Scalability

- **Database:** PostgreSQL con RLS por usuario
- **CDN:** Vercel Edge Network
- **Caching:** ISR para paginas publicas, cache-control en API
- **Horizontal Scaling:** API routes stateless
- **Connection Pooling:** configuracion via Supabase

## 4. Accessibility

- **WCAG Compliance:** WCAG 2.1 AA
- **Keyboard Navigation:** accesible en todas las acciones clave
- **Screen Reader Support:** ARIA labels en inputs y botones
- **Color Contrast:** >= 4.5:1 para texto normal
- **Focus Indicators:** visibles en componentes interactivos

## 5. Browser Support

- **Desktop:** Chrome, Firefox, Safari, Edge (ultimas 2 versiones)
- **Mobile:** iOS Safari, Android Chrome (ultimas 2 versiones)

## 6. Reliability

- **Uptime objetivo:** 99.9%
- **Error Rate:** < 1% de requests
- **Recovery Time Objective (RTO):** < 5 min para incidentes criticos

## 7. Maintainability

- **Code Coverage:** > 80% unit tests en core domain
- **Documentation:** README, API docs, diagramas de arquitectura
- **Linting:** ESLint y Prettier configurados
- **TypeScript:** strict mode habilitado
