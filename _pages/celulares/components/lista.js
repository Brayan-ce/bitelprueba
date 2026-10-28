"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDatos } from "@/_pages/components/datos/proveedor";
import { ESTADOS, claseEstado, formatSoles, soloDigitos } from "@/lib/format";
import { descargarCSV } from "@/lib/excel";
import EscanearBoton from "@/_pages/components/ui/escanear-boton";

export default function ListaCelulares() {
  const { celulares, tiendas, buscarPorImei } = useDatos();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [tienda, setTienda] = useState("");
  const [operador, setOperador] = useState("");
  const [estado, setEstado] = useState("");

  const operadorPorTienda = useMemo(
    () => new Map(tiendas.map((t) => [t.nombre, t.operador])),
    [tiendas]
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const digitos = soloDigitos(busqueda);
    return celulares.filter((celular) => {
      if (tienda && celular.tienda !== tienda) return false;
      if (operador && operadorPorTienda.get(celular.tienda) !== operador) return false;
      if (estado && celular.estado !== estado) return false;
      if (!texto) return true;
      const coincideTexto = [
        celular.codigo,
        celular.marca,
        celular.modelo,
        celular.color,
        celular.memoria,
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto);
      const coincideImei =
        digitos &&
        (celular.imei1.includes(digitos) ||
          (celular.imei2 && celular.imei2.includes(digitos)));
      return coincideTexto || coincideImei;
    });
  }, [celulares, busqueda, tienda, operador, estado, operadorPorTienda]);

  const totalCosto = filtrados.reduce((suma, c) => suma + (Number(c.costo) || 0), 0);
  const totalPrecio = filtrados.reduce((suma, c) => suma + (Number(c.precio_venta) || 0), 0);

  function exportar() {
    descargarCSV(
      "celulares",
      [
        "Código",
        "Marca",
        "Modelo",
        "Color",
        "Memoria",
        "IMEI 1",
        "IMEI 2",
        "Costo (S/)",
        "Precio venta (S/)",
        "Tienda",
        "Estado",
        "Registrado",
      ],
      [
        ...filtrados.map((c) => [
          c.codigo,
          c.marca,
          c.modelo,
          c.color,
          c.memoria,
          c.imei1,
          c.imei2 || "",
          Number(c.costo) || 0,
          Number(c.precio_venta) || 0,
          c.tienda,
          c.estado,
          String(c.creado_en || "").slice(0, 10),
        ]),
        [],
        [
          "TOTAL",
          `${filtrados.length} equipos`,
          "",
          "",
          "",
          "",
          "",
          totalCosto,
          totalPrecio,
          "",
          "",
          "",
        ],
      ]
    );
  }

  return (
    <>
      <div className="tarjeta mb-2">
        <div className="tarjeta-cuerpo">
          <div className="barra-filtros">
            <input
              className="input"
              type="search"
              placeholder="Buscar por código, IMEI, marca o modelo…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar celulares"
            />
            <select className="select" value={tienda} onChange={(e) => setTienda(e.target.value)}>
              <option value="">Todas las tiendas</option>
              {tiendas.map((t) => (
                <option key={t.id} value={t.nombre}>
                  {t.nombre}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={operador}
              onChange={(e) => setOperador(e.target.value)}
            >
              <option value="">Todos los operadores</option>
              <option value="Bitel">Bitel</option>
              <option value="Claro">Claro</option>
            </select>
            <select className="select" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div className="lista-acciones">
            <span className="texto-muted texto-chico">
              {filtrados.length} de {celulares.length} celulares · Costo {formatSoles(totalCosto)} ·
              Precio {formatSoles(totalPrecio)}
            </span>
            <span className="lista-acciones-botones">
              <EscanearBoton
                etiqueta="Escanear para buscar"
                onLectura={(texto) => {
                  const encontrado = buscarPorImei(soloDigitos(texto));
                  if (encontrado) {
                    router.push(`/celulares/${encontrado.codigo}`);
                    return;
                  }
                  setBusqueda(texto);
                }}
              />
              <button type="button" className="btn btn-chico" onClick={exportar}>
                Exportar Excel
              </button>
            </span>
          </div>
        </div>
      </div>

      <div className="tarjeta">
        <div className="tabla-scroll">
          <table className="tabla tabla-ancho">
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipo</th>
                <th>IMEI 1</th>
                <th>IMEI 2</th>
                <th>Tienda</th>
                <th>Estado</th>
                <th className="num">Costo</th>
                <th className="num">Precio venta</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((celular) => (
                <tr
                  key={celular.codigo}
                  onClick={() => router.push(`/celulares/${celular.codigo}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <Link href={`/celulares/${celular.codigo}`} className="vinculo mono">
                      {celular.codigo}
                    </Link>
                  </td>
                  <td>
                    <strong>{celular.modelo}</strong>
                    <div className="texto-muted texto-chico">
                      {[celular.marca, celular.memoria, celular.color].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td className="mono">{celular.imei1}</td>
                  <td className="mono">{celular.imei2 || "—"}</td>
                  <td>
                    <span className="tienda-celda">
                      <span
                        className={`punto-operador ${
                          operadorPorTienda.get(celular.tienda) === "Bitel"
                            ? "punto-bitel"
                            : operadorPorTienda.get(celular.tienda) === "Claro"
                              ? "punto-claro"
                              : ""
                        }`}
                        title={operadorPorTienda.get(celular.tienda) || ""}
                      />
                      {celular.tienda || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={claseEstado(celular.estado)}>{celular.estado}</span>
                  </td>
                  <td className="num">{formatSoles(celular.costo)}</td>
                  <td className="num">{formatSoles(celular.precio_venta)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="vacio">
                    No se encontraron celulares con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
            {filtrados.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6}>{filtrados.length} equipos · Totales</td>
                  <td className="num">{formatSoles(totalCosto)}</td>
                  <td className="num">{formatSoles(totalPrecio)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
