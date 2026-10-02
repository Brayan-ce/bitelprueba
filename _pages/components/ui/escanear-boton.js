"use client";

import { useEffect, useRef, useState } from "react";
import { crearLector, describirError } from "@/_pages/escanear/components/lector";
import { IconoCamara, IconoX } from "./iconos";

export default function EscanearBoton({
  onLectura,
  etiqueta = "Escanear",
  clase = "btn btn-secundario btn-chico",
}) {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("");
  const videoRef = useRef(null);
  const lectorRef = useRef(onLectura);

  useEffect(() => {
    lectorRef.current = onLectura;
  }, [onLectura]);

  useEffect(() => {
    if (!abierto) return;
    let cancelado = false;
    let controles = null;
    setEstado("cargando");
    setMensaje("");

    (async () => {
      try {
        const lector = crearLector();
        controles = await lector.decodeFromVideoDevice(undefined, videoRef.current, (r) => {
          if (!r || cancelado) return;
          const texto = r.getText();
          cancelado = true;
          try {
            controles?.stop();
          } catch {
            controles = null;
          }
          setAbierto(false);
          lectorRef.current?.(texto);
        });
        if (cancelado) {
          try {
            controles?.stop();
          } catch {
            controles = null;
          }
          return;
        }
        setEstado("activo");
      } catch (error) {
        if (!cancelado) {
          setEstado("error");
          setMensaje(describirError(error));
        }
      }
    })();

    return () => {
      cancelado = true;
      try {
        controles?.stop();
      } catch {
        controles = null;
      }
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    function alTeclar(evento) {
      if (evento.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", alTeclar);
    return () => window.removeEventListener("keydown", alTeclar);
  }, [abierto]);

  return (
    <>
      <button type="button" className={clase} onClick={() => setAbierto(true)}>
        <IconoCamara />
        {etiqueta}
      </button>

      {abierto && (
        <div className="modal-fondo" onClick={() => setAbierto(false)}>
          <div className="modal" onClick={(evento) => evento.stopPropagation()}>
            <div className="modal-cabeza">
              <strong>Escanear IMEI</strong>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar escáner"
              >
                <IconoX />
              </button>
            </div>

            <div className="escaneo-marco">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ display: estado === "activo" ? "block" : "none" }}
              />
              {estado === "activo" && <div className="escaneo-apuntador" />}
              {estado !== "activo" && (
                <div style={{ color: "#fff", textAlign: "center", padding: "0 20px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>
                    {estado === "cargando"
                      ? "Solicitando permiso de cámara…"
                      : estado === "error"
                        ? "Cámara no disponible"
                        : "Preparando la cámara…"}
                  </p>
                </div>
              )}
            </div>

            {estado === "error" && <div className="alerta alerta-error mt-2">{mensaje}</div>}

            <p className="texto-muted texto-chico mt-2">
              Apunta al código de barras o QR del IMEI: al leerlo se cierra solo y llena el campo.
            </p>

            <button
              type="button"
              className="btn btn-secundario btn-block mt-2"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
