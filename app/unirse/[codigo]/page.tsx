import UnirseSala from "@/components/UnirseSala";

export default async function Unirse({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  return (
    <>
      <h1>Unirse a la sala {codigo}</h1>
      <UnirseSala codigo={codigo} />
    </>
  );
}
