# Inventario Pastrana · Bitel y Claro

Sistema de inventario de las tiendas Pastrana S.A.C. (Huancavelica): celulares con IMEI, accesorios, vidrios, chips y servicios de las 8 tiendas Bitel y Claro. Interfaz web responsiva (celular y escritorio) con escaneo de IMEI por cámara, foto o lectora USB que responde **OK / NOK**.

## Estado actual

- ✅ Interfaz completa navegable, sin login.
- ✅ **Registro real del cliente cargado** desde los Excel de `excels/` (corte 25/10/2026).
- ✅ Datos **en memoria** (`lib/inventario.js` + `lib/datos-demo.js` + `useContext`): se prueban crear, editar y eliminar sin base de datos.
- ⏳ Pendiente: conectar **PostgreSQL** (migrar el registro y los movimientos).

## Rutas

| Ruta | Qué muestra |
| --- | --- |
| `/` | Inicio: productos, celulares, stock bajo mínimo, valor de mercadería, stock por tienda y últimos movimientos |
| `/inventario` | **Registro completo** (celulares, accesorios, chips y servicios): filtros, paginación, totales y **Exportar Excel** |
| `/escanear` | Escáner IMEI: Cámara, Foto o Lectora → OK / NOK |
| `/celulares` | Celulares con IMEI: filtros, totales, escáner y **Exportar Excel** |
| `/celulares/nuevo` | Formulario de registro (los IMEI se llenan con la cámara) |
| `/celulares/[codigo]` | Ficha del equipo, edición y sus movimientos |
| `/movimientos` | **Libro de movimientos** agrupado por días con **Exportar Excel** |
| `/movimientos/nuevo` | Registro de movimientos (IMEI con escáner rápido) |
| `/tiendas` | Alta, edición y borrado de tiendas (con operador Bitel / Claro) |
| `/usuarios` | Usuarios con roles (Administrador, Encargado, Vendedor) |
| `/reportes` | Valores, operadores, grupos, categorías, marcas y actividad de 14 días |

Navegación: **PC** → header superior (migaja PASTRANA / sección y usuario activo) + **sidebar izquierdo** con todas las secciones. **Móvil** → header con hamburguesa y marca, **dock flotante** inferior y menú lateral. Cada sección aparece en un solo lugar según el dispositivo (sin menús repetidos). El selector **Oscuro / Claro** vive en el header y la preferencia se guarda en `localStorage` (`inventario:tema`); si no hay preferencia se usa el tema del sistema.

## Registro del cliente

Fuente: los 8 libros de `excels/` (`BITEL ASCENCION`, `BITEL LIRCAY`, `BITEL MANCHEGO`, `BITEL VIRREY`, `CLARO LIRCAY`, `CLARO MANCHEGO`, `CLARO PAUCARA`, `CLARO VIRREY TOLEDO`).

| Dato | Cantidad |
| --- | --- |
| Tiendas | 8 (4 Bitel, 4 Claro) |
| Productos (SKU) | 2.124 |
| Celulares | 257 filas · 256 con IMEI válido |
| Accesorios (vidrios, estuches, cargadores, cables…) | 1.798 |
| Chips y líneas | 34 |
| Servicios (Anypay, Bypay, tasas, traslados…) | 34 |
| Unidades de mercadería | 11.755,53 |
| Valor de mercadería al costo | S/ 168.479,16 |
| Valor a precio de venta | S/ 291.877,27 |
| Productos bajo stock mínimo | 41 |

Notas sobre los datos:

