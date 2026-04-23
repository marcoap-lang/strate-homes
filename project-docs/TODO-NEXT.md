# Strate Homes — TODO-NEXT

## Prioridad alta
1. Validar la migración inicial de Supabase en entorno local y dejar documentado el flujo operativo (`db reset` / `db push`).
2. Diseñar y documentar `workspace_members`, roles iniciales y estrategia base de Auth + RLS.
3. Crear páginas públicas base de agente y empresa.
4. Expandir el shell del admin con navegación y secciones reales.
5. Diseñar componentes reutilizables formales para cards, métricas, tablas y formularios.
6. Añadir sistema inicial de tokens de branding por workspace.

## Prioridad media
7. Registrar contrato de datos siguiente para leads y CRM ligero.
8. Definir estados del pipeline comercial y reglas básicas de transición.
9. Diseñar modelo de eventos/actividad para trazabilidad comercial.
10. Diseñar estructura de media gallery y assets de propiedades más allá del metadata inicial.
11. Definir esquema para featured blocks configurables.

## Prioridad baja por ahora
12. Profundizar diseño de bot de WhatsApp por capas.
13. Diseñar analítica comercial inicial.
14. Evaluar SEO schema y slugs finales.

## Próximo bloque recomendado
Si se retoma este proyecto en otra sesión, ejecutar en este orden:
1. leer `project-docs/README-PROJECT.md`
2. leer `project-docs/CURRENT-STATUS.md`
3. leer `project-docs/ARCHITECTURE.md`
4. leer `project-docs/DECISIONS-LOG.md`
5. revisar `supabase/migrations/` y `src/types/domain.ts`
6. validar migración local de Supabase
7. continuar con Auth + RLS + membresías o, si se decide aplazar seguridad, seguir con páginas públicas de agente/empresa

## Criterio práctico de continuidad
No continuar con nuevas áreas sin actualizar:
- `CURRENT-STATUS.md`
- `DECISIONS-LOG.md`
- `TODO-NEXT.md`
