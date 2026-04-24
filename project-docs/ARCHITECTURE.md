# Strate Homes — ARCHITECTURE

## Arquitectura general
Strate Homes se construye como un SaaS modular sobre Next.js + TypeScript + Tailwind + Supabase.

La arquitectura debe soportar desde el día uno:
- presencia pública premium
- administración privada
- operaciones multiworkspace
- relación entre propiedades, leads, agentes y empresa
- personalización controlada de experiencia pública
- futura automatización por WhatsApp

Se prioriza una arquitectura de producto clara y extensible, evitando sobreingeniería temprana.

## Principios técnicos clave
- App Router para separar claramente experiencias públicas y privadas.
- TypeScript estricto para preservar integridad de dominio.
- Supabase como backend principal para Auth, Postgres y Storage.
- Componentes UI reutilizables con diseño consistente.
- Dominio modelado por entidades, no por pantallas.
- Personalización basada en configuración estructurada, no HTML libre.
- Multiworkspace preparado desde el modelo, aunque no todo se implemente en la primera entrega.

## Módulos del sistema
### 1. Public Experience
- landing
- listado público de propiedades
- detalle de propiedad
- página pública de agente
- página pública de empresa

### 2. Commercial CRM
- leads
- clientes/contactos
- notas
- pipeline
- visitas
- actividad comercial

### 3. Operations
- propiedades
- medios
- estados
- asignaciones
- equipo
- permisos

### 4. Brand & Public Personalization
- branding workspace
- branding de agente
- bloques públicos configurables
- CTAs
- contenido editable estructurado

### 5. Automation Foundation
- eventos de captura de lead
- fuente de lead
- intención de contacto
- hooks para bot futuro
- handoff a humano

### 6. Analytics Foundation
- métricas por fuente
- métricas por propiedad
- métricas por agente
- tiempos de respuesta
- conversión por etapa

## Esquema multiagente
Entidad conceptual:
- workspace
- workspace_member
- agent_profile
- operational_role
- permission profile

Idea base:
- un usuario autenticado puede pertenecer a uno o más workspaces en el futuro
- un workspace representa una inmobiliaria, equipo o agente individual
- la membresía del workspace controla permisos internos y rol operativo
- el perfil comercial de agente es una capa separada y opcional
- una misma persona puede ser `owner` o `admin` y además tener perfil comercial de agente
- las propiedades, leads y branding viven dentro de un workspace
- algunas propiedades pueden asignarse a un agente responsable

## Esquema multiworkspace
El sistema debe poder operar con estas modalidades:
- agente individual: un workspace con un solo miembro
- equipo pequeño: workspace con varios agentes
- inmobiliaria: workspace con branding institucional, varios agentes y páginas públicas compartidas

Convención base:
- todas las entidades de negocio clave incluyen `workspaceId`
- los slugs públicos pueden existir a nivel workspace y a nivel agent profile
- la configuración visual pública se resuelve por workspace o por perfil agente según contexto

## Autenticación
Autenticación base integrada con Supabase Auth.

Capas:
- autenticación: identidad del usuario en `auth.users`
- perfil de aplicación: `public.profiles`
- pertenencia organizacional: `public.workspace_members`
- capa operativa/pública comercial: `public.agents`
- visibilidad pública: páginas públicas accesibles sin login

Estado actual:
- la app ya tiene cliente base de Supabase para server/browser
- el layout raíz hidrata sesión inicial cuando existe
- todavía no se implementan guards completos ni RLS

Siguiente capa:
- middleware para rutas privadas
- guards por rol
- políticas RLS en Supabase
- selección de workspace activo por usuario

## Modelo inicial de datos en Supabase
Este bloque implementa únicamente la base mínima necesaria para arrancar el inventario y la operación inicial, sin intentar resolver todavía CRM completo, membresías multiworkspace avanzadas ni automatización.

### Entidades incluidas en la base estructural actual
- `workspaces`
- `profiles`
- `workspace_members`
- `agents`
- `properties`
- `property_images`

