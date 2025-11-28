-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  empresa VARCHAR(255),
  direccion TEXT,
  ciudad VARCHAR(100),
  notas TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_base DECIMAL(10, 2) NOT NULL,
  unidad VARCHAR(50) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'presupuesto',
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  presupuesto DECIMAL(10, 2),
  costo_final DECIMAL(10, 2),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT estado_valido CHECK (estado IN ('presupuesto', 'aprobado', 'en_produccion', 'completado', 'cancelado'))
);

-- Table: proyecto_items
CREATE TABLE IF NOT EXISTS proyecto_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vencimiento TIMESTAMP WITH TIME ZONE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  descuento DECIMAL(10, 2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT estado_presupuesto_valido CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'vencido'))
);

-- Table: presupuesto_items
CREATE TABLE IF NOT EXISTS presupuesto_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presupuesto_id UUID NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proyectos_cliente_id ON proyectos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyecto_items_proyecto_id ON proyecto_items(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_cliente_id ON presupuestos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_proyecto_id ON presupuestos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_estado ON presupuestos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later based on auth)
CREATE POLICY "Allow all operations on clientes" ON clientes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on productos" ON productos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on proyectos" ON proyectos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on proyecto_items" ON proyecto_items
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on presupuestos" ON presupuestos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on presupuesto_items" ON presupuesto_items
    FOR ALL USING (true) WITH CHECK (true);

