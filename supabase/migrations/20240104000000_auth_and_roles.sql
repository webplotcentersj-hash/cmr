-- Migración: Sistema de Autenticación y Roles
-- Implementa usuarios, perfiles y sistema de roles

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Mostrador' CHECK (role IN ('Compras', 'Taller Gráfico', 'Metalúrgica', 'Mostrador', 'Administrador')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role);
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_activo_idx ON user_profiles(activo);

-- Función para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nombre, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Mostrador')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Actualizar tabla pedidos para vincular con usuarios
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS pedidos_user_id_idx ON pedidos(user_id);

-- Actualizar tabla ordenes_compra para vincular con usuarios
ALTER TABLE ordenes_compra 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ordenes_compra_user_id_idx ON ordenes_compra(user_id);

-- Políticas RLS (Row Level Security) para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Los administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );

-- Política: Los usuarios pueden actualizar su propio perfil (excepto rol)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (role = (SELECT role FROM user_profiles WHERE id = auth.uid()) OR
     EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Administrador'))
  );

-- Política: Los administradores pueden actualizar cualquier perfil
CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );

-- Política: Los administradores pueden insertar perfiles
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );

-- Actualizar políticas RLS para pedidos
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver pedidos
CREATE POLICY "Authenticated users can view pedidos"
  ON pedidos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Los usuarios pueden crear pedidos
CREATE POLICY "Users can create pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Los usuarios pueden actualizar sus propios pedidos o Compras puede actualizar cualquier pedido
CREATE POLICY "Users can update pedidos"
  ON pedidos FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('Compras', 'Administrador')
      )
    )
  );

-- Política: Compras y Administradores pueden aprobar/rechazar pedidos
CREATE POLICY "Compras can approve pedidos"
  ON pedidos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('Compras', 'Administrador')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('Compras', 'Administrador')
    )
  );

-- Política para pedidos_items
ALTER TABLE pedidos_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pedido items"
  ON pedidos_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE pedidos.id = pedidos_items.pedido_id
    )
  );

CREATE POLICY "Users can create pedido items"
  ON pedidos_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para ordenes_compra
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Compras can view ordenes compra"
  ON ordenes_compra FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('Compras', 'Administrador')
    )
  );

CREATE POLICY "Compras can create ordenes compra"
  ON ordenes_compra FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('Compras', 'Administrador')
    )
  );

CREATE POLICY "Compras can update ordenes compra"
  ON ordenes_compra FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('Compras', 'Administrador')
    )
  );

-- Insertar usuario administrador por defecto (se debe crear primero en auth.users)
-- Este usuario se creará manualmente desde la interfaz de Supabase Auth

