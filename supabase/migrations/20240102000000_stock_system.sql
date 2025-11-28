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
  numero VARCHAR(50) UNIQUE,
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

-- Función para generar número automático de pedido
CREATE OR REPLACE FUNCTION generar_numero_pedido() RETURNS TRIGGER AS $$
DECLARE
  nuevo_numero VARCHAR(50);
  año_actual VARCHAR(4);
  ultimo_numero INTEGER;
BEGIN
  -- Solo generar si el número está vacío o es NULL
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    -- Obtener el año actual
    año_actual := TO_CHAR(NOW(), 'YYYY');
    
    -- Buscar el último número de pedido del año actual
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM '[0-9]+$') AS INTEGER)), 0)
    INTO ultimo_numero
    FROM pedidos
    WHERE numero LIKE 'PED-' || año_actual || '-%';
    
    -- Generar nuevo número: PED-YYYY-XXXX
    nuevo_numero := 'PED-' || año_actual || '-' || LPAD((ultimo_numero + 1)::TEXT, 4, '0');
    
    -- Asignar el número al nuevo pedido
    NEW.numero := nuevo_numero;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número automático antes de insertar
DROP TRIGGER IF EXISTS trigger_generar_numero_pedido ON pedidos;
CREATE TRIGGER trigger_generar_numero_pedido
BEFORE INSERT ON pedidos
FOR EACH ROW
EXECUTE FUNCTION generar_numero_pedido();

-- Índice para búsqueda rápida por número
CREATE INDEX IF NOT EXISTS pedidos_numero_idx ON pedidos(numero);

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

