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

export async function createPresupuesto(presupuesto: Omit<Presupuesto, 'id' | 'fechaCreacion' | 'items'> & { items: Omit<PresupuestoItem, 'id'>[] }): Promise<Presupuesto | null> {
  const supabase = createClient()
  
  // Generar número de presupuesto si no se proporciona
  const numero = presupuesto.numero || `PRES-${Date.now()}`
  
  // Crear el presupuesto
  const { data: presupuestoData, error: presupuestoError } = await supabase
    .from('presupuestos')
    .insert({
      proyecto_id: presupuesto.proyectoId || null,
      cliente_id: presupuesto.clienteId,
      numero: numero,
      fecha_vencimiento: presupuesto.fechaVencimiento.toISOString(),
      subtotal: presupuesto.subtotal,
      descuento: presupuesto.descuento,
      impuestos: presupuesto.impuestos,
      total: presupuesto.total,
      estado: presupuesto.estado,
      notas: presupuesto.notas,
    })
    .select()
    .single()

  if (presupuestoError || !presupuestoData) {
    console.error('Error creating presupuesto:', presupuestoError)
    return null
  }

  // Crear los items del presupuesto
  if (presupuesto.items && presupuesto.items.length > 0) {
    const itemsToInsert = presupuesto.items.map(item => ({
      presupuesto_id: presupuestoData.id,
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      descripcion: item.descripcion,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
      .from('presupuesto_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Error creating presupuesto items:', itemsError)
      // Eliminar el presupuesto si falla la inserción de items
      await supabase.from('presupuestos').delete().eq('id', presupuestoData.id)
      return null
    }
  }

  // Obtener el presupuesto completo con items
  return await getPresupuestoById(presupuestoData.id)
}

export async function updatePresupuesto(id: string, presupuesto: Partial<Presupuesto>): Promise<boolean> {
  const supabase = createClient()
  const updateData: any = {}
  
  if (presupuesto.proyectoId !== undefined) updateData.proyecto_id = presupuesto.proyectoId || null
  if (presupuesto.clienteId !== undefined) updateData.cliente_id = presupuesto.clienteId
  if (presupuesto.numero !== undefined) updateData.numero = presupuesto.numero
  if (presupuesto.fechaVencimiento !== undefined) updateData.fecha_vencimiento = presupuesto.fechaVencimiento.toISOString()
  if (presupuesto.subtotal !== undefined) updateData.subtotal = presupuesto.subtotal
  if (presupuesto.descuento !== undefined) updateData.descuento = presupuesto.descuento
  if (presupuesto.impuestos !== undefined) updateData.impuestos = presupuesto.impuestos
  if (presupuesto.total !== undefined) updateData.total = presupuesto.total
  if (presupuesto.estado !== undefined) updateData.estado = presupuesto.estado
  if (presupuesto.notas !== undefined) updateData.notas = presupuesto.notas

  const { error } = await supabase
    .from('presupuestos')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating presupuesto:', error)
    return false
  }

  return true
}

export async function deletePresupuesto(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('presupuestos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting presupuesto:', error)
    return false
  }

  return true
}

