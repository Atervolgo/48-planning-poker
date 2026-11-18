import { adminAuth } from "./firebase-admin";
import { noAutenticado } from "./errores";

export interface Usuario {
  uid: string;
  correo: string | null;
  rol: string;
}

/**
 * Verifica la sesión en CADA ruta privada (proxy.ts NO es la seguridad real).
 * El uid sale de aquí, nunca del cuerpo ni de la URL.
 */
export async function requerirUsuario(req: Request): Promise<Usuario> {
  const cookie = req.headers.get("cookie")?.match(/(?:^|;\s*)sesion=([^;]+)/)?.[1];
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  try {
    const decoded = cookie
      ? await adminAuth.verifySessionCookie(cookie, true)
      : bearer
        ? await adminAuth.verifyIdToken(bearer) // útil para probar con Bruno
        : null;
    if (!decoded) throw noAutenticado();
    return { uid: decoded.uid, correo: decoded.email ?? null, rol: (decoded.rol as string) ?? "usuario" };
  } catch {
    throw noAutenticado();
  }
}
