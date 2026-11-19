// @vitest-environment node
import { describe, it, expect } from "vitest";
import * as repo from "@/repositories/salas.memoria";
import { prepararVotosParaCliente } from "@/services/votos";

describe("repositorio en memoria (modo demo)", () => {
  it("crea sala, une miembros sin duplicar y busca por código", async () => {
    const s = await repo.crearSala("Sala T", "ABC234", "demo:ana");
    await repo.agregarMiembro(s.id, "demo:luis");
    await repo.agregarMiembro(s.id, "demo:luis");
    expect((await repo.obtenerSala(s.id))!.miembros).toEqual(["demo:ana", "demo:luis"]);
    expect((await repo.obtenerSalaPorCodigo("ABC234"))!.id).toBe(s.id);
    expect(await repo.obtenerSalaPorCodigo("ZZZZZZ")).toBeNull();
  });

  it("los votos siguen ocultos hasta revelar y se guarda el resultado", async () => {
    const s = await repo.crearSala("Sala V", "VVV234", "demo:ana");
    const hid = await repo.crearHistoria(s.id, "Login");
    await repo.guardarVoto(s.id, hid, "demo:ana", 13);
    const antes = prepararVotosParaCliente(await repo.listarVotos(s.id, hid), s.miembros, false);
    expect(antes[0].valor).toBeUndefined();
    await repo.marcarRevelada(s.id, hid, 13);
    expect((await repo.obtenerHistoria(s.id, hid))!.estado).toBe("revelada");
    expect((await repo.listarHistorias(s.id))[0].resultado).toBe(13);
  });

  it("un voto por persona en cada tarjeta de retro", async () => {
    const s = await repo.crearSala("Sala R", "RRR234", "demo:ana");
    const tid = await repo.crearTarjeta(s.id, "bien", "Buen equipo", "demo:ana");
    expect(await repo.votarTarjeta(s.id, tid, "demo:luis")).toBe("ok");
    expect(await repo.votarTarjeta(s.id, tid, "demo:luis")).toBe("ya_voto");
    expect(await repo.votarTarjeta(s.id, "no-existe", "demo:luis")).toBe("no_existe");
    expect((await repo.listarTarjetas(s.id))[0].votos).toBe(1);
  });
});
