import { ZodError } from "zod";
import { ErrorHttp } from "./errores";
import { verificarOrigen } from "./seguridad";
import { limitar } from "./limite";

type Handler = (req: Request, ctx: any) => Promise<Response>;

/**
 * Envoltorio común (sección 9.2) de TODOS los Route Handlers:
 * 1) en métodos que escriben: comprueba Origin y aplica límite de frecuencia (429)
 * 2) convierte cualquier error en { error, detalles? } con el código correcto
 * 3) nunca filtra detalles internos
 */
export function manejar(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      const metodo = req.method.toUpperCase();
      if (metodo !== "GET" && metodo !== "HEAD") {
        verificarOrigen(req);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
        const esAuth = new URL(req.url).pathname.startsWith("/api/auth");
        const permitido = limitar(`${ip}:${esAuth ? "auth" : "escritura"}`, esAuth ? 10 : 120, 60_000);
        if (!permitido) throw new ErrorHttp(429, "Demasiadas peticiones, intenta en un minuto");
      }
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ErrorHttp) {
        return Response.json(
          { error: e.message, detalles: e.detalles },
          { status: e.status, headers: e.status === 429 ? { "Retry-After": "60" } : undefined },
        );
      }
      if (e instanceof ZodError) {
        const detalles = e.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message }));
        return Response.json({ error: "Datos inválidos", detalles }, { status: 400 });
      }
      console.error("Error no controlado"); // sin datos personales ni tokens
      return Response.json({ error: "Error interno" }, { status: 500 });
    }
  };
}

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
