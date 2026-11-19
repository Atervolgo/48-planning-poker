import PokerSala from "@/components/PokerSala";

export default async function PokerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <h1>Estimación con cartas</h1>
      <PokerSala salaId={id} />
    </>
  );
}
