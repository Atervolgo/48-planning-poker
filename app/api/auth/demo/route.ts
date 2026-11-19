import { z } from "zod";
import { manejar } from "@/lib/http";
import { noEncontrado } from "@/lib/errores";
import { modoDemoActivo, nombreASlug } from "@/lib/demo";

export const runtime = "nodejs";
const schema = z.object({ nombre: z.string().trim().min(2).max(20) }).strict();

// POST /api/auth/demo { nombre } → solo existe en modo demo (404 en producción)
export const POST = manejar(async (req) => {
  if (!modoDemoActivo()) throw noEncontrado();
  const slug = nombreASlug(schema.parse(await req.json()).nombre);
  if (!slug) throw noEncontrado();
  const res = new Response(null, { status: 204 });
  res.headers.append("Set-Cookie", `sesion=demo.${slug}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`);
  return res;
});