### Relaciones base
- `profiles.id` referencia `auth.users.id` para mantener a Supabase Auth como fuente de identidad.
- `profiles.default_workspace_id` permite resolver un contexto inicial por usuario.
- `workspace_members.workspace_id` conecta perfiles con workspaces.
- `workspace_members.profile_id` define la pertenencia del usuario al workspace.
- `agents.workspace_id` conecta cada agente a un workspace.
- `agents.profile_id` conecta opcionalmente al agente con un usuario autenticado.
- `properties.workspace_id` asegura aislamiento del inventario por workspace.
- `properties.created_by` registra de forma formal al perfil que creó la propiedad.
- `properties.agent_id` representa el agente asignado dentro del modelo actual.
- `property_images.property_id` conecta la galería con cada propiedad.
- `property_images.workspace_id` replica el contexto de workspace para facilitar trazabilidad y futuras políticas.

### Decisiones de alcance para este bloque
- Ya existe `workspace_members` como base mínima de pertenencia multiworkspace.
- No se crean todavía tablas de `leads`, `visits`, `notes`, `pipeline` o actividad comercial.
- No se implementan aún políticas RLS completas; solo se deja el modelo listo para agregarlas en el siguiente bloque.
- No se acopla todavía la UI a lecturas/escrituras reales del negocio; la app puede seguir usando mocks mientras se estabiliza el contrato de datos.

### Diseño de entidades mínimas
#### `workspaces`
Representa la unidad operativa principal. Puede mapear a agente individual, equipo o inmobiliaria.

Campos clave:
- `id`
- `name`
- `slug`
- `legal_name`
- `brand_name`
- `brand_primary_color`
- `brand_accent_color`
- `is_active`
- timestamps

#### `profiles`
Representa el perfil privado del usuario autenticado. Vive alineado a `auth.users`.

Campos clave:
- `id`
- `full_name`
- `email`
- `phone`
- `avatar_url`
- `default_workspace_id`
- `is_active`
- timestamps

#### `workspace_members`
Tabla base de pertenencia entre perfiles autenticados y workspaces.

Campos clave:
- `id`
- `workspace_id`
- `profile_id`
- `role`
- `is_active`
- `invited_by`
- `joined_at`
- timestamps

Restricción relevante:
- unicidad por `(workspace_id, profile_id)`

Roles operativos vigentes en transición:
- `owner`
- `admin`
- `staff`
- `agent` (legacy; debe migrarse progresivamente fuera del núcleo operativo)

### Política operativa formal de roles
#### `owner`
Responsable máximo del workspace.

Puede ver:
- todo el inventario del workspace
- todos los miembros, agentes y configuraciones operativas
- estado global del workspace

Puede crear:
- propiedades
- agentes
- usuarios del equipo
- configuración operativa futura del workspace

Puede editar:
- cualquier propiedad del workspace
- asignaciones de propiedad
- roles del equipo
- configuración general del workspace

No debería hacer:
- borrar propiedades como flujo normal; debe archivar o despublicar

#### `admin`
Operador de confianza con control amplio del workspace, pero sin soberanía total sobre ownership.

Puede ver:
- todo el inventario del workspace
- todo el equipo operativo
- asignaciones y estado de propiedades

Puede crear:
- propiedades
- agentes
- miembros del equipo según política del workspace

Puede editar:
- cualquier propiedad del workspace
- asignaciones de propiedad
- roles de `agent` y `staff`
- datos operativos del equipo

No puede:
- degradar o expulsar al `owner`
- transferir ownership por sí mismo
- borrar propiedades como flujo normal; debe archivar o despublicar

#### `agent` (legacy)
Rol heredado que todavía existe en el sistema actual por compatibilidad, pero conceptualmente debe migrar hacia una combinación más limpia entre rol operativo y perfil comercial.

Lectura correcta a futuro:
- los permisos internos deben vivir en la membresía del workspace
- la capacidad comercial/pública debe vivir en `agents`
- una persona no debe quedar forzada a elegir entre ser admin del sistema o agente comercial

