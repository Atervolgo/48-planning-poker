// Reglas puras de la retrospectiva (RF-04) y del export (RF-06).

export type Columna = "bien" | "mejorar" | "acciones";

export interface Tarjeta {
  id: string;
  columna: Columna;
  texto: string;
  autorUid: string;
  votos: number;
}

export const COLUMNAS: { id: Columna; titulo: string }[] = [
  { id: "bien", titulo: "Qué salió bien" },
  { id: "mejorar", titulo: "Qué mejorar" },
  { id: "acciones", titulo: "Acciones" },
];

/** Agrupa por columna y ordena por votos (de mayor a menor). */
export function agruparPorColumna(tarjetas: Tarjeta[]): Record<Columna, Tarjeta[]> {
  const grupos: Record<Columna, Tarjeta[]> = { bien: [], mejorar: [], acciones: [] };
  for (const t of tarjetas) grupos[t.columna].push(t);
  for (const c of Object.keys(grupos) as Columna[]) grupos[c].sort((a, b) => b.votos - a.votos);
  return grupos;
}

export interface HistoriaResumen {
  titulo: string;
  resultado: number | string | null;
}

/** RF-06: acuerdos de estimación + acciones de la retro, en Markdown. */
export function exportarMarkdown(nombreSala: string, historias: HistoriaResumen[], tarjetas: Tarjeta[]): string {
  const grupos = agruparPorColumna(tarjetas);
  const lineas: string[] = [`# ${nombreSala}`, "", "## Estimaciones acordadas", ""];
  const cerradas = historias.filter((h) => h.resultado !== null);
  lineas.push(...(cerradas.length ? cerradas.map((h) => `- ${h.titulo}: **${h.resultado}**`) : ["_Sin estimaciones._"]));
  lineas.push("", "## Acciones de la retrospectiva", "");
  lineas.push(...(grupos.acciones.length ? grupos.acciones.map((t) => `- [ ] ${t.texto} (${t.votos} votos)`) : ["_Sin acciones._"]));
  return lineas.join("\n") + "\n";
}
