import { manejar, json } from "@/lib/http";
import { requerirFacilitador } from "@/lib/acceso";
import { noEncontrado, conflicto } from "@/lib/errores";
import { obtenerHistoria, listarVotos, marcarRevelada } from "@/repositories/salas.repo";
import { mediana, hayConsenso } from "@/services/estadisticas";

export const runtime = "nodejs";

// POST /api/salas/:id/historias/:hid/revelar  (RF-05: solo el facilitador → 403)
export const POST = manejar(async (req, { params }) => {
  const { id, hid } = await params;
  await requerirFacilitador(req, id);

  const historia = await obtenerHistoria(id, hid);
  if (!historia) throw noEncontrado("Historia no encontrada");
  if (historia.estado === "revelada") throw conflicto("La historia ya fue revelada");

  // Resultado propuesto: el valor común si hay consenso; si no, la mediana
  const valores = (await listarVotos(id, hid)).map((v) => v.valor);
  const resultado = hayConsenso(valores) ? valores[0] : mediana(valores);
  await marcarRevelada(id, hid, resultado);
  return json({ estado: "revelada", resultado });
});