-- Precargar materiales/artículos iniciales
INSERT INTO articulos (codigo, descripcion, sector, imagen, stock, stock_minimo, precio, created_at, updated_at) VALUES
('10112024', '(NO USAR)', 'Gral', NULL, 120, 10, 0.00, NOW(), NOW()),
('10404010', 'ACRILICO 2MM + CORTE EN CNC X M2', 'Gral', NULL, 202, 11, 78000.00, NOW(), NOW()),
('10404011', 'ACRILICO 3MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 130.00, NOW(), NOW()),
('10404012', 'ACRILICO 4MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404013', 'ACRILICO 5MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('022301002', 'ACRILICO ILUMINACION 3MM 1.22 X 2.44', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('022301001', 'ACRILICO LECHOSO 3MM 1.22 X 2.44', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('022301003', 'ACRILICO TRANSPARENTE 3MM 1.22 X 2.44', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10403011', 'ACRILICO TRANSPARENTE IMPRESO EN UV X M²', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21204006', 'ADHESIVO CON CORTE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21204004', 'ADHESIVO OBRA CON CORTE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21204005', 'ADHESIVO SIN CORTE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202002', 'AJUSTE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21601004', 'ALLWIN BLACK', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21601001', 'ALLWIN CYAN', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21601005', 'ALLWIN FLUSH', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21601002', 'ALLWIN MAGENTA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21601003', 'ALLWIN YELLOW', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21208001', 'ALTO IMPACTO 1MM BLANCO 1X2MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21208002', 'ALTO IMPACTO 2MM BLANCO 1X2MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404020', 'ALTO IMPACTO BLANCO 1MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404021', 'ALTO IMPACTO BLANCO 2MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404022', 'ALTO IMPACTO BLANCO 3MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21208003', 'ALTO IMPACTO NEGRO 1MM 1X2MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404025', 'ALTO IMPACTO NEGRO 1MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404026', 'ALTO IMPACTO NEGRO 2MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404027', 'ALTO IMPACTO NEGRO 3MM + CORTE EN CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10403020', 'ALTO IMPACTO PLOTEADO Y MONTADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201001', 'ARMADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201002', 'ARMADO DE CAJAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201004', 'ARMADO DE CORPÓREOS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201003', 'ARMADO DE STAND', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10103001', 'BANDERAS DE HILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10103002', 'BANDERAS DE POLIAMIDA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10202002', 'BANNER ROLL UP 0.85 X 2.00MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10202001', 'BANNER ROLL UP 1.00 X 2.00MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10202003', 'BANNER ROLL UP 1.20 X 2.00MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10202004', 'BANNER ROLL UP 1.50 X 2.00MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10202005', 'BANNER ROLL UP DOBLE FAZ 0.85 X 2.00MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202003', 'BASTIDOR', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202004', 'BASTIDOR MADERA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202005', 'BASTIDOR METALICO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301014', 'BLACK OUT MATE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301015', 'BLACK OUT MATE CONFECCIONADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102001', 'BORDADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209001', 'CAJA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10401001', 'CALADO DE ACRÍLICO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10401002', 'CALADO DE ALTO IMPACTO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10401003', 'CALADO DE LONA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10401004', 'CALADO DE MADERA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10401005', 'CALADO DE POLYFAN', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10401006', 'CALADO DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21202002', 'CARTELERIA BACKLIGHT', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21202003', 'CARTELERIA FRONTLIGHT', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21202004', 'CARTELERIA RUTERA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21202005', 'CARTEL OBRA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202006', 'CINTA BIFAZ', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201005', 'COLOCACION', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201006', 'COLOCACION DE GRAFICA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201007', 'COLOCACION DE LONA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201008', 'COLOCACION DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201009', 'COLOCACION EN ALTURA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201010', 'COLOCACION NOCTURNA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201011', 'COLOCACION vehicular', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201012', 'COLOCACION VIDRIERA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112001', 'CONFECCION', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112002', 'CONFECCION BOLSILLO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112003', 'CONFECCION DE BANDERAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112004', 'CONFECCION DE CORTINAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112005', 'CONFECCION DE MANTELES', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112006', 'CONFECCION DOBLADILLO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112007', 'CONFECCION OJALES', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112008', 'CONFECCION TELA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209002', 'CORPOREO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10301001', 'CORTE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10301002', 'CORTE DE LONA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10301003', 'CORTE DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10301004', 'CORTE LASER', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10301005', 'CORTE VINILO A REGISTRO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209003', 'CUADRO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209004', 'CUADRO TELA CANVAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202007', 'DEMASÍA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302001', 'DEPILADO DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21203001', 'DISEÑO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21203002', 'DISEÑO DE MARCA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21203003', 'DISEÑO GRAFICO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21203004', 'DISEÑO WEB', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21203005', 'EDICION DE ARCHIVO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21203006', 'EDICION FOTOGRAFICA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21203007', 'EMBALAJE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301016', 'ESMERILADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302002', 'ESMERILADO IMPRESO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301017', 'ESMERILADO LISO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301018', 'ESMERILADO PLOTTEADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209005', 'ESTRUCTURA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209006', 'ESTRUCTURA DE HIERRO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209007', 'EXHIBIDOR', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21204001', 'FOTO MURAL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21204002', 'FOTO MURAL CON COLOCACION', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209008', 'GIGANTOGRAFIA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10109001', 'GORRAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10109002', 'GORRAS ESTAMPADAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10109003', 'GORRAS SUBLIMADAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209009', 'GRAFICA vehicular', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112009', 'IMPRESION', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21205001', 'IMPRESION LASER', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21205002', 'IMPRESION OFFSET', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302003', 'IMAN', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302004', 'IMAN vehicular', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202008', 'INSTALACION ELECTRICA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10104001', 'LIENZO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10104002', 'LIENZO IMPRESO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301001', 'LONA BACKLIGHT', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301002', 'LONA BLACK OUT', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301003', 'LONA FRONTLIGHT', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301004', 'LONA MATE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301005', 'LONA MESH', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301006', 'LONA TRASLUCIDA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209010', 'MADERA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404030', 'MADERA + CORTE CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10403030', 'MADERA PLOTEADA Y MONTADA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10105001', 'MANTELES', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10105002', 'MANTELES DE TROPICAL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10105003', 'MANTELES SUBLIMADOS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202009', 'MARCO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202010', 'MARCO DE MADERA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202011', 'MARCO DE METAL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301019', 'MICROPERFORADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201001', 'MDF 3MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201002', 'MDF 5MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201003', 'MDF BLANCO 3MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201004', 'MDF BLANCO 5MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209011', 'MOBILIARIO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10402001', 'MONTADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10402002', 'MONTADO DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202012', 'MUESTRA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112010', 'OJALES', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201013', 'OPERARIO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301007', 'PAPEL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301008', 'PAPEL AFICHE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301009', 'PAPEL BLUE BACK', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301010', 'PAPEL FOTOGRAFICO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301011', 'PAPEL OBRA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301012', 'PAPEL SINTETICO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21301013', 'PAPEL TYVEK', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209012', 'PINTURA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209013', 'PLOTEADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209014', 'PLOTEADO vehicular', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209015', 'PLOTEADO VIDRIERA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201005', 'POLYFAN 20MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201006', 'POLYFAN 25MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201007', 'POLYFAN 30MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201008', 'POLYFAN 40MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201009', 'POLYFAN 50MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404040', 'POLYFAN + CORTE CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10403040', 'POLYFAN PINTADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201010', 'PVC ESPUMADO 3MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22201011', 'PVC ESPUMADO 5MM', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10404050', 'PVC ESPUMADO + CORTE CNC X M2', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10403050', 'PVC ESPUMADO PLOTEADO Y MONTADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10106001', 'REMERAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10106002', 'REMERAS DE ALGODON', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10106003', 'REMERAS DE MODAL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10106004', 'REMERAS ESTAMPADAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10106005', 'REMERAS SUBLIMADAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302005', 'RECORTE DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302006', 'REFRACTIVO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302007', 'REFRACTIVO IMPRESO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302008', 'REFILADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302009', 'REFILADO DE LONA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302010', 'REFILADO DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202013', 'RETOQUE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('22202014', 'ROTULADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21206001', 'SEÑALETICA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21206002', 'SEÑALETICA BRAILLE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21206003', 'SEÑALETICA DE EMERGENCIA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21206004', 'SEÑALETICA DE SEGURIDAD', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21206005', 'SEÑALETICA VIAL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21207001', 'SERVICIO DE GRUA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10112011', 'SOLDADURA DE LONA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10101001', 'SUBLIMACION', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10101002', 'SUBLIMACION DE TELA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209016', 'TARIFA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10107001', 'TAZAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10107002', 'TAZAS SUBLIMADAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102003', 'TELA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102004', 'TELA BLACK OUT', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102005', 'TELA CANVAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102006', 'TELA CORDURA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102007', 'TELA FLAG', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102008', 'TELA GABARDINA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102009', 'TELA KETTEN', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102010', 'TELA MICROFIBRA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102011', 'TELA POLIAMIDA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102012', 'TELA SILVER', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102013', 'TELA TROPICAL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10102014', 'TELA TRUCKER', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302011', 'TERMOTRANSFERIBLE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302012', 'TERMOTRANSFERIBLE ESTAMPADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302013', 'TERMOTRANSFERIBLE IMPRESO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302014', 'TERMOTRANSFERIBLE SUBLIMABLE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302015', 'TERMOTRANSFERIBLE TEXTIL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302016', 'TINTA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302017', 'TINTA UV', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21209017', 'TOMA DE MEDIDAS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302018', 'TRANSFER', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302019', 'TRANSFER DE VINILO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21201014', 'TRASLADO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10108001', 'UNIFORMES', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10108002', 'UNIFORMES BORDADOS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10108003', 'UNIFORMES ESTAMPADOS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10108004', 'UNIFORMES SUBLIMADOS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000001', 'VINILO ESMERILADO IMPRESO 1.25', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000002', 'VINILO ESMERILADO LISO 1.25', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21915001', 'VINILO ESMERILADO ORACAL 8510-090 SILVER COARSE 1,26MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000003', 'VINILO MICROPERFORADO 1.55', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000004', 'VINILO PET ESMERILADO LG 1.27', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000005', 'VINILO REFLECTIVO BLANCO 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21916001', 'VINILO REFLECTIVO BLANCO ORALITE 5400-010 1,26MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000006', 'VINILO REFLECTIVO DE CORTE AMARILLO 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000007', 'VINILO REFLECTIVO DE CORTE AZUL 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000008', 'VINILO REFLECTIVO DE CORTE BLANCO 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000009', 'VINILO REFLECTIVO DE CORTE NARANJA 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000010', 'VINILO REFLECTIVO DE CORTE ROJO 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000011', 'VINILO REFLECTIVO DE CORTE VERDE 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000012', 'VINILO REFLECTIVO DE CORTE 3M AMARILLO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000013', 'VINILO REFLECTIVO DE CORTE 3M AZUL', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000014', 'VINILO REFLECTIVO DE CORTE 3M BLANCO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000015', 'VINILO REFLECTIVO DE CORTE 3M NARANJA', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000016', 'VINILO REFLECTIVO DE CORTE 3M NEGRO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000017', 'VINILO REFLECTIVO DE CORTE 3M ROJO', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000018', 'VINILO REFLECTIVO DE CORTE 3M VERDE', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000019', 'VINILO REFLECTIVO DE IMPRESION 1.24', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000021', 'VINILO REFLECTIVO DE IMPRESION 1.24 WINFLEX', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('10302020', 'VINILO REFLECTIVO IMPRESO X M²', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('1000000020', 'VINILO TRANSPARENTE BRILLANTE ORAGUARD 1.55', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21901001', 'VINILOS BRILLANTE BASE BLANCA ORACAL 651G-010 0,6MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21901002', 'VINILOS BRILLANTE BASE BLANCA ORACAL 651G-010 1,06MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21901003', 'VINILOS BRILLANTE BASE BLANCA ORACAL 651G-010 1,26MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21901004', 'VINILOS BRILLANTE BASE BLANCA ORACAL 651G-010 1,37MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21901005', 'VINILOS BRILLANTE BASE BLANCA ORACAL 651G-010 1,52MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21909002', 'VINILOS BRILLANTE BASE GRIS MPI 3803 WHITE GLOSS PERM 1,26MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21909003', 'VINILOS BRILLANTE BASE GRIS MPI 3803 WHITE GLOSS PERM 1,37MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21909001', 'VINILOS BRILLANTE BASE GRIS MPI 3803 WHITE GLOSS PERM 1,52MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21910002', 'VINILOS MATE BASE GRIS ORACAL 3651M-010 1,26MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21910003', 'VINILOS MATE BASE GRIS ORACAL 3651M-010 1,37MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('21910001', 'VINILOS MATE BASE GRIS ORACAL 3651M-010 1,52MTS', 'Gral', NULL, 100, 10, 0.00, NOW(), NOW()),
('P350GRM', 'PLIEGO 350GR MATE', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('P300GRM', 'PLIEGO 300GR MATE', 'Imprenta', NULL, 3, 2, 0.00, NOW(), NOW()),
('P170GRB', 'PLIEGO 170GR ILUSTRACION BRILLANTE', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('P115GRB', 'PLIEGO 115GR ILUSTRACION BRILLANTE', 'Imprenta', NULL, 7, 2, 0.00, NOW(), NOW()),
('P120GRO', 'PLIEGO 120GR OBRA ', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('P180GRO', 'PLIEGO 180GR OBRA', 'Imprenta', NULL, 3, 2, 0.00, NOW(), NOW()),
('P240GRO', 'PLIEGO 240GR OBRA', 'Imprenta', NULL, 3, 2, 0.00, NOW(), NOW()),
('PADHB', 'PLIEGO ADHESIVO BRILLANTE', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('PADHBT', 'PLIEGO ADHESIVO BRILLANTE CON TROQUEL', 'Imprenta', NULL, 1, 2, 0.00, NOW(), NOW()),
('PADHO', 'PLIEGO ADHESIVO OBRA', 'Imprenta', NULL, 4, 1, 0.00, NOW(), NOW()),
('PQCB', 'PLIEGO QUIMICO CB', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('PQCFB', 'PLIEGO QUIMICO CFB', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('PQCF', 'PLIEGO QUIMICO CF', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('PPA3', 'PLANCHA PLASTIFICADO A3', 'Imprenta', NULL, 1, 2, 0.00, NOW(), NOW()),
('PPA4', 'PLANCHA PLASTIFICADO A4', 'Imprenta', NULL, 1, 2, 0.00, NOW(), NOW()),
('BN23/8', 'BROCHE N° 23/08', 'Imprenta', NULL, 4, 1, 0.00, NOW(), NOW()),
('BN23/10', 'BROCHE N°23/10', 'Imprenta', NULL, 5, 1, 0.00, NOW(), NOW()),
('BN23/13', 'BROCHE N°23/13', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('BN23/15', 'BROCHE N°23/15', 'Imprenta', NULL, 5, 1, 0.00, NOW(), NOW()),
('BN23/17', 'BROCHE N°23/17', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('BN21/6', 'BROCHE N°21/06', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('BN24/6', 'BROCHE N°24/6', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('BN23/24', 'BROCHE N°23/24', 'Imprenta', NULL, 4, 1, 0.00, NOW(), NOW()),
('APN7', 'ANILLO PLASTICO N°07', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('APN9', 'ANILLO PLASTICO N°09', 'Imprenta', NULL, 2, 1, 0.00, NOW(), NOW()),
('APN12', 'ANILLO PLASTICO N°12', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('APN14', 'ANILLO PLASTICO N°14', 'Imprenta', NULL, 4, 1, 0.00, NOW(), NOW()),
('APN17', 'ANILLO PLASTICO N°17', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('APN20', 'ANILLO PLASTICO N°20', 'Imprenta', NULL, 2, 1, 0.00, NOW(), NOW()),
('APN23', 'ANILLO PLASTICO N°23', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('APN25', 'ANILLO PLASTICO N°25', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('APN29', 'ANILLO PLASTICO N°29', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('APN33', 'ANILLO PLASTICO N°33', 'Imprenta', NULL, 0, 1, 0.00, NOW(), NOW()),
('APN40', 'ANILLO PLASTICO N°40', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('APN45', 'ANILLO PLASTICO N°45', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('APN50', 'ANILLO PLASTICO N°50', 'Imprenta', NULL, 2, 1, 0.00, NOW(), NOW()),
('TTA4', 'TAPA TRANSPARENTE A4', 'Imprenta', NULL, 0, 1, 0.00, NOW(), NOW()),
('TTA3', 'TAPAS TRANSPARENTES A3', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('TNA4', 'TAPAS NEGRAS A4', 'Imprenta', NULL, 0, 1, 0.00, NOW(), NOW()),
('TNA3', 'TAPAS NEGRAS A3', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('PSPOL', 'PEGAMENTO SUBLIPOL', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('PGOT', 'PEGAMENTO GOTITA', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('CM12', 'CARTON MAQUETERO N°12', 'Imprenta', NULL, 3, 5, 0.00, NOW(), NOW()),
('LMM', 'ROLLO LAMINADO MATE', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('LMB', 'ROLLO LAMINADO BRILLANTE', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('AM3164', 'ANILLOS METALICOS 3:1 - 06,4MM', 'Imprenta', NULL, 3, 1, 0.00, NOW(), NOW()),
('AM3179', 'ANILLOS METALICOS 3:1 - 07,9MM', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('AM3195', 'ANILLOS METALICOS 3:1 - 09,5MM', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('AM31125', 'ANILLOS METALICOS 3:1 - 12,5MM', 'Imprenta', NULL, 3, 2, 0.00, NOW(), NOW()),
('AM31143', 'ANILLOS METALICOS 3:1 - 14,3MM', 'Imprenta', NULL, 4, 2, 0.00, NOW(), NOW()),
('AM2164', 'ANILLOS METALICOS 2:1 - 06,4MM', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('AM2179', 'ANILLOS METALICOS 2:1 - 07,9MM', 'Imprenta', NULL, 2, 1, 0.00, NOW(), NOW()),
('AM2195', 'ANILLOS METALICOS 2:1 - 09,5MM', 'Imprenta', NULL, 1, 1, 0.00, NOW(), NOW()),
('AM21111', 'ANILLOS METALICOS 2:1 - 11,1MM', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('AM21143', 'ANILLOS METALICOS 2:1 - 14,3MM', 'Imprenta', NULL, 4, 2, 0.00, NOW(), NOW()),
('AM21160', 'ANILLOS METALICOS 2:1 - 16MM', 'Imprenta', NULL, 1, 2, 0.00, NOW(), NOW()),
('AM21190', 'ANILLOS METALICOS 2:1 - 19MM', 'Imprenta', NULL, 2, 2, 0.00, NOW(), NOW()),
('AM21250', 'ANILLOS METALICOS 2:1 - 25MM', 'Imprenta', NULL, 3, 2, 0.00, NOW(), NOW()),
('AM21220', 'ANILLOS METALICOS 2:1 - 22MM', 'Imprenta', NULL, 4, 2, 0.00, NOW(), NOW()),
('AM21280', 'ANILLOS METALICOS 2:1 - 28MM', 'Imprenta', NULL, 4, 2, 0.00, NOW(), NOW()),
('AM21320', 'ANILLOS METALICOS 2:1 - 32MM', 'Imprenta', NULL, 3, 2, 0.00, NOW(), NOW()),
('BN23/6', 'BROCHE N° 23/06', 'Imprenta', NULL, 4, 1, 0.00, NOW(), NOW()),
('BN23/20', 'BROCHE N°23/20', 'Imprenta', NULL, 5, 1, 0.00, NOW(), NOW()),
('4080TN619C', 'TONER 4080 CYAN', 'Mostrador', NULL, 1, 0, 0.00, NOW(), NOW()),
('4080TN619M', 'TONER 4080 MAGENTA', 'Mostrador', NULL, 1, 0, 0.00, NOW(), NOW()),
('4080TN619Y', 'TONER 4080 AMARILLO', 'Mostrador', NULL, 0, 0, 0.00, NOW(), NOW()),
('4080TN619K', 'TONER 4080 NEGRO', 'Mostrador', NULL, 1, 0, 0.00, NOW(), NOW()),
('6100TN622C', 'TONER 6100 CYAN', 'Mostrador', NULL, 1, 0, 0.00, NOW(), NOW()),
('6100TN622M', 'TONER 6100 MAGENTA', 'Mostrador', NULL, 1, 0, 0.00, NOW(), NOW());

