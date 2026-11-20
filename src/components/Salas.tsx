"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { crearSalaSchema } from "@/schemas";
import Esqueleto from "./Esqueleto";

interface SalaResumen { id: string; nombre: string; codigo: string; esFacilitador: boolean; miembros: number }

export default function Salas() {
  const [salas, setSalas] = useState<SalaResumen[] | null>(null);
  const [error, setError] = useState(false);
  const [nombre, setNombre] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(false);
    try { setSalas(await api<SalaResumen[]>("/api/salas")); } catch { setError(true); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    // La MISMA validación Zod del servidor, aplicada antes de enviar
    const r = crearSalaSchema.safeParse({ nombre });
    if (!r.success) return setErrorForm("El nombre debe tener entre 3 y 60 caracteres.");
    setErrorForm(null);
    try { await api("/api/salas", { method: "POST", body: JSON.stringify(r.data) }); setNombre(""); await cargar(); }
    catch { setErrorForm("No se pudo crear la sala."); }
  }

  return (
    <>
      <form onSubmit={crear} noValidate>
        <label htmlFor="nombre">Nombre de la nueva sala</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} aria-describedby="err-nombre" />
        <button type="submit">Crear sala</button>
        <p id="err-nombre" role="alert">{errorForm}</p>
      </form>

      {error ? (
        <div role="alert"><p>No se pudieron cargar tus salas.</p><button type="button" onClick={cargar}>Reintentar</button></div>
      ) : salas === null ? (
        <Esqueleto etiqueta="Cargando salas…" />
      ) : salas.length === 0 ? (
        <p>Aún no tienes salas. Crea una o únete con un código.</p>
      ) : (
        <ul>
          {salas.map((s) => (
            <li key={s.id}>
              <strong>{s.nombre}</strong> · código {s.codigo} · {s.miembros} personas
              {" · "}<a href={`/salas/${s.id}/poker`}>Poker</a>{" · "}<a href={`/salas/${s.id}/retro`}>Retro</a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
