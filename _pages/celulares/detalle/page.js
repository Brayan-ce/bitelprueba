"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDatos } from "@/_pages/components/datos/proveedor";
import {
  claseEstado,
  claseTipo,
  etiquetaTipo,
  formatFecha,
  formatFechaHoraMovimiento,
  formatSoles,
} from "@/lib/format";
import {
  IconoEditar,
  IconoMovimientos,
  IconoPapelera,
  IconoVolver,
} from "@/_pages/components/ui/iconos";
import FormularioCelular from "../components/formulario";

export default function DetalleCelularPage({ codigo }) {
  const { celulares, movimientos, eliminarCelular } = useDatos();
  const router = useRouter();
  const [editando, setEditando] = useState(false);

  const celular = celulares.find((c) => c.codigo === codigo);

  if (!celular) {
    return (
      <div className="tarjeta">
        <div className="vacio">
          No se encontró el celular <strong className="mono">{codigo}</strong>.
          <div className="mt-2">
            <Link href="/celulares" className="btn btn-chico">
              <IconoVolver />
              Volver al inventario
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const historial = movimientos
    .filter((m) => m.imei === celular.imei1 || (celular.imei2 && m.imei === celular.imei2))
    .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));

  function eliminar() {
    if (!window.confirm(`¿Eliminar ${celular.codigo} del inventario?`)) return;
    eliminarCelular(celular.codigo);
    router.push("/celulares");
  }

  if (editando) {
    return (
      <>
        <div className="encabezado-pagina">
          <div>
            <h1 className="titulo">Editar {celular.codigo}</h1>
            <p className="subtitulo">{celular.modelo}</p>
          </div>
        </div>
        <FormularioCelular
          inicial={celular}
          codigoActual={celular.codigo}
          onCancelar={() => setEditando(false)}
          onExito={(nuevoCodigo) => {
            setEditando(false);
            if (nuevoCodigo !== codigo) router.replace(`/celulares/${nuevoCodigo}`);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <Link href="/celulares" className="vinculo texto-chico">
            ← Volver al inventario
          </Link>
          <h1 className="titulo mt-1">{celular.modelo}</h1>
          <p className="subtitulo">
            {celular.marca} · <span className="mono">{celular.codigo}</span> ·{" "}
            <span className={claseEstado(celular.estado)}>{celular.estado}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/movimientos/nuevo" className="btn btn-secundario btn-chico">
            <IconoMovimientos />
            Movimiento
          </Link>
          <button type="button" className="btn btn-secundario btn-chico" onClick={() => setEditando(true)}>
            <IconoEditar />
            Editar
          </button>
          <button type="button" className="btn btn-peligro btn-chico" onClick={eliminar}>
            <IconoPapelera />
            Eliminar
          </button>
        </div>
      </div>

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Ficha del equipo</h2>
          </div>
          <div className="tarjeta-cuerpo">
            <dl className="ficha">
              <div className="ficha-item">
                <dt>Código</dt>
                <dd className="mono">{celular.codigo}</dd>
              </div>
              <div className="ficha-item">
                <dt>Tienda</dt>
                <dd>{celular.tienda || "Sin tienda"}</dd>
              </div>
              <div className="ficha-item">
                <dt>IMEI 1</dt>
                <dd className="mono">{celular.imei1}</dd>
              </div>
              <div className="ficha-item">
                <dt>IMEI 2</dt>
                <dd className="mono">{celular.imei2 || "—"}</dd>
              </div>
              <div className="ficha-item">
                <dt>Color</dt>
                <dd>{celular.color || "—"}</dd>
              </div>
              <div className="ficha-item">
                <dt>Memoria</dt>
                <dd>{celular.memoria || "—"}</dd>
              </div>
              <div className="ficha-item">
                <dt>Costo</dt>
                <dd>{formatSoles(celular.costo)}</dd>
              </div>
              <div className="ficha-item">
                <dt>Precio de venta</dt>
                <dd>{formatSoles(celular.precio_venta)}</dd>
              </div>
              <div className="ficha-item">
                <dt>Registrado</dt>
                <dd>{formatFecha(celular.creado_en)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Movimientos de este IMEI</h2>
            <span className="chip chip-brand">{historial.length}</span>
          </div>
          <div className="lista">
            {historial.map((movimiento) => (
              <div className="fila" key={movimiento.id}>
                <div className="fila-principal">
                  <span className="fila-titulo">
                    {movimiento.tienda_origen || "—"} → {movimiento.tienda_destino || "—"}
                  </span>
                  <span className={claseTipo(movimiento.tipo)}>
                    {etiquetaTipo(movimiento.tipo)}
                  </span>
                </div>
                <div className="fila-meta">
                  <span>{formatFechaHoraMovimiento(movimiento.fecha, movimiento.hora)}</span>
                  <span>{movimiento.usuario}</span>
                  {movimiento.detalle && <span>{movimiento.detalle}</span>}
                </div>
              </div>
            ))}
            {historial.length === 0 && (
              <div className="vacio">Este celular aún no tiene movimientos.</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
