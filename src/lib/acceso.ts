import { requerirUsuario } from "./auth";
import { noEncontrado, prohibido } from "./errores";
import { obtenerSala } from "@/repositories/salas.repo";

/**
 * Guardia común de las rutas /api/salas/:id/**
 * 1) ¿quién es? → 401   2) ¿pertenece a la sala? → 404 (no revelamos que existe)
 */
export async function requerirMiembro(req: Request, salaId: string) {
  const usuario = await requerirUsuario(req);
  const sala = await obtenerSala(salaId);
  if (!sala || !sala.miembros.includes(usuario.uid)) throw noEncontrado("Sala no encontrada");
  return { usuario, sala };
}

/** Además exige ser el facilitador → 403 (RF-05). */
export async function requerirFacilitador(req: Request, salaId: string) {
  const ctx = await requerirMiembro(req, salaId);
  if (ctx.sala.facilitadorUid !== ctx.usuario.uid) throw prohibido("Solo el facilitador puede hacer esto");
  return ctx;
}
