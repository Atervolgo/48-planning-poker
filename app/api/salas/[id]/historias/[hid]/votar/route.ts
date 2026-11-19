import { manejar, json } from "@/lib/http";
import { requerirMiembro } from "@/lib/acceso";
import { conflicto, noEncontrado } from "@/lib/errores";
import { votoSchema } from "@/schemas";
import { obtenerHistoria, guardarVoto } from "@/repositories/salas.repo";

export const runtime = "nodejs";

// PUT /api/salas/:id/historias/:hid/votar  { valor }  → se puede cambiar el voto mientras no se revele
export const PUT = manejar(async (req, { params }) => {
  const { id, hid } = await params;
  const { usuario } = await requerirMiembro(req, id);
  const { valor } = votoSchema.parse(await req.json());
  const historia = await obtenerHistoria(id, hid);
  if (!historia) throw noEncontrado("Historia no encontrada");
  if (historia.estado === "revelada") throw conflicto("La historia ya fue revelada"); // criterio 3
  await guardarVoto(id, hid, usuario.uid, valor); // uid de la sesión, NO del cuerpo
  return json({ ok: true });
});
