# Terravista — catálogo de bienes inmuebles

Proyecto único (un solo servidor, un solo puerto) que sirve:
- La API REST (`/api/...`)
- Las imágenes subidas por el admin (`/uploads/...`)
- El sitio web ya compilado (React + Vite)

Todo corre desde `server/`, que además contiene la base de datos SQLite.

## Estructura

```
terravista/
  server/     ← Express + SQLite + sirve todo el sitio
    src/
    uploads/properties/   ← imágenes reales, guardadas en disco
    data/                 ← database.sqlite (se crea sola al arrancar)
    public/                ← build del cliente (se genera con npm run build)
  client/     ← código fuente de React (Vite)
    src/
```

## Instalación (primera vez)

```bash
cd server
npm install
cp .env.example .env
# abre .env y define un JWT_SECRET real, por ejemplo:
# openssl rand -base64 48

npm run build          # compila client/ y lo deja en server/public
npm run create-admin -- tu_usuario tu_contraseña_segura
npm run seed            # carga 6 propiedades de ejemplo con fotos y precios
```

## Levantar el sitio completo

```bash
cd server
npm start
```

Abre `http://localhost:4000` — ahí está todo: catálogo público, detalle de
propiedad, y el panel admin en `http://localhost:4000/admin`.

## Desarrollo (con hot-reload del frontend)

Si vas a tocar el diseño del sitio seguido, puedes correr el cliente aparte
mientras desarrollas (el proxy de Vite reenvía `/api` y `/uploads` a la API real):

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Cuando termines de ajustar el diseño, corre `npm run build` en `server/`
(o en `client/`) para volver a generar el sitio único de producción.

## Notas de seguridad

- Las imágenes se validan por tipo real (JPG/PNG/WEBP), tamaño máximo 5MB,
  y se guardan con nombres generados aleatoriamente (nunca el nombre
  original del archivo) para evitar path traversal y colisiones.
- El admin se autentica con JWT en cookie `httpOnly` — nunca en localStorage.
- Todas las consultas a SQLite son parametrizadas.
- Ver `server/.env.example` para las variables necesarias antes de desplegar.