#### `staff`
Usuario de apoyo operativo o administrativo con acceso restringido.

Puede ver:
- solo la información necesaria para su función
- inventario del workspace solo cuando el módulo o la política concreta lo justifique

Puede crear:
- no crea propiedades como regla general

Puede editar:
- tareas o campos auxiliares futuros definidos por producto

No puede:
- publicar, archivar o reasignar propiedades
- invitar usuarios
- cambiar roles
- editar inventario principal como regla base

#### `agents`
Capa comercial y pública del agente. Se separa de `profiles` porque no todo agente visible requiere exponer toda la identidad privada, y porque la presencia comercial no debe confundirse con el rol operativo interno.

Campos clave:
- `id`
- `workspace_id`
- `profile_id` opcional
- `slug`
- `display_name`
- `title`
- `bio`
- canales de contacto básicos
- `is_public`
- `is_active`
- timestamps

Restricción relevante:
- unicidad por `(workspace_id, slug)`

#### `properties`
Inventario mínimo con foco en publicación y operación inmobiliaria temprana.

Campos clave:
- `id`
- `workspace_id`
- `agent_id` opcional como agente asignado
- `created_by` requerido formalmente
- `assigned_agent_id` pospuesto; en el modelo actual la asignación vive en `agent_id`
- `title`
- `slug`
- `public_code`
- `description`
- `property_type`
- `status`
- `operation_type`
- `is_featured`
- ubicación resumida y campos básicos de dirección
- precio y moneda
- atributos físicos esenciales
- `published_at`
- timestamps

Enums iniciales:
- `property_status`: `draft`, `active`, `pending`, `sold`, `rented`, `archived`
- `operation_type`: `sale`, `rent`, `both`
- `property_type`: `house`, `apartment`, `land`, `office`, `commercial`, `warehouse`, `building`, `development`, `mixed_use`

Restricción relevante:
- unicidad por `(workspace_id, slug)`

Política operativa objetivo:
- cada propiedad registra quién la creó (`created_by`)
- cada propiedad contempla agente responsable mediante `agent_id` como agente asignado actual
- `agent` puede crear propiedades
- `agent` no puede borrar propiedades
- `owner` y `admin` archivan o despublican en vez de borrar
- `agent` solo puede editar propiedades creadas por él o asignadas a él
- por política base, `agent` sí ve el inventario del workspace, pero su capacidad de edición se limita a su ámbito

#### `property_images`
Tabla de metadatos para imágenes alojadas en Supabase Storage.

Campos clave:
- `id`
- `workspace_id`
- `property_id`
- `storage_bucket`
- `storage_path`
- `alt_text`
- `sort_order`
- `is_cover`
- timestamps

### Flujo base de creación y sincronización de perfiles
Flujo adoptado en esta etapa:
1. Supabase Auth crea el usuario en `auth.users`.
2. Un trigger `on_auth_user_created` ejecuta `handle_new_user_profile()`.
3. Esa función crea o sincroniza el registro correspondiente en `public.profiles`.
4. Un trigger `on_auth_user_updated` sincroniza cambios básicos de `email` y `phone` desde `auth.users` hacia `profiles`.
5. La pertenencia organizacional vive aparte en `workspace_members`.
6. La relación con presencia comercial/pública vive aparte en `agents`.

Esto separa con claridad:
- identidad autenticada
- perfil de app
- pertenencia a workspace
- rol operativo/público del agente

### Storage inicial
Se crea el bucket público `property-images` como punto de partida para galerías de propiedades.

### Convenciones técnicas adoptadas en la migración
- UUIDs generados con `gen_random_uuid()`.
- timestamps en UTC con `created_at` y `updated_at`.
- trigger compartido `set_updated_at()` para consistencia.
- checks básicos para slugs, códigos de país/moneda y valores no negativos.
- índices en llaves foráneas y campos de consulta obvia del MVP.

