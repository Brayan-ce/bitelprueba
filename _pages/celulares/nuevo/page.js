"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import FormularioCelular from "../components/formulario";

export default function NuevoCelularPage() {
  const router = useRouter();

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Nuevo celular</h1>
          <p className="subtitulo">Registra el equipo con sus dos IMEI y su tienda</p>
        </div>
        <Link href="/celulares" className="btn btn-secundario">
          Volver
        </Link>
      </div>

      <FormularioCelular onCancelar={() => router.push("/celulares")} />
    </>
  );
}
