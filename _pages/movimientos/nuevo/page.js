"use client";

import { useRouter } from "next/navigation";
import FormularioMovimiento from "../components/formulario";

export default function NuevoMovimientoPage() {
  const router = useRouter();

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Nuevo movimiento</h1>
          <p className="subtitulo">Entrada, salida o traslado entre tiendas</p>
        </div>
      </div>

      <FormularioMovimiento onCancelar={() => router.push("/movimientos")} />
    </>
  );
}
