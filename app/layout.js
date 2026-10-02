import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProveedorDatos } from "@/_pages/components/datos/proveedor";
import Shell from "@/_pages/components/layout/shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Inventario Pastrana · Bitel",
    template: "%s · Inventario Pastrana",
  },
  description:
    "Sistema de inventario de celulares Bitel Pastrana: control por IMEI, escaneo con cámara y movimientos entre tiendas.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("inventario:tema");if(t!=="claro"&&t!=="oscuro"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"oscuro":"claro"}document.documentElement.setAttribute("data-tema",t)}catch(e){document.documentElement.setAttribute("data-tema","claro")}})();',
          }}
        />
        <ProveedorDatos>
          <Shell>{children}</Shell>
        </ProveedorDatos>
      </body>
    </html>
  );
}
