# Strate Homes — DECISIONS-LOG

## 2026-04-23

### Decisión
Iniciar Strate Homes como un monolito modular con Next.js App Router + TypeScript + Tailwind + Supabase.

### Motivo
Permite velocidad de ejecución, despliegue simple, coherencia entre frontend y backend, y una base suficiente para escalar el producto sin introducir complejidad distribuida demasiado pronto.

### Consecuencias
- desarrollo más ágil en etapa temprana
- arquitectura clara para Vercel + Supabase
- posibilidad futura de extraer servicios si el producto lo requiere

---

### Decisión
Modelar Strate Homes como plataforma integral centrada en conversión, no como portal de propiedades aislado.

### Motivo
La promesa del producto exige captar, responder, dar seguimiento y convertir mejor, no solo publicar inventario.

### Consecuencias
- el dominio de leads y CRM se considera parte del core desde la arquitectura
- la experiencia pública y privada se diseñan como un solo sistema comercial

---

### Decisión
Preparar multiworkspace desde el inicio a nivel conceptual y tipado, aunque la primera etapa no implemente toda la lógica operativa.

### Motivo
El producto debe escalar desde un agente individual hasta una inmobiliaria multiagente sin reescribir el núcleo.

### Consecuencias
- las entidades clave deben contemplar `workspaceId`
- branding, propiedades, leads y agentes deben pensarse por contexto de workspace

---

### Decisión
Implementar personalización pública como configuración estructurada basada en bloques y settings, no como editor libre.

### Motivo
Se busca equilibrio entre personalización, calidad visual, consistencia, mantenibilidad y escalabilidad.

### Consecuencias
- mejor control de diseño
- menor riesgo de interfaces rotas o inconsistentes
- expansión futura más ordenada hacia semi white-label

---

### Decisión
Construir la primera entrega con landing premium, base de admin, tipos de dominio y documentación persistente antes de entrar al CRUD completo.

### Motivo
Primero hay que fijar dirección, identidad, arquitectura y experiencia visual de alto nivel.

### Consecuencias
- menor riesgo de construir módulos inconexos
- mejor continuidad para sesiones futuras
- habilita iteración posterior con claridad

---

### Decisión
Usar datos mock estructurados en la primera capa UI.

### Motivo
Permite diseñar y validar experiencia, componentes y narrativa del producto antes de fijar integración total con Supabase.

### Consecuencias
- desacopla UI fundacional del backend temprano
- facilita cambiar el modelo sin romper flujos visuales iniciales

---

### Decisión
Introducir Supabase ya en Fase 1 avanzada mediante una primera migración mínima y no mediante modelado exhaustivo del negocio.

### Motivo
El proyecto ya necesita una base persistente real para inventario, identidad y operación inicial, pero todavía no conviene modelar CRM completo ni reglas complejas sin validar primero el núcleo inmobiliario.

### Consecuencias
- el proyecto queda listo para evolucionar desde un esquema real
- se reduce el riesgo de rehacer tablas fundacionales después
- se mantiene el alcance controlado del bloque actual

---

### Decisión
Separar `profiles` de `agents` en el esquema inicial.

### Motivo
La identidad autenticada del usuario y la presencia operativa/pública del agente no son exactamente la misma cosa. Esta separación evita acoplar demasiado pronto Auth con branding o exposición pública.

### Consecuencias
- `profiles` queda atado a `auth.users`
- `agents` puede crecer hacia capa pública, operativa y comercial sin distorsionar la identidad base
- en el futuro se pueden soportar más combinaciones de equipo, roles y membresías

---

### Decisión
No modelar todavía `workspace_members`, RLS ni roles detallados en esta migración inicial.

### Motivo
Aunque el sistema debe escalar a multiworkspace, este bloque busca dejar una base mínima y utilizable. Meter membresías, permisos y políticas completas ahora metería complejidad prematura.

### Consecuencias
- el esquema queda incompleto a nivel seguridad fina, de forma intencional
- el siguiente bloque deberá cubrir Auth + RLS + membresías
- se preserva velocidad sin perder dirección arquitectónica

---

