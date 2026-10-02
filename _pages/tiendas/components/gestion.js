"use client";

import { useState } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import { formatNumero } from "@/lib/format";
import { IconoEditar, IconoPapelera } from "@/_pages/components/ui/iconos";

export default function GestionTiendas() {
  const { tiendas, celulares, agregarTienda, actualizarTienda, eliminarTienda } = useDatos();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");

  function crear(evento) {
    evento.preventDefault();
    const resultado = agregarTienda({ nombre });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError("");
    setNombre("");
  }

  function guardarEdicion(id) {
    const resultado = actualizarTienda(id, { nombre: nombreEditado });
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
              placeholder="Nombre de la nueva tienda (ej. Ayacucho)"
              required
            />
            <button type="submit" className="btn" style={{ flex: "0 0 auto" }}>
              Agregar tienda
            </button>
          </div>
        </div>
      </form>

      <div className="tarjeta">
        <div className="lista">
          {tiendas.map((tienda) => {
            const propios = celulares.filter((c) => c.tienda === tienda.nombre);
            const disponibles = propios.filter((c) => c.estado === "Disponible").length;
            const vendidos = propios.filter((c) => c.estado === "Vendido").length;
            const editando = editandoId === tienda.id;

            return (
              <div className="fila" key={tienda.id}>
                <div className="fila-principal">
                  {editando ? (
                    <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 200 }}>
                      <input
                        className="input"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        autoFocus
                      />
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
                    <span className="fila-titulo">{tienda.nombre}</span>
                  )}

                  {!editando && (
                    <span style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-chico"
                        onClick={() => {
                          setEditandoId(tienda.id);
                          setNombreEditado(tienda.nombre);
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
                  <span>{formatNumero(propios.length)} celulares</span>
                  <span>{disponibles} disponibles</span>
                  <span>{vendidos} vendidos</span>
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
