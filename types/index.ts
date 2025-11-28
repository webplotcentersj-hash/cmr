export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;
  fechaCreacion: Date;
  ultimaActualizacion: Date;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  precioBase: number;
  unidad: string; // 'm2', 'unidad', 'metro', etc.
  activo: boolean;
}

export interface Proyecto {
  id: string;
  clienteId: string;
  nombre: string;
  descripcion?: string;
  estado: 'presupuesto' | 'aprobado' | 'en_produccion' | 'completado' | 'cancelado';
  fechaCreacion: Date;
  fechaEntrega?: Date;
  presupuesto?: number;
  costoFinal?: number;
  items: ProyectoItem[];
  notas?: string;
}

export interface ProyectoItem {
  id: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descripcion?: string;
  subtotal: number;
}

export interface Presupuesto {
  id: string;
  proyectoId: string;
  clienteId: string;
  numero: string;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  items: PresupuestoItem[];
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido';
  notas?: string;
}

export interface PresupuestoItem {
  id: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descripcion?: string;
  subtotal: number;
}

export interface Estadisticas {
  totalClientes: number;
  totalProyectos: number;
  proyectosActivos: number;
  ingresosMes: number;
  proyectosCompletadosMes: number;
  promedioTiempoProyecto: number;
}

// Sistema de Stock
export interface Articulo {
  id: number;
  codigo: string;
  descripcion: string;
  sector: string;
  imagen?: string;
  stock: number;
  stock_minimo: number;
  precio: number;
  created_at: Date;
  updated_at: Date;
}

export interface Pedido {
  id: number;
  numero: string;
  client_name: string;
  description: string;
  image_url?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  cliente_id?: string;
  approval_status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  articulo_id: number;
  cantidad: number;
  stock_disponible: number;
  created_at: Date;
}

export interface OrdenCompra {
  id: number;
  articulo_id: number;
  cantidad: number;
  proveedor: string;
  observaciones?: string;
  pedido_id?: number;
  status: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
  created_at: Date;
  updated_at: Date;
}

export interface MovimientoCaja {
  id: number;
  tipo: 'Ingreso' | 'Egreso';
  categoria: string;
  concepto: string;
  monto: number;
  metodo_pago: string;
  pedido_id?: number;
  proyecto_id?: string;
  observaciones?: string;
  created_at: Date;
}

export interface Notification {
  id: number;
  user_id?: string;
  title?: string;
  message: string;
  type: string;
  related_id?: number;
  is_read: boolean;
  created_at: Date;
}

export interface Comment {
  id: number;
  pedido_id: number;
  user_id?: string;
  content: string;
  created_at: Date;
}

