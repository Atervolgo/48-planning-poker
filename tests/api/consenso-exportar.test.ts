import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requerirUsuario: vi.fn() }));
vi.mock("@/repositories/salas.repo", () => ({
  obtenerSala: vi.fn(), obtenerHistoria: vi.fn(), fijarConsenso: vi.fn(), listarHistorias: vi.fn(), listarTarjetas: vi.fn(),
}));

import { requerirUsuario } from "@/lib/auth";
import * as repo from "@/repositories/salas.repo";
import { POST as CONSENSO } from "../../app/api/salas/[id]/historias/[hid]/consenso/route";
import { GET as EXPORTAR } from "../../app/api/salas/[id]/exportar/route";

const ctx = { params: Promise.resolve({ id: "s1", hid: "h1" }) };
const consenso = (body: unknown) => CONSENSO(new Request("http://x", { method: "POST", body: JSON.stringify(body) }), ctx);
const como = (uid: string) => vi.mocked(requerirUsuario).mockResolvedValue({ uid, correo: null, rol: "usuario" });

beforeEach(() => {
  vi.resetAllMocks();
  como("fac");
  vi.mocked(repo.obtenerSala).mockResolvedValue({ id: "s1", nombre: "Sprint 12", facilitadorUid: "fac", miembros: ["fac", "ana"] } as never);
  vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "revelada" });
});

describe("POST consenso (solo facilitador)", () => {
  it("403 si no es el facilitador", async () => {
    como("ana");
    expect((await consenso({ resultado: 5 })).status).toBe(403);
    expect(repo.fijarConsenso).not.toHaveBeenCalled();
  });
  it("400 si el valor no es una carta válida", async () => {
    expect((await consenso({ resultado: 999 })).status).toBe(400);
  });
  it("409 si todavía no se reveló", async () => {
    vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "votando" });
    expect((await consenso({ resultado: 5 })).status).toBe(409);
  });
  it("200 y guarda el valor acordado", async () => {
    expect((await consenso({ resultado: 8 })).status).toBe(200);
    expect(repo.fijarConsenso).toHaveBeenCalledWith("s1", "h1", 8);
  });
});

describe("GET exportar", () => {
  it("devuelve un .md con las estimaciones y las acciones", async () => {
    vi.mocked(repo.listarHistorias).mockResolvedValue([{ titulo: "Login", resultado: 5 }]);
    vi.mocked(repo.listarTarjetas).mockResolvedValue([{ id: "1", columna: "acciones", texto: "Escribir pruebas", autorUid: "u", votos: 2 }]);
    const res = await EXPORTAR(new Request("http://x"), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/markdown");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    const md = await res.text();
    expect(md).toContain("- Login: **5**");
    expect(md).toContain("Escribir pruebas");
  });
  it("404 si no pertenece a la sala", async () => {
    como("intruso");
    expect((await EXPORTAR(new Request("http://x"), ctx)).status).toBe(404);
  });
});
