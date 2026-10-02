import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

const FORMATOS = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
];

export function crearLector() {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATOS);
  return new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 300 });
}

export function describirError(error) {
  const nombre = error && error.name;
  if (nombre === "NotAllowedError" || nombre === "SecurityError")
    return "El navegador no tiene permiso para usar la cámara. Permite el acceso y vuelve a intentar.";
  if (nombre === "NotFoundError") return "No se encontró ninguna cámara en este dispositivo.";
  if (nombre === "NotReadableError")
    return "La cámara está siendo usada por otra aplicación.";
  return error && error.message
    ? `No se pudo iniciar la cámara: ${error.message}`
    : "No se pudo iniciar la cámara.";
}

export async function decodificarImagen(archivo) {
  const url = URL.createObjectURL(archivo);
  try {
    const imagen = new Image();
    imagen.src = url;
    await imagen.decode();

    const MAXIMO = 1600;
    const ancho = imagen.naturalWidth || imagen.width;
    const alto = imagen.naturalHeight || imagen.height;
    const escala = Math.min(1, MAXIMO / Math.max(ancho, alto));

    const lienzo = document.createElement("canvas");
    lienzo.width = Math.max(1, Math.round(ancho * escala));
    lienzo.height = Math.max(1, Math.round(alto * escala));
    const contexto = lienzo.getContext("2d", { willReadFrequently: true });
    contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

    const lector = crearLector();
    try {
      const resultado = lector.decodeFromCanvas(lienzo);
      return resultado ? resultado.getText() : null;
    } catch {
      return null;
    }
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
