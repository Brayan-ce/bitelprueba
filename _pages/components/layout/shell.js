"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDatos } from "../datos/proveedor";
import {
  IconoCelular,
  IconoEscanear,
  IconoInicio,
  IconoInventario,
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
  { href: "/inventario", etiqueta: "Inventario", icono: IconoInventario },
  { href: "/celulares", etiqueta: "Celulares", icono: IconoCelular },
  { href: "/escanear", etiqueta: "Escanear", icono: IconoEscanear },
  { href: "/movimientos", etiqueta: "Movimientos", icono: IconoMovimientos },
];

const ADMINISTRACION = [
  { href: "/tiendas", etiqueta: "Tiendas", icono: IconoTienda },
  { href: "/usuarios", etiqueta: "Usuarios", icono: IconoUsuarios },
  { href: "/reportes", etiqueta: "Reportes", icono: IconoReportes },
];

const INFERIOR = [
  { href: "/", etiqueta: "Inicio", icono: IconoInicio },
  { href: "/inventario", etiqueta: "Inventario", icono: IconoInventario },
  { href: "/escanear", etiqueta: "Escanear", icono: IconoEscanear, especial: true },
  { href: "/movimientos", etiqueta: "Movimientos", icono: IconoMovimientos },
];

const SECCIONES = [
  { href: "/inventario", etiqueta: "Inventario" },
  { href: "/celulares", etiqueta: "Celulares" },
  { href: "/escanear", etiqueta: "Escáner" },
  { href: "/movimientos", etiqueta: "Movimientos" },
  { href: "/tiendas", etiqueta: "Tiendas" },
  { href: "/usuarios", etiqueta: "Usuarios" },
  { href: "/reportes", etiqueta: "Reportes" },
];

function activo(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function seccionActual(pathname) {
  const encontrada = SECCIONES.find(
    (seccion) => pathname === seccion.href || pathname.startsWith(`${seccion.href}/`)
  );
  return encontrada ? encontrada.etiqueta : "Inicio";
}

function SelectorUsuario({ usuario, usuarios, onChange, id }) {
  return (
    <select
      id={id}
      className="select"
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
    function alCambiarAlmacen(evento) {
      if (evento.key !== "inventario:tema") return;
      if (evento.newValue !== "claro" && evento.newValue !== "oscuro") return;
      setTema(evento.newValue);
      document.documentElement.setAttribute("data-tema", evento.newValue);
    }
    window.addEventListener("storage", alCambiarAlmacen);
    return () => window.removeEventListener("storage", alCambiarAlmacen);
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

  function aplicarTema(siguiente) {
    setTema(siguiente);
    document.documentElement.setAttribute("data-tema", siguiente);
    try {
      window.localStorage.setItem("inventario:tema", siguiente);
    } catch {
      /* sin almacenamiento: el tema igual se aplica en esta sesión */
    }
  }

  const inicial = usuario ? usuario.trim().charAt(0).toUpperCase() : "·";

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

        <Link href="/" className="marca" aria-label="Pastrana · Inicio">
          <span className="marca-texto">
            <strong>Pastrana</strong>
            <span className="marca-sub">Bitel y Claro</span>
          </span>
        </Link>

        <div className="migaja">
          <span className="migaja-marca">Pastrana S.A.C.</span>
          <span className="migaja-sep">/</span>
          <span className="migaja-actual">{seccionActual(pathname)}</span>
        </div>

        <div className="header-derecha">
          <div className="header-pc">
            <div className="usuario-pill">
              <span className="usuario-avatar" aria-hidden="true">
                {inicial}
              </span>
              <SelectorUsuario
                usuario={usuario}
                usuarios={usuarios}
                onChange={cambiarUsuario}
              />
            </div>
          </div>
          <div className="tema-toggle" role="group" aria-label="Tema de la interfaz">
            <button
              type="button"
              className="tema-opcion tema-opcion-oscuro"
              onClick={() => aplicarTema("oscuro")}
              aria-pressed={tema === "oscuro"}
              title="Modo oscuro"
            >
              <IconoLuna />
              <span>Oscuro</span>
            </button>
            <button
              type="button"
              className="tema-opcion tema-opcion-claro"
              onClick={() => aplicarTema("claro")}
              aria-pressed={tema === "claro"}
              title="Modo claro"
            >
              <IconoSol />
              <span>Claro</span>
            </button>
          </div>
        </div>
      </header>

      <div className="cuerpo">
        <aside className="sidebar" aria-label="Navegación lateral">
          <p className="sidebar-titulo">Principal</p>
          <nav className="nav-lista">
            {PRINCIPALES.map(({ href, etiqueta, icono: Icono }) => (
              <Link key={href} href={href} className={activo(pathname, href) ? "activo" : ""}>
                <Icono />
                {etiqueta}
              </Link>
            ))}
          </nav>

          <p className="sidebar-titulo">Administración</p>
          <nav className="nav-lista">
            {ADMINISTRACION.map(({ href, etiqueta, icono: Icono }) => (
              <Link key={href} href={href} className={activo(pathname, href) ? "activo" : ""}>
                <Icono />
                {etiqueta}
              </Link>
            ))}
          </nav>

          <div className="sidebar-pie">
            <span>Pastrana S.A.C. · Bitel y Claro</span>
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

          <p className="texto-muted texto-chico">Pastrana S.A.C. · Bitel y Claro</p>
        </div>
      </aside>
    </div>
  );
}
