-- Script para crear usuario completo con rol desde SQL
-- ⚠️ IMPORTANTE: Esto es solo para casos avanzados
-- Recomendamos usar el Dashboard de Supabase (más fácil)

-- OPCIÓN 1: Crear usuario y perfil completo desde SQL
-- ⚠️ Reemplaza estos valores:
-- - 'usuario@ejemplo.com' → Email del usuario
-- - 'ContraseñaSegura123!' → Contraseña segura
-- - 'Nombre Usuario' → Nombre del usuario
-- - 'Compras' → Rol deseado (Compras, Administrador, Taller Gráfico, Metalúrgica, Mostrador)

DO $$
DECLARE
  nuevo_usuario_id UUID;
  usuario_email VARCHAR := 'usuario@ejemplo.com';  -- ⚠️ CAMBIA ESTO
  usuario_password VARCHAR := 'ContraseñaSegura123!';  -- ⚠️ CAMBIA ESTO
  usuario_nombre VARCHAR := 'Nombre Usuario';  -- ⚠️ CAMBIA ESTO
  usuario_role VARCHAR := 'Compras';  -- ⚠️ CAMBIA ESTO (Compras, Administrador, Taller Gráfico, Metalúrgica, Mostrador)
BEGIN
  -- Crear usuario en auth.users
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
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    usuario_email,
    crypt(usuario_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'nombre', usuario_nombre,
      'role', usuario_role
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO nuevo_usuario_id;

  -- El trigger debería crear el perfil automáticamente
  -- Pero por si acaso, lo creamos manualmente también
  INSERT INTO user_profiles (id, email, nombre, role)
  VALUES (nuevo_usuario_id, usuario_email, usuario_nombre, usuario_role)
  ON CONFLICT (id) DO UPDATE
  SET 
    nombre = usuario_nombre,
    role = usuario_role,
    email = usuario_email;

  RAISE NOTICE 'Usuario creado exitosamente: % con rol %', usuario_email, usuario_role;
END $$;

-- OPCIÓN 2: Solo actualizar el rol de un usuario existente (MÁS FÁCIL)
-- Ejecuta esto después de crear el usuario desde el Dashboard
UPDATE user_profiles
SET role = 'Compras'  -- ⚠️ CAMBIA EL ROL AQUÍ
WHERE email = 'tu-email@ejemplo.com';  -- ⚠️ CAMBIA EL EMAIL AQUÍ

-- Verificar
SELECT email, nombre, role, activo FROM user_profiles WHERE email = 'tu-email@ejemplo.com';

