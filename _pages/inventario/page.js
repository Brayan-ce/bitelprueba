"use client";

import { useDatos } from "@/_pages/components/datos/proveedor";
import { ROTULO_DATOS_DEMO } from "@/lib/datos-demo";
import { formatNumero } from "@/lib/format";
import ListaInventario from "./components/lista";

export default function InventarioPage() {
  const { productos, tiendas } = useDatos();

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Inventario</h1>
          <p className="subtitulo">
            {formatNumero(productos.length)} productos en {tiendas.length} tiendas · celulares,
            accesorios, chips y servicios
          </p>
        </div>
        <span className="chip chip-muted">{ROTULO_DATOS_DEMO}</span>
      </div>

      <ListaInventario />
    </>
  );
}
