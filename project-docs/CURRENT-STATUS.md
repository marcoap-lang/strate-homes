# Strate Homes — CURRENT-STATUS

## Estado general
Fase 1 avanzada, con admin real funcional y acceso al admin ya más claro y usable para el entorno desplegado.

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
- Admin conectado a Supabase real para listar propiedades del workspace activo.
- Creación, edición y cambio de estatus de propiedades funcionando desde admin.
- Gestión básica de imágenes funcionando mediante registros en `property_images`.
- Validaciones mínimas de captura activas en formularios principales.
- Ruta de entrada al admin confirmada en `/admin`.
- Acceso al admin mejorado con entrada visible desde navbar y estados claros para sesión/workspace.
- Login básico por magic link preparado en la vista de acceso al admin.

## Qué está en curso
- mejorar la UX del selector explícito de workspace activo para usuarios multiworkspace
- validar flujo real de login/admin sobre producción con usuario miembro final
- decidir si harán falta políticas adicionales para `workspaces` en cuanto empiece escritura real de configuración
- refinar componentes reutilizables del admin

## Qué sigue inmediatamente después
1. aterrizar selección explícita de workspace activo cuando un usuario pertenezca a varios
2. mejorar la gestión real de imágenes más allá del registro manual de `storage_path`
3. validar en producción con usuario real el flujo login → acceso → CRUD
4. decidir políticas futuras para `workspaces` y posibles lecturas públicas/controladas
5. expandir shell admin con siguientes módulos reales sin abrir CRM todavía
6. refinar componentes UI compartidos del admin

## Blockers actuales
- No hay blockers técnicos críticos en este bloque.
- Falta una UX explícita para cambiar de workspace cuando el usuario tenga varios activos.
- La gestión de imágenes todavía depende de registrar `storage_path` manualmente; no hay uploader real aún.
- Falta validar con usuario real en producción que el membership y el acceso queden entendibles de punta a punta.

## Riesgos a vigilar
- escalar sin documentar decisiones
- dejar ambigua la resolución del workspace activo en usuarios multiworkspace
- asumir que la RLS mínima ya cubre autorización fina cuando todavía no cubre todo el producto
- que la gestión manual de imágenes se vuelva cuello de botella operativo si no se mejora pronto
- olvidar políticas futuras para `workspaces` y dominios nuevos
- añadir complejidad visual sin necesidad real
- perder el hilo de continuidad si no se actualiza esta documentación

## Criterio de cierre de esta etapa
Esta etapa se considera bien cerrada cuando exista:
- proyecto inicial funcionando
- landing premium funcional
- documentación persistente completa
- base técnica clara
- rutas y módulos iniciales preparados para continuar
