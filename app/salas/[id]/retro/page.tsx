import RetroBoard from "@/components/RetroBoard";

export default async function RetroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <h1>Retrospectiva</h1>
      <RetroBoard salaId={id} />
    </>
  );
}
