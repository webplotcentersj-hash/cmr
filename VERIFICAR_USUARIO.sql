-- Script para verificar que el usuario se creó correctamente
-- Ejecuta esto en SQL Editor de Supabase

-- 1. Verificar que el usuario existe en auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar que el perfil se creó en user_profiles
SELECT 
  id,
  email,
  nombre,
  role,
  activo,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 3. Verificar que el trigger funcionó correctamente
-- Si el usuario tiene perfil, el trigger funcionó bien
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  up.id as profile_id,
  up.nombre,
  up.role,
  up.activo
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;

-- 4. Si falta el perfil, crearlo manualmente (reemplaza los valores)
-- Descomenta y ejecuta solo si el trigger no funcionó:
/*
INSERT INTO user_profiles (id, email, nombre, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'nombre', email),
  COALESCE(raw_user_meta_data->>'role', 'Mostrador')
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);
*/

