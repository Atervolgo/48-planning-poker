import { ZodError } from "zod";
import { ErrorHttp } from "./errores";

type Handler = (req: Request, ctx: any) => Promise<Response>;

/**
 * Envoltorio común (sección 9.2): convierte cualquier error en
 * { error, detalles? } con el código correcto, y nunca filtra detalles internos.
 */
export function manejar(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ErrorHttp) {
        return Response.json({ error: e.message, detalles: e.detalles }, { status: e.status });
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
