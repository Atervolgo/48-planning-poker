"use client";

import { useCallback, useEffect, useState } from "react";
import { VALORES_CARTA, crearHistoriaSchema } from "@/schemas";
import { usePolling } from "@/hooks/usePolling";
import { api, ApiError } from "@/lib/api";

interface Estado {
  fase: "votando" | "revelada" | "consenso";
  esFacilitador: boolean;
  yo: string;
  historia: { id: string; titulo: string; estado: "votando" | "revelada" } | null;
  votos: { uid: string; voto: boolean; valor?: number | string }[];
  resumen: { promedio: number | null; mediana: number | null; dispersion: number | null; consenso: boolean } | null;
}

export default function PokerSala({ salaId }: { salaId: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [miVoto, setMiVoto] = useState<number | string | null>(null);
  const [titulo, setTitulo] = useState("");

  const cargar = useCallback(async () => {
    try {
      setEstado(await api<Estado>(`/api/salas/${salaId}/estado`));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 404 ? "Sala no encontrada." : "No se pudo actualizar la sala.");
    }
  }, [salaId]);

  usePolling(cargar, 3000); // se pausa si la pestaña no está visible

  // Al cambiar de historia se limpia la carta elegida
  const hid = estado?.historia?.id;
  useEffect(() => setMiVoto(null), [hid]);

  const puedeVotar = estado?.historia?.estado === "votando";

  const votar = useCallback(async (valor: number | string) => {
    if (!estado?.historia || estado.historia.estado !== "votando") return;
    const anterior = miVoto;
    setMiVoto(valor); // actualización optimista: se ve al instante
    try {
      await api(`/api/salas/${salaId}/historias/${estado.historia.id}/votar`, { method: "PUT", body: JSON.stringify({ valor }) });
      void cargar();
    } catch {
      setMiVoto(anterior); // si falla, se revierte
      setError("No se pudo registrar tu voto.");
    }
  }, [estado, miVoto, salaId, cargar]);

  // Atajos 1-9
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) void votar(VALORES_CARTA[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [votar]);

  async function nuevaHistoria(e: React.FormEvent) {
    e.preventDefault();
    const r = crearHistoriaSchema.safeParse({ titulo });
    if (!r.success) return setError("El título debe tener entre 3 y 120 caracteres.");
    try { await api(`/api/salas/${salaId}/historias`, { method: "POST", body: JSON.stringify(r.data) }); setTitulo(""); await cargar(); }
    catch { setError("No se pudo crear la historia."); }
  }

  async function revelar() {
    if (!estado?.historia) return;
    try { await api(`/api/salas/${salaId}/historias/${estado.historia.id}/revelar`, { method: "POST" }); await cargar(); }
    catch { setError("No se pudo revelar."); }
  }

  if (!estado) return error ? <p role="alert">{error}</p> : <p role="status">Cargando sala…</p>;

  const h = estado.historia;
  return (
    <section aria-labelledby="titulo-poker">
      <h2 id="titulo-poker">{h ? h.titulo : "Sin historia activa"}</h2>
      {error && <p role="alert">{error}</p>}

      {estado.esFacilitador && (
        <form onSubmit={nuevaHistoria} noValidate>
          <label htmlFor="titulo">Nueva historia a estimar</label>
          <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <button type="submit">Abrir historia</button>
        </form>
      )}

      {h && (
        <>
          <ul className="cartas">
            {VALORES_CARTA.map((v) => (
              <li key={String(v)}>
                <button type="button" className="carta" aria-pressed={miVoto === v} disabled={!puedeVotar} onClick={() => votar(v)}>
                  {v}
                </button>
              </li>
            ))}
          </ul>

          <h3>Votos</h3>
          <ul>
            {estado.votos.map((v, i) => (
              <li key={v.uid}>
                {v.uid === estado.yo ? "Tú" : v.uid.startsWith("demo:") ? v.uid.slice(5) : `Persona ${i + 1}`}:{" "}
                {h.estado === "revelada" ? (v.valor ?? "sin voto") : v.voto ? "ya votó ✓" : "pendiente"}
              </li>
            ))}
          </ul>

          {estado.esFacilitador && h.estado === "votando" && (
            <button type="button" onClick={revelar}>Revelar votos</button>
          )}
        </>
      )}

      {/* El lector de pantalla anuncia los cambios de fase */}
      <p aria-live="polite">
        {h?.estado === "revelada" && estado.resumen
          ? `Votos revelados. Promedio ${estado.resumen.promedio?.toFixed(1) ?? "n/a"}, mediana ${estado.resumen.mediana ?? "n/a"}${estado.resumen.consenso ? ". Hay consenso." : "."}`
          : h ? "Fase: votando. Los votos están ocultos." : ""}
      </p>

      <p><a href={`/api/salas/${salaId}/exportar`}>Exportar acuerdos (Markdown)</a></p>
    </section>
  );
}
