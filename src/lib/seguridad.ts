import { prohibido } from "./errores";

/**
 * Defensa contra CSRF (sección 9.5): en peticiones que modifican datos, si el navegador
 * envía `Origin`, debe ser el mismo sitio. Sin `Origin` (Bruno, curl) no hay navegador
 * que engañar, así que se permite y la sesión sigue siendo obligatoria.
 */
export function verificarOrigen(req: Request) {
  const origen = req.headers.get("origin");
  if (!origen) return;
  const host = req.headers.get("host") ?? new URL(req.url).host;
  let mismoSitio = false;
  try {
    mismoSitio = new URL(origen).host === host;
  } catch {
    /* origen mal formado → se rechaza */
  }
  if (!mismoSitio) throw prohibido("Origen no permitido");
}
