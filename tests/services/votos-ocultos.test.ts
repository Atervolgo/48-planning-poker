import { describe, it, expect } from "vitest";
import { prepararVotosParaCliente } from "@/services/votos";

const votos = [{ uid: "a", valor: 5 }, { uid: "b", valor: 8 }];
const miembros = ["a", "b", "c"];

describe("RF-03 · votos ocultos", () => {
  it("antes de revelar NO incluye valores", () => {
    const r = prepararVotosParaCliente(votos, miembros, false);
    expect(r.every((v) => v.valor === undefined)).toBe(true);
    expect(r.map((v) => v.voto)).toEqual([true, true, false]);
  });
  it("después de revelar incluye valores", () => {
    const r = prepararVotosParaCliente(votos, miembros, true);
    expect(r[0].valor).toBe(5);
  });
});
