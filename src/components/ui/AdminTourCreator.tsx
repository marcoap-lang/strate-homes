"use client";

import { useActionState } from "react";
import { createPropertyTourAction, type PropertyTourCreateState } from "@/app/admin/actions";
import type { PropertyRecord } from "@/lib/admin-types";

const initialTourState: PropertyTourCreateState = { success: false, message: "" };

function defaultTourTitle() {
  return `Recorrido destacado ${new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}`;
}

export function AdminTourCreator({ properties }: { properties: PropertyRecord[] }) {
  const [state, action, pending] = useActionState(createPropertyTourAction, initialTourState);
  const publicProperties = properties.filter((property) => property.status === "active");

  return (
    <form action={action} className="rounded-[2rem] border border-amber-100 bg-[#fff8ec] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#9b6f21]">Recorrido compartible</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Crear recorrido sin lead</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Arma una selección pública de propiedades para mandar por WhatsApp, redes o a un cliente nuevo sin capturarlo todavía como lead.
          </p>
        </div>
        {state.tourUrl ? (
          <a href={state.tourUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800">
            Abrir recorrido
          </a>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Título</span>
          <input name="title" defaultValue={defaultTourTitle()} className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#d7ab5b]" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Mensaje intro</span>
          <input name="introMessage" defaultValue="Te comparto esta selección curada para revisar opciones y comparar rápidamente." className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#d7ab5b]" />
        </label>
      </div>

      <div className="mt-5 grid max-h-72 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
        {publicProperties.length ? publicProperties.map((property, index) => (
          <label key={property.id} className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="propertyIds" value={property.id} defaultChecked={index < 4} className="mt-1" />
            <span>
              <span className="block font-medium text-slate-950">{property.title}</span>
              <span className="text-xs leading-5 text-slate-500">{property.location_label} · {property.currency_code} {property.price_amount?.toLocaleString("es-MX") ?? "Consultar"}</span>
            </span>
          </label>
        )) : (
          <p className="rounded-2xl border border-dashed border-amber-200 bg-white px-4 py-4 text-sm text-slate-500 md:col-span-2">No hay propiedades activas para armar un recorrido.</p>
        )}
      </div>

      {state.message ? <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}

      <button disabled={pending || !publicProperties.length} className="mt-5 w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60 sm:w-auto">
        {pending ? "Creando recorrido..." : "Crear recorrido público"}
      </button>
    </form>
  );
}
