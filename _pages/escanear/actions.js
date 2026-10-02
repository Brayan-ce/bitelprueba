"use server";

import { esImeiValido, extraerImei } from "@/lib/format";

function digitoControl(imei14) {
  let suma = 0;
  for (let i = 0; i < imei14.length; i++) {
    let digito = Number(imei14[i]);
    if (i % 2 === 1) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
  }
  return (10 - (suma % 10)) % 10;
}

export async function validarImei(texto) {
  const imei = extraerImei(texto);
  if (!esImeiValido(imei)) {
    return { ok: false, error: "No se reconoció un IMEI válido (15 dígitos)." };
  }
  const checksum = digitoControl(imei.slice(0, 14)) === Number(imei[14]);
  return { ok: true, imei, checksum };
}
