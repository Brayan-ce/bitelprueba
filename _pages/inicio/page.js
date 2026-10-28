"use client";

import Image from "next/image";
import Link from "next/link";
import { useDatos } from "@/_pages/components/datos/proveedor";
import {
  claseTipo,
  diaSemana,
  esMercancia,
  etiquetaTipo,
  formatCantidad,
  formatFechaHoraMovimiento,
  formatNumero,
  formatSoles,
} from "@/lib/format";
import { ROTULO_DATOS_DEMO } from "@/lib/datos-demo";
import {
  IconoCelular,
  IconoEscanear,
  IconoInventario,
  IconoMovimientos,
} from "@/_pages/components/ui/iconos";

export default function InicioPage() {
  const { celulares, movimientos, tiendas, productos } = useDatos();

  const mercancia = productos.filter((p) => esMercancia(p.grupo));
  const unidades = mercancia.reduce((suma, p) => suma + (Number(p.stock) || 0), 0);
  const valorMercancia = mercancia.reduce(
    (suma, p) => suma + (Number(p.stock) || 0) * (Number(p.costo) || 0),
    0
  );
  const bajosMinimo = productos.filter(
    (p) => p.stockMinimo > 0 && p.stock <= p.stockMinimo
  ).length;

  const porImei = new Map();
  for (const celular of celulares) {
    porImei.set(celular.imei1, celular);
    if (celular.imei2) porImei.set(celular.imei2, celular);
  }

  const stock = tiendas.map((tienda) => {
    const propios = productos.filter((p) => p.tiendaId === tienda.id);
    const propiosMercancia = propios.filter((p) => esMercancia(p.grupo));
    return {
      ...tienda,
      total: propios.length,
      unidades: propiosMercancia.reduce((suma, p) => suma + (Number(p.stock) || 0), 0),
      valor: propiosMercancia.reduce(
        (suma, p) => suma + (Number(p.stock) || 0) * (Number(p.costo) || 0),
        0
      ),
    };
  });

  const ordenados = [...movimientos].sort((a, b) =>
    `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)
  );
  const ultimos = ordenados.slice(0, 6);

  return (
    <>
      <section className="hero mb-2">
        <div className="hero-contenido">
          <p className="hero-eyebrow">
            Pastrana S.A.C. · Bitel y Claro
            <span className="chip">{ROTULO_DATOS_DEMO}</span>
          </p>
          <h1 className="hero-titulo">Inventario bajo control</h1>
          <p className="hero-sub">
            {diaSemana()} · {formatNumero(productos.length)} productos ·{" "}
            {formatCantidad(unidades)} unidades en {tiendas.length} tiendas
          </p>
          <div className="hero-acciones">
            <Link href="/escanear" className="btn">
              <IconoEscanear />
              Escanear IMEI
            </Link>
            <Link href="/inventario" className="btn btn-secundario">
              <IconoInventario />
              Ver inventario
            </Link>
            <Link href="/movimientos/nuevo" className="btn btn-secundario">
              <IconoMovimientos />
              Registrar movimiento
            </Link>
          </div>
        </div>
        <Image
          className="hero-logo"
          src="/logo_transparente.png"
          alt=""
          width={500}
          height={500}
          aria-hidden="true"
        />
      </section>

      <div className="rejilla rejilla-stats mb-2">
        <Link href="/inventario" className="tarjeta stat stat-enlace">
          <div className="stat-ico">
            <IconoInventario />
          </div>
          <div className="stat-valor">{formatNumero(productos.length)}</div>
          <div className="stat-etiqueta">Productos registrados</div>
        </Link>
        <Link href="/celulares" className="tarjeta stat stat-enlace">
          <div className="stat-ico" style={{ background: "var(--ok-bg)", color: "var(--ok)" }}>
            <IconoCelular />
          </div>
          <div className="stat-valor">{formatNumero(celulares.length)}</div>
          <div className="stat-etiqueta">Celulares con IMEI</div>
        </Link>
        <Link href="/inventario" className="tarjeta stat stat-enlace">
          <div className="stat-ico" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>
            <IconoMovimientos />
          </div>
          <div className="stat-valor">{formatNumero(bajosMinimo)}</div>
          <div className="stat-etiqueta">Bajo stock mínimo</div>
        </Link>
        <div className="tarjeta stat">
          <div className="stat-ico">
            <IconoInventario />
          </div>
          <div className="stat-valor stat-valor-chico">{formatSoles(valorMercancia)}</div>
          <div className="stat-etiqueta">Mercadería al costo</div>
        </div>
      </div>

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Stock por tienda</h2>
            <Link href="/inventario" className="vinculo texto-chico">
              Ver inventario
            </Link>
          </div>
          <div className="lista lista-scroll">
            {stock.map((tienda) => (
              <div className="resumen-tienda" key={tienda.id}>
                <div className="resumen-tienda-texto">
                  <div className="resumen-tienda-nombre tienda-celda">
                    <span
                      className={`punto-operador ${
                        tienda.operador === "Bitel"
                          ? "punto-bitel"
                          : tienda.operador === "Claro"
                            ? "punto-claro"
                            : ""
                      }`}
                      title={tienda.operador}
                    />
                    {tienda.nombre}
                  </div>
                  <div className="resumen-tienda-meta">
                    {formatNumero(tienda.total)} productos · {formatCantidad(tienda.unidades)}{" "}
                    unidades · {formatSoles(tienda.valor)} al costo
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
          <div className="lista lista-scroll">
            {ultimos.map((movimiento) => {
              const celular = porImei.get(movimiento.imei);
              return (
                <div className="fila" key={movimiento.id}>
                  <div className="fila-principal">
                    <span className="fila-titulo">
                      {celular ? celular.modelo : "Celular no encontrado"}
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
            {ultimos.length === 0 && (
              <div className="vacio">
                Sin movimientos todavía. El stock del Excel quedó cargado como saldo inicial.
              </div>
            )}
          </div>
          <p className="nota-ayuda">
            El stock del Excel quedó cargado como entrada inicial de cada IMEI el 25/10/2026.
            Los movimientos nuevos aparecerán aquí.
          </p>
        </section>
      </div>
    </>
  );
}
