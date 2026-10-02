function diaAtras(cantidad) {
  const d = new Date();
  d.setDate(d.getDate() - cantidad);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const TIENDAS_DEMO = [
  { id: "t1", nombre: "Huancavelica", activa: true },
  { id: "t2", nombre: "Tienda 2", activa: true },
  { id: "t3", nombre: "Tienda 3", activa: true },
];

export const USUARIOS_DEMO = [
  { id: "u1", nombre: "Brayan Pastrana", rol: "Administrador", tienda: "Huancavelica", activo: true },
  { id: "u2", nombre: "María Flores", rol: "Encargado", tienda: "Huancavelica", activo: true },
  { id: "u3", nombre: "José Rojas", rol: "Vendedor", tienda: "Tienda 2", activo: true },
  { id: "u4", nombre: "Lucía Torres", rol: "Vendedor", tienda: "Tienda 3", activo: true },
];

export const CELULARES_DEMO = [
  {
    codigo: "CEL-0001", marca: "Samsung", modelo: "Galaxy A15", color: "Azul oscuro", memoria: "128 GB",
    imei1: "356789102345678", imei2: "356789102345692", costo: 480, precio_venta: 699,
    tienda: "Huancavelica", estado: "Disponible", creado_en: `${diaAtras(20)}T09:15:00`,
  },
  {
    codigo: "CEL-0002", marca: "Xiaomi", modelo: "Redmi Note 13", color: "Negro", memoria: "256 GB",
    imei1: "861234509876543", imei2: "861234509876567", costo: 620, precio_venta: 899,
    tienda: "Huancavelica", estado: "Disponible", creado_en: `${diaAtras(18)}T10:40:00`,
  },
  {
    codigo: "CEL-0003", marca: "Huawei", modelo: "Nova Y70", color: "Blanco", memoria: "128 GB",
    imei1: "869012345678901", imei2: "", costo: 430, precio_venta: 649,
    tienda: "Tienda 2", estado: "Disponible", creado_en: `${diaAtras(15)}T11:05:00`,
  },
  {
    codigo: "CEL-0004", marca: "Motorola", modelo: "Moto G04", color: "Verde", memoria: "64 GB",
    imei1: "354567890123456", imei2: "", costo: 320, precio_venta: 499,
    tienda: "Tienda 2", estado: "Vendido", creado_en: `${diaAtras(14)}T12:30:00`,
  },
  {
    codigo: "CEL-0005", marca: "Tecno", modelo: "Spark 20", color: "Dorado", memoria: "128 GB",
    imei1: "352345678901234", imei2: "", costo: 350, precio_venta: 549,
    tienda: "Tienda 3", estado: "Disponible", creado_en: `${diaAtras(12)}T09:50:00`,
  },
  {
    codigo: "CEL-0006", marca: "Samsung", modelo: "Galaxy A05", color: "Negro", memoria: "64 GB",
    imei1: "359876543210987", imei2: "", costo: 390, precio_venta: 599,
    tienda: "Huancavelica", estado: "En reparación", creado_en: `${diaAtras(10)}T15:20:00`,
  },
  {
    codigo: "CEL-0007", marca: "Xiaomi", modelo: "13C", color: "Azul", memoria: "128 GB",
    imei1: "867543210987654", imei2: "867543210987678", costo: 450, precio_venta: 679,
    tienda: "Tienda 3", estado: "Disponible", creado_en: `${diaAtras(8)}T16:10:00`,
  },
  {
    codigo: "CEL-0008", marca: "Honor", modelo: "X7b", color: "Gris", memoria: "256 GB",
    imei1: "865432109876543", imei2: "", costo: 560, precio_venta: 829,
    tienda: "Huancavelica", estado: "Vendido", creado_en: `${diaAtras(6)}T10:00:00`,
  },
  {
    codigo: "CEL-0009", marca: "Realme", modelo: "C67", color: "Negro", memoria: "128 GB",
    imei1: "351122334455667", imei2: "", costo: 470, precio_venta: 699,
    tienda: "Tienda 2", estado: "Disponible", creado_en: `${diaAtras(4)}T11:45:00`,
  },
  {
    codigo: "CEL-0010", marca: "Nokia", modelo: "C12", color: "Azul", memoria: "64 GB",
    imei1: "357788990011223", imei2: "", costo: 260, precio_venta: 399,
    tienda: "Tienda 3", estado: "Disponible", creado_en: `${diaAtras(2)}T17:30:00`,
  },
];

export const MOVIMIENTOS_DEMO = [
  { id: "m1", imei: "356789102345678", tipo: "entrada", tienda_origen: "", tienda_destino: "Huancavelica", usuario: "Brayan Pastrana", fecha: diaAtras(20), hora: "09:20:15", detalle: "Ingreso de mercadería" },
  { id: "m2", imei: "861234509876543", tipo: "entrada", tienda_origen: "", tienda_destino: "Huancavelica", usuario: "María Flores", fecha: diaAtras(18), hora: "10:45:02", detalle: "" },
  { id: "m3", imei: "869012345678901", tipo: "entrada", tienda_origen: "", tienda_destino: "Tienda 2", usuario: "José Rojas", fecha: diaAtras(15), hora: "11:10:44", detalle: "" },
  { id: "m4", imei: "354567890123456", tipo: "entrada", tienda_origen: "", tienda_destino: "Tienda 2", usuario: "José Rojas", fecha: diaAtras(14), hora: "12:35:10", detalle: "" },
  { id: "m5", imei: "354567890123456", tipo: "salida", tienda_origen: "Tienda 2", tienda_destino: "", usuario: "José Rojas", fecha: diaAtras(5), hora: "16:02:31", detalle: "Venta al cliente" },
  { id: "m6", imei: "867543210987654", tipo: "traslado", tienda_origen: "Huancavelica", tienda_destino: "Tienda 3", usuario: "Brayan Pastrana", fecha: diaAtras(4), hora: "09:40:12", detalle: "Reposición de stock" },
  { id: "m7", imei: "865432109876543", tipo: "salida", tienda_origen: "Huancavelica", tienda_destino: "", usuario: "María Flores", fecha: diaAtras(1), hora: "17:25:00", detalle: "Venta en mostrador" },
  { id: "m8", imei: "357788990011223", tipo: "entrada", tienda_origen: "", tienda_destino: "Tienda 2", usuario: "José Rojas", fecha: diaAtras(2), hora: "17:35:20", detalle: "" },
];

export const ROTULO_DATOS_DEMO = "Datos de demostración (en memoria)";
