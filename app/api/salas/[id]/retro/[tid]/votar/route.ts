import { manejar, json } from "@/lib/http";
import { requerirMiembro } from "@/lib/acceso";
import { conflicto, noEncontrado } from "@/lib/errores";
import { votarTarjeta } from "@/repositories/salas.repo";

export const runtime = "nodejs";

// POST /api/salas/:id/retro/:tid/votar → un voto por persona
export const POST = manejar(async (req, { params }) => {
  const { id, tid } = await params;
  const { usuario } = await requerirMiembro(req, id);
  const r = await votarTarjeta(id, tid, usuario.uid);
  if (r === "no_existe") throw noEncontrado("Tarjeta no encontrada");
  if (r === "ya_voto") throw conflicto("Ya votaste esta tarjeta");
  return json({ ok: true });
});
