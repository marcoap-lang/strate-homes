# Strate Homes — MASTER-PLAN

## Objetivo general
Crear una plataforma inmobiliaria premium centrada en conversión comercial, preparada para escalar desde un agente individual hasta una operación multiagente con personalización por marca y automatización conversacional.

## Roadmap por fases

### Fase 1 — Fundamentos del producto
Objetivo:
- definir visión, arquitectura y lineamientos
- inicializar repositorio
- establecer stack y estructura base
- dejar documentación persistente
- construir base visual y técnica sólida

Entregables:
- repositorio git limpio
- estructura Next.js + TypeScript + Tailwind
- `project-docs/` completo
- design foundation inicial
- landing premium v1
- base conceptual del admin

### Fase 2 — Landing premium y presencia pública
Objetivo:
- presentar Strate Homes con imagen premium
- dejar base de experiencia pública de alta conversión
- empezar la lógica de listados y detalle público

Entregables:
- home/landing premium
- secciones de propuesta de valor
- secciones de compra/renta
- featured properties
- CTAs a contacto y WhatsApp
- base de páginas públicas de agente y empresa

### Fase 3 — Core inmobiliario
Objetivo:
- modelar inventario y operaciones base
- permitir alta y administración de propiedades

Entregables:
- entidades base de propiedades
- CRUD de propiedades
- estados de propiedad
- carga de imágenes
- listados públicos
- detalle de propiedad

### Fase 4 — CRM comercial
Objetivo:
- profesionalizar captura, organización y seguimiento de leads

Entregables:
- leads
- clientes/contactos
- notas
- pipeline
- visitas
- asociación lead-propiedad-agente
- fuentes de lead

### Fase 5 — Multiagente y personalización pública
Objetivo:
- soportar workspaces, equipo, perfiles públicos y branding configurable

Entregables:
- roles y permisos
- workspaces
- páginas públicas de agente
- páginas públicas de empresa
- branding configurable
- bloques visibles configurables
- base semi white-label

### Fase 6 — Bot de WhatsApp
Objetivo:
- conectar automatización comercial con CRM y catálogo

Entregables:
- diseño de flujos
- intake inicial
- clasificación de intención
- recomendación de propiedades
- handoff a humano
- registro en CRM

### Fase 7 — Optimización premium
Objetivo:
- mejorar rendimiento, analítica y conversión

Entregables:
- métricas clave
- dashboards
- tiempos de respuesta
- performance tuning
- optimización de UX y conversión

## Dependencias entre fases
- Fase 2 depende de Fase 1.
- Fase 3 depende de Fase 1 y parcialmente de Fase 2 por componentes visuales reutilizables.
- Fase 4 depende de Fase 3 para asociar leads con propiedades y agentes.
- Fase 5 depende de Fase 3 y Fase 4 para soportar estructura organizacional real.
- Fase 6 depende de Fase 4 y Fase 5 para registrar y enrutar leads correctamente.
- Fase 7 depende del sistema operativo real funcionando.

## Definición de MVP
El MVP inicial funcional debe cubrir:
- landing premium
- branding inicial de Strate Homes
- base de listados y detalle de propiedad
- panel privado base
- estructura de datos para propiedades, leads, agentes y workspaces
- documentación persistente excelente
- base de personalización pública controlada
- base conceptual del flujo comercial

## Qué no intenta resolver el MVP
- automatización completa por WhatsApp
- analítica avanzada
- page builder libre
- white-label completo
- flujos complejos de comisiones
- ERP inmobiliario o contable

## Evolución posterior
Después del MVP, la expansión natural es:
1. inventario robusto
2. CRM comercial profundo
3. multiworkspace y páginas públicas configurables
4. bot conversacional
5. analítica y optimización de conversión

## Criterios de avance entre fases
Una fase se considera cerrada solo si:
- el entregable principal está implementado
- la documentación quedó actualizada
- el estado del proyecto está registrado
- la deuda técnica identificada quedó anotada
- existe claridad sobre el siguiente bloque de trabajo
