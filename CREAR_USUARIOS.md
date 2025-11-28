# Guía: Cómo Crear Usuarios en Supabase

## Método 1: Desde Supabase Dashboard (Recomendado)

### Paso 1: Acceder a Authentication
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **"Authentication"**
3. Luego haz clic en **"Users"**

### Paso 2: Crear Nuevo Usuario
1. Haz clic en el botón **"Add User"** (arriba a la derecha)
2. Selecciona **"Create new user"**

### Paso 3: Configurar Usuario
1. **Email**: Ingresa el email del usuario (ej: `compras@plotcenter.com`)
2. **Password**: Ingresa una contraseña segura
3. **Auto Confirm User**: ✅ Marca esta casilla para que el usuario pueda iniciar sesión inmediatamente

### Paso 4: Configurar Metadata (IMPORTANTE) ⚠️
En la sección **"User Metadata"**, agrega el siguiente JSON:

```json
{
  "nombre": "Nombre del Usuario",
  "role": "Compras"
}
```

**⚠️ Si olvidaste agregar el metadata o el rol no se guardó:**

1. Crea el usuario normalmente (sin metadata si ya lo creaste)
2. Ve a **SQL Editor** en Supabase
3. Ejecuta este comando (reemplaza el email):
```sql
UPDATE user_profiles
SET role = 'Compras'  -- Cambia el rol aquí
WHERE email = 'tu-email@ejemplo.com';  -- Cambia el email aquí
```

**Roles válidos:**
- `'Compras'`
- `'Administrador'`
- `'Taller Gráfico'`
- `'Metalúrgica'`
- `'Mostrador'`

**Roles disponibles:**
- `"Compras"` - Para usuarios del área de compras
- `"Taller Gráfico"` - Para usuarios del taller gráfico
- `"Metalúrgica"` - Para usuarios de metalúrgica
- `"Mostrador"` - Para usuarios de mostrador (rol por defecto)
- `"Administrador"` - Para administradores del sistema

### Paso 5: Guardar
1. Haz clic en **"Create User"**
2. El sistema automáticamente creará el perfil en la tabla `user_profiles` gracias al trigger

### Ejemplo Completo

**Usuario de Compras:**
```json
{
  "nombre": "Juan Pérez",
  "role": "Compras"
}
```

**Usuario Administrador:**
```json
{
  "nombre": "María González",
  "role": "Administrador"
}
```

**Usuario de Taller Gráfico:**
```json
{
  "nombre": "Carlos Rodríguez",
  "role": "Taller Gráfico"
}
```

---

## Método 2: Desde SQL (Avanzado)

Si prefieres crear usuarios directamente desde SQL:

### Paso 1: Crear Usuario en Auth
```sql
-- Esto crea el usuario en auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'compras@plotcenter.com',
  crypt('tu_contraseña_segura', gen_salt('bf')),
  NOW(),
  '{"nombre": "Juan Pérez", "role": "Compras"}'::jsonb,
  NOW(),
  NOW(),
  '',
  ''
);
```

**Nota**: Este método es más complejo. Recomiendo usar el Método 1.

---

## Método 3: Actualizar Rol de Usuario Existente

Si ya tienes un usuario y quieres cambiar su rol:

### Desde SQL Editor:
```sql
-- Actualizar el rol de un usuario existente
UPDATE user_profiles
SET role = 'Compras'
WHERE email = 'usuario@ejemplo.com';
```

---

## Verificar que el Usuario se Creó Correctamente

### Consulta SQL:
```sql
-- Ver todos los usuarios y sus roles
SELECT 
  up.id,
  up.email,
  up.nombre,
  up.role,
  up.activo,
  up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC;
```

---

## Solución de Problemas

### El usuario no puede iniciar sesión
1. Verifica que `activo = true` en `user_profiles`
2. Verifica que el email esté correcto
3. Verifica que la contraseña sea la correcta

### El usuario no tiene rol asignado
1. Verifica que el metadata tenga el campo `role`
2. Si falta, actualiza manualmente:
```sql
UPDATE user_profiles
SET role = 'Mostrador'
WHERE id = 'uuid-del-usuario';
```

### El trigger no creó el perfil automáticamente
Si el trigger falló, crea el perfil manualmente:
```sql
INSERT INTO user_profiles (id, email, nombre, role)
VALUES (
  'uuid-del-usuario-en-auth-users',
  'email@ejemplo.com',
  'Nombre del Usuario',
  'Mostrador'
);
```

---

## Crear Usuarios de Prueba

Para desarrollo, puedes crear varios usuarios de prueba:

### Usuario Compras:
- Email: `compras@plotcenter.com`
- Password: `Compras123!`
- Role: `Compras`

### Usuario Taller:
- Email: `taller@plotcenter.com`
- Password: `Taller123!`
- Role: `Taller Gráfico`

### Usuario Administrador:
- Email: `admin@plotcenter.com`
- Password: `Admin123!`
- Role: `Administrador`

---

## Importante

- **Primer Usuario**: Debe ser creado manualmente desde Supabase Dashboard
- **Contraseñas**: Usa contraseñas seguras en producción
- **Roles**: Solo los roles válidos funcionarán (ver lista arriba)
- **Metadata**: El campo `role` en metadata es crítico para el funcionamiento

