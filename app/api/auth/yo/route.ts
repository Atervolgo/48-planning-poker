import { manejar, json } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/auth/yo → 200 { usuario } o 401
export const GET = manejar(async (req) => {
  const usuario = await requerirUsuario(req);
  return json({ usuario });
});
