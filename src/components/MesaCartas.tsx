"use client"; // necesita estado y eventos del navegador

import { useReducer, useEffect } from "react";
import { VALORES_CARTA } from "@/schemas";
import { promedio, mediana, dispersion } from "@/services/estadisticas";

// useReducer para las fases (sección 6): votando → revelada
type Estado = { fase: "votando" | "revelada"; miVoto: number | string | null };
type Accion = { tipo: "votar"; valor: number | string } | { tipo: "revelar" };

function reducer(e: Estado, a: Accion): Estado {
  if (a.tipo === "votar") return e.fase === "revelada" ? e : { ...e, miVoto: a.valor }; // criterio 3
  return { ...e, fase: "revelada" };
}

// Hito 1: valores de ejemplo (luego vendrán de GET /api/salas/:id/estado)
const VOTOS_EJEMPLO = [3, 5, 5, 8];

export default function MesaCartas() {
  const [estado, dispatch] = useReducer(reducer, { fase: "votando", miVoto: null });

  // Atajos de teclado 1-9 (sección 5). Alternativa: los botones siempre funcionan.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 9) dispatch({ tipo: "votar", valor: VALORES_CARTA[n - 1] });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const todos = estado.miVoto === null ? VOTOS_EJEMPLO : [...VOTOS_EJEMPLO, estado.miVoto];

  return (
    <section aria-labelledby="titulo-mesa">
      <h2 id="titulo-mesa">Elige tu carta</h2>
      <ul className="cartas">
        {VALORES_CARTA.map((v) => (
          <li key={String(v)}>
            <button
              type="button"
              className="carta"
              aria-pressed={estado.miVoto === v}
              disabled={estado.fase === "revelada"}
              onClick={() => dispatch({ tipo: "votar", valor: v })}
            >
              {v}
            </button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => dispatch({ tipo: "revelar" })} disabled={estado.fase === "revelada"}>
        Revelar (simulado)
      </button>

      {/* aria-live: el lector de pantalla anuncia el cambio de fase (criterio 4) */}
      <p aria-live="polite">
        {estado.fase === "votando"
          ? "Fase: votando. Los votos están ocultos."
          : `Fase: revelada. Promedio ${promedio(todos)?.toFixed(1)}, mediana ${mediana(todos)}, dispersión ${dispersion(todos)?.toFixed(2)}.`}
      </p>
    </section>
  );
}