### Decisión
Crear `property_images` como metadatos separados y respaldar desde el inicio un bucket de Storage dedicado.

### Motivo
La galería de propiedades es núcleo del producto y debe quedar resuelta desde una estructura extensible, aunque la UI todavía no suba archivos reales.

### Consecuencias
- el modelo soporta múltiples imágenes, orden y cover image
- Storage queda preparado sin mezclar binarios con la tabla principal de propiedades
- la futura integración UI/backend será más directa

---

### Decisión
Validar el esquema remoto actual antes de entrar al bloque de Auth + RLS.

### Motivo
Antes de modelar seguridad y membresías conviene confirmar que la base estructural remota realmente coincide con la arquitectura mínima esperada y no trae drift respecto a la migración versionada.

### Consecuencias
- se reduce riesgo de construir RLS sobre una base inconsistente
- el siguiente bloque puede enfocarse en autorización en lugar de reabrir fundamentos del inventario
- la verificación remota se vuelve parte explícita de la disciplina del proyecto

---

### Decisión
Aceptar por ahora ciertas consistencias multiworkspace a nivel aplicación/documentación y no forzarlas todavía con constraints complejos en SQL.

### Motivo
Reglas como “el `agent_id` de una propiedad debe pertenecer al mismo workspace” son correctas, pero endurecerlas en este momento puede meter más complejidad de la necesaria antes de cerrar membresías, roles y flujo real de escritura.

### Consecuencias
- la base sigue siendo válida para el bloque actual
- queda una deuda estructural concreta antes de habilitar operaciones reales
- el siguiente diseño de Auth + RLS debe decidir si esas reglas vivirán en constraints, triggers o capa de aplicación

---

### Decisión
Definir la pertenencia multiworkspace con una tabla explícita `workspace_members` en lugar de inferir membresía desde `agents`.

### Motivo
La pertenencia organizacional y el rol comercial/público no son la misma cosa. Un usuario puede pertenecer a un workspace sin necesariamente ser un agente visible, y un agente puede requerir configuración operativa distinta de la simple membresía.

### Consecuencias
- `workspace_members` se vuelve el pivote natural para Auth + RLS
- `agents` queda enfocado en capa operativa/pública
- la arquitectura soporta mejor workspaces con staff administrativo y no solo agentes

---

### Decisión
Definir un set mínimo de roles iniciales: `owner`, `admin`, `agent`, `staff`.

### Motivo
Hace falta una base clara pero pequeña para empezar autorización y segmentación operativa sin introducir jerarquías excesivas desde el día uno.

### Consecuencias
- el siguiente bloque de RLS ya tiene una taxonomía estable de roles
- el producto puede diferenciar gobierno del workspace, operación comercial y apoyo interno
- se deja espacio para granularidad futura sin romper el modelo inicial

---

### Decisión
Sincronizar `profiles` desde `auth.users` mediante triggers de base de datos.

### Motivo
La creación del perfil de app debe ser consistente y automática, sin depender de que la UI recuerde crear registros auxiliares después del signup o login.

### Consecuencias
- menor riesgo de usuarios autenticados sin `profile`
- mejor base para futuras políticas y joins por identidad
- el flujo Auth queda más robusto incluso antes de implementar RLS completo

---

### Decisión
Resolver el workspace activo con una estrategia híbrida: preferir `profiles.default_workspace_id` en servidor y permitir override efímero en cliente.

### Motivo
La app necesita una resolución estable en SSR y una forma simple de soportar usuarios con varios workspaces sin diseñar todavía una UX completa de selector persistente sincronizado al backend.

### Consecuencias
- SSR puede renderizar con una noción consistente de workspace activo
- usuarios con un solo workspace funcionan sin pasos extra
- usuarios con varios workspaces podrán requerir una capa UX posterior para cambio explícito y persistencia mejor resuelta

---

### Decisión
Forzar en base de datos solo las consistencias multiworkspace más claras y baratas: `property -> agent` y `property_image -> property`.

### Motivo
Estas reglas son estructuralmente correctas, fáciles de validar con triggers y previenen errores serios de integridad sin esperar a RLS completa.

