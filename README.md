# Plot Center CRM

Sistema CRM completo para Plot Center - Empresa de Gráfica y Comunicación Visual

## Características

- 📊 Dashboard con métricas y estadísticas
- 👥 Gestión de clientes
- 📋 Gestión de proyectos y pedidos
- 🎨 Catálogo de productos y servicios
- 💰 Presupuestos y cotizaciones
- 📈 Seguimiento de ventas
- 🎯 Gestión de órdenes de trabajo

## Tecnologías

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Vercel (Deployment)
- Lucide Icons
- Recharts

## Configuración Inicial

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la URL del proyecto y la clave anónima (anon key)

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 3. Ejecutar migraciones de base de datos

1. Ve a la consola de Supabase
2. Navega a SQL Editor
3. Copia y ejecuta el contenido del archivo `supabase/migrations/20240101000000_initial_schema.sql`

### 4. Instalar dependencias

```bash
npm install
```

### 5. Poblar base de datos con datos de ejemplo (opcional)

Después de ejecutar las migraciones, puedes poblar la base de datos con datos de ejemplo haciendo una petición POST a:

```bash
curl -X POST http://localhost:3000/api/seed
```

O desde el navegador, visita: `http://localhost:3000/api/seed` (esto ejecutará el endpoint)

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Deployment en Vercel

### Opción 1: Desde GitHub

1. Sube tu código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Haz clic en "Deploy"

### Opción 2: Desde CLI

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Inicia sesión:
```bash
vercel login
```

3. Despliega:
```bash
vercel
```

4. Agrega las variables de entorno en el dashboard de Vercel o usando:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Estructura del Proyecto

```
├── app/                    # Páginas y rutas de Next.js
│   ├── api/               # API routes
│   ├── clientes/          # Página de clientes
│   ├── proyectos/         # Página de proyectos
│   ├── productos/         # Página de productos
│   ├── presupuestos/      # Página de presupuestos
│   └── configuracion/     # Página de configuración
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y funciones
│   ├── db/               # Funciones de base de datos
│   └── supabase/         # Configuración de Supabase
├── types/                 # Tipos TypeScript
├── supabase/             # Migraciones de Supabase
│   └── migrations/
└── public/               # Archivos estáticos
```

## Base de Datos

El esquema incluye las siguientes tablas:

- `clientes` - Información de clientes
- `productos` - Catálogo de productos y servicios
- `proyectos` - Proyectos y pedidos
- `proyecto_items` - Items de cada proyecto
- `presupuestos` - Presupuestos y cotizaciones
- `presupuesto_items` - Items de cada presupuesto

## Próximos Pasos

- [ ] Implementar autenticación de usuarios
- [ ] Agregar formularios para crear/editar registros
- [ ] Implementar exportación de presupuestos a PDF
- [ ] Agregar notificaciones en tiempo real
- [ ] Implementar sistema de permisos y roles
- [ ] Agregar búsqueda avanzada
- [ ] Implementar reportes y analytics avanzados

## Licencia

Este proyecto es privado y propiedad de Plot Center.
