-- Migración: Agregar campo numero a pedidos si no existe
-- Esta migración asegura que el campo numero exista en la tabla pedidos

-- Verificar si la columna numero existe, si no, agregarla
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pedidos' 
    AND column_name = 'numero'
  ) THEN
    -- Agregar columna numero
    ALTER TABLE pedidos ADD COLUMN numero VARCHAR(50);
    
    -- Generar números para pedidos existentes
    UPDATE pedidos 
    SET numero = 'PED-' || TO_CHAR(created_at, 'YYYY') || '-' || LPAD(id::TEXT, 4, '0')
    WHERE numero IS NULL OR numero = '';
    
    -- Hacer la columna NOT NULL después de poblar los datos
    ALTER TABLE pedidos ALTER COLUMN numero SET NOT NULL;
    
    -- Agregar índice único
    CREATE UNIQUE INDEX IF NOT EXISTS pedidos_numero_idx ON pedidos(numero);
  END IF;
END $$;

-- Asegurar que el trigger existe
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

-- Eliminar trigger si existe y recrearlo
DROP TRIGGER IF EXISTS trigger_generar_numero_pedido ON pedidos;
CREATE TRIGGER trigger_generar_numero_pedido
BEFORE INSERT ON pedidos
FOR EACH ROW
EXECUTE FUNCTION generar_numero_pedido();

