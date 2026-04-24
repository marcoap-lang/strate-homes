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
- Políticas de Storage agregadas para `property-images` alineadas al workspace activo, habilitando subida real desde sesión autenticada.
- Mensajes de error del uploader mejorados para distinguir permisos, archivo inválido y conflictos básicos.
- Módulo de propiedades reorganizado en rutas navegables separadas: listado, alta y edición.
- El inventario existente ahora se prioriza como vista principal en `/admin/properties`, dejando alta y edición en experiencias separadas.
- Política operativa multiusuario definida formalmente para roles, permisos, visibilidad de inventario y asignación de propiedades dentro de una inmobiliaria multiusuario.
- Enforcement base de roles bajado a las acciones y UI del módulo de propiedades: agent crea, agent edita solo su ámbito, owner/admin gestionan inventario completo y asignaciones.
- Flujo operativo reforzado para evitar borrado de propiedades y privilegiar archivado/despublicación por rol.
- Modelo de propiedades endurecido estructuralmente con `created_by` formal, `agent_id` ratificado como agente asignado y RLS/policies más cercanas al alcance operativo real.
- Modelo multiusuario ajustado para separar rol operativo del workspace y perfil comercial de agente como capas distintas y compatibles.
- Módulo Equipo visible en `/admin/team` para mostrar por persona su rol operativo y si además tiene perfil comercial activo.
- Dependencia legacy del rol `agent` limpiada en el enforcement principal de propiedades: los permisos operativos ahora dependen del rol en `workspace_members` y la operación comercial depende del perfil activo en `agents`.
- Activación y edición de perfil comercial ya operables desde Equipo para usuarios existentes del workspace, incluyendo owner/admin que quieran activarse como agente.
- Capa pública de propiedades ya conectada a Supabase con inventario real activo/publicado para listado y detalle.
- Ficha pública de propiedad refinada con presentación más comercial y premium: mejor portada, galería más jerarquizada, resumen claro, mejor ficha física y bloque de contacto/agente más visible.
- Home pública del workspace/inmobiliaria creada con datos reales: identidad básica, hero, propiedades destacadas, inventario activo, CTA y agentes visibles.
- Dirección visual pública refinada hacia una estética más premium/editorial para evaluar mejor el producto con sensación de brokerage de alto nivel.
- Seed demo completo preparado en `supabase/seed.sql` con inmobiliaria demo, agentes demo, propiedades variadas y galerías útiles para probar admin y sitio público.
- Seed remoto compatible con usuarios reales cargado en hospedado vía `supabase/seed-remote.sql`, reutilizando perfiles existentes del sistema sin depender de UUIDs inexistentes en `auth.users`.
- Showroom demo remoto materializado: workspace `azure-coast-realty`, 2 memberships activas, 2 agentes públicos activos, 14 propiedades demo y 51 imágenes metadata; 12 propiedades ya públicas/activas.

## Qué está en curso
- mejorar la UX del selector explícito de workspace activo para usuarios multiworkspace
- validar flujo real de login/admin sobre producción con usuario miembro final
- comprobar con usuario real el bootstrap inicial contra remoto después del ajuste por RPC segura
- validar en uso real el nuevo enforcement estructural de propiedades para detectar huecos antes de extenderlo a más módulos
- seguir limpiando el uso legacy de `agent` en módulos futuros y evitar reintroducirlo como rol operativo principal
- validar en uso real el flujo de activación/edición de perfil comercial desde Equipo
- decidir si harán falta políticas adicionales para `workspaces` en cuanto empiece escritura real de configuración
- refinar componentes reutilizables del admin
- validar en uso real el uploader visual de fotos ya habilitado y luego decidir si necesita drag-and-drop completo
- validar con propiedades reales la consistencia comercial de la capa pública (copy, fotos, agente visible, contacto)
- mejorar después el CTA real cuando se conecte lead capture/contacto operativo
- decidir más adelante resolución explícita del workspace público cuando existan múltiples sitios públicos fuertes
- ampliar más adelante el showroom remoto para usar 3-4 agentes visibles si existen más perfiles reales disponibles, sin acoplarse a usuarios demo ficticios

## Qué sigue inmediatamente después
1. aterrizar selección explícita de workspace activo cuando un usuario pertenezca a varios
2. pulir el uploader visual real de fotos y evaluar siguiente mejora de drag-and-drop / reorder más avanzado
3. validar en producción con usuario real el flujo registro/login → habilitación inicial → CRUD
4. extender la misma disciplina estructural a equipo y permisos administrativos finos
5. decidir si hace falta una migración posterior para retirar por completo el rol legacy `agent` del enum operativo
6. mejorar después la experiencia visual del perfil comercial con preview más rica y manejo de assets menos manual
7. profundizar la experiencia pública de propiedades ahora que ya consume inventario real
8. conectar después el CTA público con captura real de interés/contacto
9. separar más adelante routing público por workspace/agente cuando el producto lo requiera
10. revisar si conviene poblar el showroom remoto con más perfiles reales activos para enriquecer el módulo Equipo sin tocar Auth
6. decidir políticas futuras para `workspaces` y posibles lecturas públicas/controladas
7. profundizar la experiencia del módulo de propiedades ahora que ya tiene rutas separadas
8. refinar componentes UI compartidos del admin

## Blockers actuales
- No hay blockers técnicos críticos en este bloque.
- Falta una UX explícita para cambiar de workspace cuando el usuario tenga varios activos.
- El uploader visual ya funciona con policies de Storage compatibles, pero todavía puede requerir una capa posterior de drag-and-drop más fluida y reglas extra para limpieza/consistencia de Storage.
- Falta validar con usuario real en producción que el flujo completo de registro/login + habilitación inicial quede redondo de punta a punta, ahora ya sobre el nuevo RPC seguro.

## Riesgos a vigilar
- escalar sin documentar decisiones
- dejar ambigua la resolución del workspace activo en usuarios multiworkspace
- asumir que la RLS mínima ya cubre autorización fina cuando todavía no cubre todo el producto
- avanzar UI multiusuario sin aterrizar primero created_by, assigned_agent y reglas reales de visibilidad/edición
- que la galería visual quede corta en usabilidad si no evoluciona después hacia drag-and-drop más fino, previews más ricos y limpieza automática más robusta
- olvidar políticas futuras para `workspaces` y dominios nuevos
- añadir complejidad visual sin necesidad real
- dejar inconsistencias entre rutas del módulo de propiedades si no se mantiene disciplina de navegación
- perder el hilo de continuidad si no se actualiza esta documentación

## Criterio de cierre de esta etapa
Esta etapa se considera bien cerrada cuando exista:
- proyecto inicial funcionando
- landing premium funcional
- documentación persistente completa
- base técnica clara
- rutas y módulos iniciales preparados para continuar