### Consecuencias
- se reduce el riesgo de cruzar entidades entre workspaces por accidente
- la base gana integridad real antes de abrir escritura desde UI
- otras reglas de autorización fina siguen quedando para RLS y capa app

---

### Decisión
Implementar una RLS mínima por workspace basada en `workspace_members` y `workspace_role`, sin intentar todavía autorización exhaustiva para todo el producto.

### Motivo
El proyecto ya necesitaba aislamiento real de lectura/escritura entre workspaces, pero todavía no conviene endurecer todas las superficies del sistema antes de que existan más flujos reales y más tablas de negocio.

### Consecuencias
- miembros activos del workspace ya quedan aislados de otros workspaces
- roles `owner`/`admin` controlan `agents`
- roles `owner`/`admin`/`agent` pueden operar `properties` y `property_images`
- todavía quedarán políticas futuras cuando entren más módulos y casos límite

---

### Decisión
Resolver el onboarding inicial del primer usuario dentro de `/admin`, permitiendo crear el workspace inicial y autoasignar rol `owner` cuando aún no existan memberships activas.

### Motivo
El sistema ya tenía auth base, pero el flujo real se rompía en el punto más importante: un usuario podía autenticarse y seguir sin quedar operativo dentro del producto. Antes de invitaciones formales, hacía falta un camino mínimo y usable.

### Consecuencias
- el primer usuario puede quedar habilitado sin intervención manual en base de datos
- `/admin` deja de romper en primer acceso
- el producto gana un onboarding inicial mínimo sin comprometer todavía la arquitectura de invitaciones futura

---

### Decisión
Reemplazar el magic link como acceso principal por registro/login con correo + contraseña, manteniendo Supabase Auth como backend.

### Motivo
Strate Homes necesitaba una experiencia de producto más clara, predecible y premium en producción. El magic link servía para pruebas, pero no era la puerta correcta para un SaaS operativo ni ayudaba a controlar bien redirects en producción.

### Consecuencias
- el acceso principal ya se siente como producto real y no como flujo provisional
- el onboarding inicial queda mejor encadenado con la creación del primer workspace
- sigue siendo necesario revisar en Supabase las redirect URLs y la URL pública principal de producción

---

### Decisión
Resolver el bootstrap del primer workspace mediante una función RPC `SECURITY DEFINER` en base de datos, en lugar de abrir inserts directos sobre `workspace_members` vía RLS.

### Motivo
El primer onboarding necesita crear `workspaces`, `workspace_members` y actualizar `profiles.default_workspace_id` en una sola operación segura, pero sin relajar las políticas generales de RLS para membresías. La ruta correcta es encapsular el alta inicial en una función validada desde DB.

### Consecuencias
- se mantiene cerrada la RLS general de `workspace_members`
- el alta del primer owner ocurre de forma atómica y más robusta
- el onboarding del admin depende ahora de una RPC específica para bootstrap inicial
- futuras invitaciones o altas administrativas deberán seguir flujos dedicados y no inserts directos desde cliente

---

### Decisión
Mover la experiencia inicial del admin hacia una interfaz clara y premium antes de abrir módulos nuevos como CRM, campañas o branding avanzado.

### Motivo
En esta fase, la percepción de producto importa tanto como la base técnica. Si el acceso, el onboarding y la operación básica de propiedades se sienten internos o improvisados, el sistema pierde credibilidad aunque ya funcione.

### Consecuencias
- el esfuerzo inmediato se concentra en claridad, jerarquía visual y confianza del usuario
- el admin prioriza inventario, fotos y operación básica antes que expandirse a módulos nuevos
- la gestión de fotos avanza primero como experiencia guiada y preparación para un uploader visual posterior

---

### Decisión
Implementar el uploader visual real de fotos con subida al Storage desde cliente autenticado y persistencia/orden/portada desde acciones del servidor.

### Motivo
Esta combinación conserva la compatibilidad con el workspace activo y con la seguridad ya montada, evitando abrir atajos inseguros en RLS mientras se entrega una experiencia visual real de galería.

