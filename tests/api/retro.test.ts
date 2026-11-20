import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requerirUsuario: vi.fn() }));
vi.mock("@/repositories/salas.repo", () => ({
  obtenerSala: vi.fn(), listarTarjetas: vi.fn(), crearTarjeta: vi.fn(), votarTarjeta: vi.fn(),
}));

import { requerirUsuario } from "@/lib/auth";
import * as repo from "@/repositories/salas.repo";
import { GET, POST } from "../../app/api/salas/[id]/retro/route";
import { POST as VOTAR } from "../../app/api/salas/[id]/retro/[tid]/votar/route";

const ctx = { params: Promise.resolve({ id: "s1", tid: "t1" }) };
const post = (body: unknown) => POST(new Request("http://x/api/salas/s1/retro", { method: "POST", body: JSON.stringify(body) }), ctx);

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requerirUsuario).mockResolvedValue({ uid: "ana", correo: null, rol: "usuario" });
  vi.mocked(repo.obtenerSala).mockResolvedValue({ id: "s1", facilitadorUid: "fac", miembros: ["fac", "ana"] } as never);
});

describe("retrospectiva", () => {
  it("GET agrupa por columna y ordena por votos", async () => {
    vi.mocked(repo.listarTarjetas).mockResolvedValue([
      { id: "1", columna: "bien", texto: "a", autorUid: "x", votos: 1 },
      { id: "2", columna: "bien", texto: "b", autorUid: "x", votos: 4 },
    ]);
    const body = await (await GET(new Request("http://x"), ctx)).json();
    expect(body.bien.map((t: { id: string }) => t.id)).toEqual(["2", "1"]);
    expect(body.acciones).toEqual([]);
  });
  it("POST 400 si la columna no existe", async () => {
    expect((await post({ columna: "otra", texto: "hola" })).status).toBe(400);
  });
  it("POST 400 si el texto está vacío", async () => {
    expect((await post({ columna: "bien", texto: "   " })).status).toBe(400);
  });
  it("POST 201 y el autor sale de la sesión, no del cuerpo", async () => {
    vi.mocked(repo.crearTarjeta).mockResolvedValue("t9");
    expect((await post({ columna: "mejorar", texto: "Más pruebas" })).status).toBe(201);
    expect(repo.crearTarjeta).toHaveBeenCalledWith("s1", "mejorar", "Más pruebas", "ana");
  });
  it("POST 404 si no pertenece a la sala", async () => {
    vi.mocked(requerirUsuario).mockResolvedValue({ uid: "intruso", correo: null, rol: "usuario" });
    expect((await post({ columna: "bien", texto: "hola" })).status).toBe(404);
  });
  it("votar: 200, 409 si ya votó y 404 si la tarjeta no existe", async () => {
    const votar = () => VOTAR(new Request("http://x", { method: "POST" }), ctx);
    vi.mocked(repo.votarTarjeta).mockResolvedValueOnce("ok");
    expect((await votar()).status).toBe(200);
    vi.mocked(repo.votarTarjeta).mockResolvedValueOnce("ya_voto");
    expect((await votar()).status).toBe(409);
    vi.mocked(repo.votarTarjeta).mockResolvedValueOnce("no_existe");
    expect((await votar()).status).toBe(404);
  });
});
