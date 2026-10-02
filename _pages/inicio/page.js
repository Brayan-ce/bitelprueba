"use client";

import Link from "next/link";
import { useDatos } from "@/_pages/components/datos/proveedor";
import {
  claseTipo,
  diaSemana,
  etiquetaTipo,
  fechaLima,
  formatFechaHoraMovimiento,
  formatNumero,
  formatSoles,
} from "@/lib/format";
import { ROTULO_DATOS_DEMO } from "@/lib/datos-demo";
import {
  IconoCelular,
  IconoEscanear,
  IconoMasNuevo,
  IconoMovimientos,
} from "@/_pages/components/ui/iconos";

export default function InicioPage() {
  const { celulares, movimientos, tiendas } = useDatos();

  const hoy = fechaLima();
  const disponibles = celulares.filter((c) => c.estado === "Disponible");
  const vendidos = celulares.filter((c) => c.estado === "Vendido");
  const movimientosHoy = movimientos.filter((m) => m.fecha === hoy);

  const porImei = new Map();
  for (const celular of celulares) {
    porImei.set(celular.imei1, celular);
    if (celular.imei2) porImei.set(celular.imei2, celular);
  }

  const stock = tiendas.map((tienda) => {
    const propios = celulares.filter((c) => c.tienda === tienda.nombre);
    return {
      ...tienda,
      total: propios.length,
      disponibles: propios.filter((c) => c.estado === "Disponible").length,
      vendidos: propios.filter((c) => c.estado === "Vendido").length,
      valor: propios.reduce((suma, c) => suma + (Number(c.costo) || 0), 0),
    };
  });

  const ordenados = [...movimientos].sort((a, b) =>
    `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)
  );
  const ultimos = ordenados.slice(0, 6);

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Inventario Pastrana</h1>
          <p className="subtitulo" style={{ textTransform: "capitalize" }}>
            {diaSemana()} · {formatNumero(celulares.length)} celulares en catálogo
          </p>
        </div>
        <span className="chip chip-brand">{ROTULO_DATOS_DEMO}</span>
      </div>

      <div className="rejilla rejilla-stats mb-2">
        <div className="tarjeta stat">
          <div className="stat-ico">
            <IconoCelular />
          </div>
          <div className="stat-valor">{formatNumero(celulares.length)}</div>
          <div className="stat-etiqueta">Celulares totales</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-ico" style={{ background: "var(--ok-bg)", color: "var(--ok)" }}>
            <IconoCelular />
          </div>
          <div className="stat-valor">{formatNumero(disponibles.length)}</div>
          <div className="stat-etiqueta">Disponibles</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-ico" style={{ background: "var(--info-bg)", color: "var(--info)" }}>
            <IconoMovimientos />
          </div>
          <div className="stat-valor">{formatNumero(vendidos.length)}</div>
          <div className="stat-etiqueta">Vendidos</div>
        </div>
        <div className="tarjeta stat">
          <div className="stat-ico" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>
            <IconoEscanear />
          </div>
          <div className="stat-valor">{formatNumero(movimientosHoy.length)}</div>
          <div className="stat-etiqueta">Movimientos de hoy</div>
        </div>
      </div>

      <div className="acciones-rapidas mb-2">
        <Link href="/escanear" className="accion destacada">
          <span className="accion-ico">
            <IconoEscanear />
          </span>
          <span>
            Escanear IMEI
            <small>Cámara, foto o lectora · OK / NOK</small>
          </span>
        </Link>
        <Link href="/celulares/nuevo" className="accion">
          <span className="accion-ico">
            <IconoMasNuevo />
          </span>
          <span>
            Nuevo celular
            <small>Registrar equipo al inventario</small>
          </span>
        </Link>
        <Link href="/movimientos/nuevo" className="accion">
          <span className="accion-ico">
            <IconoMovimientos />
          </span>
          <span>
            Registrar movimiento
            <small>Entrada, salida o traslado</small>
          </span>
        </Link>
      </div>

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Stock por tienda</h2>
            <Link href="/tiendas" className="vinculo texto-chico">
              Gestionar
            </Link>
          </div>
          <div>
            {stock.map((tienda) => (
              <div className="resumen-tienda" key={tienda.id}>
                <div>
                  <div className="resumen-tienda-nombre">{tienda.nombre}</div>
                  <div className="resumen-tienda-meta">
                    {tienda.disponibles} disp. · {tienda.vendidos} vendidos ·{" "}
                    {formatSoles(tienda.valor)} en costo
                  </div>
                </div>
                <span className="chip chip-brand">{formatNumero(tienda.total)}</span>
              </div>
            ))}
            {stock.length === 0 && <div className="vacio">Aún no hay tiendas registradas.</div>}
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Últimos movimientos</h2>
            <Link href="/movimientos" className="vinculo texto-chico">
              Ver todos
            </Link>
          </div>
          <div className="lista">
            {ultimos.map((movimiento) => {
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
                    <span className="mono">{movimiento.imei}</span>
                    <span>
                      {movimiento.tienda_origen || "—"} → {movimiento.tienda_destino || "—"}
                    </span>
                    <span>{formatFechaHoraMovimiento(movimiento.fecha, movimiento.hora)}</span>
                    <span>{movimiento.usuario}</span>
                  </div>
                </div>
              );
            })}
            {ultimos.length === 0 && <div className="vacio">Sin movimientos registrados.</div>}
          </div>
        </section>
      </div>
    </>
  );
}
