import { manejar, json } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";
import { conflicto, noEncontrado } from "@/lib/errores";
import { unirseSchema, MAX_PERSONAS_POR_SALA } from "@/schemas";
import { obtenerSalaPorCodigo, agregarMiembro } from "@/repositories/salas.repo";

export const runtime = "nodejs";

// POST /api/salas/unirse  { codigo }
export const POST = manejar(async (req) => {
  const usuario = await requerirUsuario(req);
  const { codigo } = unirseSchema.parse(await req.json());
  const sala = await obtenerSalaPorCodigo(codigo);
  if (!sala) throw noEncontrado("Código inválido");
  if (!sala.miembros.includes(usuario.uid)) {
    if (sala.miembros.length >= MAX_PERSONAS_POR_SALA) throw conflicto("La sala está llena");
    await agregarMiembro(sala.id, usuario.uid);
  }
  return json({ id: sala.id });
});
