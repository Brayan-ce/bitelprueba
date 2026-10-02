"use client";

import GestionUsuarios from "./components/gestion";

export default function UsuariosPage() {
  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Usuarios</h1>
          <p className="subtitulo">Roles: Administrador, Encargado y Vendedor</p>
        </div>
      </div>

      <GestionUsuarios />
    </>
  );
}
