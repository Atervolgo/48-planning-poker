import { manejar, json } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";
import { noEncontrado } from "@/lib/errores";
import { obtenerSala, listarVotos, obtenerHistoria } from "@/repositories/salas.repo";
import { prepararVotosParaCliente } from "@/services/votos";
import { promedio, mediana, dispersion, hayConsenso } from "@/services/estadisticas";

export const runtime = "nodejs";

// GET /api/salas/:id/estado  (RF-03: votos ocultos hasta que el facilitador revele)
export const GET = manejar(async (req, { params }) => {
  const { id } = await params;
  const usuario = await requerirUsuario(req); // 1. ¿quién es? (401)
  const sala = await obtenerSala(id);
  // 2. ¿pertenece a la sala? Si no, 404 (no revelamos que existe)
  if (!sala || !sala.miembros.includes(usuario.uid)) throw noEncontrado("Sala no encontrada");

  const hid = sala.historiaActualId;
  if (!hid) return json({ fase: sala.faseActual, historia: null, votos: [] });

  const historia = await obtenerHistoria(id, hid);
  const revelada = historia?.estado === "revelada";
  const votosReales = await listarVotos(id, hid);

  // 3. El filtro de seguridad: sin revelar, solo "quién votó", nunca el valor
  const votos = prepararVotosParaCliente(votosReales, sala.miembros, revelada);

  const valores = votosReales.map((v) => v.valor);
  const resumen = revelada
    ? { promedio: promedio(valores), mediana: mediana(valores), dispersion: dispersion(valores), consenso: hayConsenso(valores) }
    : null;

  return json({ fase: sala.faseActual, historia: { id: hid, ...historia }, votos, resumen });
});
