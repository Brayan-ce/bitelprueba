export const ESTADOS = ["Disponible", "Vendido", "En reparación", "Baja"];

export const TIPOS_MOVIMIENTO = ["entrada", "salida", "traslado"];

export const ROLES = ["Administrador", "Encargado", "Vendedor"];

const ZONA_LIMA = "America/Lima";

export function formatSoles(valor) {
  const numero = Number(valor) || 0;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(numero);
}

export function formatNumero(valor) {
  return new Intl.NumberFormat("es-PE").format(Number(valor) || 0);
}

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "set", "oct", "nov", "dic",
];

export function formatFecha(fecha) {
  if (!fecha) return "—";
  const partes = String(fecha).slice(0, 10).split("-");
  if (partes.length !== 3) return fecha;
  const [anio, mes, dia] = partes;
  return `${dia} ${MESES_CORTOS[Number(mes) - 1] || mes} ${anio}`;
}

export function formatFechaHoraMovimiento(fecha, hora) {
  if (!fecha) return "—";
  const horaCorta = String(hora || "").slice(0, 5);
  return horaCorta ? `${formatFecha(fecha)} · ${horaCorta}` : formatFecha(fecha);
}

export function formatFechaHora(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: ZONA_LIMA,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function fechaLima() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_LIMA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function horaLima() {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: ZONA_LIMA,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function diaSemana() {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: ZONA_LIMA,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function soloDigitos(texto) {
  return String(texto || "").replace(/\D+/g, "");
}

export function extraerImei(texto) {
  const digitos = soloDigitos(texto);
  const coincidencias = String(texto || "").match(/\d{15}/g);
  if (coincidencias && coincidencias.length) return coincidencias[0];
  if (digitos.length === 15) return digitos;
  if (digitos.length > 15) return digitos.slice(0, 15);
  return digitos;
}

export function esImeiValido(texto) {
  return /^\d{15}$/.test(soloDigitos(texto));
}

export function claseEstado(estado) {
  switch (estado) {
    case "Disponible":
      return "chip chip-ok";
    case "Vendido":
      return "chip chip-info";
    case "En reparación":
      return "chip chip-warn";
    case "Baja":
      return "chip chip-muted";
    default:
      return "chip";
  }
}

export function claseTipo(tipo) {
  switch (tipo) {
    case "entrada":
      return "chip chip-ok";
    case "salida":
      return "chip chip-danger";
    case "traslado":
      return "chip chip-info";
    default:
      return "chip";
  }
}

export function etiquetaTipo(tipo) {
  if (tipo === "entrada") return "Entrada";
  if (tipo === "salida") return "Salida";
  if (tipo === "traslado") return "Traslado";
  return tipo;
}
