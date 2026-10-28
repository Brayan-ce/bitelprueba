import {
  CORTE_REGISTRO,
  PRODUCTOS_REGISTRO,
  TIENDAS_REGISTRO,
} from "./inventario";

/* =========================================================
   Datos de trabajo de la app.
   El inventario (tiendas, productos y celulares) sale del
   registro real del cliente (excels/). Usuarios, series y
   movimientos iniciales viven aquí.
   ========================================================= */

export const TIENDAS_DEMO = TIENDAS_REGISTRO;

export const USUARIOS_DEMO = [
  { id: "u1", nombre: "Brayan Pastrana", rol: "Administrador", tienda: "Bitel Lircay", activo: true },
  { id: "u2", nombre: "Miriam Quispe", rol: "Encargado", tienda: "Bitel Ascensión", activo: true },
  { id: "u3", nombre: "José Rojas", rol: "Encargado", tienda: "Bitel Virrey", activo: true },
  { id: "u4", nombre: "Rosa Huamán", rol: "Vendedor", tienda: "Bitel Manchego", activo: true },
  { id: "u5", nombre: "Luis Torres", rol: "Encargado", tienda: "Claro Lircay", activo: true },
  { id: "u6", nombre: "Ana Paucar", rol: "Vendedor", tienda: "Claro Paucará", activo: true },
  { id: "u7", nombre: "Lucía Torres", rol: "Vendedor", tienda: "Claro Manchego", activo: true },
  { id: "u8", nombre: "Pedro Soto", rol: "Vendedor", tienda: "Claro Virrey Toledo", activo: true },
];

/* Todo el registro: celulares, accesorios, chips y servicios. */
export const PRODUCTOS_DEMO = PRODUCTOS_REGISTRO;

/* Los celulares son los productos con IMEI. */
export const CELULARES_DEMO = PRODUCTOS_REGISTRO.filter((p) => p.imei).map((p, i) => ({
  codigo: `CEL-${String(i + 1).padStart(4, "0")}`,
  marca: p.marca,
  modelo: p.nombre,
  color: "",
  memoria: p.memoria,
  imei1: p.imei,
  imei2: "",
  costo: p.costo,
  precio_venta: p.precio,
  tienda: p.tienda,
  estado: "Disponible",
  creado_en: `${CORTE_REGISTRO}T08:00:00`,
  productoId: p.id,
}));

/* El Excel es una foto del stock: la entrada inicial se registra
   como movimiento de carga para dejar trazabilidad desde el día 1. */
function horaCarga(indice) {
  const minutos = 8 * 60 + (indice % 540);
  const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
  const mm = String(minutos % 60).padStart(2, "0");
  return `${hh}:${mm}:00`;
}

export const MOVIMIENTOS_DEMO = CELULARES_DEMO.map((celular, i) => ({
  id: `m${i + 1}`,
  imei: celular.imei1,
  tipo: "entrada",
  tienda_origen: "",
  tienda_destino: celular.tienda,
  usuario: "Brayan Pastrana",
  fecha: CORTE_REGISTRO,
  hora: horaCarga(i),
  detalle: "Saldo inicial importado del Excel",
}));

export const ROTULO_DATOS_DEMO = "Corte 25/10/2026";
