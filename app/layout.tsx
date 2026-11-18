import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planning Poker y Retrospectivas",
  description: "Estima historias y haz retrospectivas con tu equipo, sin costo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <header>
          <nav aria-label="Principal">
            <a href="/salas">Mis salas</a>
          </nav>
        </header>
        <main id="contenido">{children}</main>
        <footer>Proyecto 48 · Planning Poker y Retrospectivas</footer>
      </body>
    </html>
  );
}
