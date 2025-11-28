import { createClient } from '@/lib/supabase/client'
import { OrdenCompra } from '@/types'

export async function getOrdenesCompra(status?: string): Promise<OrdenCompra[]> {
  const supabase = createClient()
  let query = supabase
    .from('ordenes_compra')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching ordenes compra:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    articulo_id: item.articulo_id,
    cantidad: item.cantidad,
    proveedor: item.proveedor,
    observaciones: item.observaciones,
    pedido_id: item.pedido_id,
    status: item.status,
    created_at: new Date(item.created_at),
    updated_at: new Date(item.updated_at),
  }))
}

export async function createOrdenCompra(orden: Omit<OrdenCompra, 'id' | 'created_at' | 'updated_at'>): Promise<OrdenCompra | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ordenes_compra')
    .insert({
      articulo_id: orden.articulo_id,
      cantidad: orden.cantidad,
      proveedor: orden.proveedor,
      observaciones: orden.observaciones,
      pedido_id: orden.pedido_id,
      status: orden.status,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating orden compra:', error)
    return null
  }

  return {
    id: data.id,
    articulo_id: data.articulo_id,
    cantidad: data.cantidad,
    proveedor: data.proveedor,
    observaciones: data.observaciones,
    pedido_id: data.pedido_id,
    status: data.status,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }
}

export async function updateOrdenCompra(id: number, orden: Partial<OrdenCompra>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ordenes_compra')
    .update({
      articulo_id: orden.articulo_id,
      cantidad: orden.cantidad,
      proveedor: orden.proveedor,
      observaciones: orden.observaciones,
      status: orden.status,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating orden compra:', error)
    return false
  }

  return true
}

export async function deleteOrdenCompra(id: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ordenes_compra')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting orden compra:', error)
    return false
  }

  return true
}

