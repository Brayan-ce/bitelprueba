"use client";

import { useState } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import { OPERADORES, esMercancia, formatNumero, formatSoles } from "@/lib/format";
import { IconoEditar, IconoPapelera } from "@/_pages/components/ui/iconos";

export default function GestionTiendas() {
  const { tiendas, productos, celulares, agregarTienda, actualizarTienda, eliminarTienda } =
    useDatos();
  const [nombre, setNombre] = useState("");
  const [operador, setOperador] = useState("Bitel");
  const [error, setError] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [operadorEditado, setOperadorEditado] = useState("Bitel");

  function crear(evento) {
    evento.preventDefault();
    const resultado = agregarTienda({ nombre, operador });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError("");
    setNombre("");
  }

  function guardarEdicion(id) {
    const resultado = actualizarTienda(id, { nombre: nombreEditado, operador: operadorEditado });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError("");
    setEditandoId(null);
  }

  function eliminar(id, titulo) {
    if (!window.confirm(`¿Eliminar la tienda "${titulo}"?`)) return;
    const resultado = eliminarTienda(id);
    setError(resultado.ok ? "" : resultado.error);
  }

  return (
    <>
      <form className="tarjeta mb-2" onSubmit={crear}>
        <div className="tarjeta-cuerpo">
          {error && <div className="alerta alerta-error mb-2">{error}</div>}
          <div className="barra-filtros">
            <input
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la nueva tienda (ej. Bitel Ayacucho)"
              required
            />
            <select
              className="select"
              value={operador}
              onChange={(e) => setOperador(e.target.value)}
              aria-label="Operador de la nueva tienda"
            >
              {OPERADORES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <button type="submit" className="btn" style={{ flex: "0 0 auto" }}>
              Agregar tienda
            </button>
          </div>
        </div>
      </form>

      <div className="tarjeta">
        <div className="lista">
          {tiendas.map((tienda) => {
            const propios = productos.filter((p) => p.tiendaId === tienda.id);
            const celularesTienda = celulares.filter((c) => c.tienda === tienda.nombre);
            const valor = propios
              .filter((p) => esMercancia(p.grupo))
              .reduce((s, p) => s + p.stock * p.costo, 0);
            const editando = editandoId === tienda.id;

            return (
              <div className="fila" key={tienda.id}>
                <div className="fila-principal">
                  {editando ? (
                    <div className="tienda-edicion">
                      <input
                        className="input"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        autoFocus
                      />
                      <select
                        className="select"
                        value={operadorEditado}
                        onChange={(e) => setOperadorEditado(e.target.value)}
                        aria-label="Operador de la tienda"
                      >
                        {OPERADORES.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-chico"
                        onClick={() => guardarEdicion(tienda.id)}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        className="btn btn-secundario btn-chico"
                        onClick={() => setEditandoId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <span className="fila-titulo tienda-titulo">
                      {tienda.nombre}
                      <span className={tienda.operador === "Claro" ? "chip chip-info" : "chip chip-brand"}>
                        {tienda.operador}
                      </span>
                    </span>
                  )}

                  {!editando && (
                    <span style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-chico"
                        onClick={() => {
                          setEditandoId(tienda.id);
                          setNombreEditado(tienda.nombre);
                          setOperadorEditado(tienda.operador || "Bitel");
                          setError("");
                        }}
                        aria-label={`Editar ${tienda.nombre}`}
                      >
                        <IconoEditar />
                      </button>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-chico"
                        onClick={() => eliminar(tienda.id, tienda.nombre)}
                        aria-label={`Eliminar ${tienda.nombre}`}
                      >
                        <IconoPapelera />
                      </button>
                    </span>
                  )}
                </div>

                <div className="fila-meta">
                  <span>{formatNumero(propios.length)} productos</span>
                  <span>{formatNumero(celularesTienda.length)} celulares</span>
                  <span>{formatSoles(valor)} de mercadería</span>
                  <span className={tienda.activa ? "chip chip-ok" : "chip chip-muted"}>
                    {tienda.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            );
          })}
          {tiendas.length === 0 && <div className="vacio">Aún no hay tiendas.</div>}
        </div>
      </div>
    </>
  );
}
