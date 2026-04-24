-- Remote-safe showroom seed for Strate Homes.
-- Reuses existing real profiles/auth users and avoids creating fake profiles.
-- Non-destructive: only touches the dedicated demo workspace and its related demo rows.

create extension if not exists pgcrypto;

begin;

-- 1) Ensure a dedicated showroom workspace exists.
insert into public.workspaces (
  id,
  name,
  slug,
  legal_name,
  brand_name,
  brand_primary_color,
  brand_accent_color,
  is_active
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Azure Coast Realty',
  'azure-coast-realty',
  'Azure Coast Realty LLC',
  'Azure Coast Realty',
  '#0f172a',
  '#d4a373',
  true
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  legal_name = excluded.legal_name,
  brand_name = excluded.brand_name,
  brand_primary_color = excluded.brand_primary_color,
  brand_accent_color = excluded.brand_accent_color,
  is_active = excluded.is_active;

-- 2) Pick up to 4 real existing profiles to power memberships/agents.
create temporary table temp_demo_profiles on commit drop as
select
  p.id,
  coalesce(nullif(p.full_name, ''), split_part(p.email, '@', 1), 'Usuario') as base_name,
  p.email,
  row_number() over (order by (p.default_workspace_id is not null) desc, p.created_at nulls last, p.id) as rn
from public.profiles p
where p.is_active = true
limit 4;

-- Require at least 1 real profile.
do $$
begin
  if not exists (select 1 from temp_demo_profiles) then
    raise exception 'No active real profiles available for remote showroom seed';
  end if;
end $$;

-- 3) Ensure demo memberships using those real profiles.
insert into public.workspace_members (id, workspace_id, profile_id, role, is_active, joined_at)
select
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  t.id,
  (case when t.rn = 1 then 'owner' when t.rn = 2 then 'admin' else 'staff' end)::workspace_role,
  true,
  timezone('utc', now())
from temp_demo_profiles t
on conflict (workspace_id, profile_id) do update set
  role = excluded.role,
  is_active = excluded.is_active;

-- 4) Upsert public-facing agent profiles bound to those real profiles.
insert into public.agents (
  id,
  workspace_id,
  profile_id,
  slug,
  display_name,
  title,
  bio,
  phone,
  email,
  whatsapp,
  avatar_url,
  is_public,
  is_active
)
select
  case t.rn
    when 1 then '40000000-0000-0000-0000-000000000001'::uuid
    when 2 then '40000000-0000-0000-0000-000000000002'::uuid
    when 3 then '40000000-0000-0000-0000-000000000003'::uuid
    else '40000000-0000-0000-0000-000000000004'::uuid
  end,
  '11111111-1111-1111-1111-111111111111',
  t.id,
  case t.rn
    when 1 then 'showroom-agent-1'
    when 2 then 'showroom-agent-2'
    when 3 then 'showroom-agent-3'
    else 'showroom-agent-4'
  end,
  case t.rn
    when 1 then 'Elena Marín'
    when 2 then 'Daniel Ross'
    when 3 then 'Camila Ortega'
    else 'Lucas Bennett'
  end,
  case t.rn
    when 1 then 'Luxury Waterfront Advisor'
    when 2 then 'Urban Investment Specialist'
    when 3 then 'Residential Lifestyle Broker'
    else 'Commercial & Office Advisor'
  end,
  case t.rn
    when 1 then 'Especialista en residencias frente al mar y propiedades turnkey para compradores internacionales.'
    when 2 then 'Enfocado en departamentos premium, oficinas boutique y activos con alto potencial de renta.'
    when 3 then 'Acompaña a familias y relocation buyers en propiedades con diseño, luz natural y amenidades.'
    else 'Trabaja activos comerciales, oficinas creativas y espacios flexibles para marcas en expansión.'
  end,
  null,
  t.email,
  null,
  null,
  true,
  true
from temp_demo_profiles t
on conflict (workspace_id, slug) do update set
  profile_id = excluded.profile_id,
  display_name = excluded.display_name,
  title = excluded.title,
  bio = excluded.bio,
  email = excluded.email,
  is_public = excluded.is_public,
  is_active = excluded.is_active;

