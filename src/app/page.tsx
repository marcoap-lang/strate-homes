import Link from "next/link";

const proofPoints = [
  ["Presencia publica", "Sitio premium para la inmobiliaria, fichas de propiedad y perfiles personales de asesores."],
  ["Operacion diaria", "Inventario, responsables, calidad de publicacion, leads y siguientes pasos en un mismo lugar."],
  ["Publicidad medible", "Links de campana con UTM para medir visitas, WhatsApp, formularios y leads por solicitud."],
];

const productionSteps = [
  ["Dia 1", "Marca y escaparate", "Logo, claim, contacto, hero visual y URL publica lista para compartir."],
  ["Dia 2", "Inventario vendible", "Propiedades con portada, fotos, precio, ubicacion, asesor y score de publicacion."],
  ["Dia 3", "Asesores publicos", "Perfiles comerciales personales para que cada asesor tenga su propia pagina."],
  ["Dia 4", "Seguimiento", "Interesados con responsable, estado, notas, WhatsApp y proximo contacto."],
  ["Dia 5", "Campana inicial", "Facebook, Instagram o Google con link medible y resultados visibles en Homes."],
];

const offerCards = [
  {
    title: "Asesor independiente",
    line: "Marca personal con presencia seria.",
    bullets: ["Pagina publica propia", "Propiedades ilimitadas por operacion inicial", "Leads y WhatsApp ordenados"],
  },
  {
    title: "Inmobiliaria pequena",
    line: "Equipo comercial con inventario y seguimiento.",
    bullets: ["Varios asesores", "Perfiles publicos por asesor", "Pipeline simple de interesados"],
  },
  {
    title: "Arranque con pauta",
    line: "Produccion visual + campana medible.",
    bullets: ["Configuracion asistida", "Links UTM por campana", "Reporte de visitas, WhatsApp y formularios"],
  },
];

