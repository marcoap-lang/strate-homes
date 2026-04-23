const properties = [
  {
    name: "Residencia Bosque Alto",
    type: "Venta",
    location: "Valle del Sol",
  },
  {
    name: "Penthouse Santa Fe",
    type: "Renta",
    location: "Zona corporativa",
  },
  {
    name: "Casa Jardines",
    type: "Venta",
    location: "Zona residencial premium",
  },
];

export function PropertiesSection() {
  return (
    <section id="properties" className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Inventario</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Propiedades presentadas como experiencia, no como ficha fría.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-zinc-600">
          Diseñadas para mostrar valor, contexto y llamado a la acción con claridad.
        </p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {properties.map((property) => (
          <article key={property.name} className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
              <span>{property.type}</span>
              <span>Destacada</span>
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-zinc-950">{property.name}</h3>
            <p className="mt-2 text-sm text-zinc-600">{property.location}</p>
            <div className="mt-6 h-40 rounded-[1.25rem] bg-gradient-to-br from-zinc-200 to-zinc-100" />
          </article>
        ))}
      </div>
    </section>
  );
}
