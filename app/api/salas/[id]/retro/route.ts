import { manejar, json } from "@/lib/http";
import { requerirMiembro } from "@/lib/acceso";
import { tarjetaRetroSchema } from "@/schemas";
import { listarTarjetas, crearTarjeta } from "@/repositories/salas.repo";
import { agruparPorColumna } from "@/services/retro";

export const runtime = "nodejs";

// GET /api/salas/:id/retro → tarjetas agrupadas por columna (RF-04)
export const GET = manejar(async (req, { params }) => {
  const { id } = await params;
  await requerirMiembro(req, id);
  return json(agruparPorColumna(await listarTarjetas(id)));
});

// POST /api/salas/:id/retro { columna, texto }
export const POST = manejar(async (req, { params }) => {
  const { id } = await params;
  const { usuario } = await requerirMiembro(req, id);
  const { columna, texto } = tarjetaRetroSchema.parse(await req.json());
  const tid = await crearTarjeta(id, columna, texto, usuario.uid);
  return json({ id: tid }, 201);
});
