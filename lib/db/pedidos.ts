import { createClient } from '@/lib/supabase/client'
import { Pedido, PedidoItem } from '@/types'

export async function getPedidos(approvalStatus?: string): Promise<Pedido[]> {
  const supabase = createClient()
  let query = supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (approvalStatus && approvalStatus !== 'all') {
    query = query.eq('approval_status', approvalStatus)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching pedidos:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    client_name: item.client_name,
    description: item.description,
    image_url: item.image_url,
    status: item.status,
    created_at: new Date(item.created_at),
    updated_at: new Date(item.updated_at),
    cliente_id: item.cliente_id,
    approval_status: item.approval_status,
    approved_by: item.approved_by,
    approved_at: item.approved_at ? new Date(item.approved_at) : undefined,
    rejection_reason: item.rejection_reason,
  }))
}

export async function getPedidoById(id: number): Promise<Pedido | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching pedido:', error)
    return null
  }

  return {
    id: data.id,
    client_name: data.client_name,
    description: data.description,
    image_url: data.image_url,
    status: data.status,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    cliente_id: data.cliente_id,
    approval_status: data.approval_status,
    approved_by: data.approved_by,
    approved_at: data.approved_at ? new Date(data.approved_at) : undefined,
    rejection_reason: data.rejection_reason,
  }
}

export async function getPedidoItems(pedidoId: number): Promise<PedidoItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pedidos_items')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pedido items:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    pedido_id: item.pedido_id,
    articulo_id: item.articulo_id,
    cantidad: item.cantidad,
    stock_disponible: item.stock_disponible,
    created_at: new Date(item.created_at),
  }))
}

export async function createPedido(pedido: Omit<Pedido, 'id' | 'created_at' | 'updated_at'>): Promise<Pedido | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pedidos')
    .insert({
      client_name: pedido.client_name,
      description: pedido.description,
      image_url: pedido.image_url,
      status: pedido.status,
      cliente_id: pedido.cliente_id,
      approval_status: pedido.approval_status,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating pedido:', error)
    return null
  }

  return {
    id: data.id,
    client_name: data.client_name,
    description: data.description,
    image_url: data.image_url,
    status: data.status,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    cliente_id: data.cliente_id,
    approval_status: data.approval_status,
    approved_by: data.approved_by,
    approved_at: data.approved_at ? new Date(data.approved_at) : undefined,
    rejection_reason: data.rejection_reason,
  }
}

export async function approvePedido(id: number, approvedBy: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('pedidos')
    .update({
      approval_status: 'Aprobado',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error approving pedido:', error)
    return false
  }

  return true
}

export async function rejectPedido(id: number, reason: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('pedidos')
    .update({
      approval_status: 'Rechazado',
      rejection_reason: reason,
    })
    .eq('id', id)

  if (error) {
    console.error('Error rejecting pedido:', error)
    return false
  }

  return true
}

export async function addPedidoItem(item: Omit<PedidoItem, 'id' | 'created_at'>): Promise<PedidoItem | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pedidos_items')
    .insert({
      pedido_id: item.pedido_id,
      articulo_id: item.articulo_id,
      cantidad: item.cantidad,
      stock_disponible: item.stock_disponible,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating pedido item:', error)
    return null
  }

  return {
    id: data.id,
    pedido_id: data.pedido_id,
    articulo_id: data.articulo_id,
    cantidad: data.cantidad,
    stock_disponible: data.stock_disponible,
    created_at: new Date(data.created_at),
  }
}

