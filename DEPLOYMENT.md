# Guía de Deployment - Plot Center CRM

Esta guía te ayudará a desplegar el CRM de Plot Center en Vercel con Supabase como base de datos.

## Paso 1: Configurar Supabase

### 1.1 Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa el formulario:
   - **Name**: plot-center-crm (o el nombre que prefieras)
   - **Database Password**: Elige una contraseña segura (guárdala)
   - **Region**: Elige la región más cercana
5. Espera a que se cree el proyecto (puede tardar unos minutos)

### 1.2 Obtener credenciales

1. En el dashboard de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (la clave anónima)

### 1.3 Ejecutar migraciones

1. En Supabase, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Abre el archivo `supabase/migrations/20240101000000_initial_schema.sql` de este proyecto
4. Copia todo el contenido y pégalo en el editor SQL
5. Haz clic en **Run** o presiona `Ctrl+Enter`
6. Verifica que todas las tablas se hayan creado correctamente en **Table Editor**

### 1.4 Poblar datos de ejemplo (opcional)

1. Ve a **SQL Editor** nuevamente
2. Puedes ejecutar el endpoint `/api/seed` después de desplegar, o crear los datos manualmente desde la interfaz

## Paso 2: Configurar el proyecto localmente

### 2.1 Clonar/descargar el proyecto

```bash
# Si tienes git
git clone <tu-repositorio>
cd Cmr

# O simplemente asegúrate de estar en el directorio del proyecto
```

### 2.2 Instalar dependencias

```bash
npm install
```

### 2.3 Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 2.4 Probar localmente

```bash
npm run dev
```

Visita `http://localhost:3000` y verifica que todo funcione correctamente.

## Paso 3: Desplegar en Vercel

### Opción A: Desde GitHub (Recomendado)

#### 3.1 Subir código a GitHub

1. Crea un repositorio en GitHub
2. Sube tu código:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

#### 3.2 Conectar con Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **Add New Project**
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente que es un proyecto Next.js

#### 3.3 Configurar variables de entorno

En la página de configuración del proyecto en Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave anónima de Supabase
3. Selecciona **Production**, **Preview**, y **Development**
4. Haz clic en **Save**

#### 3.4 Desplegar

1. Haz clic en **Deploy**
2. Espera a que termine el deployment
3. Una vez completado, tendrás una URL como: `https://tu-proyecto.vercel.app`

### Opción B: Desde CLI de Vercel

#### 3.1 Instalar Vercel CLI

```bash
npm i -g vercel
```

#### 3.2 Iniciar sesión

```bash
vercel login
```

#### 3.3 Desplegar

```bash
vercel
```

Sigue las instrucciones en pantalla:
- ¿Set up and deploy? → **Y**
- ¿Which scope? → Selecciona tu cuenta
- ¿Link to existing project? → **N**
- ¿What's your project's name? → plot-center-crm (o el nombre que prefieras)
- ¿In which directory is your code located? → **./** (presiona Enter)
- ¿Want to override the settings? → **N**

#### 3.4 Agregar variables de entorno

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Pega tu URL cuando se solicite
# Selecciona: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Pega tu clave cuando se solicite
# Selecciona: Production, Preview, Development
```

#### 3.5 Redesplegar

```bash
vercel --prod
```

## Paso 4: Poblar datos de ejemplo

Una vez desplegado, puedes poblar la base de datos con datos de ejemplo:

1. Visita: `https://tu-proyecto.vercel.app/api/seed`
2. O usa curl:
```bash
curl -X POST https://tu-proyecto.vercel.app/api/seed
```

## Paso 5: Verificar el deployment

1. Visita tu URL de Vercel
2. Verifica que todas las páginas carguen correctamente:
   - Dashboard (`/`)
   - Clientes (`/clientes`)
   - Proyectos (`/proyectos`)
   - Productos (`/productos`)
   - Presupuestos (`/presupuestos`)

## Solución de Problemas

### Error: "Missing environment variables"

- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de haber seleccionado Production, Preview y Development
- Redespliega después de agregar variables

### Error: "Failed to fetch" o problemas de conexión

- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de que las políticas RLS permitan acceso (las migraciones incluyen políticas permisivas)
- Revisa los logs de Vercel en el dashboard

### Las tablas no existen

- Ejecuta las migraciones en Supabase SQL Editor
- Verifica que no haya errores en la ejecución del SQL

### Problemas con CORS

- Supabase maneja CORS automáticamente
- Si hay problemas, verifica la configuración de Supabase en Settings → API

## Próximos Pasos

- [ ] Configurar dominio personalizado en Vercel
- [ ] Implementar autenticación de usuarios
- [ ] Configurar backups automáticos en Supabase
- [ ] Configurar monitoreo y alertas
- [ ] Optimizar rendimiento

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)

