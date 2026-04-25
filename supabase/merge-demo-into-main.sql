-- Replicate showroom demo data into the current user's main workspace.
-- Non-destructive to the rest of the system: only deletes prior demo-tagged rows in the target workspace.

begin;

create temporary table temp_target_profile on commit drop as
select id, email, default_workspace_id
from public.profiles
where email = 'marcoap@gmail.com'
limit 1;

create temporary table temp_target_workspace on commit drop as
select w.id, w.name, w.slug, w.brand_name
from public.workspaces w
join temp_target_profile p on p.default_workspace_id = w.id;

create temporary table temp_target_agents on commit drop as
select a.id, a.profile_id, a.slug, a.display_name, a.created_at
from public.agents a
join temp_target_workspace w on w.id = a.workspace_id
where a.is_active = true
order by a.created_at asc nulls last;

-- Clean only previous replicated demo rows in the main workspace.
delete from public.property_images
where workspace_id = (select id from temp_target_workspace)
  and property_id in (
    select id from public.properties
    where workspace_id = (select id from temp_target_workspace)
      and public_code like 'DEMO-%'
  );

delete from public.properties
where workspace_id = (select id from temp_target_workspace)
  and public_code like 'DEMO-%';

with fallback_profile as (
  select id from temp_target_profile limit 1
), target_agent_map as (
  select
    coalesce((select id from temp_target_agents order by created_at asc nulls last limit 1), null) as agent_1,
    coalesce((select id from temp_target_agents order by created_at asc nulls last offset 1 limit 1), (select id from temp_target_agents order by created_at asc nulls last limit 1), null) as agent_2
)
insert into public.properties (
  id, workspace_id, agent_id, created_by, title, slug, public_code, description, property_type, status,
  operation_type, is_featured, location_label, address_line, neighborhood, city, state, country_code,
  price_amount, currency_code, bedrooms, bathrooms, parking_spots, lot_area_m2, construction_area_m2, published_at
)
values
  ('60000000-0000-0000-0000-000000000001',(select id from temp_target_workspace),(select agent_1 from target_agent_map),(select id from fallback_profile),'Villa Biscayne Horizon','main-villa-biscayne-horizon','DEMO-001','Residencia frente al agua con interiorismo cálido, doble altura y terraza panorámica.','house','active','sale',true,'Biscayne Bay','1001 Harbor View Dr','Harbor Point','Miami','Florida','US',4850000,'USD',5,5.5,4,820,690,timezone('utc', now())),
  ('60000000-0000-0000-0000-000000000002',(select id from temp_target_workspace),(select coalesce(agent_2,agent_1) from target_agent_map),(select id from fallback_profile),'Penthouse Azure Brickell','main-penthouse-azure-brickell','DEMO-002','Penthouse luminoso con terraza privada, vistas abiertas y amenidades de hotel.','apartment','active','sale',true,'Brickell Waterfront','88 Skyline Ave PH-4','Brickell','Miami','Florida','US',2350000,'USD',3,3.5,2,0,285,timezone('utc', now())),
  ('60000000-0000-0000-0000-000000000003',(select id from temp_target_workspace),(select agent_1 from target_agent_map),(select id from fallback_profile),'Oceanfront Lease Residence','main-oceanfront-lease-residence','DEMO-003','Departamento en renta con frente al mar, lobby privado y club de playa.','apartment','active','rent',true,'Sunny Isles Oceanfront','2100 Coastal Blvd 18A','Sunny Isles','Miami','Florida','US',18500,'USD',3,3.0,2,0,240,timezone('utc', now())),
  ('60000000-0000-0000-0000-000000000004',(select id from temp_target_workspace),(select coalesce(agent_2,agent_1) from target_agent_map),(select id from fallback_profile),'Palm Reserve Family House','main-palm-reserve-family-house','DEMO-004','Casa familiar renovada con jardín, alberca y cocina abierta al área social.','house','active','sale',true,'Coral Gables Garden District','320 Palm Reserve Ln','Coral Gables','Miami','Florida','US',2890000,'USD',4,4.5,3,640,470,timezone('utc', now())),
  ('60000000-0000-0000-0000-000000000005',(select id from temp_target_workspace),(select agent_1 from target_agent_map),(select id from fallback_profile),'Sunset Marina Townhome','main-sunset-marina-townhome','DEMO-005','Townhome con rooftop privado y salida cercana a marina y lifestyle district.','house','active','sale',false,'Sunset Marina','44 Marina Walk','Edgewater','Miami','Florida','US',1740000,'USD',3,3.5,2,220,260,timezone('utc', now())),
  ('60000000-0000-0000-0000-000000000006',(select id from temp_target_workspace),(select coalesce(agent_2,agent_1) from target_agent_map),(select id from fallback_profile),'Bal Harbour Quiet Luxury Flat','main-bal-harbour-quiet-luxury-flat','DEMO-006','Flat sofisticado para lifestyle sereno con amenidades y cercanía al mar.','apartment','active','sale',false,'Bal Harbour Residences','18 Harbour Calm Rd 8B','Bal Harbour','Miami','Florida','US',1980000,'USD',2,2.5,2,0,170,timezone('utc', now()));

insert into public.property_images (
  workspace_id, property_id, storage_bucket, storage_path, alt_text, sort_order, is_cover
)
values
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000001','property-images','demo/main-workspace/villa-biscayne-horizon/01-fachada-principal.jpg','Fachada principal',0,true),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000001','property-images','demo/main-workspace/villa-biscayne-horizon/02-sala.jpg','Sala principal',1,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000001','property-images','demo/main-workspace/villa-biscayne-horizon/03-comedor.jpg','Comedor',2,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000001','property-images','demo/main-workspace/villa-biscayne-horizon/04-cocina.jpg','Cocina',3,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000002','property-images','demo/main-workspace/penthouse-azure-brickell/01-portada.jpg','Portada principal',0,true),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000002','property-images','demo/main-workspace/penthouse-azure-brickell/02-sala.jpg','Sala',1,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000002','property-images','demo/main-workspace/penthouse-azure-brickell/03-cocina.jpg','Cocina',2,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000003','property-images','demo/main-workspace/oceanfront-lease-residence/01-portada.jpg','Portada principal',0,true),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000003','property-images','demo/main-workspace/oceanfront-lease-residence/02-sala.jpg','Sala',1,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000004','property-images','demo/main-workspace/palm-reserve-family-house/01-fachada.jpg','Fachada principal',0,true),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000004','property-images','demo/main-workspace/palm-reserve-family-house/02-sala.jpg','Sala',1,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000004','property-images','demo/main-workspace/palm-reserve-family-house/03-cocina.jpg','Cocina',2,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000005','property-images','demo/main-workspace/sunset-marina-townhome/01-portada.jpg','Portada principal',0,true),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000005','property-images','demo/main-workspace/sunset-marina-townhome/02-sala.jpg','Sala',1,false),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000006','property-images','demo/main-workspace/bal-harbour-quiet-luxury-flat/01-portada.jpg','Portada principal',0,true),
  ((select id from temp_target_workspace),'60000000-0000-0000-0000-000000000006','property-images','demo/main-workspace/bal-harbour-quiet-luxury-flat/02-sala.jpg','Sala',1,false);

commit;
