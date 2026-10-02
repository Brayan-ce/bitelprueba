import DetalleCelular from "@/_pages/celulares/detalle/page";

export default async function Page({ params }) {
  const { codigo } = await params;
  return <DetalleCelular codigo={codigo} />;
}
