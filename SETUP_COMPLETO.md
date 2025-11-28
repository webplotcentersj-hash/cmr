# Guía Completa de Configuración - Plot Center CRM

Esta guía te ayudará a configurar completamente tu CRM para que todas las funciones trabajen correctamente.

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en **"New Project"**
4. Completa el formulario:
   - **Name**: `plot-center-crm` (o el nombre que prefieras)
   - **Database Password**: Elige una contraseña segura (¡GUÁRDALA!)
   - **Region**: Elige la región más cercana
5. Espera a que se cree el proyecto (puede tardar 2-3 minutos)

## Paso 2: Ejecutar Migraciones (Crear Tablas)

1. En el dashboard de Supabase, ve a **SQL Editor** (menú lateral izquierdo)
2. Haz clic en **"New Query"**
3. Abre el archivo `supabase/migrations/20240101000000_initial_schema.sql` de este proyecto
4. **Copia TODO el contenido** del archivo SQL
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **"Run"** o presiona `Ctrl+Enter` (o `Cmd+Enter` en Mac)
7. Espera a que termine la ejecución
8. Verifica que no haya errores (debería decir "Success. No rows returned")

## Paso 3: Verificar que las Tablas se Crearon

1. En Supabase, ve a **Table Editor** (menú lateral izquierdo)
2. Deberías ver las siguientes tablas:
   - ✅ `clientes`
   - ✅ `productos`
   - ✅ `proyectos`
   - ✅ `proyecto_items`
   - ✅ `presupuestos`
   - ✅ `presupuesto_items`

## Paso 4: Obtener Credenciales de Supabase

1. En Supabase, ve a **Settings** → **API** (menú lateral izquierdo)
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Paso 5: Configurar Variables de Entorno en Vercel

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **cmr**
3. Ve a **Settings** → **Environment Variables**
4. Agrega la primera variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Pega tu Project URL de Supabase
   - Selecciona: ☑ Production, ☑ Preview, ☑ Development
   - Haz clic en **Save**
5. Agrega la segunda variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Pega tu anon public key de Supabase
   - Selecciona: ☑ Production, ☑ Preview, ☑ Development
   - Haz clic en **Save**

## Paso 6: Redesplegar en Vercel

1. En Vercel, ve a la pestaña **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **"Redeploy"**
4. O simplemente haz un nuevo push a GitHub (Vercel desplegará automáticamente)

## Paso 7: Poblar Base de Datos con Datos de Ejemplo

Una vez que la aplicación esté desplegada y funcionando:

1. Visita tu aplicación desplegada: `https://tu-proyecto.vercel.app`
2. Visita la URL del endpoint de seed: `https://tu-proyecto.vercel.app/api/seed`
3. O desde la terminal local:
   ```bash
   curl -X POST https://tu-proyecto.vercel.app/api/seed
   ```

**Nota**: El endpoint `/api/seed` solo funciona con método POST. Si lo visitas desde el navegador, puedes usar una extensión como "REST Client" o hacer una petición POST desde la consola del navegador:

```javascript
fetch('/api/seed', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data))
```

## Paso 8: Verificar que Todo Funcione

1. Visita tu aplicación: `https://tu-proyecto.vercel.app`
2. Deberías ver:
   - ✅ Dashboard con estadísticas
   - ✅ Clientes (con datos si ejecutaste el seed)
   - ✅ Proyectos
   - ✅ Productos
   - ✅ Presupuestos

## Solución de Problemas

### Error: "Failed to fetch" o "Network error"
- ✅ Verifica que las variables de entorno estén configuradas en Vercel
- ✅ Verifica que las credenciales de Supabase sean correctas
- ✅ Asegúrate de haber redesplegado después de agregar las variables

### Las páginas están vacías
- ✅ Verifica que ejecutaste las migraciones (Paso 2)
- ✅ Verifica que las tablas existen en Supabase Table Editor
- ✅ Ejecuta el endpoint `/api/seed` para poblar datos

### Error 500 en el middleware
- ✅ Ya está corregido en el código actual
- ✅ Asegúrate de tener las variables de entorno configuradas

### No puedo ejecutar el seed
- ✅ El endpoint requiere método POST
- ✅ Usa curl o una herramienta como Postman
- ✅ O ejecuta desde la consola del navegador (ver Paso 7)

## Verificación Final

✅ Proyecto creado en Supabase
✅ Migraciones ejecutadas (tablas creadas)
✅ Variables de entorno configuradas en Vercel
✅ Aplicación redesplegada
✅ Datos de ejemplo insertados (opcional pero recomendado)
✅ Aplicación funcionando correctamente

## Próximos Pasos

Una vez que todo funcione:
- [ ] Agregar más clientes desde la interfaz
- [ ] Crear proyectos nuevos
- [ ] Generar presupuestos
- [ ] Personalizar productos y servicios
- [ ] Implementar autenticación de usuarios (opcional)

