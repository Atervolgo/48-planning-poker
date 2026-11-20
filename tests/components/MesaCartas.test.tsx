import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MesaCartas from "@/components/MesaCartas";

const respuesta = (data: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => data });
afterEach(() => vi.unstubAllGlobals());

describe("MesaCartas", () => {
  it("muestra 'cargando' y luego la mesa", async () => {
    vi.stubGlobal("fetch", respuesta({ historia: "Login", votos: [3, 5] }));
    render(<MesaCartas />);
    expect(screen.getByRole("status")).toHaveTextContent(/cargando/i);
    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("marca la carta elegida con aria-pressed", async () => {
    vi.stubGlobal("fetch", respuesta({ historia: "Login", votos: [3, 5] }));
    render(<MesaCartas />);
    const carta = await screen.findByRole("button", { name: "8" });
    await userEvent.click(carta);
    expect(carta).toHaveAttribute("aria-pressed", "true");
  });

  it("al revelar anuncia el resultado y bloquea las cartas", async () => {
    vi.stubGlobal("fetch", respuesta({ historia: "Login", votos: [3, 5] }));
    render(<MesaCartas />);
    await userEvent.click(await screen.findByRole("button", { name: /revelar/i }));
    expect(screen.getByText(/Fase: revelada/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8" })).toBeDisabled();
  });

  it("recorre las tres fases: votando → revelada → consenso", async () => {
    vi.stubGlobal("fetch", respuesta({ historia: "Login", votos: [3, 5] }));
    render(<MesaCartas />);
    await userEvent.click(await screen.findByRole("button", { name: /revelar/i }));
    await userEvent.click(screen.getByRole("button", { name: /fijar consenso/i }));
    expect(screen.getByText(/Fase: consenso/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /fijar consenso/i })).not.toBeInTheDocument();
  });

  it("muestra error con botón para reintentar", async () => {
    vi.stubGlobal("fetch", respuesta({}, false));
    render(<MesaCartas />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/no se pudo/i);
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("muestra estado vacío si no hay votos", async () => {
    vi.stubGlobal("fetch", respuesta({ historia: "Login", votos: [] }));
    render(<MesaCartas />);
    expect(await screen.findByText(/nadie ha votado/i)).toBeInTheDocument();
  });
});
