"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDatos } from "@/_pages/components/datos/proveedor";
import { ESTADOS, claseEstado, soloDigitos } from "@/lib/format";
import EscanearBoton from "@/_pages/components/ui/escanear-boton";

const INICIAL = {
  codigo: "",
  marca: "",
  modelo: "",
  color: "",
  memoria: "",
  imei1: "",
  imei2: "",
  costo: "",
  precio_venta: "",
  tienda: "",
  estado: "Disponible",
};

export default function FormularioCelular({ inicial, codigoActual, onExito, onCancelar }) {
  const { tiendas, siguienteCodigo, agregarCelular, actualizarCelular } = useDatos();
  const router = useRouter();
  const [datos, setDatos] = useState(inicial || INICIAL);
  const [error, setError] = useState("");

  function cambiar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  function enviar(evento) {
    evento.preventDefault();
    setError("");
    const resultado = codigoActual
      ? actualizarCelular(codigoActual, datos)
      : agregarCelular(datos);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    if (onExito) onExito(resultado.codigo);
    else router.push(`/celulares/${resultado.codigo}`);
  }

  return (
    <form className="tarjeta" onSubmit={enviar}>
      <div className="tarjeta-cuerpo">
        {error && <div className="alerta alerta-error mb-2">{error}</div>}

        <div className="formulario dos-columnas">
          <div className="campo">
            <label htmlFor="codigo">Código</label>
            <input
              id="codigo"
              className="input mono"
              value={datos.codigo}
              onChange={(e) => cambiar("codigo", e.target.value.toUpperCase())}
              placeholder={codigoActual || siguienteCodigo()}
            />
          </div>
          <div className="campo">
            <label htmlFor="tienda">Tienda *</label>
            <select
              id="tienda"
              className="select"
              value={datos.tienda}
              onChange={(e) => cambiar("tienda", e.target.value)}
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

          <div className="campo">
            <label htmlFor="marca">Marca *</label>
            <input
              id="marca"
              className="input"
              value={datos.marca}
              onChange={(e) => cambiar("marca", e.target.value)}
              placeholder="Samsung"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="modelo">Modelo *</label>
            <input
              id="modelo"
              className="input"
              value={datos.modelo}
              onChange={(e) => cambiar("modelo", e.target.value)}
              placeholder="Galaxy A15"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="color">Color</label>
            <input
              id="color"
              className="input"
              value={datos.color}
              onChange={(e) => cambiar("color", e.target.value)}
              placeholder="Azul oscuro"
            />
          </div>
          <div className="campo">
            <label htmlFor="memoria">Memoria</label>
            <input
              id="memoria"
              className="input"
              value={datos.memoria}
              onChange={(e) => cambiar("memoria", e.target.value)}
              placeholder="128 GB"
            />
          </div>

          <div className="campo">
            <label htmlFor="imei1">IMEI 1 *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="imei1"
                className="input mono"
                inputMode="numeric"
                value={datos.imei1}
                onChange={(e) => cambiar("imei1", soloDigitos(e.target.value).slice(0, 15))}
                placeholder="15 dígitos"
                maxLength={15}
                style={{ flex: 1, minWidth: 0 }}
                required
              />
              <EscanearBoton
                etiqueta="Cámara"
                onLectura={(texto) => cambiar("imei1", soloDigitos(texto).slice(0, 15))}
              />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="imei2">IMEI 2 (opcional)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="imei2"
                className="input mono"
                inputMode="numeric"
                value={datos.imei2}
                onChange={(e) => cambiar("imei2", soloDigitos(e.target.value).slice(0, 15))}
                placeholder="15 dígitos"
                maxLength={15}
                style={{ flex: 1, minWidth: 0 }}
              />
              <EscanearBoton
                etiqueta="Cámara"
                onLectura={(texto) => cambiar("imei2", soloDigitos(texto).slice(0, 15))}
              />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="costo">Costo (S/)</label>
            <input
              id="costo"
              className="input"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={datos.costo}
              onChange={(e) => cambiar("costo", e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="campo">
            <label htmlFor="precio">Precio de venta (S/)</label>
            <input
              id="precio"
              className="input"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={datos.precio_venta}
              onChange={(e) => cambiar("precio_venta", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="campo ancho">
            <label htmlFor="estado">Estado</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <select
                id="estado"
                className="select"
                value={datos.estado}
                onChange={(e) => cambiar("estado", e.target.value)}
                style={{ maxWidth: 240 }}
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <span className={claseEstado(datos.estado)}>{datos.estado}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tarjeta-cabeza" style={{ borderBottom: "none", borderTop: "1px solid var(--line)" }}>
        <button type="button" className="btn btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn">
          {codigoActual ? "Guardar cambios" : "Registrar celular"}
        </button>
      </div>
    </form>
  );
}
