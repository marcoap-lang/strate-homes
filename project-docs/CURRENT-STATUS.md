# Strate Homes — CURRENT-STATUS

## Estado general
Fase 1 avanzada, con acceso de producto real ya resuelto mediante registro/login con correo + contraseña y onboarding inicial dentro del admin.

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
- Registro con correo + contraseña implementado como acceso principal.
- Login con correo + contraseña implementado como acceso principal.
- Redirect URL de auth preparado para producción sin depender de `Site URL` por defecto.
- Primer acceso resuelto: si el usuario tiene sesión pero no tiene workspace/member, puede crear su workspace inicial y quedar habilitado como owner.
- Bootstrap inicial endurecido con RPC segura en DB para crear workspace + owner membership + default workspace sin abrir permisos amplios en RLS.
- `/admin` ya no rompe cuando el usuario todavía no está completamente habilitado.
- Estados de acceso reescritos con experiencia de producto más limpia y menos técnica.
- Experiencia visual de acceso y onboarding refinada hacia un tono más claro, limpio y premium.
- Shell inicial del admin refinado con mejor jerarquía, workspace visible, usuario visible y logout claro.
- UX de fotos mejorada con guía visual, checklist sugerido de cobertura mínima y noción de completitud por propiedad.
- Uploader visual real de fotos integrado al admin con subida a Storage, preview, orden visual y selección de portada principal.

## Qué está en curso
- mejorar la UX del selector explícito de workspace activo para usuarios multiworkspace
- validar flujo real de login/admin sobre producción con usuario miembro final
- comprobar con usuario real el bootstrap inicial contra remoto después del ajuste por RPC segura
- decidir si harán falta políticas adicionales para `workspaces` en cuanto empiece escritura real de configuración
- refinar componentes reutilizables del admin
- validar y pulir el uploader visual real de fotos sobre uso operativo y luego decidir si necesita drag-and-drop completo

## Qué sigue inmediatamente después
1. aterrizar selección explícita de workspace activo cuando un usuario pertenezca a varios
2. pulir el uploader visual real de fotos y evaluar siguiente mejora de drag-and-drop / reorder más avanzado
3. validar en producción con usuario real el flujo registro/login → habilitación inicial → CRUD
4. decidir políticas futuras para `workspaces` y posibles lecturas públicas/controladas
5. expandir shell admin con siguientes módulos reales sin abrir CRM todavía
6. refinar componentes UI compartidos del admin

## Blockers actuales
- No hay blockers técnicos críticos en este bloque.
- Falta una UX explícita para cambiar de workspace cuando el usuario tenga varios activos.
- El uploader visual ya funciona, pero todavía puede requerir una capa posterior de drag-and-drop más fluida y reglas extra para limpieza/consistencia de Storage.
- Falta validar con usuario real en producción que el flujo completo de registro/login + habilitación inicial quede redondo de punta a punta, ahora ya sobre el nuevo RPC seguro.

## Riesgos a vigilar
- escalar sin documentar decisiones
- dejar ambigua la resolución del workspace activo en usuarios multiworkspace
- asumir que la RLS mínima ya cubre autorización fina cuando todavía no cubre todo el producto
- que la galería visual quede corta en usabilidad si no evoluciona después hacia drag-and-drop más fino, previews más ricos y limpieza automática más robusta
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
