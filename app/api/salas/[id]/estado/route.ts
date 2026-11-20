import { manejar, json } from "@/lib/http";
import { requerirMiembro } from "@/lib/acceso";
import { listarVotos, obtenerHistoria, listarHistorias } from "@/repositories/salas.repo";
import { prepararVotosParaCliente } from "@/services/votos";
import { promedio, mediana, dispersion, hayConsenso } from "@/services/estadisticas";

export const runtime = "nodejs";

// GET /api/salas/:id/estado  (RF-03: votos ocultos hasta que el facilitador revele)
export const GET = manejar(async (req, { params }) => {
  const { id } = await params;
  const { usuario, sala } = await requerirMiembro(req, id);
  const historial = (await listarHistorias(id)).filter((h) => h.resultado !== null);
  const base = {
    fase: sala.faseActual,
    esFacilitador: sala.facilitadorUid === usuario.uid,
    yo: usuario.uid,
    historial,
  };

  const hid = sala.historiaActualId;
  if (!hid) return json({ ...base, miVoto: null, historia: null, votos: [], resumen: null });

  const historia = await obtenerHistoria(id, hid);
  const revelada = historia?.estado === "revelada";
  const votosReales = await listarVotos(id, hid);

  // El filtro de seguridad: sin revelar, solo "quién votó", nunca el valor ajeno
  const votos = prepararVotosParaCliente(votosReales, sala.miembros, revelada);
  // Tu propio voto sí puedes verlo (para marcarlo tras recargar la página)
  const miVoto = votosReales.find((v) => v.uid === usuario.uid)?.valor ?? null;

  const valores = votosReales.map((v) => v.valor);
  const resumen = revelada
    ? { promedio: promedio(valores), mediana: mediana(valores), dispersion: dispersion(valores), consenso: hayConsenso(valores) }
    : null;

  return json({ ...base, miVoto, historia: { id: hid, ...historia }, votos, resumen });
});
