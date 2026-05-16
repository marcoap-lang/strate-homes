export type CommercialPlanKey = "solo" | "small_agency" | "agency";

export const commercialPlans: Record<CommercialPlanKey, {
  label: string;
  description: string;
  monthlyPrice: number;
  audience: string;
  highlights: string[];
  limits: {
    agents: number;
    internalUsers: number;
  };
}> = {
  solo: {
    label: "Solo Asesor",
    description: "Para un asesor o vendedor independiente con marca propia.",
    monthlyPrice: 0,
    audience: "Asesor independiente o inmobiliaria muy pequeña.",
    highlights: ["Sitio público de marca", "Perfil comercial", "Inventario profesional", "Seguimiento básico"],
    limits: {
      agents: 1,
      internalUsers: 1,
    },
  },
  small_agency: {
    label: "Inmobiliaria Pequeña",
    description: "Para equipos comerciales que necesitan inventario, asesores y seguimiento.",
    monthlyPrice: 0,
    audience: "Equipos de 2 a 8 asesores.",
    highlights: ["Varios asesores", "Propiedades por asesor", "Recorridos compartibles", "Control de interesados"],
    limits: {
      agents: 8,
      internalUsers: 6,
    },
  },
  agency: {
    label: "Agencia",
    description: "Para inmobiliarias con más inventario, operación y soporte comercial.",
    monthlyPrice: 0,
    audience: "Inmobiliarias con operación y staff.",
    highlights: ["Mayor capacidad", "Equipo amplio", "Métricas comerciales", "Soporte prioritario"],
    limits: {
      agents: 30,
      internalUsers: 20,
    },
  },
};

export const defaultWhatsAppTemplates = [
  {
    key: "first_contact",
    title: "Primer contacto",
    body: "Hola {nombre}, soy {asesor}. Vi tu interés en {propiedad}. ¿Te gustaría que te comparta disponibilidad, ubicación y opciones para visitarla?",
  },
  {
    key: "follow_up",
    title: "Seguimiento",
    body: "Hola {nombre}, retomo tu búsqueda de {propiedad}. ¿Pudiste revisar la información? Si quieres, te puedo enviar opciones similares.",
  },
  {
    key: "schedule_visit",
    title: "Agendar visita",
    body: "Hola {nombre}, podemos agendar visita para {propiedad}. Tengo disponibilidad hoy por la tarde o mañana. ¿Qué horario te funciona mejor?",
  },
  {
    key: "send_listing",
    title: "Enviar ficha",
    body: "Hola {nombre}, te comparto la ficha de {propiedad}: {link}. Quedo atento para resolver dudas o coordinar una visita.",
  },
  {
    key: "reactivate_lead",
    title: "Reactivar lead",
    body: "Hola {nombre}, sigo al pendiente de tu búsqueda. Tengo algunas propiedades que podrían encajar mejor con lo que buscas. ¿Quieres que te las mande?",
  },
];

export function getPlanLabel(plan?: string | null) {
  if (plan === "small_agency" || plan === "agency" || plan === "solo") return commercialPlans[plan].label;
  return commercialPlans.solo.label;
}

export function fillMessageTemplate(template: string, values: Record<string, string | null | undefined>) {
  return template
    .replaceAll("{nombre}", values.nombre ?? "te contacto")
    .replaceAll("{asesor}", values.asesor ?? "tu asesor")
    .replaceAll("{propiedad}", values.propiedad ?? "la propiedad")
    .replaceAll("{link}", values.link ?? "");
}
