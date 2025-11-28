-- Script para solucionar problemas con roles de usuarios
-- Ejecuta esto en SQL Editor de Supabase

-- PASO 1: Ver qué usuarios tienes y sus roles actuales
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'nombre' as nombre_metadata,
  u.raw_user_meta_data->>'role' as role_metadata,
  up.nombre as nombre_perfil,
  up.role as role_perfil,
  up.activo
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;

-- PASO 2: Si el perfil NO existe, créalo con este script
-- Reemplaza 'EMAIL_DEL_USUARIO' con el email real del usuario
INSERT INTO user_profiles (id, email, nombre, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nombre', u.email),
  COALESCE(u.raw_user_meta_data->>'role', 'Mostrador')
FROM auth.users u
WHERE u.email = 'EMAIL_DEL_USUARIO'  -- ⚠️ CAMBIA ESTO
  AND u.id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- PASO 3: Si el perfil existe pero NO tiene rol, actualízalo
-- Reemplaza 'EMAIL_DEL_USUARIO' con el email real
UPDATE user_profiles
SET 
  role = COALESCE(
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = user_profiles.id),
    'Mostrador'
  ),
  nombre = COALESCE(
    (SELECT raw_user_meta_data->>'nombre' FROM auth.users WHERE id = user_profiles.id),
    email
  )
WHERE email = 'EMAIL_DEL_USUARIO'  -- ⚠️ CAMBIA ESTO
  AND (role IS NULL OR role = '');

-- PASO 4: Asignar rol específico manualmente
-- Ejemplo: Asignar rol "Compras" a un usuario específico
UPDATE user_profiles
SET role = 'Compras'EMAIL email = 'compras@plotcenter.com';  -- ⚠️ CAMBIA ESTO

-- O asignar rol "Administrador"
UPDATE user_profiles
SET role = 'Administrador'
WHERE email = 'admin@plotcenter.com';  -- ⚠️ CAMBIA ESTO

-- PASO 5: Verificar que todo quedó bien
SELECT 
  email,
  nombre,
  role,
  activo
FROM user_profiles
ORDER BY created_at DESC;

