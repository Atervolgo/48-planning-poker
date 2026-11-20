"use client"; // necesita estado y eventos del navegador

import { useReducer, useEffect, useState } from "react";
import { VALORES_CARTA } from "@/schemas";
import { promedio, mediana, dispersion } from "@/services/estadisticas";
import Esqueleto from "./Esqueleto";

// useReducer para las fases de la sesión (sección 6): votando → revelada → consenso
type Estado = { fase: "votando" | "revelada" | "consenso"; miVoto: number | string | null };
type Accion = { tipo: "votar"; valor: number | string } | { tipo: "revelar" } | { tipo: "consenso" };

export function reducer(e: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case "votar":
      return e.fase === "votando" ? { ...e, miVoto: a.valor } : e; // no se vota tras revelar
    case "revelar":
      return e.fase === "votando" ? { ...e, fase: "revelada" } : e;
    case "consenso":
      return e.fase === "revelada" ? { ...e, fase: "consenso" } : e;
  }
}

type Carga =
  | { estado: "cargando" }
  | { estado: "error" }
  | { estado: "ok"; historia: string; votos: number[] };

export default function MesaCartas() {
  const [juego, dispatch] = useReducer(reducer, { fase: "votando", miVoto: null });
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" });
  const [intento, setIntento] = useState(0);

  // Hito 1: los votos de los demás vienen de un JSON de ejemplo
  useEffect(() => {
    let activo = true;
    setCarga({ estado: "cargando" });
    fetch("/ejemplo-estado.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((d) => activo && setCarga({ estado: "ok", historia: d.historia, votos: d.votos ?? [] }))
      .catch(() => activo && setCarga({ estado: "error" }));
    return () => { activo = false; };
  }, [intento]);

  // Atajos 1-9 (sección 5). Se ignoran si la persona está escribiendo en un campo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) dispatch({ tipo: "votar", valor: VALORES_CARTA[n - 1] });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (carga.estado === "cargando") return <Esqueleto etiqueta="Cargando mesa…" />;
  if (carga.estado === "error")
    return (
      <div role="alert">
        <p>No se pudo cargar la mesa.</p>
        <button type="button" onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
      </div>
    );
  if (carga.votos.length === 0) return <p>Aún nadie ha votado. Sé la primera persona.</p>;

  const todos = juego.miVoto === null ? carga.votos : [...carga.votos, juego.miVoto];

  return (
    <section aria-labelledby="titulo-mesa">
      <h2 id="titulo-mesa">{carga.historia}</h2>
      <fieldset>
        <legend>Elige tu carta (también puedes usar las teclas 1 a 9)</legend>
        <ul className="cartas">
          {VALORES_CARTA.map((v) => (
            <li key={String(v)}>
              <button
                type="button"
                className="carta"
                aria-pressed={juego.miVoto === v}
                disabled={juego.fase !== "votando"}
                onClick={() => dispatch({ tipo: "votar", valor: v })}
              >
                {v}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {juego.fase === "votando" && (
        <button type="button" onClick={() => dispatch({ tipo: "revelar" })}>Revelar (simulado)</button>
      )}
      {juego.fase === "revelada" && (
        <button type="button" onClick={() => dispatch({ tipo: "consenso" })}>Fijar consenso (simulado)</button>
      )}

      {/* aria-live: el lector de pantalla anuncia el cambio de fase */}
      <p aria-live="polite">
        {juego.fase === "votando" && "Fase: votando. Los votos están ocultos."}
        {juego.fase === "revelada" &&
          `Fase: revelada. Promedio ${promedio(todos)?.toFixed(1)}, mediana ${mediana(todos)}, dispersión ${dispersion(todos)?.toFixed(2)}.`}
        {juego.fase === "consenso" && `Fase: consenso. Resultado acordado: ${mediana(todos)}.`}
      </p>
    </section>
  );
}