### Consecuencias
- la subida binaria ocurre directamente contra Storage con sesión autenticada del usuario
- el orden, la portada y la persistencia final de metadatos viven en el flujo del admin y se revalidan desde servidor
- la siguiente mejora natural, si hace falta, será drag-and-drop más fino y limpieza automática más completa de archivos huérfanos

---

### Decisión
Autorizar el bucket `property-images` con policies de `storage.objects` basadas en el primer segmento del path como `workspace_id`.

### Motivo
El uploader ya enviaba archivos a una ruta del tipo `workspaceId/propertyId/...`, pero sin policies explícitas de Storage el upload quedaba bloqueado. Reusar el `workspace_id` embebido en el path permite mantener el control alineado con la membresía activa sin abrir acceso amplio al bucket.

### Consecuencias
- el upload real al bucket queda habilitado para usuarios autenticados con membresía activa en ese workspace
- el path de Storage pasa a ser parte importante del contrato de autorización
- si en el futuro cambia la estructura del path, habrá que ajustar también las policies del bucket

---

### Decisión
Separar el módulo de propiedades en rutas navegables (`/admin/properties`, `/admin/properties/new`, `/admin/properties/[id]`) en lugar de mantener listado, alta y edición dentro de una sola pantalla acumulada.

### Motivo
La experiencia de producto necesitaba sentirse más SaaS y menos interna. Priorizar el inventario existente como vista principal y mover el alta/edición a contextos separados mejora claridad, foco operativo y percepción profesional.

### Consecuencias
- el listado del inventario se vuelve la entrada natural al módulo de propiedades
- alta y edición ganan contexto propio y menos fricción visual
- la navegación del admin empieza a parecer sistema real y no panel provisional

---

### Decisión
Definir como política operativa base que `agent` vea todo el inventario del workspace, pero solo pueda editar propiedades creadas por él o asignadas a él; además, toda propiedad debe evolucionar hacia `created_by` + `assigned_agent` como campos de gobierno operativo.

### Motivo
Strate Homes ya debe comportarse como sistema de una inmobiliaria multiusuario. Para evitar ambigüedad futura, hacía falta decidir ahora cómo se reparte visibilidad, edición, asignación y gobierno de inventario entre `owner`, `admin`, `agent` y `staff`.

### Consecuencias
- el inventario se concibe como activo compartido del workspace y no como silo privado de cada agente
- la edición queda acotada por autoría y asignación, no solo por pertenencia al workspace
- futuras migraciones deberán bajar esta política a schema y RLS con campos como `created_by` y `assigned_agent`
- invitaciones, cambio de rol y asignación de propiedades quedan claramente reservados a `owner` y parcialmente a `admin`

---

### Decisión
Aplicar desde ahora enforcement operativo en acciones y UI de propiedades, aun antes de completar la bajada final a schema/RLS fina.

### Motivo
La política ya estaba definida y seguir construyendo encima de permisos ambiguos iba a contaminar el comportamiento del producto. Hacía falta que el sistema dejara de comportarse como panel libre y empezara a respetar jerarquía real por rol desde la capa de aplicación.

### Consecuencias
- `agent` ya puede crear propiedades pero no reasignarlas libremente
- `agent` solo puede editar propiedades dentro de su ámbito asignado
- `owner` y `admin` conservan control completo de inventario y estatus sensibles
- el borrado operativo de propiedades queda fuera de la experiencia del producto y se refuerza el uso de archivado/despublicación

---

### Decisión
Mantener `agent_id` como representación del agente asignado en el modelo actual y agregar `created_by` como nueva fuente formal de autoría, en lugar de abrir una separación más grande de `assigned_agent_id` en este momento.

### Motivo
Hacía falta endurecer el modelo sin disparar una refactorización excesiva. `agent_id` ya funcionaba como asignación operativa y era el punto menos costoso para anclar RLS y reglas de alcance; lo que faltaba de forma crítica era registrar formalmente quién creó la propiedad.

### Consecuencias
- el modelo gana autoría formal con `created_by`
- la asignación queda más clara sin romper compatibilidad, usando `agent_id` como agente asignado actual
- las policies de properties/property_images ya pueden acercarse al alcance operativo real de owner/admin vs creator/assigned agent
- una futura separación explícita de `assigned_agent_id` solo será necesaria si aparece un caso de producto que ya no quepa en el modelo actual