const painPoints = [
  "Publican propiedades buenas con fichas que no transmiten valor.",
  "Los interesados llegan por distintos canales y se pierden en WhatsApp.",
  "Cada asesor comunica distinto y la inmobiliaria pierde consistencia.",
  "Se paga publicidad sin saber que propiedad, canal o mensaje genero el lead.",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4efe6] text-[#15110d]">
      <header className="sticky top-0 z-40 border-b border-[#e0d4c2]/70 bg-[#f7f1e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#a18461]">Strate Homes</p>
            <p className="mt-1 hidden text-sm text-[#4d4236] sm:block">Presencia, operacion y pauta inmobiliaria</p>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login?next=/admin" className="rounded-full border border-[#d8c9b4] bg-transparent px-3 py-2.5 text-sm font-medium text-[#6d5c49] transition hover:bg-white/60 hover:text-[#15110d] sm:px-4">
              Admin
            </Link>
            <Link href="/login?next=/app" className="rounded-full border border-[#d8c9b4] bg-white/70 px-3 py-2.5 text-sm font-semibold text-[#2a2118] transition hover:bg-white sm:px-4">
              Entrar
            </Link>
            <a href="#demo" className="hidden rounded-full bg-[#18120d] px-4 py-2.5 text-sm font-semibold text-[#fff8ee] transition hover:bg-[#2a2118] sm:inline-flex">
              Ver produccion
            </a>
          </div>
        </div>
      </header>

      <section className="relative px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_12%,rgba(215,171,91,0.34),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(23,18,14,0.16),transparent_34%),linear-gradient(180deg,#f7f1e8_0%,#efe6da_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-[#d8c9b4] bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8a6a43] shadow-sm">
              Para vender propiedades con imagen, orden y seguimiento
            </p>
            <h1 className="mt-7 max-w-5xl font-serif text-5xl font-semibold leading-[0.91] tracking-[-0.065em] text-[#17120e] sm:text-7xl lg:text-[6.6rem]">
              Tu inmobiliaria lista para verse premium, responder leads y medir campanas.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#655848]">
              Strate Homes monta el escaparate publico de tu inmobiliaria, ordena propiedades y asesores, captura interesados y conecta la publicidad con resultados reales: visitas, WhatsApp y formularios.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login?next=/app" className="inline-flex justify-center rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-semibold text-[#17120e] shadow-[0_18px_40px_rgba(215,171,91,0.28)] transition hover:bg-[#e3ba72]">
                Quiero mi demo producida
              </Link>
              <Link href="/properties" className="inline-flex justify-center rounded-full border border-[#d8c9b4] bg-white/72 px-6 py-4 text-sm font-semibold text-[#2a2118] transition hover:bg-white">
                Ver experiencia publica
              </Link>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {[
                ["7 dias", "para montar un piloto visual"],
                ["3 canales", "Facebook, Instagram y Google"],
                ["4 metricas", "visitas, WhatsApp, formularios y leads"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-[1.4rem] border border-[#dccfbd] bg-white/58 px-4 py-4">
                  <p className="text-3xl font-semibold tracking-tight text-[#17120e]">{value}</p>
                  <p className="mt-1 text-sm leading-6 text-[#655848]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative" id="demo">
            <div className="absolute -inset-6 rounded-[3rem] bg-[#17120e] opacity-[0.08] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.7rem] border border-[#d8c9b4] bg-[#17120e] p-5 text-[#fff8ee] shadow-[0_34px_90px_rgba(43,33,24,0.24)]">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d7ab5b]/20 blur-3xl" />
              <div className="rounded-[2.1rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">Produccion comercial</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em]">Una demo que parece inmobiliaria real, no plantilla.</h2>
                <div className="mt-8 space-y-3">
                  {productionSteps.map(([step, title, description]) => (
                    <div key={step} className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-4 sm:grid-cols-[76px_1fr]">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/42">{step}</p>
                      <div>
                        <p className="text-lg font-semibold">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-white/58">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <article className="rounded-[2.3rem] bg-[#17120e] p-7 text-[#fff8ee] shadow-[0_24px_70px_rgba(43,33,24,0.18)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">El problema</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em]">La mayoria no pierde ventas por falta de propiedades, sino por falta de sistema.</h2>
          </article>
          <div className="grid gap-4 sm:grid-cols-2">
            {painPoints.map((point) => (
              <div key={point} className="rounded-[1.8rem] border border-[#dccfbd] bg-white/68 p-5 shadow-[0_18px_50px_rgba(43,33,24,0.06)]">
                <p className="text-sm leading-7 text-[#4d4236]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a6a43]">La solucion</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#17120e] sm:text-5xl">
              Una plataforma bonita por fuera y operativa por dentro.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {proofPoints.map(([title, description]) => (
              <article key={title} className="rounded-[2rem] border border-[#dccfbd] bg-[#fffaf3] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#8a6a43]">{title}</p>
                <p className="mt-5 text-lg font-semibold leading-7 text-[#17120e]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.6rem] border border-[#dccfbd] bg-white/72 p-6 shadow-[0_24px_70px_rgba(43,33,24,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8a6a43]">Paquetes de arranque</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[#17120e] sm:text-5xl">No vendemos solo software. Montamos una operacion inicial.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#655848]">La mejor primera venta es acompanada: configuramos marca, propiedades, asesores y una pauta inicial para validar interesados reales.</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {offerCards.map((card) => (
              <article key={card.title} className="rounded-[2rem] border border-[#dccfbd] bg-[#fffaf3] p-6">
                <h3 className="font-serif text-3xl font-semibold tracking-[-0.04em] text-[#17120e]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#655848]">{card.line}</p>
                <div className="mt-5 space-y-2">
                  {card.bullets.map((bullet) => (
                    <p key={bullet} className="rounded-2xl border border-[#e5d8c6] bg-white px-4 py-3 text-sm text-[#4d4236]">{bullet}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[2.4rem] bg-[#17120e] p-7 text-[#fff8ee] shadow-[0_24px_70px_rgba(43,33,24,0.18)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">Pauta lista para medir</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em]">Cada anuncio debe terminar en una ficha, un WhatsApp o un formulario medible.</h2>
            <p className="mt-5 text-sm leading-8 text-white/62">
              Homes genera links de campana con UTM y registra visitas, clics a WhatsApp, formularios y leads relacionados. Asi la pauta deja de ser una caja negra.
            </p>
          </article>
          <article className="rounded-[2.4rem] border border-[#dccfbd] bg-[#fffaf3] p-7">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8a6a43]">Nota para real estate</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#17120e]">Meta y Google necesitan medicion y cuidado de cumplimiento.</h2>
            <p className="mt-5 text-sm leading-8 text-[#655848]">
              Para vivienda, la pauta debe configurarse con categoria adecuada cuando aplique, mensajes no discriminatorios y landing coherente. Por eso empezamos con compra asistida y medicion propia antes de automatizar APIs.
            </p>
          </article>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2.4rem] border border-[#dccfbd] bg-white/76 p-7 shadow-[0_24px_70px_rgba(43,33,24,0.08)] lg:flex-row lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#8a6a43]">Siguiente paso</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.05em] text-[#17120e]">Produzcamos una demo tan buena que justifique comprar pauta.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#655848]">La primera meta no es escalar: es conseguir conversaciones reales con inmobiliarias y aprender que mensaje convierte mejor.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login?next=/app" className="rounded-full bg-[#17120e] px-6 py-4 text-center text-sm font-semibold text-[#fff8ee] transition hover:bg-[#2a2118]">
              Quiero mi demo producida
            </Link>
            <Link href="/properties" className="rounded-full border border-[#d8c9b4] bg-white px-6 py-4 text-center text-sm font-semibold text-[#2a2118] transition hover:bg-[#fffaf3]">
              Ver experiencia publica
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
