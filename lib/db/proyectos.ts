import { createClient } from '@/lib/supabase/client'
import { Proyecto, ProyectoItem } from '@/types'

export async function getProyectos(): Promise<Proyecto[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proyectos')
    .select(`
      *,
      proyecto_items (
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
    console.error('Error fetching proyectos:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    clienteId: item.cliente_id,
    nombre: item.nombre,
    descripcion: item.descripcion,
    estado: item.estado,
    fechaCreacion: new Date(item.fecha_creacion),
    fechaEntrega: item.fecha_entrega ? new Date(item.fecha_entrega) : undefined,
    presupuesto: item.presupuesto ? parseFloat(item.presupuesto) : undefined,
    costoFinal: item.costo_final ? parseFloat(item.costo_final) : undefined,
    notas: item.notas,
    items: (item.proyecto_items || []).map((pi: any) => ({
      id: pi.id,
      productoId: pi.producto_id,
      cantidad: parseFloat(pi.cantidad),
      precioUnitario: parseFloat(pi.precio_unitario),
      descripcion: pi.descripcion,
      subtotal: parseFloat(pi.subtotal),
    })),
  }))
}

export async function getProyectoById(id: string): Promise<Proyecto | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proyectos')
    .select(`
      *,
      proyecto_items (
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
    console.error('Error fetching proyecto:', error)
    return null
  }

  return {
    id: data.id,
    clienteId: data.cliente_id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    estado: data.estado,
    fechaCreacion: new Date(data.fecha_creacion),
    fechaEntrega: data.fecha_entrega ? new Date(data.fecha_entrega) : undefined,
    presupuesto: data.presupuesto ? parseFloat(data.presupuesto) : undefined,
    costoFinal: data.costo_final ? parseFloat(data.costo_final) : undefined,
    notas: data.notas,
    items: (data.proyecto_items || []).map((pi: any) => ({
      id: pi.id,
      productoId: pi.producto_id,
      cantidad: parseFloat(pi.cantidad),
      precioUnitario: parseFloat(pi.precio_unitario),
      descripcion: pi.descripcion,
      subtotal: parseFloat(pi.subtotal),
    })),
  }
}

export async function getProyectosByCliente(clienteId: string): Promise<Proyecto[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proyectos')
    .select(`
      *,
      proyecto_items (
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
    console.error('Error fetching proyectos by cliente:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    clienteId: item.cliente_id,
    nombre: item.nombre,
    descripcion: item.descripcion,
    estado: item.estado,
    fechaCreacion: new Date(item.fecha_creacion),
    fechaEntrega: item.fecha_entrega ? new Date(item.fecha_entrega) : undefined,
    presupuesto: item.presupuesto ? parseFloat(item.presupuesto) : undefined,
    costoFinal: item.costo_final ? parseFloat(item.costo_final) : undefined,
    notas: item.notas,
    items: (item.proyecto_items || []).map((pi: any) => ({
      id: pi.id,
      productoId: pi.producto_id,
      cantidad: parseFloat(pi.cantidad),
      precioUnitario: parseFloat(pi.precio_unitario),
      descripcion: pi.descripcion,
      subtotal: parseFloat(pi.subtotal),
    })),
  }))
}

export async function createProyecto(proyecto: Omit<Proyecto, 'id' | 'fechaCreacion' | 'items'>): Promise<Proyecto | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proyectos')
    .insert({
      cliente_id: proyecto.clienteId,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      estado: proyecto.estado,
      fecha_entrega: proyecto.fechaEntrega?.toISOString(),
      presupuesto: proyecto.presupuesto,
      costo_final: proyecto.costoFinal,
      notas: proyecto.notas,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating proyecto:', error)
    return null
  }

  return {
    id: data.id,
    clienteId: data.cliente_id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    estado: data.estado,
    fechaCreacion: new Date(data.fecha_creacion),
    fechaEntrega: data.fecha_entrega ? new Date(data.fecha_entrega) : undefined,
    presupuesto: data.presupuesto ? parseFloat(data.presupuesto) : undefined,
    costoFinal: data.costo_final ? parseFloat(data.costo_final) : undefined,
    notas: data.notas,
    items: [],
  }
}

export async function updateProyecto(id: string, proyecto: Partial<Proyecto>): Promise<boolean> {
  const supabase = createClient()
  const updateData: any = {}
  
  if (proyecto.clienteId !== undefined) updateData.cliente_id = proyecto.clienteId
  if (proyecto.nombre !== undefined) updateData.nombre = proyecto.nombre
  if (proyecto.descripcion !== undefined) updateData.descripcion = proyecto.descripcion
  if (proyecto.estado !== undefined) updateData.estado = proyecto.estado
  if (proyecto.fechaEntrega !== undefined) updateData.fecha_entrega = proyecto.fechaEntrega?.toISOString()
  if (proyecto.presupuesto !== undefined) updateData.presupuesto = proyecto.presupuesto
  if (proyecto.costoFinal !== undefined) updateData.costo_final = proyecto.costoFinal
  if (proyecto.notas !== undefined) updateData.notas = proyecto.notas

  const { error } = await supabase
    .from('proyectos')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating proyecto:', error)
    return false
  }

  return true
}

export async function deleteProyecto(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('proyectos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting proyecto:', error)
    return false
  }

  return true
}

