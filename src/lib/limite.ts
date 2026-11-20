// Límite de frecuencia simple en memoria (ventana deslizante).
// En Vercel cada instancia tiene su propio contador: para producción real
// se recomienda además el Firewall de Vercel. Aquí cumple la sección 9.5 y se puede probar.
const golpes = new Map<string, number[]>();

/** true = permitido, false = excedió el límite (el handler responde 429). */
export function limitar(clave: string, max: number, ventanaMs: number, ahora = Date.now()): boolean {
  const recientes = (golpes.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (recientes.length >= max) {
    golpes.set(clave, recientes);
    return false;
  }
  recientes.push(ahora);
  golpes.set(clave, recientes);
  if (golpes.size > 5000) {
    for (const [k, v] of golpes) if (!v.some((t) => ahora - t < ventanaMs)) golpes.delete(k);
  }
  return true;
}

/** Solo para pruebas. */
export const _reiniciarLimites = () => golpes.clear();
