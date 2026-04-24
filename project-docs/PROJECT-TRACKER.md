# Strate Homes — Project Tracker

## Estado general

**Avance estimado:** 65%  
**Enfoque actual:** pasar de base técnica + landing a sistema operativo real

## Último bloque completado

✅ Registro/login real + onboarding inicial
✅ Bootstrap seguro del primer workspace vía RPC sin relajar RLS
✅ Refinamiento UX de acceso, onboarding y experiencia inicial del admin
✅ Uploader visual real de fotos con preview, orden y portada principal
✅ Storage policies alineadas para upload real al bucket property-images
✅ Módulo de propiedades separado en listado, alta y edición por rutas
✅ Política operativa multiusuario definida para roles y propiedades
✅ Enforcement base de roles aplicado en acciones/UI de propiedades
✅ Endurecimiento estructural de propiedades con created_by + RLS de alcance
✅ Separación visible entre rol operativo y perfil comercial en módulo Equipo

## Bloque actual

🟨 En curso: limpieza progresiva del modelo legacy de roles + selector explícito de workspace activo

## Siguiente bloque

⬜ Selector explícito de workspace activo + pulido posterior del uploader visual

---

## Tablero compacto

### Base del proyecto

- ✅ Proyecto base
- ✅ Repo git
- ✅ App local corriendo
- ✅ Supabase real enlazado

### Front público

- ✅ Landing inicial
- ✅ Branding inicial
- ✅ Rutas públicas base
- ⬜ Datos reales en páginas públicas

### Base de datos

- ✅ workspaces
- ✅ profiles
- ✅ agents
- ✅ properties
- ✅ created_by en properties
- ✅ property_images
- ⬜ branding/settings
- ⬜ leads

### Auth y membresías

- ✅ Supabase Auth base
- ✅ Registro con correo + contraseña
- ✅ Login con correo + contraseña
- ✅ Sync auth.users -> profiles
- ✅ workspace_members
- ✅ Roles base
- ✅ Separación conceptual entre rol operativo y perfil comercial
- ✅ Política operativa formal de roles
- ✅ Workspace activo base
- ✅ Habilitación mínima de owner inicial
- ✅ Bootstrap inicial seguro por RPC
- ⬜ Selector explícito de workspace activo
- ⬜ Bajada de permisos finos a schema/RLS

### Seguridad multiworkspace

- ✅ Consistencia multiworkspace mínima
- ✅ RLS mínima
- ✅ RLS de alcance base en properties/property_images
- ⬜ RLS por rol más fina en resto del sistema

### Admin de propiedades

- ✅ Shell admin
- ✅ Módulo Equipo visible
- ✅ CRUD real de propiedades
- ✅ Acceso claro al admin
- ✅ Header admin más claro con workspace, usuario y logout visible
- ✅ Listado de propiedades como vista principal del módulo
- ✅ Alta separada en `/admin/properties/new`
- ✅ Edición separada en `/admin/properties/[id]`
- ✅ Gestión visual de imágenes con Storage, preview, orden, portada, checklist y completitud visual
- ✅ Policies mínimas de Storage para upload autenticado por workspace
- ✅ Política operativa base de created_by / assigned_agent definida a nivel documental
- ✅ Enforcement base: agent crea, agent edita su ámbito, owner/admin gestionan todo
- ✅ Sin borrado operativo de propiedades desde UI
- ✅ created_by formalizado en esquema
- ✅ agent_id ratificado como agente asignado en el modelo actual
- ⬜ Filtros admin

### Páginas públicas configurables

- ✅ Concepto definido
- ⬜ Página pública de empresa
- ⬜ Página pública de agente
- ⬜ Branding configurable

### CRM / Leads

- ⬜ Captura de lead
- ⬜ Tabla leads
- ⬜ Estados y notas
- ⬜ Pipeline mínimo

### WhatsApp bot

- ✅ Visión definida
- ⬜ Arquitectura detallada
- ⬜ Integración base

### Campañas

- ✅ Idea definida
- ⬜ Módulo técnico formal
- ⬜ Tracking de origen

### Analítica

- ⬜ Leads por fuente
- ⬜ Conversión por agente
- ⬜ Dashboard base

---

## Regla de continuidad

Al iniciar una nueva sesión:

1. leer este archivo
2. leer CURRENT-STATUS.md
3. ejecutar solo un bloque pequeño y verificable
4. al terminar, actualizar este tracker y CURRENT-STATUS.md
