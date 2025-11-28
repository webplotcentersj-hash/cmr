import { Cliente, Producto, Proyecto, Presupuesto } from '@/types';

// Datos de ejemplo para desarrollo
export const clientes: Cliente[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    telefono: '+54 11 1234-5678',
    empresa: 'Empresa ABC',
    direccion: 'Av. Corrientes 1234',
    ciudad: 'Buenos Aires',
    fechaCreacion: new Date('2024-01-15'),
    ultimaActualizacion: new Date('2024-01-20'),
  },
  {
    id: '2',
    nombre: 'María González',
    email: 'maria.gonzalez@startup.com',
    telefono: '+54 11 9876-5432',
    empresa: 'Startup XYZ',
    direccion: 'Calle Falsa 456',
    ciudad: 'Córdoba',
    fechaCreacion: new Date('2024-02-01'),
    ultimaActualizacion: new Date('2024-02-10'),
  },
];

export const productos: Producto[] = [
  {
    id: '1',
    nombre: 'Banner Vinílico',
    categoria: 'Banners',
    descripcion: 'Banner de vinilo para exteriores',
    precioBase: 1500,
    unidad: 'm2',
    activo: true,
  },
  {
    id: '2',
    nombre: 'Lona Publicitaria',
    categoria: 'Banners',
    descripcion: 'Lona de alta resistencia para exteriores',
    precioBase: 1800,
    unidad: 'm2',
    activo: true,
  },
  {
    id: '3',
    nombre: 'Señalética Interior',
    categoria: 'Señalética',
    descripcion: 'Señalética para interiores en PVC',
    precioBase: 2500,
    unidad: 'unidad',
    activo: true,
  },
  {
    id: '4',
    nombre: 'Plotter de Corte',
    categoria: 'Corte',
    descripcion: 'Corte de vinilo para decoración',
    precioBase: 800,
    unidad: 'm2',
    activo: true,
  },
  {
    id: '5',
    nombre: 'Impresión Digital',
    categoria: 'Impresión',
    descripcion: 'Impresión digital de alta calidad',
    precioBase: 1200,
    unidad: 'm2',
    activo: true,
  },
  {
    id: '6',
    nombre: 'Diseño Gráfico',
    categoria: 'Servicios',
    descripcion: 'Servicio de diseño gráfico',
    precioBase: 5000,
    unidad: 'hora',
    activo: true,
  },
];

export const proyectos: Proyecto[] = [
  {
    id: '1',
    clienteId: '1',
    nombre: 'Banner para Evento Corporativo',
    descripcion: 'Banner de 3x2 metros para evento corporativo',
    estado: 'en_produccion',
    fechaCreacion: new Date('2024-01-20'),
    fechaEntrega: new Date('2024-02-15'),
    presupuesto: 9000,
    items: [
      {
        id: '1',
        productoId: '1',
        cantidad: 6,
        precioUnitario: 1500,
        descripcion: 'Banner Vinílico 3x2m',
        subtotal: 9000,
      },
    ],
  },
  {
    id: '2',
    clienteId: '2',
    nombre: 'Señalética para Oficina',
    descripcion: 'Conjunto de señalética para nueva oficina',
    estado: 'aprobado',
    fechaCreacion: new Date('2024-02-05'),
    fechaEntrega: new Date('2024-02-25'),
    presupuesto: 15000,
    items: [
      {
        id: '2',
        productoId: '3',
        cantidad: 5,
        precioUnitario: 2500,
        descripcion: 'Señalética Interior',
        subtotal: 12500,
      },
      {
        id: '3',
        productoId: '6',
        cantidad: 2,
        precioUnitario: 5000,
        descripcion: 'Diseño Gráfico',
        subtotal: 10000,
      },
    ],
  },
];

export const presupuestos: Presupuesto[] = [
  {
    id: '1',
    proyectoId: '1',
    clienteId: '1',
    numero: 'PRES-2024-001',
    fechaCreacion: new Date('2024-01-18'),
    fechaVencimiento: new Date('2024-02-18'),
    items: [
      {
        id: '1',
        productoId: '1',
        cantidad: 6,
        precioUnitario: 1500,
        descripcion: 'Banner Vinílico 3x2m',
        subtotal: 9000,
      },
    ],
    subtotal: 9000,
    descuento: 0,
    impuestos: 1890,
    total: 10890,
    estado: 'aprobado',
  },
];

// Funciones helper para obtener datos relacionados
export function getClienteById(id: string): Cliente | undefined {
  return clientes.find(c => c.id === id);
}

export function getProductoById(id: string): Producto | undefined {
  return productos.find(p => p.id === id);
}

export function getProyectosByCliente(clienteId: string): Proyecto[] {
  return proyectos.filter(p => p.clienteId === clienteId);
}

export function getPresupuestosByCliente(clienteId: string): Presupuesto[] {
  return presupuestos.filter(p => p.clienteId === clienteId);
}

