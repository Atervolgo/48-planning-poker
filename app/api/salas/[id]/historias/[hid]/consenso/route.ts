import { manejar, json } from "@/lib/http";
import { requerirFacilitador } from "@/lib/acceso";
import { noEncontrado, conflicto } from "@/lib/errores";
import { consensoSchema } from "@/schemas";
import { obtenerHistoria, fijarConsenso } from "@/repositories/salas.repo";

export const runtime = "nodejs";

// POST /api/salas/:id/historias/:hid/consenso  { resultado }  (solo facilitador)
// Cierra la historia con el valor acordado; luego se puede abrir la siguiente.
export const POST = manejar(async (req, { params }) => {
  const { id, hid } = await params;
  await requerirFacilitador(req, id);
  const { resultado } = consensoSchema.parse(await req.json());

  const historia = await obtenerHistoria(id, hid);
  if (!historia) throw noEncontrado("Historia no encontrada");
  if (historia.estado !== "revelada") throw conflicto("Primero hay que revelar los votos");

  await fijarConsenso(id, hid, resultado);
  return json({ resultado });
});
