import { NextResponse, type NextRequest } from "next/server";

// En Next.js 16 proxy.ts reemplaza a middleware.ts.
// SOLO mejora la experiencia (redirige si falta la cookie).
// NO es seguridad: cada Route Handler vuelve a verificar la sesión.
export function proxy(req: NextRequest) {
  if (!req.cookies.has("sesion")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/salas/:path*"] };
