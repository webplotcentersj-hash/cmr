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

