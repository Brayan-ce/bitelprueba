"use client";

import Link from "next/link";
import { IconoMasNuevo } from "@/_pages/components/ui/iconos";
import ListaCelulares from "./components/lista";

export default function CelularesPage() {
  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Celulares</h1>
          <p className="subtitulo">Inventario completo por tienda, estado e IMEI</p>
        </div>
        <Link href="/celulares/nuevo" className="btn">
          <IconoMasNuevo />
          Nuevo celular
        </Link>
      </div>

      <ListaCelulares />
    </>
  );
}
