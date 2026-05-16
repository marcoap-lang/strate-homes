export type CommercialPlanKey = "solo" | "small_agency" | "agency";

export const commercialPlans: Record<CommercialPlanKey, {
  label: string;
  description: string;
  limits: {
    activeProperties: number;
    agents: number;
    internalUsers: number;
    tours: number;
    monthlyLeads: number;
  };
}> = {
  solo: {
    label: "Solo Asesor",
    description: "Para un asesor o vendedor independiente con marca propia.",
    limits: {
      activeProperties: 15,
      agents: 1,
      internalUsers: 1,
      tours: 10,
      monthlyLeads: 80,
    },
  },
  small_agency: {
    label: "Inmobiliaria Pequeña",
    description: "Para equipos comerciales que necesitan inventario, asesores y seguimiento.",
    limits: {
      activeProperties: 60,
      agents: 8,
      internalUsers: 6,
      tours: 40,
      monthlyLeads: 300,
    },
  },
  agency: {
    label: "Agencia",
    description: "Para inmobiliarias con más inventario, operación y soporte comercial.",
    limits: {
      activeProperties: 200,
      agents: 25,
      internalUsers: 18,
      tours: 140,
      monthlyLeads: 1200,
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
