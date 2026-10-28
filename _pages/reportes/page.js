"use client";

import { useMemo } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import {
  GRUPOS_INVENTARIO,
  esMercancia,
  fechaLima,
  formatCantidad,
  formatFecha,
  formatNumero,
  formatSoles,
} from "@/lib/format";
import { ROTULO_DATOS_DEMO } from "@/lib/datos-demo";
import { IconoInventario } from "@/_pages/components/ui/iconos";

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
  const { celulares, movimientos, tiendas, productos } = useDatos();

  const mercancia = productos.filter((p) => esMercancia(p.grupo));
  const costoTotal = mercancia.reduce((s, p) => s + p.stock * (Number(p.costo) || 0), 0);
  const precioTotal = mercancia.reduce((s, p) => s + p.stock * (Number(p.precio) || 0), 0);
  const unidadesTotal = mercancia.reduce((s, p) => s + (Number(p.stock) || 0), 0);

  const porTienda = tiendas.map((tienda) => {
    const propios = productos.filter((p) => p.tiendaId === tienda.id);
    const propiosMercancia = propios.filter((p) => esMercancia(p.grupo));
    return {
      id: tienda.id,
      nombre: tienda.nombre,
      operador: tienda.operador,
      total: propios.length,
      celulares: propios.filter((p) => p.imei).length,
      unidades: propiosMercancia.reduce((s, p) => s + (Number(p.stock) || 0), 0),
      bajos: propios.filter((p) => p.stockMinimo > 0 && p.stock <= p.stockMinimo).length,
      costo: propiosMercancia.reduce((s, p) => s + p.stock * (Number(p.costo) || 0), 0),
      precio: propiosMercancia.reduce((s, p) => s + p.stock * (Number(p.precio) || 0), 0),
    };
  });

  const porOperador = ["Bitel", "Claro"].map((operador) => {
    const propios = productos.filter((p) => p.operador === operador);
    return {
      operador,
      cantidad: propios.length,
      unidades: propios.reduce((s, p) => s + (Number(p.stock) || 0), 0),
      costo: propios
        .filter((p) => esMercancia(p.grupo))
        .reduce((s, p) => s + p.stock * (Number(p.costo) || 0), 0),
    };
  });

  const porGrupo = GRUPOS_INVENTARIO.map((grupo) => ({
    grupo,
    cantidad: productos.filter((p) => p.grupo === grupo).length,
  })).filter((fila) => fila.cantidad > 0);

  const porCategoria = useMemo(() => {
    const mapa = new Map();
    for (const producto of productos) {
      mapa.set(producto.categoria, (mapa.get(producto.categoria) || 0) + 1);
    }
    return [...mapa.entries()]
      .map(([categoria, cantidad]) => ({ categoria, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);
  }, [productos]);

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
          <div className="stat-ico">
            <IconoInventario />
          </div>
          <div className="stat-valor">{formatNumero(productos.length)}</div>
          <div className="stat-etiqueta">Productos (SKU)</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-valor">{formatSoles(costoTotal)}</div>
          <div className="stat-etiqueta">Mercadería al costo</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-valor">{formatSoles(precioTotal)}</div>
          <div className="stat-etiqueta">Valor a precio de venta</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-valor">{formatCantidad(unidadesTotal)}</div>
          <div className="stat-etiqueta">Unidades en stock</div>
        </div>
      </div>

      <section className="tarjeta mb-2">
        <div className="tarjeta-cabeza">
          <h2 className="tarjeta-titulo">Stock por tienda</h2>
        </div>
        <div className="tabla-scroll">
          <table className="tabla tabla-ancho">
            <thead>
              <tr>
                <th>Tienda</th>
                <th className="num">Productos</th>
                <th className="num">Celulares</th>
                <th className="num">Unidades</th>
                <th className="num">Bajo mínimo</th>
                <th className="num">Costo</th>
                <th className="num">Precio venta</th>
              </tr>
            </thead>
            <tbody>
              {porTienda.map((fila) => (
                <tr key={fila.id}>
                  <td>
                    <span className="tienda-celda">
                      <span
                        className={`punto-operador ${
                          fila.operador === "Bitel"
                            ? "punto-bitel"
                            : fila.operador === "Claro"
                              ? "punto-claro"
                              : ""
                        }`}
                        title={fila.operador}
                      />
                      <strong>{fila.nombre}</strong>
                    </span>
                  </td>
                  <td className="num">{formatNumero(fila.total)}</td>
                  <td className="num">{formatNumero(fila.celulares)}</td>
                  <td className="num">{formatCantidad(fila.unidades)}</td>
                  <td className={`num${fila.bajos ? " stock-bajo" : ""}`}>
                    {formatNumero(fila.bajos)}
                  </td>
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
            <tfoot>
              <tr>
                <td>Total</td>
                <td className="num">{formatNumero(productos.length)}</td>
                <td className="num">{formatNumero(celulares.length)}</td>
                <td className="num">{formatCantidad(unidadesTotal)}</td>
                <td className="num">
                  {formatNumero(
                    productos.filter((p) => p.stockMinimo > 0 && p.stock <= p.stockMinimo).length
                  )}
                </td>
                <td className="num">{formatSoles(costoTotal)}</td>
                <td className="num">{formatSoles(precioTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="nota-ayuda">
          Costo y precio de venta corresponden a mercadería; no incluyen servicios (Anypay,
          Bypay, tasas, traslados ni devoluciones).
        </p>
      </section>

      <div className="rejilla rejilla-2 mb-2">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Por operador</h2>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="barras">
              {porOperador.map((fila) => (
                <Barra
                  key={fila.operador}
                  etiqueta={fila.operador}
                  valor={fila.cantidad}
                  total={productos.length}
                  sufijo="SKU"
                />
              ))}
            </div>
            <p className="nota-ayuda">
              {porOperador
                .map((f) => `${f.operador}: ${formatCantidad(f.unidades)} unidades`)
                .join(" · ")}
            </p>
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Por grupo</h2>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="barras">
              {porGrupo.map((fila) => (
                <Barra
                  key={fila.grupo}
                  etiqueta={fila.grupo}
                  valor={fila.cantidad}
                  total={productos.length}
                  sufijo="SKU"
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Categorías con más SKU</h2>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="barras">
              {porCategoria.map((fila) => (
                <Barra
                  key={fila.categoria}
                  etiqueta={fila.categoria}
                  valor={fila.cantidad}
                  total={productos.length}
                  sufijo="SKU"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Celulares por marca</h2>
            <span className="chip chip-brand">{formatNumero(celulares.length)} IMEI</span>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="barras">
              {porMarca.map((fila) => (
                <Barra
                  key={fila.marca}
                  etiqueta={fila.marca}
                  valor={fila.cantidad}
                  total={celulares.length}
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
