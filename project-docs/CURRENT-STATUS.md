# Strate Homes — CURRENT-STATUS

## Estado general
Fase 1 avanzada, con proyecto remoto real en Supabase, Auth base lista, workspace activo mínimo resuelto y RLS inicial por workspace ya aplicada.

## Qué ya está hecho
- Repositorio base creado con Next.js + TypeScript + Tailwind.
- Carpeta `project-docs/` creada como memoria persistente del proyecto.
- Documentación fundacional completa en primera versión.
- Identidad inicial del producto, principios del sistema y roadmap establecidos.
- Landing premium v1 implementada.
- Shell inicial de administración implementado en `/admin`.
- Páginas públicas base de propiedades implementadas en `/properties` y `/properties/[slug]`.
- Tipos de dominio base creados.
- Mock data estructurada integrada.
- Build validado con éxito.
- Supabase CLI instalado y proyecto inicializado con carpeta `supabase/`.
- Proyecto remoto real de Supabase creado para Strate Homes y enlazado al repo.
- Primera migración inicial aplicada en remoto con entidades mínimas: `workspaces`, `profiles`, `agents`, `properties`, `property_images`.
- Bucket inicial de Storage definido para imágenes de propiedades.
- Contrato de dominio frontend alineado al nuevo esquema mínimo.
- Base de cliente Supabase agregada para integración futura.
- Verificación estructural realizada contra el remoto: no se detectaron diferencias entre migración versionada y schema `public` remoto.
- Segunda migración preparada para identidad y pertenencia: `workspace_members` + enum `workspace_role`.
- Flujo base de sincronización entre `auth.users` y `profiles` definido mediante triggers SQL.
- Integración base de sesión Supabase agregada a la app para server/browser.
- Resolución mínima de workspace activo agregada para server y client.
- Reglas mínimas de consistencia multiworkspace preparadas para propiedades e imágenes.
- RLS base aplicada en `profiles`, `workspace_members`, `agents`, `properties` y `property_images`.
- Helper functions de autorización por workspace/rol agregadas en base de datos.
- Validación estructural posterior al push: sin drift detectado contra el remoto.

## Qué está en curso
- terminar de aterrizar la noción de workspace activo en flujos reales de admin
- decidir si harán falta políticas adicionales para `workspaces` en cuanto empiece escritura real de configuración
- refinar componentes reutilizables
- expandir admin shell hacia navegación funcional
- preparar base de páginas públicas de agente y empresa

## Qué sigue inmediatamente después
1. aterrizar selección explícita de workspace activo cuando un usuario pertenezca a varios
2. definir si la consistencia restante multiworkspace vivirá en más triggers SQL o en capa app
3. decidir políticas futuras para `workspaces` y posibles lecturas públicas/controladas
4. definir componentes UI compartidos de forma más formal
5. crear páginas públicas de agente y empresa
6. expandir shell admin con secciones reales

## Blockers actuales
- No hay blockers técnicos críticos en este bloque.
- La base mínima de aislamiento ya existe.
- Falta una UX explícita para cambiar de workspace cuando el usuario tenga varios activos.

## Riesgos a vigilar
- escalar sin documentar decisiones
- dejar ambigua la resolución del workspace activo en usuarios multiworkspace
- asumir que la RLS mínima ya cubre autorización fina cuando todavía no cubre todo el producto
- olvidar políticas futuras para `workspaces` y dominios nuevos
- sobrecargar el dashboard con demasiadas métricas antes de tiempo
- añadir complejidad visual sin necesidad real
- perder el hilo de continuidad si no se actualiza esta documentación

## Criterio de cierre de esta etapa
Esta etapa se considera bien cerrada cuando exista:
- proyecto inicial funcionando
- landing premium funcional
- documentación persistente completa
- base técnica clara
- rutas y módulos iniciales preparados para continuar
