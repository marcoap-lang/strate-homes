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
