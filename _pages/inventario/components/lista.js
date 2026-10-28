"use client";

import { useMemo, useState } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import {
  GRUPOS_INVENTARIO,
  claseGrupo,
  esMercancia,
  formatCantidad,
  formatNumero,
  formatSoles,
} from "@/lib/format";
import { descargarCSV } from "@/lib/excel";

const TAMANOS = [25, 50, 100];

const CLASE_OPERADOR = { Bitel: "punto-bitel", Claro: "punto-claro" };

function nombreCorto(tienda) {
  return String(tienda || "").replace(/^(Bitel|Claro)\s+/, "");
}

export default function ListaInventario() {
  const { productos, tiendas } = useDatos();
  const [busqueda, setBusqueda] = useState("");
  const [operador, setOperador] = useState("");
  const [tienda, setTienda] = useState("");
  const [grupo, setGrupo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [bajoMinimo, setBajoMinimo] = useState(false);
  const [tamano, setTamano] = useState(50);
  const [pagina, setPagina] = useState(1);

  const categorias = useMemo(() => {
    const lista = new Set(
      productos.filter((p) => !grupo || p.grupo === grupo).map((p) => p.categoria)
    );
    return [...lista].sort((a, b) => a.localeCompare(b, "es"));
  }, [productos, grupo]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (operador && p.operador !== operador) return false;
      if (tienda && p.tienda !== tienda) return false;
      if (grupo && p.grupo !== grupo) return false;
      if (categoria && p.categoria !== categoria) return false;
      if (bajoMinimo && !(p.stockMinimo > 0 && p.stock <= p.stockMinimo)) return false;
      if (!texto) return true;
      return [p.nombre, p.categoria, p.grupo, p.tienda, p.codigo, p.imei, p.marca]
        .join(" ")
        .toLowerCase()
        .includes(texto);
    });
  }, [productos, busqueda, operador, tienda, grupo, categoria, bajoMinimo]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / tamano));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * tamano;
  const visibles = filtrados.slice(desde, desde + tamano);

  const unidades = filtrados.reduce((s, p) => s + (Number(p.stock) || 0), 0);
  const valor = filtrados
    .filter((p) => esMercancia(p.grupo))
    .reduce((s, p) => s + p.stock * (Number(p.costo) || 0), 0);
  const bajos = filtrados.filter((p) => p.stockMinimo > 0 && p.stock <= p.stockMinimo).length;

  function reiniciar(fn) {
    fn();
    setPagina(1);
  }

  function limpiar() {
    setBusqueda("");
    setOperador("");
    setTienda("");
    setGrupo("");
    setCategoria("");
    setBajoMinimo(false);
    setPagina(1);
  }

  function exportar() {
    descargarCSV(
      "inventario",
      [
        "Tienda",
        "Operador",
        "Grupo",
        "Categoría",
        "Producto",
        "Marca",
        "Memoria",
        "Código",
        "IMEI",
        "Stock",
        "Stock mínimo",
        "Costo (S/)",
        "Precio (S/)",
        "Valor al costo (S/)",
      ],
      filtrados.map((p) => [
        p.tienda,
        p.operador,
        p.grupo,
        p.categoria,
        p.nombre,
        p.marca,
        p.memoria,
        p.codigo,
        p.imei,
        p.stock,
        p.stockMinimo,
        p.costo,
        p.precio,
        Math.round(p.stock * p.costo * 100) / 100,
      ])
    );
  }

  const hayFiltros = Boolean(busqueda || operador || tienda || grupo || categoria || bajoMinimo);

  return (
    <>
      <div className="tarjeta mb-2">
        <div className="tarjeta-cuerpo">
          <div className="barra-filtros">
            <input
              className="input"
              type="search"
              placeholder="Buscar producto, código, IMEI, marca o tienda…"
              value={busqueda}
              onChange={(e) => reiniciar(() => setBusqueda(e.target.value))}
              aria-label="Buscar en el inventario"
            />
            <select
              className="select"
              value={operador}
              onChange={(e) =>
                reiniciar(() => {
                  setOperador(e.target.value);
                  setTienda("");
                })
              }
              aria-label="Operador"
            >
              <option value="">Todos los operadores</option>
              <option value="Bitel">Bitel</option>
              <option value="Claro">Claro</option>
            </select>
            <select
              className="select"
              value={tienda}
              onChange={(e) => reiniciar(() => setTienda(e.target.value))}
              aria-label="Tienda"
            >
              <option value="">Todas las tiendas</option>
              {tiendas
                .filter((t) => !operador || t.operador === operador)
                .map((t) => (
                  <option key={t.id} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))}
            </select>
          </div>

          <div className="barra-filtros mt-1">
            <select
              className="select"
              value={grupo}
              onChange={(e) =>
                reiniciar(() => {
                  setGrupo(e.target.value);
                  setCategoria("");
                })
              }
              aria-label="Grupo"
            >
              <option value="">Todos los grupos</option>
              {GRUPOS_INVENTARIO.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={categoria}
              onChange={(e) => reiniciar(() => setCategoria(e.target.value))}
              aria-label="Categoría"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`btn btn-chico btn-filtro${bajoMinimo ? " activo" : ""}`}
              onClick={() => reiniciar(() => setBajoMinimo((v) => !v))}
              aria-pressed={bajoMinimo}
            >
              Bajo mínimo
              <span className="chip chip-warn">{formatNumero(bajos)}</span>
            </button>
            {hayFiltros && (
              <button type="button" className="btn btn-fantasma btn-chico" onClick={limpiar}>
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="lista-acciones">
            <span className="texto-muted texto-chico">
              {formatNumero(filtrados.length)} productos · {formatCantidad(unidades)} unidades ·{" "}
              {formatSoles(valor)} de mercadería al costo
            </span>
            <span className="lista-acciones-botones">
              <button type="button" className="btn btn-chico" onClick={exportar}>
                Exportar Excel
              </button>
            </span>
          </div>

          <p className="nota-ayuda">
            El valor al costo no incluye servicios (Anypay, Bypay, tasas, traslados ni
            devoluciones): son fondos operativos, no mercadería.
          </p>
        </div>
      </div>

      <div className="tarjeta">
        <div className="tabla-scroll">
          <table className="tabla tabla-ancho">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Código / IMEI</th>
                <th>Tienda</th>
                <th className="num">Stock</th>
                <th className="num">Costo</th>
                <th className="num">Precio</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const bajo = p.stockMinimo > 0 && p.stock <= p.stockMinimo;
                return (
                  <tr key={p.id}>
                    <td>
                      <strong className="producto-nombre">{p.nombre}</strong>
                      <div className="texto-muted texto-chico">
                        {[p.marca, p.memoria].filter(Boolean).join(" · ") || p.grupo}
                      </div>
                    </td>
                    <td>
                      <span className={`chip ${claseGrupo(p.grupo)}`}>{p.categoria}</span>
                    </td>
                    <td className="mono">
                      {p.codigo || p.imei ? (
                        <>
                          {p.imei ? <span className="etiqueta-mini">IMEI</span> : null}
                          {p.codigo || p.imei}
                        </>
                      ) : (
                        <span className="texto-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="tienda-celda">
                        <span
                          className={`punto-operador ${CLASE_OPERADOR[p.operador] || ""}`}
                          title={p.operador}
                        />
                        {nombreCorto(p.tienda)}
                      </span>
                    </td>
                    <td className={`num${bajo ? " stock-bajo" : ""}`}>
                      {formatCantidad(p.stock)}
                      <span className="stock-min">mín {formatCantidad(p.stockMinimo)}</span>
                    </td>
                    <td className="num">{formatSoles(p.costo)}</td>
                    <td className="num">{formatSoles(p.precio)}</td>
                    <td className="num">{formatSoles(p.stock * p.costo)}</td>
                  </tr>
                );
              })}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={8} className="vacio">
                    No se encontraron productos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
            {filtrados.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4}>
                    {formatNumero(filtrados.length)} productos
                  </td>
                  <td className="num">{formatCantidad(unidades)}</td>
                  <td className="num" colSpan={2}>
                    Valor mercadería
                  </td>
                  <td className="num">{formatSoles(valor)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {filtrados.length > 0 && (
          <div className="paginacion">
            <span className="texto-muted texto-chico">
              Mostrando {formatNumero(desde + 1)}–{formatNumero(Math.min(desde + tamano, filtrados.length))} de{" "}
              {formatNumero(filtrados.length)}
            </span>
            <div className="paginacion-controles">
              <select
                className="select select-chico"
                value={tamano}
                onChange={(e) => {
                  setTamano(Number(e.target.value));
                  setPagina(1);
                }}
                aria-label="Filas por página"
              >
                {TAMANOS.map((t) => (
                  <option key={t} value={t}>
                    {t} por página
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secundario btn-chico"
                onClick={() => setPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
              >
                Anterior
              </button>
              <span className="paginacion-num">
                {paginaActual} / {totalPaginas}
              </span>
              <button
                type="button"
                className="btn btn-secundario btn-chico"
                onClick={() => setPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
