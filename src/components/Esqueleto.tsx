// Estado de carga (sección 4): bloques grises + texto para lectores de pantalla.
export default function Esqueleto({ etiqueta = "Cargando…", filas = 3 }: { etiqueta?: string; filas?: number }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{etiqueta}</span>
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="esqueleto" aria-hidden="true" />
      ))}
    </div>
  );
}
