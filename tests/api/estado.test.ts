import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requerirUsuario: vi.fn() }));
vi.mock("@/repositories/salas.repo", () => ({
  obtenerSala: vi.fn(), obtenerHistoria: vi.fn(), listarVotos: vi.fn(), listarHistorias: vi.fn(),
}));

import { requerirUsuario } from "@/lib/auth";
import * as repo from "@/repositories/salas.repo";
import { GET } from "../../app/api/salas/[id]/estado/route";

const llamar = () => GET(new Request("http://x"), { params: Promise.resolve({ id: "s1" }) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requerirUsuario).mockResolvedValue({ uid: "ana", correo: null, rol: "usuario" });
  vi.mocked(repo.obtenerSala).mockResolvedValue({
    id: "s1", facilitadorUid: "fac", miembros: ["fac", "ana"], faseActual: "votando", historiaActualId: "h1",
  } as never);
  vi.mocked(repo.listarVotos).mockResolvedValue([{ uid: "fac", valor: 13 }, { uid: "ana", valor: 3 }]);
  vi.mocked(repo.listarHistorias).mockResolvedValue([{ titulo: "Anterior", resultado: 8 }, { titulo: "Sin cerrar", resultado: null }]);
});

describe("GET estado · votos ocultos (RF-03)", () => {
  it("antes de revelar NO devuelve ningún valor de voto", async () => {
    vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "votando" });
    const res = await llamar();
    const texto = await res.text();
    const body = JSON.parse(texto);
    expect(body.votos.every((v: { valor?: unknown }) => v.valor === undefined)).toBe(true);
    expect(body.resumen).toBeNull();
    expect(texto).not.toContain("13"); // el voto del facilitador no viaja
  });
  it("después de revelar sí devuelve valores y resumen", async () => {
    vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "revelada" });
    const body = await (await llamar()).json();
    expect(body.votos.find((v: { uid: string }) => v.uid === "fac").valor).toBe(13);
    expect(body.resumen.mediana).toBe(8);
  });
  it("devuelve mi propio voto y el historial de historias cerradas", async () => {
    vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "votando" });
    const body = await (await llamar()).json();
    expect(body.miVoto).toBe(3); // el voto de Ana es suyo y puede verlo
    expect(body.historial).toEqual([{ titulo: "Anterior", resultado: 8 }]);
  });
  it("indica si quien consulta es el facilitador", async () => {
    vi.mocked(repo.obtenerHistoria).mockResolvedValue({ titulo: "H", estado: "votando" });
    expect((await (await llamar()).json()).esFacilitador).toBe(false);
  });
});
