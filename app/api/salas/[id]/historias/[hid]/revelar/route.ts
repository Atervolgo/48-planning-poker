import { manejar, json } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";
import { noEncontrado, prohibido, conflicto } from "@/lib/errores";
import { obtenerSala, obtenerHistoria, marcarRevelada } from "@/repositories/salas.repo";

export const runtime = "nodejs";

// POST /api/salas/:id/historias/:hid/revelar  (RF-05: solo el facilitador)
export const POST = manejar(async (req, { params }) => {
  const { id, hid } = await params;
  const usuario = await requerirUsuario(req);
  const sala = await obtenerSala(id);
  if (!sala || !sala.miembros.includes(usuario.uid)) throw noEncontrado("Sala no encontrada");

  // Criterio de aceptación 2: no facilitador → 403
  if (sala.facilitadorUid !== usuario.uid) throw prohibido("Solo el facilitador puede revelar");

  const historia = await obtenerHistoria(id, hid);
  if (!historia) throw noEncontrado("Historia no encontrada");
  if (historia.estado === "revelada") throw conflicto("La historia ya fue revelada");

  await marcarRevelada(id, hid);
  return json({ estado: "revelada" });
});
