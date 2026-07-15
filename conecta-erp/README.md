# CONECTA ERP

Sistema de gestión empresarial (ERP) para CONECTA — reemplaza el flujo de trabajo en Excel con
servicios, clientes, inventario y personal en campo, todo respaldado por Supabase.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router (HashRouter) + lucide-react
- **Backend:** Supabase (Postgres + Auth + Row Level Security)
- **Hosting:** GitHub Pages (estático, sin servidor)

## 1. Configurar la base de datos

1. Entra al **SQL Editor** de tu proyecto Supabase (`viwaaxiamrybwibawykf`).
2. Ejecuta el archivo `01_schema_conecta_erp.sql` completo (crea tablas, RLS, triggers e índices).
3. Registra tu primer usuario desde la pantalla de Login de la app (o desde
   Authentication > Users en el dashboard de Supabase).
4. En **Table Editor > profiles**, cambia manualmente el `role` de ese primer usuario a `admin`
   (por defecto todo usuario nuevo se crea como `staff`).

## 2. Desarrollo local (VSC)

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Las credenciales de Supabase ya están configuradas en
`src/supabaseClient.js` (la anon key es segura para el cliente; el acceso real lo controla RLS).

## 3. Compilar para producción

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para publicarse como sitio estático.

## 4. Desplegar en GitHub Pages

Tienes dos opciones — usa la que prefieras:

### Opción A — GitHub Actions (recomendada, despliegue automático)

1. Sube este proyecto a un repositorio de GitHub.
2. En GitHub: **Settings > Pages > Build and deployment > Source**, selecciona **GitHub Actions**.
3. Cada `git push` a la rama `main` compilará y publicará automáticamente
   (workflow ya incluido en `.github/workflows/deploy.yml`).

### Opción B — Despliegue manual con `gh-pages`

```bash
npm run deploy
```

Esto compila el proyecto y publica el contenido de `dist/` en la rama `gh-pages`.
Luego en **Settings > Pages**, selecciona la rama `gh-pages` como fuente.

> El `base: './'` en `vite.config.js` genera rutas relativas, así que funciona tanto en
> `usuario.github.io` como en `usuario.github.io/nombre-repo/` sin tocar nada.

## Estructura del proyecto

```
src/
  supabaseClient.js       # Cliente de Supabase (credenciales del proyecto)
  context/AuthContext.jsx # Sesión, perfil, login/logout, estado de cuenta
  lib/auditLog.js         # Registro de auditoría inmutable (audit_logs)
  lib/geoNav.js           # Detección de dispositivo + apertura de Maps/Waze
  components/
    Login.jsx
    Layout.jsx             # Sidebar + navegación
    ProtectedRoute.jsx
    GoogleDriveViewer.jsx  # Visor embebido de carpeta de Drive
    GeoNavButtons.jsx      # Botones "Maps" / "Waze"
    StatusBadge.jsx
  modules/
    DashboardHome.jsx      # Rail de operaciones en vivo + KPIs + actividad
    ClientsModule.jsx      # CRUD de clientes + vínculo a Drive
    ServicesModule.jsx     # CRUD de servicios + GPS + presupuesto
    InventoryModule.jsx    # CRUD de inventario con estado automático
    ConfigModule.jsx       # Branding + gestión de usuarios (solo admin)
```

## Roles y permisos

| Rol         | Permisos                                                            |
|-------------|----------------------------------------------------------------------|
| `staff`     | Lectura de todo, actualiza sus propias asignaciones/asistencia GPS   |
| `supervisor`| Lectura y escritura de clientes, servicios e inventario              |
| `admin`     | Todo lo anterior + gestión de usuarios y configuración de marca      |

## Google Drive

Para que el visor funcione, cada carpeta de Drive vinculada en `clients.google_drive_folder_id`
debe compartirse como **"Cualquier persona con el enlace puede ver"**. El ID es el fragmento de
la URL: `https://drive.google.com/drive/folders/`**`ESTE_ID`**.
