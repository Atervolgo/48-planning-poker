// Lógica de dominio PURA: sin Firebase, sin HTTP. Por eso es fácil de probar.

export type ValorVoto = number | string;

/** Solo los votos numéricos cuentan ("?" y "☕" se ignoran). */
export function soloNumericos(votos: ValorVoto[]): number[] {
  return votos.filter((v): v is number => typeof v === "number");
}

export function promedio(votos: ValorVoto[]): number | null {
  const n = soloNumericos(votos);
  if (n.length === 0) return null;
  return n.reduce((a, b) => a + b, 0) / n.length;
}

export function mediana(votos: ValorVoto[]): number | null {
  const n = [...soloNumericos(votos)].sort((a, b) => a - b);
  if (n.length === 0) return null;
  const mid = Math.floor(n.length / 2);
  return n.length % 2 === 0 ? (n[mid - 1] + n[mid]) / 2 : n[mid];
}

/** Dispersión = desviación estándar poblacional. */
export function dispersion(votos: ValorVoto[]): number | null {
  const n = soloNumericos(votos);
  const p = promedio(n);
  if (p === null) return null;
  const varianza = n.reduce((acc, v) => acc + (v - p) ** 2, 0) / n.length;
  return Math.sqrt(varianza);
}

/** Hay consenso cuando todos los votos son iguales. */
export function hayConsenso(votos: ValorVoto[]): boolean {
  return votos.length > 0 && new Set(votos).size === 1;
}
