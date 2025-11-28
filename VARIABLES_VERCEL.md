# Variables de Entorno para Vercel

## Variables Requeridas

Configura estas variables de entorno en tu proyecto de Vercel:

### 1. NEXT_PUBLIC_SUPABASE_URL
- **Descripción**: URL de tu proyecto de Supabase
- **Formato**: `https://xxxxxxxxxxxxx.supabase.co`
- **Dónde encontrarla**: 
  - Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
  - Settings → API
  - Copia el valor de **Project URL**

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Descripción**: Clave pública anónima de Supabase
- **Formato**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Dónde encontrarla**:
  - Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
  - Settings → API
  - Copia el valor de **anon public** key

## Cómo Configurarlas en Vercel

### Opción 1: Desde el Dashboard de Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **plot-center-crm**
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Tu URL de Supabase
   - Selecciona: ☑ Production, ☑ Preview, ☑ Development
   - Haz clic en **Save**
5. Repite para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Opción 2: Desde la CLI de Vercel

```bash
# Configurar para todos los entornos
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# O configurar solo para producción
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

## Ejemplo de Valores

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## Importante

⚠️ **NO** subas estas variables al repositorio de GitHub. Ya están protegidas en `.gitignore`.

✅ Después de agregar las variables, **redespliega** tu aplicación en Vercel para que los cambios surtan efecto.

## Verificar Configuración

Después de configurar las variables y redesplegar, puedes verificar que funcionan correctamente visitando tu aplicación desplegada. Si hay errores, revisa los logs de Vercel para más detalles.

