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
- role
- permission profile

Idea base:
- un usuario autenticado puede pertenecer a uno o más workspaces en el futuro
- un workspace representa una inmobiliaria, equipo o agente individual
- un agente puede ser miembro de un workspace con rol específico
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
Autenticación prevista con Supabase Auth.

Capas:
- autenticación: identidad del usuario
- autorización: acceso por workspace y rol
- visibilidad pública: páginas públicas accesibles sin login

Futuro cercano:
- middleware para rutas privadas
- guards por rol
- políticas RLS en Supabase

## Modelo inicial de datos en Supabase
Este bloque implementa únicamente la base mínima necesaria para arrancar el inventario y la operación inicial, sin intentar resolver todavía CRM completo, membresías multiworkspace avanzadas ni automatización.

### Entidades incluidas en la primera migración
- `workspaces`
- `profiles`
- `agents`
- `properties`
- `property_images`

### Relaciones base
- `profiles.id` referencia `auth.users.id` para mantener a Supabase Auth como fuente de identidad.
- `profiles.default_workspace_id` permite resolver un contexto inicial por usuario sin modelar aún membresías complejas.
- `agents.workspace_id` conecta cada agente a un workspace.
- `agents.profile_id` conecta opcionalmente al agente con un usuario autenticado.
- `properties.workspace_id` asegura aislamiento del inventario por workspace.
- `properties.agent_id` asigna opcionalmente una propiedad a un agente responsable.
- `property_images.property_id` conecta la galería con cada propiedad.
- `property_images.workspace_id` replica el contexto de workspace para facilitar trazabilidad y futuras políticas.

### Decisiones de alcance para este bloque
- No se crea todavía `workspace_members`.
- No se crean todavía tablas de `leads`, `visits`, `notes`, `pipeline` o actividad comercial.
- No se implementan aún políticas RLS; solo se deja el modelo listo para agregarlas en el siguiente bloque de seguridad/auth.
- No se acopla todavía la UI a lecturas/escrituras reales; la app puede seguir usando mocks mientras se estabiliza el contrato de datos.

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

#### `agents`
Capa operativa y pública mínima del agente. Se separa de `profiles` porque no todo agente visible requiere exponer toda la identidad privada, y en el futuro puede haber relaciones más complejas entre cuenta, rol y presencia pública.

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
- `agent_id` opcional
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

### Storage inicial
Se crea el bucket público `property-images` como punto de partida para galerías de propiedades.

### Convenciones técnicas adoptadas en la migración
- UUIDs generados con `gen_random_uuid()`.
- timestamps en UTC con `created_at` y `updated_at`.
- trigger compartido `set_updated_at()` para consistencia.
- checks básicos para slugs, códigos de país/moneda y valores no negativos.
- índices en llaves foráneas y campos de consulta obvia del MVP.

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
- `workspace_member`: permisos internos
- `agent_public_profile`: presentación pública

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
