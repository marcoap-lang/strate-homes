# Strate Homes — TODO-NEXT

## Prioridad alta
1. Validar y pulir admin móvil en celular real: ya hay primer pase responsive, falta comprobar navegación, formularios, galería y acciones con uso real.
2. Validar manualmente en producción/incógnito que links de copiar, WhatsApp, preview y “Ver sitio público” siempre usen `https://homes.strate.lat`.
3. Validar con usuario real el flujo completo: registro/login → bootstrap inicial → admin → CRUD de propiedades → publicación pública.
4. Validar una subida real de foto en hospedado; si falla, capturar mensaje exacto del cliente antes de tocar policies.
5. Diseñar UX explícita de workspace activo para usuarios con múltiples workspaces sin reintroducir confusión operativa.
6. Mantener documentación viva alineada con leads mínimos, notas internas, source type, branding público y detalles comerciales de propiedad.

## Prioridad media
7. Pulir leads como CRM ligero: estados, nota interna, fuente y propiedad de interés.
8. Mejorar branding público desde admin con preview más rica y manejo controlado de logo/hero.
9. Diseñar componentes reutilizables formales para cards, métricas, tablas y formularios.
10. Definir estados futuros del pipeline comercial y reglas básicas de transición.
11. Diseñar modelo de eventos/actividad para trazabilidad comercial.
12. Evaluar si `public_code` debe ser único por workspace o global.

## Prioridad baja por ahora
13. Iterar property tours MVP: edición de recorridos, expiración opcional, analytics de apertura/clics y mejor copy para WhatsApp.
14. Validar en producción la creación real de un recorrido desde `/admin/leads` con un lead existente.
15. Profundizar diseño de bot de WhatsApp por capas.
16. Diseñar analítica comercial inicial.
17. Evaluar SEO schema y slugs finales.
18. Evaluar featured blocks configurables cuando la home pública necesite más control editorial.

## Próximo bloque recomendado
Si se retoma este proyecto en otra sesión, ejecutar en este orden:
1. leer `project-docs/PROJECT-TRACKER.md`
2. leer `project-docs/CURRENT-STATUS.md`
3. revisar `git status --short`
4. priorizar admin móvil antes de nuevos módulos
5. probar property tours con lead real y ajustar UX de creación si hace falta
6. correr `npm run lint`
7. correr `npm run build`
8. ejecutar solo un bloque pequeño y verificable
9. actualizar `PROJECT-TRACKER.md`, `CURRENT-STATUS.md` y este archivo

## Criterio práctico de continuidad
No continuar con nuevas áreas sin actualizar:
- `PROJECT-TRACKER.md`
- `CURRENT-STATUS.md`
- `TODO-NEXT.md`
- `ARCHITECTURE.md` si cambia el modelo de datos o permisos
- `DECISIONS-LOG.md` si se toma una decisión de producto/arquitectura nueva
