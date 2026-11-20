"use client";

import { useCallback, useState } from "react";
import { tarjetaRetroSchema } from "@/schemas";
import { COLUMNAS, type Columna, type Tarjeta } from "@/services/retro";
import { usePolling } from "@/hooks/usePolling";
import { api, ApiError } from "@/lib/api";
import Esqueleto from "./Esqueleto";

type Grupos = Record<Columna, Tarjeta[]>;

export default function RetroBoard({ salaId }: { salaId: string }) {
  const [grupos, setGrupos] = useState<Grupos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [columna, setColumna] = useState<Columna>("bien");
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    try { setGrupos(await api<Grupos>(`/api/salas/${salaId}/retro`)); }
    catch { setError("No se pudo cargar el tablero."); }
  }, [salaId]);
  usePolling(cargar, 4000);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    const r = tarjetaRetroSchema.safeParse({ columna, texto });
    if (!r.success) return setError("Escribe entre 1 y 280 caracteres.");
    setError(null);
    try { await api(`/api/salas/${salaId}/retro`, { method: "POST", body: JSON.stringify(r.data) }); setTexto(""); setAviso("Tarjeta agregada."); await cargar(); }
    catch { setError("No se pudo agregar la tarjeta."); }
  }

  async function votar(t: Tarjeta) {
    try { await api(`/api/salas/${salaId}/retro/${t.id}/votar`, { method: "POST" }); setAviso("Voto registrado."); await cargar(); }
    catch (e) { setError(e instanceof ApiError && e.status === 409 ? "Ya votaste esta tarjeta." : "No se pudo votar."); }
  }

  if (!grupos) return error ? <p role="alert">{error}</p> : <Esqueleto etiqueta="Cargando tablero…" />;

  return (
    <>
      <form onSubmit={agregar} noValidate>
        <fieldset>
        <legend>Nueva tarjeta</legend>
        <label htmlFor="columna">Columna</label>
        <select id="columna" value={columna} onChange={(e) => setColumna(e.target.value as Columna)}>
          {COLUMNAS.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
        <label htmlFor="texto">Tarjeta</label>
        <input id="texto" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={280} />
        <button type="submit">Agregar</button>
        </fieldset>
      </form>
      <button type="button" onClick={cargar}>Actualizar</button>
      {error && <p role="alert">{error}</p>}
      <p aria-live="polite">{aviso}</p>

      {/* Móvil: columnas apiladas. Escritorio: tres columnas */}
      <div className="retro">
        {COLUMNAS.map((c) => (
          <section key={c.id} aria-labelledby={`col-${c.id}`}>
            <h2 id={`col-${c.id}`}>{c.titulo}</h2>
            {grupos[c.id].length === 0 ? <p>Sin tarjetas todavía.</p> : (
              <ul>
                {grupos[c.id].map((t) => (
                  <li key={t.id}>
                    {t.texto}{" "}
                    <button type="button" onClick={() => votar(t)} aria-label={`Votar: ${t.texto}. Votos actuales ${t.votos}`}>
                      👍 {t.votos}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <p><a href={`/api/salas/${salaId}/exportar`}>Exportar acciones (Markdown)</a></p>
    </>
  );
}
