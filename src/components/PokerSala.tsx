"use client";

import { startTransition, useCallback, useEffect, useOptimistic, useState } from "react";
import { VALORES_CARTA, crearHistoriaSchema } from "@/schemas";
import { usePolling } from "@/hooks/usePolling";
import { api, ApiError } from "@/lib/api";
import Esqueleto from "./Esqueleto";

type Valor = number | string;

interface Estado {
  fase: "votando" | "revelada" | "consenso";
  esFacilitador: boolean;
  yo: string;
  miVoto: Valor | null;
  historia: { id: string; titulo: string; estado: "votando" | "revelada"; resultado?: Valor | null } | null;
  votos: { uid: string; voto: boolean; valor?: Valor }[];
  resumen: { promedio: number | null; mediana: number | null; dispersion: number | null; consenso: boolean } | null;
  historial: { titulo: string; resultado: Valor | null }[];
}

const aValor = (s: string): Valor => (/^\d+$/.test(s) ? Number(s) : s);

export default function PokerSala({ salaId }: { salaId: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [miVoto, setMiVoto] = useState<Valor | null>(null);
  // useOptimistic: la carta se marca al instante y, si la petición falla, vuelve sola al valor real
  const [votoVisible, setVotoOptimista] = useOptimistic<Valor | null, Valor>(miVoto, (_actual, nuevo) => nuevo);
  const [titulo, setTitulo] = useState("");
  const [acordado, setAcordado] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setEstado(await api<Estado>(`/api/salas/${salaId}/estado`));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 404 ? "Sala no encontrada." : "No se pudo actualizar la sala.");
    }
  }, [salaId]);

  usePolling(cargar, 3000); // se pausa si la pestaña no está visible

  // Tu voto real viene del servidor (también tras recargar la página o al cambiar de historia)
  const votoServidor = estado?.miVoto ?? null;
  const hidActual = estado?.historia?.id;
  useEffect(() => {
    setMiVoto(votoServidor);
    setAcordado(null);
  }, [votoServidor, hidActual]);

  const votar = useCallback(
    (valor: Valor) => {
      const h = estado?.historia;
      if (!h || h.estado !== "votando") return;
      startTransition(async () => {
        setVotoOptimista(valor);
        try {
          await api(`/api/salas/${salaId}/historias/${h.id}/votar`, { method: "PUT", body: JSON.stringify({ valor }) });
          setMiVoto(valor);
          setError(null);
          await cargar();
        } catch {
          setError("No se pudo registrar tu voto.");
        }
      });
    },
    [estado, salaId, cargar, setVotoOptimista],
  );

  // Atajos 1-9 (se ignoran al escribir en un campo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) votar(VALORES_CARTA[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [votar]);

  async function nuevaHistoria(e: React.FormEvent) {
    e.preventDefault();
    const r = crearHistoriaSchema.safeParse({ titulo });
    if (!r.success) return setError("El título debe tener entre 3 y 120 caracteres.");
    try {
      await api(`/api/salas/${salaId}/historias`, { method: "POST", body: JSON.stringify(r.data) });
      setTitulo("");
      await cargar();
    } catch {
      setError("No se pudo crear la historia.");
    }
  }

  async function revelar() {
    if (!estado?.historia) return;
    try {
      await api(`/api/salas/${salaId}/historias/${estado.historia.id}/revelar`, { method: "POST" });
      await cargar();
    } catch {
      setError("No se pudo revelar.");
    }
  }

  async function fijarConsenso(resultado: Valor) {
    if (!estado?.historia) return;
    try {
      await api(`/api/salas/${salaId}/historias/${estado.historia.id}/consenso`, { method: "POST", body: JSON.stringify({ resultado }) });
      await cargar();
    } catch {
      setError("No se pudo fijar el consenso.");
    }
  }

  if (!estado) return error ? <p role="alert">{error}</p> : <Esqueleto etiqueta="Cargando sala…" />;

  const h = estado.historia;
  const revelada = h?.estado === "revelada";
  const propuesto = h?.resultado != null ? String(h.resultado) : "5";
  const etiquetaVoto = (v: Estado["votos"][number], i: number) =>
    v.uid === estado.yo ? "Tú" : v.uid.startsWith("demo:") ? v.uid.slice(5) : `Persona ${i + 1}`;

  return (
    <section aria-labelledby="titulo-poker">
      <h2 id="titulo-poker">{h ? h.titulo : "Sin historia activa"}</h2>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={cargar}>Actualizar</button>

      {estado.esFacilitador && (estado.fase !== "votando" || !h) && (
        <form onSubmit={nuevaHistoria} noValidate>
          <label htmlFor="titulo">{h ? "Siguiente historia a estimar" : "Primera historia a estimar"}</label>
          <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <button type="submit">Abrir historia</button>
        </form>
      )}

      {h && (
        <>
          <fieldset>
            <legend>Elige tu carta (teclas 1 a 9)</legend>
            <ul className="cartas">
              {VALORES_CARTA.map((v) => (
                <li key={String(v)}>
                  <button type="button" className="carta" aria-pressed={votoVisible === v} disabled={h.estado !== "votando"} onClick={() => votar(v)}>
                    {v}
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>

          <h3>Votos</h3>
          <ul>
            {estado.votos.map((v, i) => (
              <li key={v.uid}>
                {etiquetaVoto(v, i)}: {revelada ? (v.valor ?? "sin voto") : v.voto ? "ya votó ✓" : "pendiente"}
              </li>
            ))}
          </ul>

          {estado.esFacilitador && h.estado === "votando" && (
            <button type="button" onClick={revelar}>Revelar votos</button>
          )}

          {estado.esFacilitador && revelada && estado.fase !== "consenso" && (
            <fieldset>
              <legend>Fijar el consenso</legend>
              <label htmlFor="acordado">Valor acordado</label>
              <select id="acordado" value={acordado ?? propuesto} onChange={(e) => setAcordado(e.target.value)}>
                {VALORES_CARTA.map((v) => <option key={String(v)} value={String(v)}>{v}</option>)}
              </select>
              <button type="button" onClick={() => fijarConsenso(aValor(acordado ?? propuesto))}>Fijar consenso</button>
            </fieldset>
          )}
        </>
      )}

      {/* El lector de pantalla anuncia los cambios de fase */}
      <p aria-live="polite">
        {estado.fase === "consenso" && h
          ? `Consenso fijado: ${h.resultado}.`
          : revelada && estado.resumen
            ? `Votos revelados. Promedio ${estado.resumen.promedio?.toFixed(1) ?? "n/a"}, mediana ${estado.resumen.mediana ?? "n/a"}${estado.resumen.consenso ? ". Hay consenso." : "."}`
            : h ? "Fase: votando. Los votos están ocultos." : ""}
      </p>

      <h3>Historial de estimaciones</h3>
      {estado.historial.length === 0 ? (
        <p>Aún no hay estimaciones cerradas.</p>
      ) : (
        <ol>
          {estado.historial.map((x, i) => <li key={i}>{x.titulo}: <strong>{x.resultado}</strong></li>)}
        </ol>
      )}

      <p><a href={`/api/salas/${salaId}/exportar`}>Exportar acuerdos (Markdown)</a></p>
    </section>
  );
}
