<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas del proyecto (obligatorias)

1. **No instalar dependencias.** Prohibido `npm install`, `npm i`, `npm add`, `npx ... install`, pnpm/yarn/bun y cualquier variante. Si falta un paquete, escribe en el chat el comando exacto (ej. `npm install paquete`) y espera a que el usuario lo instale.
2. **No ejecutar el proyecto ni sus scripts.** Prohibido `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `next dev`, `next build` y todo lo similar. El usuario ejecuta, revisa los errores y los reporta aquí. Tú solo lee/edita archivos.
3. **No hay base de datos todavía.** No crear ni tocar drivers, ORM, SQL, esquemas, pools de conexión ni `.env` de base de datos. La interfaz usa datos de demostración en memoria (`lib/datos-demo.js` + `useContext`). Pendiente futuro: migrar a **PostgreSQL**.
4. **Estructura de carpetas:**
   - `app/` solo contiene `layout.js`, `globals.css` y wrappers de una línea por ruta que importan de `_pages/`.
   - Toda la UI vive en `_pages/`, organizada por sección (`_pages/<seccion>/page.js`) con su carpeta `components/` interna.
   - `'use client'` y `'use server'` se declaran en los archivos de `_pages/` donde corresponda; `app/` no lleva esas directivas.
5. **Idioma:** UI, comentarios y mensajes en español (Perú). Moneda en soles (S/).
