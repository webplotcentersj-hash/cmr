# Solución Rápida: Asignar Rol a Usuario Existente

## Problema
Creaste el usuario pero no tiene rol asignado o el rol no se guardó correctamente.

## Solución Rápida (2 minutos)

### Opción 1: Desde SQL Editor (MÁS FÁCIL)

1. Ve a **SQL Editor** en Supabase Dashboard
2. Ejecuta este comando (reemplaza los valores):

```sql
-- Ver tus usuarios actuales
SELECT email, nombre, role 
FROM user_profiles 
ORDER BY created_at DESC;
```

3. Si tu usuario NO aparece o NO tiene rol, ejecuta:

```sql
-- Si el perfil NO existe, créalo
INSERT INTO user_profiles (id, email, nombre, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nombre', u.email),
  'Compras'  -- ⚠️ Cambia el rol aquí si quieres otro
FROM auth.users u
WHERE u.email = 'TU_EMAIL_AQUI@ejemplo.com'  -- ⚠️ Cambia esto
  AND u.id NOT IN (SELECT id FROM user_profiles);
```

4. Si el perfil SÍ existe pero NO tiene rol, ejecuta:

```sql
-- Actualizar rol del usuario existente
UPDATE user_profiles
SET role = 'Compras'  -- ⚠️ Cambia el rol aquí
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';  -- ⚠️ Cambia esto
```

5. Verifica que funcionó:

```sql
SELECT email, nombre, role, activo 
FROM user_profiles 
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';
```

### Opción 2: Crear Usuario Nuevo Correctamente

Si prefieres empezar de nuevo:

1. Ve a **Authentication** → **Users**
2. Elimina el usuario sin rol (opcional)
3. Crea uno nuevo siguiendo estos pasos:

**Configuración:**
- Email: `compras@plotcenter.com`
- Password: `TuContraseña123!`
- ✅ Auto Confirm User

**User Metadata (MUY IMPORTANTE):**
```json
{
  "nombre": "Tu Nombre",
  "role": "Compras"
}
```

## Roles Disponibles

Copia y pega exactamente uno de estos valores en el campo `role`:

- `Compras` - Para aprobar pedidos y crear órdenes de compra
- `Administrador` - Acceso completo
- `Taller Gráfico` - Acceso general
- `Metalúrgica` - Acceso general  
- `Mostrador` - Acceso general (por defecto)

## Verificar que Funcionó

Después de asignar el rol, ejecuta:

```sql
SELECT email, nombre, role, activo 
FROM user_profiles;
```

Deberías ver tu usuario con el rol correcto.

## Probar el Sistema

1. Inicia sesión en `/login` con tu email y contraseña
2. Según tu rol verás:
   - **Compras/Admin**: Verás "Compras" en el menú y botones de aprobar/rechazar
   - **Otros roles**: No verás "Compras" ni botones de aprobar/rechazar

## ¿Necesitas Ayuda?

Si después de seguir estos pasos aún no funciona:
1. Ejecuta `SOLUCIONAR_ROLES.sql` completo
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que la migración `20240104000000_auth_and_roles.sql` se ejecutó correctamente

