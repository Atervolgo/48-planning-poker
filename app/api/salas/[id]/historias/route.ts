import { manejar, json } from "@/lib/http";
import { requerirFacilitador } from "@/lib/acceso";
import { crearHistoriaSchema } from "@/schemas";
import { crearHistoria } from "@/repositories/salas.repo";

export const runtime = "nodejs";

// POST /api/salas/:id/historias → el facilitador abre una nueva historia a estimar
export const POST = manejar(async (req, { params }) => {
  const { id } = await params;
  await requerirFacilitador(req, id);
  const { titulo } = crearHistoriaSchema.parse(await req.json());
  const hid = await crearHistoria(id, titulo);
  return json({ id: hid, titulo, estado: "votando" }, 201);
});
