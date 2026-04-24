# Strate Homes — Project Tracker

## Estado general

**Avance estimado:** 38%  
**Enfoque actual:** pasar de base técnica + landing a sistema operativo real

## Último bloque completado

✅ Registro/login real + onboarding inicial
✅ Bootstrap seguro del primer workspace vía RPC sin relajar RLS
✅ Refinamiento UX de acceso, onboarding y experiencia inicial del admin

## Bloque actual

🟨 En curso: selector explícito de workspace activo para usuarios multiworkspace + siguiente mejora de uploader visual

## Siguiente bloque

⬜ Selector explícito de workspace activo + uploader visual real para fotos

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
- ✅ Workspace activo base
- ✅ Habilitación mínima de owner inicial
- ✅ Bootstrap inicial seguro por RPC
- ⬜ Selector explícito de workspace activo

### Seguridad multiworkspace

- ✅ Consistencia multiworkspace mínima
- ✅ RLS mínima
- ⬜ RLS por rol más fina

### Admin de propiedades

- ✅ Shell admin
- ✅ CRUD real de propiedades
- ✅ Acceso claro al admin
- ✅ Header admin más claro con workspace, usuario y logout visible
- 🟨 Gestión guiada de imágenes con checklist y completitud visual
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
