"use client";

import { useState } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import { ROLES } from "@/lib/format";
import { IconoEditar, IconoPapelera } from "@/_pages/components/ui/iconos";

const INICIAL = { nombre: "", rol: "", tienda: "" };

export default function GestionUsuarios() {
  const { usuarios, tiendas, agregarUsuario, actualizarUsuario, eliminarUsuario } = useDatos();
  const [datos, setDatos] = useState(INICIAL);
  const [error, setError] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState(INICIAL);

  function cambiar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  function crear(evento) {
    evento.preventDefault();
    const resultado = agregarUsuario(datos);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError("");
    setDatos(INICIAL);
  }

  function guardarEdicion(id) {
    const resultado = actualizarUsuario(id, editado);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError("");
    setEditandoId(null);
  }

  function eliminar(id, nombre) {
    if (!window.confirm(`¿Eliminar al usuario "${nombre}"?`)) return;
    const resultado = eliminarUsuario(id);
    setError(resultado.ok ? "" : resultado.error);
  }

  function claseRol(rol) {
    if (rol === "Administrador") return "chip chip-brand";
    if (rol === "Encargado") return "chip chip-info";
    return "chip chip-warn";
  }

  return (
    <>
      <form className="tarjeta mb-2" onSubmit={crear}>
        <div className="tarjeta-cuerpo">
          {error && <div className="alerta alerta-error mb-2">{error}</div>}
          <div className="formulario dos-columnas">
            <div className="campo">
              <label htmlFor="usuario-nombre">Nombre completo *</label>
              <input
                id="usuario-nombre"
                className="input"
                value={datos.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
                placeholder="Ej. Carlos Ramírez"
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="usuario-rol">Rol *</label>
              <select
                id="usuario-rol"
                className="select"
                value={datos.rol}
                onChange={(e) => cambiar("rol", e.target.value)}
                required
              >
                <option value="">Selecciona…</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="usuario-tienda">Tienda *</label>
              <select
                id="usuario-tienda"
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
            <div className="campo" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="btn">
                Agregar usuario
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="tarjeta">
        <div className="lista">
          {usuarios.map((u) => {
            const editando = editandoId === u.id;
            return (
              <div className="fila" key={u.id}>
                <div className="fila-principal">
                  {editando ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flex: 1,
                        flexWrap: "wrap",
                        minWidth: 240,
                      }}
                    >
                      <input
                        className="input"
                        style={{ flex: "1 1 160px" }}
                        value={editado.nombre}
                        onChange={(e) => setEditado({ ...editado, nombre: e.target.value })}
                        placeholder="Nombre"
                      />
                      <select
                        className="select"
                        style={{ flex: "1 1 130px" }}
                        value={editado.rol}
                        onChange={(e) => setEditado({ ...editado, rol: e.target.value })}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <select
                        className="select"
                        style={{ flex: "1 1 130px" }}
                        value={editado.tienda}
                        onChange={(e) => setEditado({ ...editado, tienda: e.target.value })}
                      >
                        {tiendas.map((t) => (
                          <option key={t.id} value={t.nombre}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-chico"
                        onClick={() => guardarEdicion(u.id)}
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
                    <span className="fila-titulo">{u.nombre}</span>
                  )}

                  {!editando && (
                    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span className={claseRol(u.rol)}>{u.rol}</span>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-chico"
                        onClick={() => {
                          setEditandoId(u.id);
                          setEditado({ nombre: u.nombre, rol: u.rol, tienda: u.tienda });
                          setError("");
                        }}
                        aria-label={`Editar ${u.nombre}`}
                      >
                        <IconoEditar />
                      </button>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-chico"
                        onClick={() => eliminar(u.id, u.nombre)}
                        aria-label={`Eliminar ${u.nombre}`}
                      >
                        <IconoPapelera />
                      </button>
                    </span>
                  )}
                </div>

                {!editando && (
                  <div className="fila-meta">
                    <span>Tienda: {u.tienda || "—"}</span>
                    <span className={u.activo ? "chip chip-ok" : "chip chip-muted"}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {usuarios.length === 0 && <div className="vacio">Aún no hay usuarios.</div>}
        </div>
      </div>
    </>
  );
}
