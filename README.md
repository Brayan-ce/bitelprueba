# Inventario Pastrana · Bitel

Sistema de inventario de celulares para la tienda Bitel Pastrana (Huancavelica). Interfaz web responsiva (celular y escritorio) con escaneo de IMEI por cámara, foto o lectora USB que responde **OK / NOK**.

## Estado actual

- ✅ Interfaz completa navegable, sin login.
- ✅ Datos de demostración **en memoria** (`lib/datos-demo.js` + `useContext`): se prueban crear, editar y eliminar sin base de datos.
- ⏳ Pendiente: conectar **PostgreSQL** (migrar los datos de demostración y los del cliente).

## Rutas

| Ruta | Qué muestra |
| --- | --- |
| `/` | Inicio: estadísticas, stock por tienda, últimos movimientos |
| `/escanear` | Escáner IMEI: Cámara, Foto o Lectora → OK / NOK |
| `/celulares` | Lista tipo hoja de cálculo: filtros, totales, escáner y **Exportar Excel** |
| `/celulares/nuevo` | Formulario de registro (los IMEI se llenan con la cámara) |
| `/celulares/[codigo]` | Ficha del equipo, edición y sus movimientos |
| `/movimientos` | **Libro de movimientos** agrupado por días con **Exportar Excel** |
| `/movimientos/nuevo` | Registro de movimientos (IMEI con escáner rápido) |
| `/tiendas` | Alta, edición y borrado de tiendas |
| `/usuarios` | Usuarios con roles (Administrador, Encargado, Vendedor) |
| `/reportes` | Valores, estados, marcas y actividad de 14 días |

Navegación: **PC** → header superior (marca, usuario activo y modo claro/oscuro) + **sidebar izquierdo** con todas las secciones. **Móvil** → header con hamburguesa (abre el menú lateral), barra inferior rápida y el mismo menú lateral; modo claro/oscuro guardado como preferencia. Cada sección aparece en un solo lugar según el dispositivo (sin menús repetidos).

## Estructura

```
app/                  → solo layout, globals.css y wrappers de una línea por ruta
_pages/               → toda la UI, organizada por sección
  <seccion>/page.js   → página (con 'use client' donde necesita navegador)
  <seccion>/components/ → componentes internos de esa sección
  <seccion>/actions.js  → server actions ('use server')
  components/           → shell/navegación, iconos y store de datos
lib/
  datos-demo.js       → datos de demostración
  format.js           → formatos de soles, fechas (Lima), IMEI, etc.
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

Abre `http://localhost:3000`. La cámara necesita `localhost` o HTTPS.

## Escaneo

- **Cámara:** decodifica Code 128/39, EAN, ITF, QR y Data Matrix en vivo.
- **Foto:** sube/toma una foto de la etiqueta y la lee.
- **Lectora USB:** si está conectada, dispara desde cualquier punto de la página; también permite escribir el IMEI a mano.

Resultado: **OK** si el IMEI está en el inventario (con ficha del equipo), **NOK** si no está o la lectura no es válida. Incluye sonido, vibración e historial de lecturas.

Además del escáner completo, la velocidad está integrada en el flujo:

- **Celulares → "Escanear para buscar"**: abre la cámara y, si el IMEI existe, salta directo a su ficha.
- **Formularios → botón "Cámara" junto a cada IMEI**: llena el campo escaneando (alta de celular y registro de movimiento).
- **Exportar Excel**: la lista de celulares y el libro de movimientos exportan a `.csv` (se abre directo en Excel) con los filtros aplicados, totales incluidos.

## Próximos pasos (PostgreSQL)

1. Crear el esquema con las tablas `celulares`, `movimientos`, `usuarios` y `tiendas`.
2. Reemplazar el store de `useContext` por server actions (`'use server'`) que consulten PostgreSQL.
3. Dejar de usar `lib/datos-demo.js` en producción.
