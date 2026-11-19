import { manejar, json } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";
import { crearSalaSchema } from "@/schemas";
import { generarCodigo } from "@/services/codigo";
import { crearSala, listarSalasDeUsuario, obtenerSalaPorCodigo } from "@/repositories/salas.repo";

export const runtime = "nodejs";

// GET /api/salas → mis salas
export const GET = manejar(async (req) => {
  const usuario = await requerirUsuario(req);
  const salas = await listarSalasDeUsuario(usuario.uid);
  return json(
    salas.map((s) => ({
      id: s.id, nombre: s.nombre, codigo: s.codigo,
      esFacilitador: s.facilitadorUid === usuario.uid,
      miembros: s.miembros.length,
    })),
  );
});

// POST /api/salas → crear sala (RF-01). El facilitador es quien la crea.
export const POST = manejar(async (req) => {
  const usuario = await requerirUsuario(req);
  const { nombre } = crearSalaSchema.parse(await req.json());
  let codigo = generarCodigo();
  while (await obtenerSalaPorCodigo(codigo)) codigo = generarCodigo(); // código único
  const sala = await crearSala(nombre, codigo, usuario.uid);
  return json({ id: sala.id, nombre: sala.nombre, codigo: sala.codigo }, 201);
});
