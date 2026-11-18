import { z } from "zod";
import { adminAuth } from "@/lib/firebase-admin";
import { manejar } from "@/lib/http";
import { ErrorHttp } from "@/lib/errores";

export const runtime = "nodejs";
const CINCO_DIAS_MS = 5 * 24 * 60 * 60 * 1000;
const bodySchema = z.object({ idToken: z.string().min(10) }).strict();

// POST /api/auth/sesion → cambia el idToken de Firebase por una cookie HttpOnly
export const POST = manejar(async (req) => {
  const { idToken } = bodySchema.parse(await req.json());
  let cookie: string;
  try {
    cookie = await adminAuth.createSessionCookie(idToken, { expiresIn: CINCO_DIAS_MS });
  } catch {
    throw new ErrorHttp(401, "Token inválido");
  }
  const res = new Response(null, { status: 204 });
  res.headers.append(
    "Set-Cookie",
    `sesion=${cookie}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${CINCO_DIAS_MS / 1000}`,
  );
  return res;
});

// DELETE /api/auth/sesion → cierra sesión
export const DELETE = manejar(async () => {
  const res = new Response(null, { status: 204 });
  res.headers.append("Set-Cookie", "sesion=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  return res;
});
