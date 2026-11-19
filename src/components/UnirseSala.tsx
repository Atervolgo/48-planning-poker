"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function UnirseSala({ codigo }: { codigo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function unirse() {
    try {
      const { id } = await api<{ id: string }>("/api/salas/unirse", { method: "POST", body: JSON.stringify({ codigo }) });
      router.push(`/salas/${id}/poker`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo unir a la sala.");
    }
  }

  return (
    <>
      <button type="button" onClick={unirse}>Unirme a la sala</button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
