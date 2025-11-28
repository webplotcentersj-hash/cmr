import { createClient } from '@/lib/supabase/client'
import { Articulo } from '@/types'

export async function getArticulos(sector?: string, search?: string): Promise<Articulo[]> {
  const supabase = createClient()
  let query = supabase
    .from('articulos')
    .select('*')
    .order('created_at', { ascending: false })

  if (sector && sector !== 'all') {
    query = query.eq('sector', sector)
  }

  if (search) {
    query = query.or(`codigo.ilike.%${search}%,descripcion.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching articulos:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    codigo: item.codigo,
    descripcion: item.descripcion,
    sector: item.sector,
    imagen: item.imagen,
    stock: item.stock,
    stock_minimo: item.stock_minimo,
    precio: parseFloat(item.precio),
    created_at: new Date(item.created_at),
    updated_at: new Date(item.updated_at),
  }))
}

export async function getArticuloById(id: number): Promise<Articulo | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('articulos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching articulo:', error)
    return null
  }

  return {
    id: data.id,
    codigo: data.codigo,
    descripcion: data.descripcion,
    sector: data.sector,
    imagen: data.imagen,
    stock: data.stock,
    stock_minimo: data.stock_minimo,
    precio: parseFloat(data.precio),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }
}

export async function createArticulo(articulo: Omit<Articulo, 'id' | 'created_at' | 'updated_at'>): Promise<Articulo | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('articulos')
    .insert({
      codigo: articulo.codigo,
      descripcion: articulo.descripcion,
      sector: articulo.sector,
      imagen: articulo.imagen,
      stock: articulo.stock,
      stock_minimo: articulo.stock_minimo,
      precio: articulo.precio,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating articulo:', error)
    return null
  }

  return {
    id: data.id,
    codigo: data.codigo,
    descripcion: data.descripcion,
    sector: data.sector,
    imagen: data.imagen,
    stock: data.stock,
    stock_minimo: data.stock_minimo,
    precio: parseFloat(data.precio),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }
}

export async function updateArticulo(id: number, articulo: Partial<Articulo>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('articulos')
    .update({
      codigo: articulo.codigo,
      descripcion: articulo.descripcion,
      sector: articulo.sector,
      imagen: articulo.imagen,
      stock: articulo.stock,
      stock_minimo: articulo.stock_minimo,
      precio: articulo.precio,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating articulo:', error)
    return false
  }

  return true
}

export async function deleteArticulo(id: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('articulos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting articulo:', error)
    return false
  }

  return true
}

