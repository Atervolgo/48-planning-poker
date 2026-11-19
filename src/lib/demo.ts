/**
 * Modo demo: datos en memoria y acceso por nombre, SIN Firebase.
 * Solo sirve con `npm run dev` (NODE_ENV=development) y MODO_DEMO=1.
 * En producción (Vercel / `next start`) queda desactivado aunque la variable exista.
 */
export const modoDemoActivo = () =>
  process.env.MODO_DEMO === "1" && process.env.NODE_ENV !== "production";

/** "Ana María!" → "ana-maria" (para usarlo como identificador) */
export const nombreASlug = (n: string) =>
  n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20);
