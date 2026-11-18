export default async function Unirse({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  // TODO Hito 3: POST /api/salas/unirse con el código
  return <h1>Unirse a la sala {codigo}</h1>;
}
