"use client";

import { createContext, useContext, useState } from "react";
import {
  CELULARES_DEMO,
  MOVIMIENTOS_DEMO,
  TIENDAS_DEMO,
  USUARIOS_DEMO,
} from "@/lib/datos-demo";
import {
  ESTADOS,
  TIPOS_MOVIMIENTO,
  esImeiValido,
  extraerImei,
  fechaLima,
  horaLima,
  soloDigitos,
} from "@/lib/format";

const ContextoDatos = createContext(null);

function nuevoId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function fallo(mensaje) {
  return { ok: false, error: mensaje };
}

function limpiarCelular(datos) {
  return {
    codigo: String(datos.codigo || "").trim().toUpperCase(),
    marca: String(datos.marca || "").trim(),
    modelo: String(datos.modelo || "").trim(),
    color: String(datos.color || "").trim(),
    memoria: String(datos.memoria || "").trim(),
    imei1: soloDigitos(datos.imei1),
    imei2: soloDigitos(datos.imei2),
    costo: Number(datos.costo) || 0,
    precio_venta: Number(datos.precio_venta) || 0,
    tienda: String(datos.tienda || "").trim(),
    estado: datos.estado || "Disponible",
  };
}

function validarCelular(datos) {
  if (!String(datos.marca || "").trim()) return "La marca es obligatoria.";
  if (!String(datos.modelo || "").trim()) return "El modelo es obligatorio.";
  if (!esImeiValido(datos.imei1)) return "El IMEI 1 debe tener 15 dígitos.";
  const imei2 = soloDigitos(datos.imei2);
  if (imei2 && !esImeiValido(imei2)) return "El IMEI 2 debe tener 15 dígitos.";
  if (imei2 && imei2 === soloDigitos(datos.imei1))
    return "El IMEI 2 no puede ser igual al IMEI 1.";
  if (!String(datos.tienda || "").trim()) return "Selecciona la tienda.";
  if (!ESTADOS.includes(datos.estado)) return "Estado no válido.";
  if (Number(datos.costo) < 0 || Number(datos.precio_venta) < 0)
    return "El costo y el precio no pueden ser negativos.";
  return null;
}

function aplicarMovimiento(celular, tipo, destino) {
  if (tipo === "entrada") return { ...celular, tienda: destino, estado: "Disponible" };
  if (tipo === "salida") return { ...celular, estado: "Vendido" };
  return { ...celular, tienda: destino };
}

