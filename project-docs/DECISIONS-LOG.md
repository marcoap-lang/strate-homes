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