-- 5) Replace only demo properties/images for the dedicated demo workspace.
delete from public.property_images where workspace_id = '11111111-1111-1111-1111-111111111111';
delete from public.properties where workspace_id = '11111111-1111-1111-1111-111111111111';

with demo_agent_map as (
  select slug, id as agent_id, profile_id
  from public.agents
  where workspace_id = '11111111-1111-1111-1111-111111111111'
), fallback_profile as (
  select id from temp_demo_profiles order by rn limit 1
)
insert into public.properties (
  id, workspace_id, agent_id, created_by, title, slug, public_code, description, property_type, status,
  operation_type, is_featured, location_label, address_line, neighborhood, city, state, country_code,
  price_amount, currency_code, bedrooms, bathrooms, parking_spots, lot_area_m2, construction_area_m2, published_at
)
values
  ('50000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',(select agent_id from demo_agent_map where slug='showroom-agent-1'),(select profile_id from demo_agent_map where slug='showroom-agent-1'),'Villa Biscayne Horizon','villa-biscayne-horizon','ACR-001','Residencia frente al agua con interiorismo cálido, doble altura y terraza panorámica.','house','active','sale',true,'Biscayne Bay','1001 Harbor View Dr','Harbor Point','Miami','Florida','US',4850000,'USD',5,5.5,4,820,690,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-3'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-3'),(select id from fallback_profile))),'Penthouse Azure Brickell','penthouse-azure-brickell','ACR-002','Penthouse luminoso con terraza privada, vistas abiertas y amenidades de hotel.','apartment','active','sale',true,'Brickell Waterfront','88 Skyline Ave PH-4','Brickell','Miami','Florida','US',2350000,'USD',3,3.5,2,0,285,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-2'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-2'),(select id from fallback_profile))),'Oceanfront Lease Residence','oceanfront-lease-residence','ACR-003','Departamento en renta con frente al mar, lobby privado y club de playa.','apartment','active','rent',true,'Sunny Isles Oceanfront','2100 Coastal Blvd 18A','Sunny Isles','Miami','Florida','US',18500,'USD',3,3.0,2,0,240,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-4'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-4'),(select id from fallback_profile))),'Design District Office Loft','design-district-office-loft','ACR-004','Oficina boutique lista para firma creativa o family office con diseño editorial.','office','active','rent',false,'Design District','410 Artline St Suite 300','Design District','Miami','Florida','US',9800,'USD',0,2.0,6,0,310,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-4'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-4'),(select id from fallback_profile))),'Coconut Grove Retail Corner','coconut-grove-retail-corner','ACR-005','Local con fachada de alto impacto peatonal, doble frente y terraza comercial.','commercial','active','sale',false,'Coconut Grove High Street','55 Grove Walk','Coconut Grove','Miami','Florida','US',1650000,'USD',0,2.0,3,0,220,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-3'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-3'),(select id from fallback_profile))),'Palm Reserve Family House','palm-reserve-family-house','ACR-006','Casa familiar renovada con jardín, alberca y cocina abierta al área social.','house','active','sale',true,'Coral Gables Garden District','320 Palm Reserve Ln','Coral Gables','Miami','Florida','US',2890000,'USD',4,4.5,3,640,470,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-2'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-2'),(select id from fallback_profile))),'Midtown Skyline Residence','midtown-skyline-residence','ACR-007','Departamento alto con diseño limpio y amenidades de lifestyle urbano.','apartment','active','sale',false,'Midtown Skyline','701 Midtown Blvd 24C','Midtown','Miami','Florida','US',1275000,'USD',2,2.0,1,0,145,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111',(select agent_id from demo_agent_map where slug='showroom-agent-1'),(select profile_id from demo_agent_map where slug='showroom-agent-1'),'Bayview Entertainer Estate','bayview-entertainer-estate','ACR-008','Residencia de líneas contemporáneas con cine, cava y rooftop lounge.','house','draft','sale',true,'Bayview Islands','9 Bayview Estate Dr','Bayview','Miami','Florida','US',6200000,'USD',6,6.5,5,980,840,null),
  ('50000000-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-3'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-3'),(select id from fallback_profile))),'Surfside Garden Residence','surfside-garden-residence','ACR-009','Casa en calle tranquila con jardín amplio, family room y suite principal luminosa.','house','active','rent',false,'Surfside Garden','80 Garden Crest Ave','Surfside','Miami','Florida','US',14500,'USD',4,3.5,2,530,360,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-4'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-4'),(select id from fallback_profile))),'Wynwood Creative Showroom','wynwood-creative-showroom','ACR-010','Espacio comercial con imagen potente para showroom, galería o retail curado.','commercial','active','rent',false,'Wynwood Arts Corridor','121 Canvas Ave','Wynwood','Miami','Florida','US',7200,'USD',0,1.0,2,0,180,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-2'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-2'),(select id from fallback_profile))),'Brickell Executive Suite','brickell-executive-suite','ACR-011','Suite ejecutiva compacta para rental income o pied-à-terre premium.','apartment','archived','sale',false,'Brickell Executive','1300 Executive Blvd 12D','Brickell','Miami','Florida','US',890000,'USD',1,1.5,1,0,92,null),
  ('50000000-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111',(select agent_id from demo_agent_map where slug='showroom-agent-1'),(select profile_id from demo_agent_map where slug='showroom-agent-1'),'Sunset Marina Townhome','sunset-marina-townhome','ACR-012','Townhome con rooftop privado y salida cercana a marina y lifestyle district.','house','active','sale',false,'Sunset Marina','44 Marina Walk','Edgewater','Miami','Florida','US',1740000,'USD',3,3.5,2,220,260,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000013','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-3'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-3'),(select id from fallback_profile))),'Bal Harbour Quiet Luxury Flat','bal-harbour-quiet-luxury-flat','ACR-013','Flat sofisticado para lifestyle sereno con amenidades y cercanía al mar.','apartment','active','sale',false,'Bal Harbour Residences','18 Harbour Calm Rd 8B','Bal Harbour','Miami','Florida','US',1980000,'USD',2,2.5,2,0,170,timezone('utc', now())),
  ('50000000-0000-0000-0000-000000000014','11111111-1111-1111-1111-111111111111',(select coalesce((select agent_id from demo_agent_map where slug='showroom-agent-4'),(select agent_id from demo_agent_map where slug='showroom-agent-1'))),(select coalesce((select profile_id from demo_agent_map where slug='showroom-agent-4'),(select id from fallback_profile))),'Coral Way Medical Office','coral-way-medical-office','ACR-014','Consultorio/oficina listo para operación profesional con acceso ágil y recepción.','office','active','rent',false,'Coral Way Professional Center','900 Coral Way Suite 12','Coral Way','Miami','Florida','US',5400,'USD',0,2.0,8,0,140,timezone('utc', now()));

