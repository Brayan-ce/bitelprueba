"use client";

import Link from "next/link";
import { IconoMasNuevo } from "@/_pages/components/ui/iconos";
import ListaMovimientos from "./components/lista";

export default function MovimientosPage() {
  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Libro de movimientos</h1>
          <p className="subtitulo">Registro por días de dónde entra y sale cada equipo</p>
        </div>
        <Link href="/movimientos/nuevo" className="btn">
          <IconoMasNuevo />
          Nuevo movimiento
        </Link>
      </div>

      <ListaMovimientos />
    </>
  );
}
