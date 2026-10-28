import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Inventario Pastrana · Bitel y Claro",
    template: "%s · Inventario Pastrana",
  },
  description:
    "Inventario de las tiendas Bitel y Claro de Pastrana S.A.C.: celulares por IMEI, accesorios, chips, escaneo con cámara y movimientos entre tiendas.",
  applicationName: "Inventario Pastrana",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
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