---

### Decisión
Separar formalmente el rol operativo del workspace y el perfil comercial de agente como dos capas distintas, no mutuamente excluyentes.

### Motivo
En una inmobiliaria real, una misma persona puede tener permisos operativos amplios (`owner` o `admin`) y además operar comercialmente como asesor con perfil público y propiedades asignadas. Tratar `agent` como rol operativo único distorsiona el producto y mezcla gobierno interno con presencia comercial.

### Consecuencias
- la membresía del workspace pasa a representar permisos internos
- `agents` se reafirma como capa comercial/pública opcional y compatible con cualquier rol operativo
- el módulo Equipo ya debe mostrar ambas dimensiones por separado
- el uso legacy de `agent` como rol operativo deberá limpiarse progresivamente en schema, RLS y UI futura

---

### Decisión
Dejar de depender del rol legacy `agent` para autorizar permisos operativos principales en propiedades, usando en su lugar dos señales distintas: rol operativo en `workspace_members` y perfil comercial activo en `agents`.

### Motivo
Mantener el enforcement atado a `agent` como rol del sistema ya contradecía el nuevo modelo. El ajuste correcto era permitir que la operación comercial dependa de tener perfil de agente y que la autoridad interna dependa del rol operativo real.

### Consecuencias
- `owner` y `admin` siguen gobernando el inventario por permisos internos
- la capacidad de crear/operar comercialmente propiedades ya puede depender de tener perfil activo en `agents`, no de un rol legacy
- el enum operativo aún conserva `agent` por compatibilidad, pero dejó de ser la base conceptual del enforcement principal
- futuras limpiezas podrán retirar ese legado con menos riesgo porque el comportamiento central ya cambió

---

### Decisión
Permitir que owner/admin activen y editen perfiles comerciales de agente sobre miembros existentes del workspace, incluyendo activarse a sí mismos, reutilizando la tabla `agents` actual como capa comercial.

### Motivo
La separación conceptual ya estaba definida, pero hacía falta volverla operable. Sin un flujo real en Equipo, el modelo seguía siendo correcto en teoría pero incompleto en producto.

### Consecuencias
- la activación de perfil comercial ya no requiere inventar un usuario aparte ni mezclar permisos internos con presencia comercial
- owner/admin pueden convertir en asesor comercial a una persona existente del workspace, o activarse ellos mismos
- el módulo Equipo deja visible y editable la capa comercial sin tocar todavía branding completo ni CRM

---

### Decisión
Preparar un seed demo inmobiliario completo y usar una dirección visual pública más editorial/premium para evaluar el producto como showroom real, aunque la carga remota del seed se ejecute de forma controlada más adelante.

### Motivo
El producto ya necesitaba verse y sentirse como sistema real, no como plantilla vacía. Sin inventario demo creíble y sin una capa pública visualmente potente, era difícil juzgar bien el valor del admin, las fichas públicas, el equipo comercial y la navegación general.

### Consecuencias
- el repositorio ya conserva un seed demo útil para poblar entornos de prueba o showroom
- la experiencia pública se empuja hacia una referencia más premium tipo brokerage/luxury real estate
- la carga del seed en remoto queda separada como paso operativo consciente para evitar resets destructivos improvisados

---

### Decisión
Para poblar el showroom remoto, reutilizar perfiles reales ya existentes en `public.profiles` en vez de crear perfiles demo falsos que no existen en `auth.users`.

### Motivo
El modelo remoto exige integridad entre `public.profiles.id` y `auth.users.id`. Eso vuelve inválido un seed remoto basado en UUIDs demo arbitrarios. Reusar perfiles reales permite sembrar workspace demo, memberships, agentes y propiedades sin reset destructivo ni manipulación frágil de Auth.

### Consecuencias
- se añade un seed remoto separado (`supabase/seed-remote.sql`) orientado al entorno hospedado
- el showroom demo remoto queda materializable sin crear usuarios fake en Auth
- el número de agentes/memberships visibles depende de cuántos perfiles reales activos existan en el sistema
