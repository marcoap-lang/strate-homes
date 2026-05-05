# Strate Homes — Project Tracker

## Estado general

**Avance estimado:** 97%  
**Enfoque actual:** cerrar coherencia documental + validación final de producción antes de ampliar CRM

## Último bloque completado

✅ Reentrada 2026-05-04: upload de foto de asesor corregido para usar prefijo de workspace en Storage; lint/build pasan
✅ Reentrada 2026-05-04: wizard bloqueante corregido para amenidades, descripción generada y desbloqueo de publicación; lint/build pasan
✅ Reentrada 2026-05-04: login/admin sin sesión simplificado y landing SaaS temporal más profesional; lint/build pasan
✅ Reentrada 2026-05-04: wizard móvil reforzado con botonera sticky y galería móvil más cómoda; lint/build pasan
✅ Reentrada 2026-05-04: wizard de propiedades ajustado para móvil; selector compacto reemplaza lista larga de pasos; lint/build pasan
✅ Reentrada 2026-05-04: primer pase de admin móvil aplicado en shell, navegación, cards, formularios y botones; lint/build pasan
✅ Reentrada 2026-05-04: documentación reconciliada con leads y branding público; lint/build pasan sin warnings; property tours reclasificado como borrador no desarrollado
✅ Reentrada 2026-04-29: lint quedó sin errores y build validado después de tipar leads/branding/propiedades públicas y limpiar warnings críticos
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
✅ Limpieza principal del legacy `agent` en enforcement de propiedades
✅ Activación y edición de perfil comercial operables desde Equipo
✅ Propiedades públicas conectadas a inventario real desde Supabase
✅ Ficha pública de propiedad refinada con presentación más comercial y premium
✅ Home pública del workspace conectada a datos reales
✅ Dirección visual pública más premium/editorial
✅ Seed demo completo preparado para showroom del producto
✅ Seed remoto compatible con usuarios reales cargado en hospedado
✅ Showroom demo visible en remoto sin reset destructivo
✅ Datos demo útiles replicados al workspace principal del usuario actual
✅ Experiencia simplificada a un workspace principal claro
✅ Navegación pública más clara entre home, listado y ficha
✅ Compartir propiedad por WhatsApp + copiar link público
✅ Dominio canónico público aplicado a links compartibles (`NEXT_PUBLIC_SITE_URL`)
✅ Dirección visual pública más premium tipo Miami coastal
✅ Disclaimer legal discreto integrado en páginas públicas

## Bloque actual

🟨 En curso: validar admin/login/landing en móvil real y ajustar percepción visual

## Siguiente bloque

⬜ Validación manual en celular real + links públicos canónicos en incógnito

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
- ✅ Datos reales en páginas públicas
- ✅ Ficha pública comercial reforzada en `/properties/[slug]`
- ✅ Home pública del workspace con inventario y agentes reales
- ✅ Dirección visual pública más premium
- ✅ Seed demo versionado en `supabase/seed.sql`
- ✅ Seed remoto versionado en `supabase/seed-remote.sql`
- ✅ Showroom remoto cargado: 1 workspace demo, 2 agentes, 14 propiedades, 51 imágenes metadata
- ✅ Propiedades demo visibles también en el workspace principal (`sarita-homes`)
- ✅ Selector de workspace oculto en esta etapa para evitar confusión operativa
- ✅ Ficha pública lista para compartir por WhatsApp con mensaje prellenado comercial
- ✅ URL pública configurable para compartir links correctos de producción
- ✅ Copiar link / WhatsApp / preview público preparados para usar base canónica `https://homes.strate.lat`
- ✅ Home/listado/ficha públicas con lenguaje visual más editorial y navegable
- ✅ Ruta pública real por workspace implementada: `/w/{workspace_slug}`, `/w/{workspace_slug}/properties` y `/w/{workspace_slug}/properties/{property_slug}`
- ✅ Admin abre la home pública del workspace activo en nueva pestaña usando su slug público
- ⚠️ Upload de fotos quedó diagnosticado a nivel bucket/policies/path; el siguiente paso operativo, si el fallo persiste en hospedado, es capturar el mensaje exacto del cliente para cerrar el bug end-to-end

### Base de datos

- ✅ workspaces
- ✅ profiles
- ✅ agents
- ✅ properties
- ✅ created_by en properties
- ✅ property_images
- ✅ branding público básico en `workspaces`
- ✅ leads mínimos
- ⬜ property tours no desarrollado; solo existe borrador técnico local, no aplicar a remoto todavía

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
- ✅ Permissions operativos principales sin dependencia conceptual de `agent`
- ⬜ RLS por rol más fina en resto del sistema

### Admin de propiedades

- ✅ Shell admin
- ✅ Módulo Equipo visible
- ✅ Activación/edición básica de perfil comercial de agente
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
- 🟨 Mejora móvil del admin: primer pase aplicado; falta validación en celular real y pulido de fricciones restantes

### Páginas públicas configurables
- ✅ Listado/detalle público con propiedades reales activas/publicadas

- ✅ Concepto definido
- ✅ Página pública de empresa/workspace por `/w/{workspace_slug}`
- ✅ Página pública de agente por `/w/{workspace_slug}/agents/{agent_slug}`
- ✅ Branding público básico editable
- ⬜ Branding avanzado por bloques/settings

### CRM / Leads

- ✅ Tabla leads mínima
- ✅ Asociación lead ↔ propiedad
- ✅ Estado básico de lead
- ✅ Nota interna
- ✅ Source type inicial
- ⬜ Property tours no desarrollado; queda como idea futura/borrador técnico
- ⬜ Pipeline formal

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
