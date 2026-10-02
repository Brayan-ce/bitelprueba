"use client";

import { useMemo } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import {
  ESTADOS,
  claseEstado,
  fechaLima,
  formatFecha,
  formatNumero,
  formatSoles,
} from "@/lib/format";
import { ROTULO_DATOS_DEMO } from "@/lib/datos-demo";

function Barra({ etiqueta, valor, total, sufijo }) {
  const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="barra-fila">
      <div className="barra-etiqueta">
        <span>{etiqueta}</span>
        <span>
          {formatNumero(valor)} {sufijo || ""} · {porcentaje}%
        </span>
      </div>
      <div className="barra-rail">
        <div className="barra-lleno" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

export default function ReportesPage() {
  const { celulares, movimientos, tiendas } = useDatos();

  const total = celulares.length;
  const costoTotal = celulares.reduce((s, c) => s + (Number(c.costo) || 0), 0);
  const precioTotal = celulares.reduce((s, c) => s + (Number(c.precio_venta) || 0), 0);

  const porEstado = ESTADOS.map((estado) => ({
    estado,
    cantidad: celulares.filter((c) => c.estado === estado).length,
  }));

  const porMarca = useMemo(() => {
    const mapa = new Map();
    for (const celular of celulares) {
      mapa.set(celular.marca, (mapa.get(celular.marca) || 0) + 1);
    }
    return [...mapa.entries()]
      .map(([marca, cantidad]) => ({ marca, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);
  }, [celulares]);

  const ultimos14 = useMemo(() => {
    const hoy = fechaLima();
    const dias = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dias.push(`${yyyy}-${mm}-${dd}`);
    }
    const conteo = new Map();
    for (const dia of dias) conteo.set(dia, { fecha: dia, entradas: 0, salidas: 0 });
    for (const movimiento of movimientos) {
      const registro = conteo.get(movimiento.fecha);
      if (!registro) continue;
      if (movimiento.tipo === "entrada") registro.entradas += 1;
      if (movimiento.tipo === "salida") registro.salidas += 1;
    }
    const conMovimientos = [...conteo.values()].reduce(
      (suma, d) => suma + d.entradas + d.salidas,
      0
    );
    return { dias: [...conteo.values()], conMovimientos, hoy };
  }, [movimientos]);

  const porTienda = tiendas.map((tienda) => {
    const propios = celulares.filter((c) => c.tienda === tienda.nombre);
    return {
      id: tienda.id,
      nombre: tienda.nombre,
      total: propios.length,
      disponibles: propios.filter((c) => c.estado === "Disponible").length,
      vendidos: propios.filter((c) => c.estado === "Vendido").length,
      reparacion: propios.filter((c) => c.estado === "En reparación").length,
      costo: propios.reduce((s, c) => s + (Number(c.costo) || 0), 0),
      precio: propios.reduce((s, c) => s + (Number(c.precio_venta) || 0), 0),
    };
  });

  const maxMovimiento = Math.max(
    1,
    ...ultimos14.dias.map((d) => Math.max(d.entradas, d.salidas))
  );

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Reportes</h1>
          <p className="subtitulo">Resumen del inventario y de la actividad</p>
        </div>
        <span className="chip chip-brand">{ROTULO_DATOS_DEMO}</span>
      </div>

      <div className="rejilla rejilla-stats mb-2">
        <div className="tarjeta stat">
          <div className="stat-valor">{formatSoles(costoTotal)}</div>
          <div className="stat-etiqueta">Inversión en inventario (costo)</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-valor">{formatSoles(precioTotal)}</div>
          <div className="stat-etiqueta">Valor a precio de venta</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-valor">{formatSoles(precioTotal - costoTotal)}</div>
          <div className="stat-etiqueta">Margen potencial</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-valor">{formatNumero(ultimos14.conMovimientos)}</div>
          <div className="stat-etiqueta">Movimientos (14 días)</div>
        </div>
      </div>

      <section className="tarjeta mb-2">
        <div className="tarjeta-cabeza">
          <h2 className="tarjeta-titulo">Stock por tienda</h2>
        </div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Tienda</th>
                <th className="num">Total</th>
                <th className="num">Disp.</th>
                <th className="num">Vend.</th>
                <th className="num">Reparación</th>
                <th className="num">Costo</th>
                <th className="num">Precio venta</th>
              </tr>
            </thead>
            <tbody>
              {porTienda.map((fila) => (
                <tr key={fila.id}>
                  <td>
                    <strong>{fila.nombre}</strong>
                  </td>
                  <td className="num">{formatNumero(fila.total)}</td>
                  <td className="num">{formatNumero(fila.disponibles)}</td>
                  <td className="num">{formatNumero(fila.vendidos)}</td>
                  <td className="num">{formatNumero(fila.reparacion)}</td>
                  <td className="num">{formatSoles(fila.costo)}</td>
                  <td className="num">{formatSoles(fila.precio)}</td>
                </tr>
              ))}
              {porTienda.length === 0 && (
                <tr>
                  <td colSpan={7} className="vacio">
                    Sin tiendas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Por estado</h2>
            <span className="chip chip-brand">{formatNumero(total)} en total</span>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="barras">
              {porEstado.map((fila) => (
                <div key={fila.estado}>
                  <div className="barra-fila">
                    <div className="barra-etiqueta">
                      <span className={claseEstado(fila.estado)}>{fila.estado}</span>
                      <span>
                        {formatNumero(fila.cantidad)} ·{" "}
                        {total > 0 ? Math.round((fila.cantidad / total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="barra-rail">
                      <div
                        className="barra-lleno"
                        style={{
                          width: `${total > 0 ? (fila.cantidad / total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Por marca</h2>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="barras">
              {porMarca.map((fila) => (
                <Barra
                  key={fila.marca}
                  etiqueta={fila.marca}
                  valor={fila.cantidad}
                  total={total}
                  sufijo="und."
                />
              ))}
              {porMarca.length === 0 && (
                <div className="vacio">Sin celulares registrados.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="tarjeta mt-2">
        <div className="tarjeta-cabeza">
          <h2 className="tarjeta-titulo">Movimientos de los últimos 14 días</h2>
          <span className="chip chip-info">Hoy: {formatFecha(ultimos14.hoy)}</span>
        </div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th className="num">Entradas</th>
                <th className="num">Salidas</th>
                <th style={{ width: "45%" }}>Actividad</th>
              </tr>
            </thead>
            <tbody>
              {ultimos14.dias.map((dia) => (
                <tr key={dia.fecha}>
                  <td>{formatFecha(dia.fecha)}</td>
                  <td className="num">{dia.entradas}</td>
                  <td className="num">{dia.salidas}</td>
                  <td>
                    <div className="barra-rail">
                      <div
                        className="barra-lleno"
                        style={{
                          width: `${((dia.entradas + dia.salidas) / maxMovimiento) * 100}%`,
                          background:
                            dia.salidas > dia.entradas
                              ? "var(--danger)"
                              : "linear-gradient(90deg, var(--brand), var(--accent))",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
