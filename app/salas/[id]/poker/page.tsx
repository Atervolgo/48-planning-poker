import MesaCartas from "@/components/MesaCartas";

// Componente de servidor (por defecto). Solo MesaCartas es "use client".
export default function PokerPage() {
  return (
    <>
      <h1>Estimación con cartas</h1>
      <MesaCartas />
    </>
  );
}
