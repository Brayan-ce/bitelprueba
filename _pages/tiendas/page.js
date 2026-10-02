"use client";

import GestionTiendas from "./components/gestion";

export default function TiendasPage() {
  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Tiendas</h1>
          <p className="subtitulo">Puntos de venta y su stock asignado</p>
        </div>
      </div>

      <GestionTiendas />
    </>
  );
}
