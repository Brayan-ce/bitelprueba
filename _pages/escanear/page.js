"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDatos } from "@/_pages/components/datos/proveedor";
import { horaLima, soloDigitos } from "@/lib/format";
import { validarImei } from "./actions";
import Camara from "./components/camara";
import { decodificarImagen } from "./components/lector";
import { IconoFoto, IconoTeclado } from "@/_pages/components/ui/iconos";

let contextoAudio = null;

function reproducirSonido(estado) {
  try {
    const Constructor = window.AudioContext || window.webkitAudioContext;
    if (!Constructor) return;
    if (!contextoAudio || contextoAudio.state === "closed") contextoAudio = new Constructor();
    if (contextoAudio.state === "suspended") contextoAudio.resume().catch(() => {});
    const frecuencias = estado === "OK" ? [880, 1318] : [420, 294];
    frecuencias.forEach((frecuencia, indice) => {
      const oscilador = contextoAudio.createOscillator();
      const ganancia = contextoAudio.createGain();
      oscilador.type = "sine";
      oscilador.frequency.value = frecuencia;
      const inicio = contextoAudio.currentTime + indice * 0.16;
      ganancia.gain.setValueAtTime(0.0001, inicio);
      ganancia.gain.exponentialRampToValueAtTime(0.22, inicio + 0.02);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.14);
      oscilador.connect(ganancia);
      ganancia.connect(contextoAudio.destination);
      oscilador.start(inicio);
      oscilador.stop(inicio + 0.16);
    });
  } catch {
    contextoAudio = null;
  }
}

const PESTANAS = [
  { id: "camara", etiqueta: "Cámara" },
  { id: "foto", etiqueta: "Foto" },
  { id: "lectora", etiqueta: "Lectora" },
];