- El archivo `lib/inventario.js` se **genera** a partir de los Excel; no se edita a mano.
- Los **servicios** (Anypay, Bypay, tasas, pagos de traslado, devoluciones PayJoy) se muestran en el inventario pero **no suman al valor de mercadería**: son fondos operativos, no productos.
- Se normalizaron categorías repetidas del sistema anterior (`VIDRIO`/`VIDRIOS`, `ESTUCHE`/`ESTUCHE1`, `CABLE1`, `CABEZA1`, `AUDIFONO1`, etc.) y se agruparon en *Celulares*, *Accesorios*, *Chips y líneas*, *Servicios* y *Otros*.
- El stock es una foto al 25/10/2026. Los celulares quedaron registrados con una **entrada inicial** cada uno para dejar trazabilidad en el libro de movimientos.
- Dato a corregir en el origen: el **ZTE Blade A36 de Bitel Virrey** trae el código `435` en la columna de IMEI; queda en el inventario pero no en la lista de celulares con IMEI.
- Alta de celulares en la app: el equipo nuevo también se crea en el inventario y, al moverse o venderse, se actualiza su stock (1 / 0).

## Identidad visual

El diseño se guía por el logo **PASTRANA S.A.C.** (serif clásica, arco negro con sombra plata):

- Paleta: negro grafito, plata y **oro** (ámbar) como acento; verde/rojo/azul solo para estados y operador.
- Tipografía: **Cormorant Garamond** para títulos y marca; Geist para la interfaz; monoespaciada para IMEI.
- Logo: se usa en la portada (`public/logo_transparente.png`), adaptado al tema (negro en claro, blanco en oscuro) y como favicon (`app/icon.png`, `app/apple-icon.png`).
- Tema claro y oscuro completos (header, sidebar, menú y portada); impresión limpia en blanco y negro.

## Estructura

```
app/                  → solo layout, globals.css, iconos y wrappers de una línea por ruta
_pages/               → toda la UI, organizada por sección
  <seccion>/page.js   → página (con 'use client' donde necesita navegador)
  <seccion>/components/ → componentes internos de esa sección
  <seccion>/actions.js  → server actions ('use server')
  components/           → shell/navegación, iconos, escáner rápido y store de datos
lib/
  inventario.js       → registro real generado de los Excel (tiendas + 2.124 productos)
  datos-demo.js       → usuarios, celulares derivados y movimientos iniciales
  format.js           → formatos de soles, cantidades, fechas (Lima), IMEI, grupos
  excel.js            → exportación a Excel (.csv)
public/
  logo_transparente.png → logo principal (fondo transparente)
  logo.jpg              → logo original
```

## Dependencias

Ya instaladas: `next@16`, `react@19`, `@zxing/browser` + `@zxing/library` (lectura de códigos).

Para reinstalar desde cero:

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

Abre `http://localhost:4000`. La cámara necesita `localhost` o HTTPS.

## Escaneo

- **Cámara:** decodifica Code 128/39, EAN, ITF, QR y Data Matrix en vivo.
- **Foto:** sube/toma una foto de la etiqueta y la lee.
- **Lectora USB:** si está conectada, dispara desde cualquier punto de la página; también permite escribir el IMEI a mano.

Resultado: **OK** si el IMEI está en el inventario (con ficha del equipo), **NOK** si no está o la lectura no es válida. Incluye sonido, vibración e historial de lecturas.

Además del escáner completo, la velocidad está integrada en el flujo:

- **Celulares → "Escanear para buscar"**: abre la cámara y, si el IMEI existe, salta directo a su ficha.
- **Formularios → botón "Cámara" junto a cada IMEI**: llena el campo escaneando (alta de celular y registro de movimiento).
- **Exportar Excel**: el inventario completo, los celulares y el libro de movimientos exportan a `.csv` (se abre directo en Excel) con los filtros aplicados, totales incluidos.

## Próximos pasos

1. Confirmar con el cliente las categorías y el stock mínimo de cada producto.
2. Importar las próximas fotos del Excel (idealmente CSV) sin tocar código.
3. Conectar **PostgreSQL**: tablas `tiendas`, `productos`, `celulares`, `movimientos` y `usuarios`; reemplazar el store de `useContext` por server actions (`'use server'`).
