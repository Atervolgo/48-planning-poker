import { describe, it, expect, vi, beforeEach } from "vitest";

// Se simula la sesión y el repositorio: NO se toca Firebase
vi.mock("@/lib/auth", () => ({ requerirUsuario: vi.fn() }));
vi.mock("@/repositories/salas.repo", () => ({
  obtenerSala: vi.fn(), obtenerHistoria: vi.fn(), listarVotos: vi.fn(), marcarRevelada: vi.fn(),
}));

import { requerirUsuario } from "@/lib/auth";
import { noAutenticado } from "@/lib/errores";
import * as repo from "@/repositories/salas.repo";
import { POST } from "../../app/api/salas/[id]/historias/[hid]/revelar/route";

const sala = { id: "s1", facilitadorUid: "fac", miembros: ["fac", "ana"] };
const llamar = () => POST(new Request("http://x", { method: "POST" }), { params: Promise.resolve({ id: "s1", hid: "h1" }) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(repo.obtenerSala).mockResolvedValue(sala as never);
  vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "votando" });
  vi.mocked(repo.listarVotos).mockResolvedValue([{ uid: "fac", valor: 5 }, { uid: "ana", valor: 5 }]);
});

describe("POST revelar", () => {
  it("401 sin sesión", async () => {
    vi.mocked(requerirUsuario).mockRejectedValue(noAutenticado());
    expect((await llamar()).status).toBe(401);
  });
  it("403 si no es el facilitador (RF-05)", async () => {
    vi.mocked(requerirUsuario).mockResolvedValue({ uid: "ana", correo: null, rol: "usuario" });
    expect((await llamar()).status).toBe(403);
    expect(repo.marcarRevelada).not.toHaveBeenCalled();
  });
  it("404 si no pertenece a la sala", async () => {
    vi.mocked(requerirUsuario).mockResolvedValue({ uid: "intruso", correo: null, rol: "usuario" });
    expect((await llamar()).status).toBe(404);
  });
  it("200 si es el facilitador, y guarda el resultado", async () => {
    vi.mocked(requerirUsuario).mockResolvedValue({ uid: "fac", correo: null, rol: "usuario" });
    const res = await llamar();
    expect(res.status).toBe(200);
    expect(repo.marcarRevelada).toHaveBeenCalledWith("s1", "h1", 5);
  });
  it("409 si ya estaba revelada", async () => {
    vi.mocked(requerirUsuario).mockResolvedValue({ uid: "fac", correo: null, rol: "usuario" });
    vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "revelada" });
    expect((await llamar()).status).toBe(409);
  });
});
