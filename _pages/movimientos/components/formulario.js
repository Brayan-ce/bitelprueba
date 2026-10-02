"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDatos } from "@/_pages/components/datos/proveedor";
import EscanearBoton from "@/_pages/components/ui/escanear-boton";
import {
  ESTADOS,
  TIPOS_MOVIMIENTO,
  claseEstado,
  etiquetaTipo,
  extraerImei,
  soloDigitos,
} from "@/lib/format";

export default function FormularioMovimiento({ onCancelar }) {
  const { celulares, tiendas, usuarios, buscarPorImei, agregarMovimiento } = useDatos();
  const router = useRouter();

  const [tipo, setTipo] = useState("entrada");
  const [imei, setImei] = useState("");
  const [tiendaOrigen, setTiendaOrigen] = useState("");
  const [tiendaDestino, setTiendaDestino] = useState("");
  const [usuario, setUsuario] = useState("");
  const [detalle, setDetalle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const guardado = window.localStorage.getItem("inventario:usuario");
    const existe = usuarios.find((u) => u.nombre === guardado);
    setUsuario(existe ? existe.nombre : usuarios[0]?.nombre || "");
  }, [usuarios]);

  const listaImeis = useMemo(() => {
    const valores = [];
    for (const celular of celulares) {
      valores.push(celular.imei1);
      if (celular.imei2) valores.push(celular.imei2);
    }
    return valores;
  }, [celulares]);

  const celular = imei.length >= 15 ? buscarPorImei(extraerImei(imei)) : null;
  const mostrarOrigen = tipo === "salida" || tipo === "traslado";
  const mostrarDestino = tipo === "entrada" || tipo === "traslado";

  function enviar(evento) {
    evento.preventDefault();
    setError("");
    const resultado = agregarMovimiento({
      tipo,
      imei,
      tienda_origen: mostrarOrigen ? tiendaOrigen : "",
      tienda_destino: mostrarDestino ? tiendaDestino : "",
      usuario,
      detalle,
    });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    router.push("/movimientos");
  }

  return (
    <form className="tarjeta" onSubmit={enviar}>
      <div className="tarjeta-cuerpo">
        {error && <div className="alerta alerta-error mb-2">{error}</div>}

        <div className="formulario dos-columnas">
          <div className="campo">
            <label htmlFor="tipo">Tipo de movimiento *</label>
            <select
              id="tipo"
              className="select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {TIPOS_MOVIMIENTO.map((t) => (
                <option key={t} value={t}>
                  {etiquetaTipo(t)}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="usuario">Usuario responsable *</label>
            <select
              id="usuario"
              className="select"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            >
              <option value="">Selecciona…</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.nombre}>
                  {u.nombre} · {u.rol}
                </option>
              ))}
            </select>
          </div>

          <div className="campo ancho">
            <label htmlFor="imei">IMEI *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="imei"
                className="input mono"
                inputMode="numeric"
                list="imei-datalist"
                value={imei}
                onChange={(e) => setImei(soloDigitos(e.target.value).slice(0, 15))}
                placeholder="Escribe o pega los 15 dígitos"
                style={{ flex: 1, minWidth: 0 }}
                required
              />
              <EscanearBoton
                etiqueta="Cámara"
                onLectura={(texto) => setImei(soloDigitos(texto).slice(0, 15))}
              />
            </div>
            <datalist id="imei-datalist">
              {listaImeis.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>

            {imei.length >= 15 && !celular && (
              <div className="alerta alerta-error mt-1">
                El IMEI {extraerImei(imei) || imei} no está en el inventario.
              </div>
            )}
            {celular && (
              <div className="alerta alerta-ok mt-1" style={{ justifyContent: "space-between" }}>
                <span>
                  <strong>{celular.marca} {celular.modelo}</strong> · {celular.codigo} ·{" "}
                  {celular.tienda || "sin tienda"}
                </span>
                <span className={claseEstado(celular.estado)}>{celular.estado}</span>
              </div>
            )}
          </div>

          {mostrarOrigen && (
            <div className="campo">
              <label htmlFor="origen">Tienda origen *</label>
              <select
                id="origen"
                className="select"
                value={tiendaOrigen}
                onChange={(e) => setTiendaOrigen(e.target.value)}
                required
              >
                <option value="">Selecciona…</option>
                {tiendas.map((t) => (
                  <option key={t.id} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mostrarDestino && (
            <div className="campo">
              <label htmlFor="destino">
                {tipo === "salida" ? "Tienda destino" : "Tienda destino *"}
              </label>
              <select
                id="destino"
                className="select"
                value={tiendaDestino}
                onChange={(e) => setTiendaDestino(e.target.value)}
                required={tipo !== "salida"}
              >
                <option value="">Selecciona…</option>
                {tiendas.map((t) => (
                  <option key={t.id} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="campo ancho">
            <label htmlFor="detalle">
              {tipo === "salida" ? "Motivo de la salida *" : "Detalle (opcional)"}
            </label>
            <textarea
              id="detalle"
              className="textarea"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder={
                tipo === "salida"
                  ? "Ej.: Venta al cliente, garantía, traslado interno…"
                  : "Observaciones del movimiento"
              }
              required={tipo === "salida"}
            />
          </div>
        </div>

        <p className="texto-muted texto-chico mt-2">
          Estados que maneja el sistema: {ESTADOS.join(", ")}.
        </p>
      </div>

      <div
        className="tarjeta-cabeza"
        style={{ borderBottom: "none", borderTop: "1px solid var(--line)" }}
      >
        <button type="button" className="btn btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn">
          Registrar movimiento
        </button>
      </div>
    </form>
  );
}
