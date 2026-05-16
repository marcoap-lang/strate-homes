# Strate Homes Platform Admin

## Acceso

El panel interno vive en `/admin` y es exclusivo para usuarios incluidos en `platform_admins` o en `STRATE_PLATFORM_ADMIN_EMAILS`.

Para agregar un administrador por base de datos:

```sql
insert into public.platform_admins (profile_id)
select id
from public.profiles
where lower(email) = lower('admin@example.com')
on conflict (profile_id) do nothing;
```

El usuario debe existir antes en `profiles`, normalmente después de iniciar sesión por primera vez.

## Recuperar Contraseña

Desde `/login?next=/admin`, elegir `Recuperar`, escribir el correo y abrir el link enviado por Supabase. El link regresa a `/login?next=/admin&recovery=1` para definir contraseña nueva.

## Billing Manual

Cada inmobiliaria usa `workspace_subscriptions`:

- `plan`: `solo`, `small_agency`, `agency`
- `status`: `trial`, `active`, `past_due`, `cancelled`
- `commercial_status`: `prospect`, `demo`, `customer`, `risk`, `churn`

Los cambios hechos desde `/admin/workspaces/[id]` registran `subscription_updated` en `activity_events`.

## Revisión De Cuenta

Para revisar una cuenta con problemas:

1. Abrir `/admin`.
2. Filtrar por salud crítica o alerta.
3. Entrar al detalle de la inmobiliaria.
4. Revisar alertas, leads recientes, propiedades, asesoría y actividad.
5. Agregar nota interna o seguimiento si requiere acción comercial.

## Soporte Seguro

El admin interno permite acciones seguras:

- Editar plan y estado comercial.
- Crear notas internas.
- Crear/completar followups.
- Pausar/reactivar workspace con confirmación.
- Cambiar owner solo si el nuevo owner ya es miembro activo.
- Activar feature flags.
- Crear anuncios.

No hay impersonation ni edición directa de inventario/leads desde `/admin`.