## Verificación estructural del esquema remoto
Se verificó el proyecto remoto de Supabase enlazado a Strate Homes contra la migración inicial aplicada.

### Resultado general
La estructura remota en schema `public` coincide con la migración base del proyecto para este bloque.

Validación realizada:
- migración aplicada vía `supabase db push`
- inspección posterior con `supabase db pull --schema public --linked`
- resultado relevante: `No schema changes found`

Eso confirma, para el alcance actual, que el esquema remoto y la definición versionada están alineados.

### Tablas estructurales confirmadas
- `public.workspaces`
- `public.profiles`
- `public.agents`
- `public.properties`
- `public.property_images`

### Elementos estructurales confirmados
- PKs UUID en todas las tablas principales
- FK `profiles.id -> auth.users.id`
- FK `profiles.default_workspace_id -> workspaces.id`
- FK `agents.workspace_id -> workspaces.id`
- FK `agents.profile_id -> profiles.id`
- FK `properties.workspace_id -> workspaces.id`
- FK `properties.agent_id -> agents.id`
- FK `property_images.workspace_id -> workspaces.id`
- FK `property_images.property_id -> properties.id`
- timestamps `created_at` + `updated_at` en todas las tablas del bloque
- trigger `set_updated_at()` aplicado a las cinco tablas principales
- índices iniciales para llaves foráneas y consultas obvias del MVP
- bucket `property-images` preparado en Storage

### Huecos detectados, pero intencionalmente fuera de alcance
Estos puntos no son fallas del esquema actual; son pendientes deliberados antes del siguiente bloque:
- no hay políticas RLS aún
- no existe todavía selección explícita de workspace activo en UX
- no existe constraint que garantice que `properties.agent_id` pertenezca al mismo `workspace_id` de la propiedad
- no existe constraint que garantice que `property_images.workspace_id` coincida con el `workspace_id` de su propiedad
- no se definió aún unicidad para `public_code`
- no existe aún tabla de branding/settings por workspace
- no existe todavía invitación/aceptación formal de miembros

### Lectura arquitectónica
La base está bien para arrancar Auth + RLS, pero la siguiente capa ya no debería posponerse mucho. El mayor hueco real no está en inventario ni propiedades, sino en membresía/autorización y consistencia multiworkspace.

## Manejo de propiedades
Entidad property preparada para soportar:
- casas
- departamentos
- terrenos
- oficinas
- locales
- bodegas
- edificios
- desarrollos
- propiedades mixtas

Atributos base esperados:
- workspaceId
- agentId opcional
- createdBy
- assignedAgentId
- status
- publication status
- operation type: venta/renta/mixto
- price / currency
- location summary
- property type
- media gallery
- features structured
- featured flag
- source metadata

### Política operativa de propiedades
#### Visibilidad
Decisión operativa inicial:
- `owner` y `admin` ven todo el inventario del workspace
- `agent` ve todo el inventario del workspace para poder operar comercialmente con contexto completo
- `staff` no tiene garantizado ver todo; su visibilidad debe ser explícita por módulo o caso de uso

#### Creación
- `owner` y `admin` pueden crear propiedades por su rol operativo
- usuarios con perfil comercial activo en `agents` también pueden crear propiedades dentro de su ámbito comercial
- al crearse, la propiedad debe guardar `created_by`
- al crearse, la propiedad debe guardar `agent_id` si existe responsable definido

#### Edición
- `owner` y `admin` pueden editar cualquier propiedad del workspace
- el creador y/o agente comercial asignado puede editar propiedades dentro de su ámbito permitido
- `staff` sin perfil comercial no edita propiedades como política base

#### Eliminación
- no se adopta borrado como flujo operativo normal
- `agent` no puede borrar propiedades
- `owner` y `admin` deben archivar o despublicar en vez de borrar
- el borrado físico, si alguna vez existe, debe reservarse para mantenimiento excepcional

#### Asignación
- la asignación principal de una propiedad corresponde a `agent_id` en el modelo actual
- `owner` y `admin` pueden cambiar asignación
- `agent` no cambia libremente la asignación salvo permiso futuro explícito

