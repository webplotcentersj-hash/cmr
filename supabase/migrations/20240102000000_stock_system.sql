-- Migración: Sistema de Stock, Pedidos y Caja
-- Integración del sistema de stock de Plot Center al CRM

-- Tabla articulos (materiales/inventario)
CREATE TABLE IF NOT EXISTS articulos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NOT NULL,
  sector VARCHAR(50) NOT NULL DEFAULT 'Gral',
  imagen TEXT,
  stock INTEGER NOT NULL DEFAULT 100,
  stock_minimo INTEGER NOT NULL DEFAULT 10,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla pedidos (pedidos de clientes)
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  approval_status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Tabla pedidos_items (artículos en cada pedido)
CREATE TABLE IF NOT EXISTS pedidos_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  articulo_id INTEGER NOT NULL REFERENCES articulos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL,
  stock_disponible INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla ordenes_compra (órdenes de compra a proveedores)
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id SERIAL PRIMARY KEY,
  articulo_id INTEGER NOT NULL REFERENCES articulos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  proveedor VARCHAR(255) DEFAULT 'Por definir',
  observaciones TEXT,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla movimientos_caja (ingresos y egresos de caja)
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Ingreso','Egreso')),
  categoria VARCHAR(100) NOT NULL DEFAULT 'General',
  concepto VARCHAR(255) NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla notifications (notificaciones del sistema)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  title VARCHAR(255),
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'order_update',
  related_id INTEGER,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla comments (comentarios en pedidos)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  user_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla configuracion (parámetros globales)
CREATE TABLE IF NOT EXISTS configuracion (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descripcion VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_articulos_sector ON articulos(sector);
CREATE INDEX IF NOT EXISTS idx_articulos_codigo ON articulos(codigo);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_approval_status ON pedidos(approval_status);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_items_pedido ON pedidos_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_items_articulo ON pedidos_items(articulo_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_status ON ordenes_compra(status);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_articulo ON ordenes_compra(articulo_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo ON movimientos_caja(tipo);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Triggers para updated_at
CREATE TRIGGER update_articulos_updated_at BEFORE UPDATE ON articulos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_compra_updated_at BEFORE UPDATE ON ordenes_compra
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE articulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir todo por ahora - ajustar según necesidades)
CREATE POLICY "Allow all operations on articulos" ON articulos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on pedidos" ON pedidos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on pedidos_items" ON pedidos_items
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ordenes_compra" ON ordenes_compra
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on movimientos_caja" ON movimientos_caja
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notifications" ON notifications
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on comments" ON comments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on configuracion" ON configuracion
    FOR ALL USING (true) WITH CHECK (true);

