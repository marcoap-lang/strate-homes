"use client";

import { useActionState, useState } from "react";
import { deletePropertyTourAction, type PropertyTourDeleteState } from "@/app/admin/actions";
import { AdminTourCreator } from "@/components/ui/AdminTourCreator";
import type { PropertyRecord } from "@/lib/admin-types";
import type { PropertyTourRecord } from "@/lib/admin-access";
import { buildPublicTourUrl } from "@/lib/public-links";

const initialDeleteState: PropertyTourDeleteState = { success: false, message: "" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function DeleteTourButton({ tourId }: { tourId: string }) {
  const [state, action, pending] = useActionState(deletePropertyTourAction, initialDeleteState);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="rounded-full border border-rose-100 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
        Borrar
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="tourId" value={tourId} />
      <button disabled={pending} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60">
        {pending ? "Borrando..." : "Confirmar"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
        Cancelar
      </button>
      {state.message ? <span className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</span> : null}
    </form>
  );
}

function CopyTourLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={handleCopy} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
      {copied ? "Liga copiada" : "Copiar liga"}
    </button>
  );
}

export function AdminToursManager({
  workspaceName,
  workspaceSlug,
  properties,
  tours,
}: {
  workspaceName: string | null | undefined;
  workspaceSlug?: string | null | undefined;
  properties: PropertyRecord[];
  tours: PropertyTourRecord[];
}) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Recorridos</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Selecciones compartibles</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Crea y administra recorridos públicos para enviar por WhatsApp, correo o redes sin mezclarlo con el listado operativo de propiedades.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">{workspaceName ?? workspaceSlug ?? "Workspace"}</span>
      </header>

      <AdminTourCreator properties={properties} />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Disponibles</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Recorridos creados</h3>
          </div>
          <p className="text-sm text-slate-500">{tours.length} recorrido{tours.length === 1 ? "" : "s"}</p>
        </div>

        <div className="mt-6 space-y-4">
          {tours.length ? tours.map((tour) => {
            const url = buildPublicTourUrl(tour.slug, workspaceSlug ?? null);
            return (
              <article key={tour.id} className="rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xl font-semibold text-slate-950">{tour.title}</h4>
                      {!tour.public_enabled ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Oculto</span> : null}
                    </div>
                    <p className="mt-2 break-all text-sm text-slate-500">{url}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Creado {formatDate(tour.created_at)}</span>
                      <span>{tour.properties.length} propiedades</span>
                      {tour.lead?.full_name ? <span>Lead: {tour.lead.full_name}</span> : <span>Sin lead</span>}
                    </div>
                    {tour.intro_message ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{tour.intro_message}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tour.properties.slice(0, 4).map((property) => (
                        <span key={property.id} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">{property.title}</span>
                      ))}
                      {tour.properties.length > 4 ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">+{tour.properties.length - 4} más</span> : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a href={url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Abrir
                    </a>
                    <CopyTourLinkButton url={url} />
                    <DeleteTourButton tourId={tour.id} />
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm leading-6 text-slate-600">
              Todavía no hay recorridos. Crea el primero arriba y tendrás aquí su liga lista para copiar.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
