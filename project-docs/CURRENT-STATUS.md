# Strate Homes — CURRENT-STATUS

## Estado general
Fase 1 avanzada, con base inicial de Supabase ya preparada a nivel de proyecto y esquema mínimo definido.

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
- Primera migración inicial creada con entidades mínimas: `workspaces`, `profiles`, `agents`, `properties`, `property_images`.
- Bucket inicial de Storage definido para imágenes de propiedades.
- Contrato de dominio frontend alineado al nuevo esquema mínimo.
- Base de cliente Supabase agregada para integración futura.

## Qué está en curso
- validar la primera migración localmente y conectar entorno local/remoto de Supabase
- definir estrategia de Auth + RLS + membresías por workspace
- refinar componentes reutilizables
- expandir admin shell hacia navegación funcional
- preparar base de páginas públicas de agente y empresa
- definir estrategia de branding por workspace

## Qué sigue inmediatamente después
1. validar el esquema en instancia local de Supabase y ajustar detalles si aparece fricción real
2. definir `workspace_members`, Auth flow y estrategia inicial de RLS
3. definir componentes UI compartidos de forma más formal
4. crear páginas públicas de agente y empresa
5. expandir shell admin con secciones reales
6. continuar con phase 2 del roadmap sin perder continuidad documental

## Blockers actuales
- No hay blockers técnicos críticos en este bloque.
- Falta ejecutar la migración contra una instancia local o proyecto enlazado de Supabase para validación completa end-to-end.
- Queda pendiente definir el detalle de RLS, auth y membresías antes de habilitar escritura real desde UI.

## Riesgos a vigilar
- escalar sin documentar decisiones
- modelar seguridad y membresías demasiado tarde
- sobrecargar el dashboard con demasiadas métricas antes de tiempo
- añadir complejidad visual sin necesidad real
- perder el hilo de continuidad si no se actualiza esta documentación

## Criterio de cierre de esta etapa
Esta etapa se considera bien cerrada cuando exista:
- proyecto inicial funcionando
- landing premium funcional
- documentación persistente completa
- base técnica clara
- rutas y módulos iniciales preparados para continuar
