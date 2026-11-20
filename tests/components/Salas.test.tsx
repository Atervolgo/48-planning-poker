import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Salas from "@/components/Salas";

const respuesta = (data: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => data });
afterEach(() => vi.unstubAllGlobals());

describe("Salas", () => {
  it("muestra el estado vacío cuando no hay salas", async () => {
    vi.stubGlobal("fetch", respuesta([]));
    render(<Salas />);
    expect(await screen.findByText(/aún no tienes salas/i)).toBeInTheDocument();
  });

  it("lista las salas con enlaces a poker y retro", async () => {
    vi.stubGlobal("fetch", respuesta([{ id: "s1", nombre: "Sprint 12", codigo: "ABC234", esFacilitador: true, miembros: 3 }]));
    render(<Salas />);
    expect(await screen.findByText("Sprint 12")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Poker" })).toHaveAttribute("href", "/salas/s1/poker");
    expect(screen.getByRole("link", { name: "Retro" })).toHaveAttribute("href", "/salas/s1/retro");
  });

  it("valida el nombre con el mismo esquema Zod antes de enviar", async () => {
    const fetchMock = respuesta([]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Salas />);
    await screen.findByText(/aún no tienes salas/i);
    await userEvent.type(screen.getByLabelText(/nombre de la nueva sala/i), "a");
    await userEvent.click(screen.getByRole("button", { name: /crear sala/i }));
    expect(screen.getByText(/entre 3 y 60 caracteres/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1); // solo el GET inicial: no se envió el POST
  });

  it("muestra error con botón para reintentar si falla la carga", async () => {
    vi.stubGlobal("fetch", respuesta({ error: "x" }, false));
    render(<Salas />);
    expect(await screen.findByText(/no se pudieron cargar/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });
});