Extensión futura:
- developments
- units inside developments
- pre-sale inventory

## Manejo de leads
Entidad lead preparada para registrar:
- workspaceId
- agentId opcional
- propertyId opcional
- source
- sourceDetail
- capture channel
- name
- phone
- email
- intention: compra/renta
- budget range
- zone interest
- property type interest
- urgency
- thermal status: caliente/tibio/frío
- pipeline stage
- response SLA timestamps
- notes summary

## Manejo de agentes
Un agente necesita dos capas:
1. identidad privada/operativa dentro del sistema
2. presencia pública configurable

Por eso se separan conceptos:
- `workspace_member`: permisos internos y rol operativo
- `agent_public_profile`: presentación pública/comercial opcional

Regla de enforcement ya adoptada:
- los permisos operativos no deben depender conceptualmente del rol legacy `agent`
- la capa `agents` define presencia comercial, asignación comercial y alcance comercial sobre propiedades

### Política operativa de equipo
#### Invitaciones
- `owner` puede invitar usuarios a cualquier rol permitido por producto
- `admin` puede invitar `agent` y `staff`
- `agent` no invita usuarios
- `staff` no invita usuarios

#### Cambio de roles
- `owner` puede cambiar roles dentro del workspace
- `admin` puede cambiar roles de `agent` y `staff` si producto lo permite
- `admin` no debe poder promover a `owner` ni alterar ownership
- `agent` y `staff` no cambian roles

#### Asignación de propiedades
- `owner` y `admin` pueden asignar propiedades a agentes
- `agent` puede sugerir o solicitar asignación en un flujo futuro, pero no gobernarla libremente
- `staff` no asigna propiedades como política base

## Base de personalización de páginas públicas
No se implementará un page builder libre.

Se propone un modelo de personalización controlada mediante:
- settings estructurados
- temas por tokens de diseño
- layouts controlados
- bloques configurables por tipo de página

### Tipos base de página pública
- workspace public page
- agent public page
- property detail page
- landing/public marketing page

### Configuración estructurada esperada
#### Para agente
- foto de perfil
- nombre
- bio
- especialidad
- zonas de atención
- WhatsApp
- teléfono
- correo
- redes sociales
- portada
- color principal
- CTA principal
- propiedades destacadas

#### Para empresa
- logo
- nombre comercial
- descripción institucional
- portada
- colores principales
- datos de contacto
- equipo visible
- propiedades destacadas
- CTA principal
- secciones visibles

### Bloques configurables iniciales
- hero
- intro/about
- featured properties
- contact CTA
- testimonials future-ready
- team preview
- market zones preview

## Criterios para futura integración con bot de WhatsApp
La integración futura debe conectarse con el modelo de leads y propiedades, no operar aislada.

Capas previstas:
1. recepción y filtro
2. recomendación y respuesta
3. handoff a humano + registro en CRM

Requisitos estructurales desde hoy:
- registrar fuente y canal de lead
- permitir asociación con propiedad específica
- almacenar intención comercial
- poder capturar resumen conversacional
- soportar eventos/historial posteriores

## Estructura de carpetas sugerida
- `src/app` → rutas públicas y privadas
- `src/components` → UI y secciones
- `src/lib` → utilidades, config, constants
- `src/types` → dominio tipado
- `src/features` → módulos por dominio a medida que el sistema crezca

## Decisiones técnicas clave iniciales
- No usar CMS externo en esta etapa.
- No usar librerías pesadas de estado global sin necesidad inmediata.
- No crear microservicios tempranos; mantener monolito modular.
- No modelar white-label completo todavía; preparar base de branding y slugs.
- Dejar lista una base para Supabase, pero sin acoplar la UI inicial a un backend prematuro.

## Deuda técnica aceptada por ahora
- aún no existe esquema SQL definitivo
- aún no existe middleware auth real
- aún no existen políticas RLS
- la landing v1 utilizará datos mock bien estructurados
