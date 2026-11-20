import { describe, it, expect, beforeEach } from "vitest";
import { manejar, json } from "@/lib/http";
import { limitar, _reiniciarLimites } from "@/lib/limite";

const handler = manejar(async () => json({ ok: true }));
const post = (url: string, headers: Record<string, string> = {}) => handler(new Request(url, { method: "POST", headers }), {});

beforeEach(() => _reiniciarLimites());

describe("Origin (anti-CSRF)", () => {
  it("403 si el Origin es de otro sitio", async () => {
    const res = await post("http://localhost:3000/api/salas", { origin: "https://sitio-malo.com", host: "localhost:3000" });
    expect(res.status).toBe(403);
  });
  it("200 si el Origin es el mismo sitio", async () => {
    const res = await post("http://localhost:3000/api/salas", { origin: "http://localhost:3000", host: "localhost:3000" });
    expect(res.status).toBe(200);
  });
  it("200 sin Origin (Bruno / curl)", async () => {
    expect((await post("http://localhost:3000/api/salas")).status).toBe(200);
  });
  it("las lecturas (GET) no se comprueban", async () => {
    const res = await handler(new Request("http://localhost:3000/api/salas", { headers: { origin: "https://otro.com" } }), {});
    expect(res.status).toBe(200);
  });
});

describe("límite de frecuencia (429)", () => {
  it("limitar() bloquea al superar el máximo y se recupera pasada la ventana", () => {
    expect(limitar("k", 2, 1000, 0)).toBe(true);
    expect(limitar("k", 2, 1000, 10)).toBe(true);
    expect(limitar("k", 2, 1000, 20)).toBe(false);
    expect(limitar("k", 2, 1000, 1500)).toBe(true);
  });
  it("las rutas /api/auth permiten 10 por minuto y la 11 recibe 429 con Retry-After", async () => {
    for (let i = 0; i < 10; i++) expect((await post("http://localhost:3000/api/auth/sesion")).status).toBe(200);
    const res = await post("http://localhost:3000/api/auth/sesion");
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});
