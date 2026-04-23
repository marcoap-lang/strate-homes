# Strate Homes — TODO-NEXT

## Prioridad alta
1. Aplicar y validar la migración de `workspace_members` en el remoto.
2. Diseñar estrategia base de RLS usando `workspace_members` + `workspace_role`.
3. Decidir cómo forzar consistencia multiworkspace entre `agents`, `properties` y `property_images`.
4. Definir concepto de workspace activo en app/admin.
5. Crear páginas públicas base de agente y empresa.
6. Expandir el shell del admin con navegación y secciones reales.

## Prioridad media
7. Diseñar componentes reutilizables formales para cards, métricas, tablas y formularios.
8. Añadir sistema inicial de tokens de branding por workspace.
9. Evaluar si `public_code` debe ser único por workspace o global.
10. Registrar contrato de datos siguiente para leads y CRM ligero.
11. Definir estados del pipeline comercial y reglas básicas de transición.
12. Diseñar modelo de eventos/actividad para trazabilidad comercial.
13. Diseñar estructura de media gallery y assets de propiedades más allá del metadata inicial.
14. Definir esquema para featured blocks configurables.

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
5. revisar `supabase/migrations/` y aplicar la segunda migración si aún no está en remoto
6. diseñar políticas RLS base sobre `workspace_members`
7. decidir constraints/triggers de consistencia multiworkspace antes de abrir escritura real

## Criterio práctico de continuidad
No continuar con nuevas áreas sin actualizar:
- `CURRENT-STATUS.md`
- `DECISIONS-LOG.md`
- `TODO-NEXT.md`