export default function EscanearPage() {
  const { buscarPorImei } = useDatos();
  const [modo, setModo] = useState("camara");
  const [manual, setManual] = useState("");
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [fotoError, setFotoError] = useState("");
  const [leyendoFoto, setLeyendoFoto] = useState(false);
  const procesandoRef = useRef(false);
  const ultimaRef = useRef({ valor: "", tiempo: 0 });

  const procesar = useCallback(
    async (texto) => {
      const ahora = Date.now();
      const limpio = String(texto || "").trim();
      if (!limpio) return;
      if (procesandoRef.current) return;
      if (ultimaRef.current.valor === limpio && ahora - ultimaRef.current.tiempo < 2500) return;

      ultimaRef.current = { valor: limpio, tiempo: ahora };
      procesandoRef.current = true;
      setProcesando(true);

      try {
        const validacion = await validarImei(limpio);
        const hora = horaLima();
        let nuevo;
        if (!validacion.ok) {
          nuevo = { estado: "NOK", imei: limpio, motivo: validacion.error, hora };
        } else {
          const celular = buscarPorImei(validacion.imei);
          const coincide = celular
            ? celular.imei1 === validacion.imei
              ? "IMEI 1"
              : "IMEI 2"
            : "";
          nuevo = celular
            ? { estado: "OK", imei: validacion.imei, celular, coincide, hora }
            : {
                estado: "NOK",
                imei: validacion.imei,
                motivo: "El IMEI no está en el inventario.",
                hora,
              };
        }
        setResultado(nuevo);
        setHistorial((prev) =>
          [
            { id: `${ahora}-${nuevo.imei}`, imei: nuevo.imei, estado: nuevo.estado, hora },
            ...prev,
          ].slice(0, 12)
        );
        reproducirSonido(nuevo.estado);
        if (navigator.vibrate)
          navigator.vibrate(nuevo.estado === "OK" ? 120 : [90, 50, 90]);
      } catch {
        setResultado({
          estado: "NOK",
          imei: limpio,
          motivo: "No se pudo verificar el IMEI. Intenta de nuevo.",
          hora: horaLima(),
        });
      } finally {
        procesandoRef.current = false;
        setProcesando(false);
      }
    },
    [buscarPorImei]
  );

  useEffect(() => {
    let buffer = "";
    let ultimoTiempo = 0;

    function onKeyDown(evento) {
      const destino = evento.target;
      const enCampo =
        destino &&
        (destino.tagName === "INPUT" ||
          destino.tagName === "TEXTAREA" ||
          destino.tagName === "SELECT" ||
          destino.isContentEditable);
      if (enCampo) return;

      const ahora = Date.now();
      if (ahora - ultimoTiempo > 150) buffer = "";
      ultimoTiempo = ahora;

      if (evento.key === "Enter") {
        if (buffer.length >= 8) {
          evento.preventDefault();
          procesar(buffer);
        }
        buffer = "";
        return;
      }

      if (evento.key.length === 1) {
        buffer += evento.key;
        if (buffer.length === 15 && /^\d{15}$/.test(buffer)) {
          procesar(buffer);
          buffer = "";
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [procesar]);

  async function manejarFoto(evento) {
    const archivo = evento.target.files && evento.target.files[0];
    if (!archivo) return;
    setFotoError("");
    setLeyendoFoto(true);
    try {
      const texto = await decodificarImagen(archivo);
      if (!texto) {
        setFotoError(
          "No se reconoció ningún código en la foto. Da más luz, acerca el teléfono o usa la pestaña Lectora para escribir el IMEI."
        );
      } else {
        await procesar(texto);
      }
    } finally {
      setLeyendoFoto(false);
      evento.target.value = "";
    }
  }

  function enviarManual(evento) {
    evento.preventDefault();
    if (manual.trim().length >= 8) procesar(manual);
  }

  const alertaEstado =
    resultado && resultado.estado === "OK" && resultado.celular.estado !== "Disponible"
      ? `El celular figura como "${resultado.celular.estado}".`
      : null;

  const tituloModo =
    modo === "camara"
      ? "Escaneo con cámara"
      : modo === "foto"
        ? "Escaneo desde una foto"
        : "Lectora USB o escritura manual";

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1 className="titulo">Escanear IMEI</h1>
          <p className="subtitulo">El sistema responde con OK si está en inventario, NOK si no</p>
        </div>
        <Link href="/celulares" className="btn btn-secundario btn-chico">
          Ver inventario
        </Link>
      </div>

      <div className="pestanas">
        {PESTANAS.map((pestana) => (
          <button
            key={pestana.id}
            type="button"
            className={modo === pestana.id ? "activo" : ""}
            onClick={() => setModo(pestana.id)}
          >
            {pestana.etiqueta}
          </button>
        ))}
      </div>

      {resultado && (
        <div className="mb-2">
          <div
            className={`resultado ${resultado.estado === "OK" ? "resultado-ok" : "resultado-nok"}`}
            role="status"
          >
            <div className="resultado-estado">{resultado.estado}</div>
            <div className="resultado-imei mono">IMEI {resultado.imei}</div>

            {resultado.estado === "OK" ? (
              <div className="resultado-detalle">
                <div>
                  <span>Celular</span>
                  <span>
                    <strong>
                      {resultado.celular.marca} {resultado.celular.modelo}
                    </strong>
                  </span>
                </div>
                <div>
                  <span>Código</span>
                  <span className="mono">{resultado.celular.codigo}</span>
                </div>
                <div>
                  <span>Tienda</span>
                  <span>{resultado.celular.tienda || "Sin tienda"}</span>
                </div>
                <div>
                  <span>Estado</span>
                  <span>{resultado.celular.estado}</span>
                </div>
                <div>
                  <span>Coincide con</span>
                  <span>{resultado.coincide}</span>
                </div>
                <div>
                  <span>Hora</span>
                  <span>{resultado.hora}</span>
                </div>
              </div>
            ) : (
              <div className="resultado-detalle">
                <div>
                  <span>Motivo</span>
                  <span>{resultado.motivo}</span>
                </div>
                <div>
                  <span>Hora</span>
                  <span>{resultado.hora}</span>
                </div>
              </div>
            )}
          </div>

          {alertaEstado && <div className="alerta alerta-error mt-2">{alertaEstado}</div>}

          <div className="mt-2" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {resultado.estado === "OK" ? (
              <Link
                href={`/celulares/${resultado.celular.codigo}`}
                className="btn btn-secundario btn-chico"
              >
                Ver ficha del celular
              </Link>
            ) : (
              <Link href="/celulares/nuevo" className="btn btn-secundario btn-chico">
                Registrar este IMEI
              </Link>
            )}
            <button type="button" className="btn btn-chico" onClick={() => setResultado(null)}>
              Escanear otro
            </button>
          </div>
        </div>
      )}

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">{tituloModo}</h2>
            <span className="chip chip-brand">{procesando ? "Verificando…" : "Listo"}</span>
          </div>
          <div className="tarjeta-cuerpo">
            {modo === "camara" && <Camara onLectura={procesar} />}

            {modo === "foto" && (
              <div>
                <input
                  id="foto-imei"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={manejarFoto}
                />
                <label
                  htmlFor="foto-imei"
                  className="btn btn-block"
                  style={{
                    cursor: "pointer",
                    opacity: leyendoFoto ? 0.6 : 1,
                    pointerEvents: leyendoFoto ? "none" : "auto",
                  }}
                >
                  <IconoFoto />
                  {leyendoFoto ? "Leyendo la foto…" : "Tomar o subir foto de la etiqueta"}
                </label>
                {fotoError && <div className="alerta alerta-error mt-2">{fotoError}</div>}
                <p className="texto-muted texto-chico mt-2">
                  Fotografía el código de barras o QR del IMEI (etiqueta de la caja o del fondo del
                  equipo). Si el código sale bien, aparecerá OK o NOK al instante.
                </p>
              </div>
            )}

            {modo === "lectora" && (
              <form onSubmit={enviarManual}>
                <div className="campo">
                  <label htmlFor="imei-manual">IMEI (15 dígitos)</label>
                  <input
                    id="imei-manual"
                    className="input mono"
                    inputMode="numeric"
                    maxLength={15}
                    value={manual}
                    onChange={(e) => setManual(soloDigitos(e.target.value).slice(0, 15))}
                    placeholder="Escribe o pega el IMEI"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-block mt-2"
                  disabled={procesando || manual.length < 8}
                >
                  <IconoTeclado />
                  {procesando ? "Verificando…" : "Verificar IMEI"}
                </button>
                <p className="texto-muted texto-chico mt-2">
                  Con lectora USB (pistola): deja el cursor fuera de los campos y dispara. El sistema
                  captura la lectura automáticamente y verifica el IMEI.
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2 className="tarjeta-titulo">Últimas lecturas</h2>
            {historial.length > 0 && (
              <button
                type="button"
                className="btn btn-fantasma btn-chico"
                onClick={() => setHistorial([])}
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="tarjeta-cuerpo">
            {historial.length === 0 ? (
              <div className="vacio" style={{ padding: "24px 10px" }}>
                Aún no has escaneado nada en esta sesión.
              </div>
            ) : (
              <div className="historial">
                {historial.map((item) => (
                  <div className="historial-item" key={item.id}>
                    <span className="mono">{item.imei}</span>
                    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={item.estado === "OK" ? "chip chip-ok" : "chip chip-danger"}>
                        {item.estado}
                      </span>
                      <span className="texto-muted texto-chico">{item.hora.slice(0, 5)}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <p className="texto-muted texto-chico mt-2">
        Tipos de lectura soportados: código de barras (Code 128 / 39, EAN, ITF), QR y Data Matrix.
      </p>
    </>
  );
}
