"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MAX_IMAGE_FILE_SIZE_MB = 8;

export function AgentAvatarUploadField({
  workspaceId,
  agentKey,
  value,
  onChange,
  label = "Foto",
}: {
  workspaceId: string;
  agentKey: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const supabase = createSupabaseBrowserClient();

  function initialsFromUrl() {
    return "A";
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setError(null);

    startUploadTransition(async () => {
      try {
        if (!file.type.startsWith("image/")) throw new Error("Solo puedes subir imágenes válidas.");
        if (file.size > MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024) throw new Error(`La imagen supera ${MAX_IMAGE_FILE_SIZE_MB} MB.`);

        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const safeName = file.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9.]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const path = `${workspaceId}/agents/${agentKey}/${Date.now()}-${crypto.randomUUID()}-${safeName || `image.${extension}`}`;

        const { error: uploadError } = await supabase.storage.from("property-images").upload(path, file, {
          upsert: false,
          contentType: file.type,
        });

        if (uploadError) throw new Error(uploadError.message);

        const publicUrl = supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;
        onChange(publicUrl);
        setMessage("Foto cargada correctamente.");
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "No pudimos subir la foto.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="space-y-3">
      <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">{label}</span>
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 text-lg font-semibold text-stone-500">
          {value ? <Image src={value} alt={label} fill className="object-cover" unoptimized /> : initialsFromUrl()}
        </div>
        <div className="space-y-2">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="block text-sm text-stone-600" />
          {isUploading ? <p className="text-xs text-stone-500">Subiendo...</p> : null}
          {message ? <p className="text-xs text-emerald-700">{message}</p> : null}
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </div>
      </div>
      <input type="hidden" name="avatarUrl" value={value} />
    </div>
  );
}
