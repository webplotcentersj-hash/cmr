import { createClient } from '@/lib/supabase/client'
import { Cliente } from '@/types'

export async function getClientes(): Promise<Cliente[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error fetching clientes:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    nombre: item.nombre,
    email: item.email,
    telefono: item.telefono || '',
    empresa: item.empresa,
    direccion: item.direccion,
    ciudad: item.ciudad,
    notas: item.notas,
    fechaCreacion: new Date(item.fecha_creacion),
    ultimaActualizacion: new Date(item.ultima_actualizacion),
  }))
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching cliente:', error)
    return null
  }

  return {
    id: data.id,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono || '',
    empresa: data.empresa,
    direccion: data.direccion,
    ciudad: data.ciudad,
    notas: data.notas,
    fechaCreacion: new Date(data.fecha_creacion),
    ultimaActualizacion: new Date(data.ultima_actualizacion),
  }
}

export async function createCliente(cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'ultimaActualizacion'>): Promise<Cliente | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      empresa: cliente.empresa,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      notas: cliente.notas,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating cliente:', error)
    return null
  }

  return {
    id: data.id,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono || '',
    empresa: data.empresa,
    direccion: data.direccion,
    ciudad: data.ciudad,
    notas: data.notas,
    fechaCreacion: new Date(data.fecha_creacion),
    ultimaActualizacion: new Date(data.ultima_actualizacion),
  }
}

export async function updateCliente(id: string, cliente: Partial<Cliente>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('clientes')
    .update({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      empresa: cliente.empresa,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      notas: cliente.notas,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating cliente:', error)
    return false
  }

  return true
}

export async function deleteCliente(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting cliente:', error)
    return false
  }

  return true
}

