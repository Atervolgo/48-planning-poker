import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requerirUsuario: vi.fn() }));
vi.mock("@/repositories/salas.repo", () => ({ obtenerSalaPorCodigo: vi.fn(), agregarMiembro: vi.fn() }));

import { requerirUsuario } from "@/lib/auth";
import { noAutenticado } from "@/lib/errores";
import * as repo from "@/repositories/salas.repo";
import { POST } from "../../app/api/salas/unirse/route";

const llamar = (body: unknown) => POST(new Request("http://x/api/salas/unirse", { method: "POST", body: JSON.stringify(body) }), {});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requerirUsuario).mockResolvedValue({ uid: "luis", correo: null, rol: "usuario" });
});

describe("POST unirse", () => {
  it("401 sin sesión", async () => {
    vi.mocked(requerirUsuario).mockRejectedValue(noAutenticado());
    expect((await llamar({ codigo: "ABC234" })).status).toBe(401);
  });
  it("400 si el código no tiene 6 caracteres", async () => {
    expect((await llamar({ codigo: "AB" })).status).toBe(400);
  });
  it("404 si el código no existe", async () => {
    vi.mocked(repo.obtenerSalaPorCodigo).mockResolvedValue(null);
    expect((await llamar({ codigo: "ABC234" })).status).toBe(404);
  });
  it("409 si la sala está llena (15 personas)", async () => {
    const miembros = Array.from({ length: 15 }, (_, i) => `u${i}`);
    vi.mocked(repo.obtenerSalaPorCodigo).mockResolvedValue({ id: "s1", miembros } as never);
    expect((await llamar({ codigo: "ABC234" })).status).toBe(409);
    expect(repo.agregarMiembro).not.toHaveBeenCalled();
  });
  it("200 y agrega a la persona; acepta minúsculas", async () => {
    vi.mocked(repo.obtenerSalaPorCodigo).mockResolvedValue({ id: "s1", miembros: ["ana"] } as never);
    expect((await llamar({ codigo: "abc234" })).status).toBe(200);
    expect(repo.obtenerSalaPorCodigo).toHaveBeenCalledWith("ABC234");
    expect(repo.agregarMiembro).toHaveBeenCalledWith("s1", "luis");
  });
});
