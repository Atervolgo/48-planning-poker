import { describe, it, expect } from "vitest";
import { promedio, mediana, dispersion, hayConsenso } from "@/services/estadisticas";

describe("estadísticas del poker", () => {
  it("promedio ignora '?' y '☕'", () => expect(promedio([3, 5, "?", "☕"])).toBe(4));
  it("mediana con cantidad impar", () => expect(mediana([8, 1, 3])).toBe(3));
  it("mediana con cantidad par", () => expect(mediana([1, 3, 5, 8])).toBe(4));
  it("dispersión es 0 si todos votan igual", () => expect(dispersion([5, 5, 5])).toBe(0));
  it("consenso cuando todos coinciden", () => expect(hayConsenso([5, 5, 5])).toBe(true));
  it("sin consenso si hay diferencias", () => expect(hayConsenso([3, 5])).toBe(false));
  it("sin votos numéricos devuelve null", () => expect(promedio(["?"])).toBeNull());
});
