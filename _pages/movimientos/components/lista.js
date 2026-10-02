"use client";

import { useMemo, useState } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import {
  TIPOS_MOVIMIENTO,
  claseTipo,
  etiquetaTipo,
  fechaLima,
  formatFecha,
  soloDigitos,
} from "@/lib/format";
import { descargarCSV } from "@/lib/excel";

export default function ListaMovimientos() {
  const { movimientos, celulares, tiendas, usuarios } = useDatos();
  const [tipo, setTipo] = useState("");
  const [tienda, setTienda] = useState("");
  const [usuario, setUsuario] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const hoy = fechaLima();

  const porImei = useMemo(() => {
    const mapa = new Map();
    for (const celular of celulares) {
      mapa.set(celular.imei1, celular);
      if (celular.imei2) mapa.set(celular.imei2, celular);
    }
    return mapa;
  }, [celulares]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const digitos = soloDigitos(busqueda);
    return movimientos
      .filter((m) => {
        if (tipo && m.tipo !== tipo) return false;
        if (tienda && m.tienda_origen !== tienda && m.tienda_destino !== tienda) return false;
        if (usuario && m.usuario !== usuario) return false;
        if (!texto) return true;
        const celular = porImei.get(m.imei);
        const descripcion = celular
          ? `${celular.codigo} ${celular.marca} ${celular.modelo}`.toLowerCase()
          : "";
        return (
          m.imei.includes(digitos || texto) ||
          descripcion.includes(texto) ||
          m.usuario.toLowerCase().includes(texto)
        );
      })
      .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
  }, [movimientos, porImei, tipo, tienda, usuario, busqueda]);

  const grupos = useMemo(() => {
    const mapa = new Map();
    for (const movimiento of filtrados) {
      if (!mapa.has(movimiento.fecha)) mapa.set(movimiento.fecha, []);
      mapa.get(movimiento.fecha).push(movimiento);
    }
    return [...mapa.entries()].map(([fecha, items]) => ({
      fecha,
      items,
      entradas: items.filter((m) => m.tipo === "entrada").length,
      salidas: items.filter((m) => m.tipo === "salida").length,
      traslados: items.filter((m) => m.tipo === "traslado").length,
    }));
  }, [filtrados]);

  function exportar() {
    descargarCSV(
      "movimientos",
      [
        "Fecha",
        "Hora",
        "Tipo",
        "IMEI",
        "Equipo",
        "Tienda origen",
        "Tienda destino",
        "Usuario",
        "Detalle",
      ],
      filtrados.map((m) => {
        const celular = porImei.get(m.imei);
        return [
          m.fecha,
          m.hora,
          etiquetaTipo(m.tipo),
          m.imei,
          celular ? `${celular.marca} ${celular.modelo}` : "",
          m.tienda_origen,
          m.tienda_destino,
          m.usuario,
          m.detalle,
        ];
      })
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
              placeholder="Buscar por IMEI, código o usuario…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar movimientos"
            />
            <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {TIPOS_MOVIMIENTO.map((t) => (
                <option key={t} value={t}>
                  {etiquetaTipo(t)}
                </option>
              ))}
            </select>
            <select className="select" value={tienda} onChange={(e) => setTienda(e.target.value)}>
              <option value="">Todas las tiendas</option>
              {tiendas.map((t) => (
                <option key={t.id} value={t.nombre}>
                  {t.nombre}
                </option>
              ))}
            </select>
            <select className="select" value={usuario} onChange={(e) => setUsuario(e.target.value)}>
              <option value="">Todos los usuarios</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.nombre}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="lista-acciones">
            <span className="texto-muted texto-chico">
              {filtrados.length} de {movimientos.length} movimientos · {grupos.length} días
              registrados
            </span>
            <span className="lista-acciones-botones">
              <button type="button" className="btn btn-chico" onClick={exportar}>
                Exportar Excel
              </button>
            </span>
          </div>
        </div>
      </div>

      {grupos.map((grupo) => (
        <section className="tarjeta mb-2" key={grupo.fecha}>
          <div className="dia-cabecera">
            <span>
              {grupo.fecha === hoy && <span className="chip chip-brand">Hoy</span>}{" "}
              {formatFecha(grupo.fecha)}
            </span>
            <span className="texto-muted texto-chico">
              {grupo.items.length} movimientos · {grupo.entradas} entradas · {grupo.salidas}{" "}
              salidas · {grupo.traslados} traslados
            </span>
          </div>

          <div className="lista">
            {grupo.items.map((movimiento) => {
              const celular = porImei.get(movimiento.imei);
              return (
                <div className="fila" key={movimiento.id}>
                  <div className="fila-principal">
                    <span className="fila-titulo">
                      {celular ? `${celular.marca} ${celular.modelo}` : "Celular no encontrado"}
                    </span>
                    <span className={claseTipo(movimiento.tipo)}>
                      {etiquetaTipo(movimiento.tipo)}
                    </span>
                  </div>
                  <div className="fila-meta">
                    <span className="mono">{String(movimiento.hora).slice(0, 5)}</span>
                    <span className="mono">{movimiento.imei}</span>
                    <span>
                      {movimiento.tienda_origen || "—"} → {movimiento.tienda_destino || "—"}
                    </span>
                    <span>{movimiento.usuario}</span>
                    {movimiento.detalle && <span>{movimiento.detalle}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {grupos.length === 0 && (
        <div className="tarjeta">
          <div className="vacio">No hay movimientos con esos filtros.</div>
        </div>
      )}
    </>
  );
}
