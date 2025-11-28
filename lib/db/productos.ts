import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'

export async function getProductos(): Promise<Producto[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('categoria', { ascending: true })

  if (error) {
    console.error('Error fetching productos:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    nombre: item.nombre,
    categoria: item.categoria,
    descripcion: item.descripcion,
    precioBase: parseFloat(item.precio_base),
    unidad: item.unidad,
    activo: item.activo,
  }))
}

export async function getProductoById(id: string): Promise<Producto | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching producto:', error)
    return null
  }

  return {
    id: data.id,
    nombre: data.nombre,
    categoria: data.categoria,
    descripcion: data.descripcion,
    precioBase: parseFloat(data.precio_base),
    unidad: data.unidad,
    activo: data.activo,
  }
}

export async function createProducto(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: producto.nombre,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      precio_base: producto.precioBase,
      unidad: producto.unidad,
      activo: producto.activo,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating producto:', error)
    return null
  }

  return {
    id: data.id,
    nombre: data.nombre,
    categoria: data.categoria,
    descripcion: data.descripcion,
    precioBase: parseFloat(data.precio_base),
    unidad: data.unidad,
    activo: data.activo,
  }
}

export async function updateProducto(id: string, producto: Partial<Producto>): Promise<boolean> {
  const supabase = createClient()
  const updateData: any = {}
  
  if (producto.nombre !== undefined) updateData.nombre = producto.nombre
  if (producto.categoria !== undefined) updateData.categoria = producto.categoria
  if (producto.descripcion !== undefined) updateData.descripcion = producto.descripcion
  if (producto.precioBase !== undefined) updateData.precio_base = producto.precioBase
  if (producto.unidad !== undefined) updateData.unidad = producto.unidad
  if (producto.activo !== undefined) updateData.activo = producto.activo

  const { error } = await supabase
    .from('productos')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating producto:', error)
    return false
  }

  return true
}

export async function deleteProducto(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting producto:', error)
    return false
  }

  return true
}

