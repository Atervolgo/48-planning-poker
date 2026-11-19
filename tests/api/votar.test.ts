import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requerirUsuario: vi.fn() }));
vi.mock("@/repositories/salas.repo", () => ({
  obtenerSala: vi.fn(), obtenerHistoria: vi.fn(), guardarVoto: vi.fn(),
}));

import { requerirUsuario } from "@/lib/auth";
import * as repo from "@/repositories/salas.repo";
import { PUT } from "../../app/api/salas/[id]/historias/[hid]/votar/route";

const llamar = (body: unknown) =>
  PUT(new Request("http://x", { method: "PUT", body: JSON.stringify(body) }), { params: Promise.resolve({ id: "s1", hid: "h1" }) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requerirUsuario).mockResolvedValue({ uid: "ana", correo: null, rol: "usuario" });
  vi.mocked(repo.obtenerSala).mockResolvedValue({ id: "s1", facilitadorUid: "fac", miembros: ["fac", "ana"] } as never);
  vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "votando" });
});

describe("PUT votar", () => {
  it("200 y guarda con el uid de la SESIÓN", async () => {
    expect((await llamar({ valor: 5 })).status).toBe(200);
    expect(repo.guardarVoto).toHaveBeenCalledWith("s1", "h1", "ana", 5);
  });
  it("400 si el valor es inválido", async () => {
    const res = await llamar({ valor: 999 });
    expect(res.status).toBe(400);
    expect((await res.json()).detalles).toBeDefined();
  });
  it("400 si trae campos extra (mass assignment)", async () => {
    expect((await llamar({ valor: 5, uid: "fac" })).status).toBe(400);
  });
  it("409 si la historia ya fue revelada (criterio 3)", async () => {
    vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "revelada" });
    expect((await llamar({ valor: 5 })).status).toBe(409);
    expect(repo.guardarVoto).not.toHaveBeenCalled();
  });
});
