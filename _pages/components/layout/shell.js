"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDatos } from "../datos/proveedor";
import {
  IconoCelular,
  IconoEscanear,
  IconoInicio,
  IconoLuna,
  IconoMenu,
  IconoMovimientos,
  IconoReportes,
  IconoSol,
  IconoTienda,
  IconoUsuarios,
  IconoX,
} from "../ui/iconos";

const PRINCIPALES = [
  { href: "/", etiqueta: "Inicio", icono: IconoInicio },
  { href: "/celulares", etiqueta: "Celulares", icono: IconoCelular },
  { href: "/escanear", etiqueta: "Escanear", icono: IconoEscanear },
  { href: "/movimientos", etiqueta: "Movimientos", icono: IconoMovimientos },
];

const ADMINISTRACION = [
  { href: "/tiendas", etiqueta: "Tiendas", icono: IconoTienda },
  { href: "/usuarios", etiqueta: "Usuarios", icono: IconoUsuarios },
  { href: "/reportes", etiqueta: "Reportes", icono: IconoReportes },
];

const TODO = [...PRINCIPALES, ...ADMINISTRACION];

const INFERIOR = [
  { href: "/", etiqueta: "Inicio", icono: IconoInicio },
  { href: "/celulares", etiqueta: "Celulares", icono: IconoCelular },
  { href: "/escanear", etiqueta: "Escanear", icono: IconoEscanear, especial: true },
  { href: "/movimientos", etiqueta: "Movimientos", icono: IconoMovimientos },
];

function activo(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Marca() {
  return (
    <div className="marca">
      <span className="marca-logo">b</span>
      <span className="marca-texto">
        bitel <span>inventario</span>
        <span className="marca-sub">Pastrana · Huancavelica</span>
      </span>
    </div>
  );
}

function SelectorUsuario({ usuario, usuarios, onChange, id }) {
  return (
    <select
      id={id}
      className="select header-usuario"
      value={usuario}
      onChange={onChange}
      aria-label="Usuario activo"
    >
      <option value="">Selecciona…</option>
      {usuarios.map((u) => (
        <option key={u.id} value={u.nombre}>
          {u.nombre}
        </option>
      ))}
    </select>
  );
}

export default function Shell({ children }) {
  const pathname = usePathname();
  const { usuarios } = useDatos();
  const [usuario, setUsuario] = useState("");
  const [tema, setTema] = useState("claro");
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!usuarios.length) return;
    const guardado = window.localStorage.getItem("inventario:usuario");
    const coincide = usuarios.find((u) => u.nombre === guardado);
    const actual = coincide ? coincide.nombre : usuarios[0].nombre;
    setUsuario(actual);
    window.localStorage.setItem("inventario:usuario", actual);
  }, [usuarios]);

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-tema") || "claro";
    setTema(actual);
  }, []);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawer) return;
    document.body.style.overflow = "hidden";
    function alTeclar(evento) {
      if (evento.key === "Escape") setDrawer(false);
    }
    window.addEventListener("keydown", alTeclar);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", alTeclar);
    };
  }, [drawer]);

  function cambiarUsuario(evento) {
    const valor = evento.target.value;
    setUsuario(valor);
    window.localStorage.setItem("inventario:usuario", valor);
  }

  function cambiarTema() {
    const siguiente = tema === "oscuro" ? "claro" : "oscuro";
    setTema(siguiente);
    document.documentElement.setAttribute("data-tema", siguiente);
    try {
      window.localStorage.setItem("inventario:tema", siguiente);
    } catch {
      setTema(siguiente);
    }
  }

  const IconoTema = tema === "oscuro" ? IconoSol : IconoLuna;
  const textoTema = tema === "oscuro" ? "Modo claro" : "Modo oscuro";

  return (
    <div className="app">
      <header className="header">
        <button
          type="button"
          className="icon-btn menu-hamburguesa"
          onClick={() => setDrawer(true)}
          aria-label="Abrir menú"
        >
          <IconoMenu />
        </button>

        <Link href="/" aria-label="Inicio">
          <Marca />
        </Link>

        <div className="header-derecha">
          <div className="header-pc">
            <SelectorUsuario
              usuario={usuario}
              usuarios={usuarios}
              onChange={cambiarUsuario}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={cambiarTema}
              aria-label={textoTema}
              title={textoTema}
            >
              <IconoTema />
            </button>
          </div>
        </div>
      </header>

      <div className="cuerpo">
        <aside className="sidebar" aria-label="Navegación lateral">
          <p className="sidebar-titulo">Navegación</p>
          <nav className="nav-lista">
            {TODO.map(({ href, etiqueta, icono: Icono }) => (
              <Link key={href} href={href} className={activo(pathname, href) ? "activo" : ""}>
                <Icono />
                {etiqueta}
              </Link>
            ))}
          </nav>
          <div className="sidebar-pie">
            Inventario Pastrana
            <span>Datos de demostración</span>
          </div>
        </aside>

        <main className="contenido">{children}</main>
      </div>

      <nav className="bottomnav" aria-label="Navegación rápida">
        {INFERIOR.map(({ href, etiqueta, icono: Icono, especial }) => {
          const clase = [activo(pathname, href) ? "activo" : "", especial ? "escanear-item" : ""]
            .filter(Boolean)
            .join(" ");
          return (
            <Link key={href} href={href} className={clase}>
              {especial ? (
                <span className="nav-boton">
                  <Icono />
                </span>
              ) : (
                <Icono />
              )}
              <span>{etiqueta}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className={`drawer-overlay${drawer ? " visible" : ""}`}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />

      <aside
        className={`drawer${drawer ? " abierto" : ""}`}
        aria-label="Menú de navegación"
        ref={drawerRef}
        inert={!drawer}
      >
        <div className="drawer-cabeza">
          <strong className="drawer-titulo-head">Menú</strong>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDrawer(false)}
            aria-label="Cerrar menú"
          >
            <IconoX />
          </button>
        </div>

        <div className="drawer-grupo">
          <p className="drawer-titulo">Principal</p>
          {PRINCIPALES.map(({ href, etiqueta, icono: Icono }) => (
            <Link key={href} href={href} className={activo(pathname, href) ? "activo" : ""}>
              <Icono />
              {etiqueta}
            </Link>
          ))}
        </div>

        <div className="drawer-grupo">
          <p className="drawer-titulo">Administración</p>
          {ADMINISTRACION.map(({ href, etiqueta, icono: Icono }) => (
            <Link key={href} href={href} className={activo(pathname, href) ? "activo" : ""}>
              <Icono />
              {etiqueta}
            </Link>
          ))}
        </div>

        <div className="drawer-pie">
          <div className="campo">
            <label htmlFor="usuario-drawer">Usuario activo</label>
            <select
              id="usuario-drawer"
              className="select"
              value={usuario}
              onChange={cambiarUsuario}
            >
              <option value="">Selecciona…</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.nombre}>
                  {u.nombre} · {u.rol}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="btn btn-secundario btn-block" onClick={cambiarTema}>
            <IconoTema />
            {textoTema}
          </button>

          <p className="texto-muted texto-chico">Inventario Pastrana · datos de demostración</p>
        </div>
      </aside>
    </div>
  );
}