insert into public.property_images (
  workspace_id, property_id, storage_bucket, storage_path, alt_text, sort_order, is_cover
)
values
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/01-fachada-principal.jpg','Fachada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/02-sala.jpg','Sala principal',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/03-comedor.jpg','Comedor',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/04-cocina.jpg','Cocina',3,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/05-recamara-principal.jpg','Recámara principal',4,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/06-bano-principal.jpg','Baño principal',5,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/07-terraza.jpg','Terraza exterior',6,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000001','property-images','demo/azure-coast-realty/villa-biscayne-horizon/08-vista.jpg','Vista destacada',7,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000002','property-images','demo/azure-coast-realty/penthouse-azure-brickell/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000002','property-images','demo/azure-coast-realty/penthouse-azure-brickell/02-sala.jpg','Sala',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000002','property-images','demo/azure-coast-realty/penthouse-azure-brickell/03-cocina.jpg','Cocina',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000002','property-images','demo/azure-coast-realty/penthouse-azure-brickell/04-terraza.jpg','Terraza',3,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000002','property-images','demo/azure-coast-realty/penthouse-azure-brickell/05-recamara-principal.jpg','Recámara principal',4,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000002','property-images','demo/azure-coast-realty/penthouse-azure-brickell/06-bano-principal.jpg','Baño principal',5,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000002','property-images','demo/azure-coast-realty/penthouse-azure-brickell/07-amenidad.jpg','Amenidad destacada',6,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000003','property-images','demo/azure-coast-realty/oceanfront-lease-residence/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000003','property-images','demo/azure-coast-realty/oceanfront-lease-residence/02-sala.jpg','Sala',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000003','property-images','demo/azure-coast-realty/oceanfront-lease-residence/03-cocina.jpg','Cocina',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000003','property-images','demo/azure-coast-realty/oceanfront-lease-residence/04-recamara-principal.jpg','Recámara principal',3,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000003','property-images','demo/azure-coast-realty/oceanfront-lease-residence/05-vista.jpg','Vista destacada',4,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000004','property-images','demo/azure-coast-realty/design-district-office-loft/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000004','property-images','demo/azure-coast-realty/design-district-office-loft/02-acceso.jpg','Acceso',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000004','property-images','demo/azure-coast-realty/design-district-office-loft/03-interior.jpg','Interior principal',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000005','property-images','demo/azure-coast-realty/coconut-grove-retail-corner/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000005','property-images','demo/azure-coast-realty/coconut-grove-retail-corner/02-fachada.jpg','Fachada comercial',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000005','property-images','demo/azure-coast-realty/coconut-grove-retail-corner/03-interior.jpg','Interior comercial',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000006','property-images','demo/azure-coast-realty/palm-reserve-family-house/01-fachada.jpg','Fachada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000006','property-images','demo/azure-coast-realty/palm-reserve-family-house/02-sala.jpg','Sala',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000006','property-images','demo/azure-coast-realty/palm-reserve-family-house/03-cocina.jpg','Cocina',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000006','property-images','demo/azure-coast-realty/palm-reserve-family-house/04-recamara-principal.jpg','Recámara principal',3,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000006','property-images','demo/azure-coast-realty/palm-reserve-family-house/05-bano-principal.jpg','Baño principal',4,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000006','property-images','demo/azure-coast-realty/palm-reserve-family-house/06-patio.jpg','Patio exterior',5,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000007','property-images','demo/azure-coast-realty/midtown-skyline-residence/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000007','property-images','demo/azure-coast-realty/midtown-skyline-residence/02-sala.jpg','Sala',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000007','property-images','demo/azure-coast-realty/midtown-skyline-residence/03-vista.jpg','Vista destacada',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000009','property-images','demo/azure-coast-realty/surfside-garden-residence/01-fachada.jpg','Fachada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000009','property-images','demo/azure-coast-realty/surfside-garden-residence/02-sala.jpg','Sala',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000009','property-images','demo/azure-coast-realty/surfside-garden-residence/03-cocina.jpg','Cocina',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000009','property-images','demo/azure-coast-realty/surfside-garden-residence/04-patio.jpg','Patio',3,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000010','property-images','demo/azure-coast-realty/wynwood-creative-showroom/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000010','property-images','demo/azure-coast-realty/wynwood-creative-showroom/02-fachada.jpg','Fachada comercial',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000012','property-images','demo/azure-coast-realty/sunset-marina-townhome/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000012','property-images','demo/azure-coast-realty/sunset-marina-townhome/02-sala.jpg','Sala',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000012','property-images','demo/azure-coast-realty/sunset-marina-townhome/03-cocina.jpg','Cocina',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000012','property-images','demo/azure-coast-realty/sunset-marina-townhome/04-rooftop.jpg','Terraza rooftop',3,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000013','property-images','demo/azure-coast-realty/bal-harbour-quiet-luxury-flat/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000013','property-images','demo/azure-coast-realty/bal-harbour-quiet-luxury-flat/02-sala.jpg','Sala',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000013','property-images','demo/azure-coast-realty/bal-harbour-quiet-luxury-flat/03-recamara-principal.jpg','Recámara principal',2,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000014','property-images','demo/azure-coast-realty/coral-way-medical-office/01-portada.jpg','Portada principal',0,true),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000014','property-images','demo/azure-coast-realty/coral-way-medical-office/02-acceso.jpg','Acceso',1,false),
  ('11111111-1111-1111-1111-111111111111','50000000-0000-0000-0000-000000000014','property-images','demo/azure-coast-realty/coral-way-medical-office/03-consultorio.jpg','Interior principal',2,false);

commit;