export function ProveedorDatos({ children }) {
  const [tiendas, setTiendas] = useState(TIENDAS_DEMO);
  const [usuarios, setUsuarios] = useState(USUARIOS_DEMO);
  const [celulares, setCelulares] = useState(CELULARES_DEMO);
  const [movimientos, setMovimientos] = useState(MOVIMIENTOS_DEMO);

  function buscarPorImei(imei) {
    const valor = String(imei || "").trim();
    if (!valor) return null;
    return (
      celulares.find((c) => c.imei1 === valor || (c.imei2 && c.imei2 === valor)) || null
    );
  }

  function siguienteCodigo() {
    let maximo = 0;
    for (const celular of celulares) {
      const coincidencia = String(celular.codigo || "").match(/(\d+)$/);
      if (coincidencia) maximo = Math.max(maximo, Number(coincidencia[1]));
    }
    return `CEL-${String(maximo + 1).padStart(4, "0")}`;
  }

  function agregarCelular(datos) {
    const problema = validarCelular(datos);
    if (problema) return fallo(problema);

    const registro = limpiarCelular(datos);
    if (!registro.codigo) registro.codigo = siguienteCodigo();

    if (celulares.some((c) => c.codigo === registro.codigo))
      return fallo(`El código ${registro.codigo} ya está en uso.`);
    if (buscarPorImei(registro.imei1))
      return fallo(`El IMEI ${registro.imei1} ya está registrado.`);
    if (registro.imei2 && buscarPorImei(registro.imei2))
      return fallo(`El IMEI ${registro.imei2} ya está registrado.`);

    registro.creado_en = new Date().toISOString();
    setCelulares((prev) => [...prev, registro]);
    return { ok: true, codigo: registro.codigo };
  }

  function actualizarCelular(codigo, datos) {
    const problema = validarCelular(datos);
    if (problema) return fallo(problema);

    const registro = limpiarCelular(datos);
    if (!registro.codigo) registro.codigo = String(codigo).toUpperCase();

    if (celulares.some((c) => c.codigo === registro.codigo && c.codigo !== codigo))
      return fallo(`El código ${registro.codigo} ya está en uso.`);
    const porImei1 = buscarPorImei(registro.imei1);
    if (porImei1 && porImei1.codigo !== codigo)
      return fallo(`El IMEI ${registro.imei1} ya está en otro celular.`);
    if (registro.imei2) {
      const porImei2 = buscarPorImei(registro.imei2);
      if (porImei2 && porImei2.codigo !== codigo)
        return fallo(`El IMEI ${registro.imei2} ya está en otro celular.`);
    }

    setCelulares((prev) =>
      prev.map((c) =>
        c.codigo === codigo ? { ...c, ...registro, creado_en: c.creado_en } : c
      )
    );
    return { ok: true, codigo: registro.codigo };
  }

  function eliminarCelular(codigo) {
    setCelulares((prev) => prev.filter((c) => c.codigo !== codigo));
    return { ok: true };
  }

  function agregarMovimiento(datos) {
    const tipo = datos.tipo;
    if (!TIPOS_MOVIMIENTO.includes(tipo)) return fallo("Tipo de movimiento no válido.");

    const imei = extraerImei(datos.imei);
    if (!esImeiValido(imei)) return fallo("El IMEI debe tener 15 dígitos.");

    const usuario = String(datos.usuario || "").trim();
    if (!usuario) return fallo("Selecciona el usuario responsable.");

    const tiendaOrigen = String(datos.tienda_origen || "").trim();
    const tiendaDestino = String(datos.tienda_destino || "").trim();
    const detalle = String(datos.detalle || "").trim();

    if (tipo === "entrada" && !tiendaDestino)
      return fallo("Selecciona la tienda de destino.");
    if (tipo === "salida") {
      if (!tiendaOrigen) return fallo("Selecciona la tienda de origen.");
      if (!detalle) return fallo("Indica el motivo de la salida (venta, etc.).");
    }
    if (tipo === "traslado") {
      if (!tiendaOrigen || !tiendaDestino)
        return fallo("Selecciona la tienda de origen y la de destino.");
      if (tiendaOrigen === tiendaDestino)
        return fallo("La tienda de origen y destino no pueden ser la misma.");
    }

    const celular = buscarPorImei(imei);
    if (!celular) return fallo(`El IMEI ${imei} no está en el inventario.`);

    if ((tipo === "salida" || tipo === "traslado") && celular.tienda !== tiendaOrigen)
      return fallo(
        `El celular está en "${celular.tienda || "sin tienda"}", no en "${tiendaOrigen}".`
      );
    if (tipo === "salida" && celular.estado === "Baja")
      return fallo("El celular está dado de baja.");

    const movimiento = {
      id: nuevoId(),
      imei,
      tipo,
      tienda_origen: tipo === "entrada" ? "" : tiendaOrigen,
      tienda_destino: tipo === "salida" ? "" : tiendaDestino,
      usuario,
      fecha: fechaLima(),
      hora: horaLima(),
      detalle,
    };

    setMovimientos((prev) => [movimiento, ...prev]);
    setCelulares((prev) =>
      prev.map((c) =>
        c.codigo === celular.codigo ? aplicarMovimiento(c, tipo, tiendaDestino) : c
      )
    );
    return { ok: true, codigo: celular.codigo };
  }

  function agregarTienda(datos) {
    const nombre = String(datos.nombre || "").trim();
    if (!nombre) return fallo("El nombre de la tienda es obligatorio.");
    if (tiendas.some((t) => t.nombre.toLowerCase() === nombre.toLowerCase()))
      return fallo(`Ya existe la tienda "${nombre}".`);
    setTiendas((prev) => [...prev, { id: nuevoId(), nombre, activa: datos.activa !== false }]);
    return { ok: true };
  }

  function actualizarTienda(id, datos) {
    const nombre = String(datos.nombre || "").trim();
    if (!nombre) return fallo("El nombre de la tienda es obligatorio.");
    if (tiendas.some((t) => t.id !== id && t.nombre.toLowerCase() === nombre.toLowerCase()))
      return fallo(`Ya existe la tienda "${nombre}".`);
    setTiendas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, nombre, activa: datos.activa !== false } : t
      )
    );
    return { ok: true };
  }

  function eliminarTienda(id) {
    const tienda = tiendas.find((t) => t.id === id);
    const enUso = celulares.filter((c) => tienda && c.tienda === tienda.nombre);
    if (enUso.length)
      return fallo(`No se puede eliminar: hay ${enUso.length} celular(es) en esa tienda.`);
    setTiendas((prev) => prev.filter((t) => t.id !== id));
    return { ok: true };
  }

  function agregarUsuario(datos) {
    const nombre = String(datos.nombre || "").trim();
    if (!nombre) return fallo("El nombre es obligatorio.");
    if (!datos.rol) return fallo("Selecciona un rol.");
    if (!String(datos.tienda || "").trim()) return fallo("Selecciona la tienda.");
    if (usuarios.some((u) => u.nombre.toLowerCase() === nombre.toLowerCase()))
      return fallo(`Ya existe un usuario con el nombre "${nombre}".`);
    setUsuarios((prev) => [
      ...prev,
      { id: nuevoId(), nombre, rol: datos.rol, tienda: datos.tienda, activo: true },
    ]);
    return { ok: true };
  }

  function actualizarUsuario(id, datos) {
    const nombre = String(datos.nombre || "").trim();
    if (!nombre) return fallo("El nombre es obligatorio.");
    if (!datos.rol) return fallo("Selecciona un rol.");
    if (!String(datos.tienda || "").trim()) return fallo("Selecciona la tienda.");
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, nombre, rol: datos.rol, tienda: datos.tienda } : u
      )
    );
    return { ok: true };
  }

  function eliminarUsuario(id) {
    const objetivo = usuarios.find((u) => u.id === id);
    const admins = usuarios.filter((u) => u.rol === "Administrador" && u.activo && u.id !== id);
    if (objetivo?.rol === "Administrador" && admins.length === 0)
      return fallo("No se puede eliminar el único administrador.");
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    return { ok: true };
  }

  const valor = {
    tiendas,
    usuarios,
    celulares,
    movimientos,
    buscarPorImei,
    siguienteCodigo,
    agregarCelular,
    actualizarCelular,
    eliminarCelular,
    agregarMovimiento,
    agregarTienda,
    actualizarTienda,
    eliminarTienda,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
  };

  return <ContextoDatos.Provider value={valor}>{children}</ContextoDatos.Provider>;
}

export function useDatos() {
  const contexto = useContext(ContextoDatos);
  if (!contexto)
    throw new Error("useDatos debe usarse dentro de <ProveedorDatos>");
  return contexto;
}
