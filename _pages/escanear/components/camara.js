"use client";

import { useEffect, useRef, useState } from "react";
import { IconoCamara, IconoEscanear } from "@/_pages/components/ui/iconos";
import { crearLector, describirError } from "./lector";

export default function Camara({ onLectura }) {
  const videoRef = useRef(null);
  const controlesRef = useRef(null);
  const lecturaRef = useRef(onLectura);
  const [estado, setEstado] = useState("inactiva");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    lecturaRef.current = onLectura;
  }, [onLectura]);

  useEffect(() => {
    return () => {
      try {
        controlesRef.current?.stop();
      } catch {
        controlesRef.current = null;
      }
    };
  }, []);

  async function iniciar() {
    setEstado("cargando");
    setMensaje("");
    try {
      const lector = crearLector();
      const controles = await lector.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (resultado) => {
          if (resultado) lecturaRef.current?.(resultado.getText());
        }
      );
      controlesRef.current = controles;
      setEstado("activa");
    } catch (error) {
      setEstado("error");
      setMensaje(describirError(error));
    }
  }

  function detener() {
    try {
      controlesRef.current?.stop();
    } catch {
      controlesRef.current = null;
    }
    controlesRef.current = null;
    setEstado("inactiva");
  }
  const activa = estado === "activa";

  return (
    <div>
      <div className="escaneo-marco">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ display: activa ? "block" : "none" }}
        />
        {!activa && (
          <div style={{ color: "#fff", textAlign: "center", padding: "0 24px" }}>
            <IconoCamara style={{ width: 42, height: 42, opacity: 0.9 }} />
            <p style={{ marginTop: 10, fontSize: 14, fontWeight: 600 }}>
              {estado === "cargando"
                ? "Solicitando permiso de cámara…"
                : "Activa la cámara y apunta al código de barras de la etiqueta IMEI"}
            </p>
          </div>
        )}
        {activa && <div className="escaneo-apuntador" />}
      </div>

      {estado === "error" && <div className="alerta alerta-error mt-2">{mensaje}</div>}

      <div className="mt-2" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!activa ? (
          <button type="button" className="btn" onClick={iniciar} disabled={estado === "cargando"}>
            <IconoCamara />
            {estado === "error" ? "Reintentar cámara" : "Activar cámara"}
          </button>
        ) : (
          <button type="button" className="btn btn-secundario" onClick={detener}>
            Detener cámara
          </button>
        )}
        <span className="chip chip-brand" style={{ alignSelf: "center" }}>
          <IconoEscanear style={{ width: 13, height: 13 }} />
          {activa ? "Escaneando…" : "Cámara lista"}
        </span>
      </div>
    </div>
  );
}
