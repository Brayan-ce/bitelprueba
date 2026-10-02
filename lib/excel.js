import { fechaLima } from "./format";

const BOM = "﻿";

function escapar(valor) {
  const texto = String(valor === null || valor === undefined ? "" : valor);
  if (/[";\n,]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

export function descargarCSV(nombreBase, encabezados, filas) {
  const lineas = [encabezados.map(escapar).join(",")];
  for (const fila of filas) lineas.push(fila.map(escapar).join(","));
  const contenido = BOM + lineas.join("\r\n") + "\r\n";
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombreBase}-${fechaLima()}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
