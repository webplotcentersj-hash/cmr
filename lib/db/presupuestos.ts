import { createClient } from '@/lib/supabase/client'
import { Presupuesto, PresupuestoItem } from '@/types'

export async function getPresupuestos(): Promise<Presupuesto[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('presupuestos')
    .select(`
      *,
      presupuesto_items (
        id,
        producto_id,
        cantidad,
        precio_unitario,
        descripcion,
        subtotal
      )
    `)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error fetching presupuestos:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    proyectoId: item.proyecto_id,
    clienteId: item.cliente_id,
    numero: item.numero,
    fechaCreacion: new Date(item.fecha_creacion),
    fechaVencimiento: new Date(item.fecha_vencimiento),
    items: (item.presupuesto_items || []).map((pi: any) => ({
      id: pi.id,
      productoId: pi.producto_id,
      cantidad: parseFloat(pi.cantidad),
      precioUnitario: parseFloat(pi.precio_unitario),
      descripcion: pi.descripcion,
      subtotal: parseFloat(pi.subtotal),
    })),
    subtotal: parseFloat(item.subtotal),
    descuento: parseFloat(item.descuento),
    impuestos: parseFloat(item.impuestos),
    total: parseFloat(item.total),
    estado: item.estado,
    notas: item.notas,
  }))
}

export async function getPresupuestoById(id: string): Promise<Presupuesto | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('presupuestos')
    .select(`
      *,
      presupuesto_items (
        id,
        producto_id,
        cantidad,
        precio_unitario,
        descripcion,
        subtotal
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching presupuesto:', error)
    return null
  }

  return {
    id: data.id,
    proyectoId: data.proyecto_id,
    clienteId: data.cliente_id,
    numero: data.numero,
    fechaCreacion: new Date(data.fecha_creacion),
    fechaVencimiento: new Date(data.fecha_vencimiento),
    items: (data.presupuesto_items || []).map((pi: any) => ({
      id: pi.id,
      productoId: pi.producto_id,
      cantidad: parseFloat(pi.cantidad),
      precioUnitario: parseFloat(pi.precio_unitario),
      descripcion: pi.descripcion,
      subtotal: parseFloat(pi.subtotal),
    })),
    subtotal: parseFloat(data.subtotal),
    descuento: parseFloat(data.descuento),
    impuestos: parseFloat(data.impuestos),
    total: parseFloat(data.total),
    estado: data.estado,
    notas: data.notas,
  }
}

export async function getPresupuestosByCliente(clienteId: string): Promise<Presupuesto[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('presupuestos')
    .select(`
      *,
      presupuesto_items (
        id,
        producto_id,
        cantidad,
        precio_unitario,
        descripcion,
        subtotal
      )
    `)
    .eq('cliente_id', clienteId)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error fetching presupuestos by cliente:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    proyectoId: item.proyecto_id,
    clienteId: item.cliente_id,
    numero: item.numero,
    fechaCreacion: new Date(item.fecha_creacion),
    fechaVencimiento: new Date(item.fecha_vencimiento),
    items: (item.presupuesto_items || []).map((pi: any) => ({
      id: pi.id,
      productoId: pi.producto_id,
      cantidad: parseFloat(pi.cantidad),
      precioUnitario: parseFloat(pi.precio_unitario),
      descripcion: pi.descripcion,
      subtotal: parseFloat(pi.subtotal),
    })),
    subtotal: parseFloat(item.subtotal),
    descuento: parseFloat(item.descuento),
    impuestos: parseFloat(item.impuestos),
    total: parseFloat(item.total),
    estado: item.estado,
    notas: item.notas,
  }))
}

