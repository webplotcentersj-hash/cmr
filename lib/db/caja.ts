import { createClient } from '@/lib/supabase/client'
import { MovimientoCaja } from '@/types'

export async function getMovimientosCaja(tipo?: string): Promise<MovimientoCaja[]> {
  const supabase = createClient()
  let query = supabase
    .from('movimientos_caja')
    .select('*')
    .order('created_at', { ascending: false })

  if (tipo && tipo !== 'all') {
    query = query.eq('tipo', tipo === 'ingreso' ? 'Ingreso' : 'Egreso')
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching movimientos caja:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    tipo: item.tipo,
    categoria: item.categoria,
    concepto: item.concepto,
    monto: parseFloat(item.monto),
    metodo_pago: item.metodo_pago,
    pedido_id: item.pedido_id,
    proyecto_id: item.proyecto_id,
    observaciones: item.observaciones,
    created_at: new Date(item.created_at),
  }))
}

export async function getResumenCaja(): Promise<{ ingresos: number; egresos: number; balance: number }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('movimientos_caja')
    .select('tipo, monto')

  if (error) {
    console.error('Error fetching resumen caja:', error)
    return { ingresos: 0, egresos: 0, balance: 0 }
  }

  const ingresos = data
    .filter(m => m.tipo === 'Ingreso')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0)

  const egresos = data
    .filter(m => m.tipo === 'Egreso')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0)

  return {
    ingresos,
    egresos,
    balance: ingresos - egresos,
  }
}

export async function createMovimientoCaja(movimiento: Omit<MovimientoCaja, 'id' | 'created_at'>): Promise<MovimientoCaja | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('movimientos_caja')
    .insert({
      tipo: movimiento.tipo,
      categoria: movimiento.categoria,
      concepto: movimiento.concepto,
      monto: movimiento.monto,
      metodo_pago: movimiento.metodo_pago,
      pedido_id: movimiento.pedido_id,
      proyecto_id: movimiento.proyecto_id,
      observaciones: movimiento.observaciones,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating movimiento caja:', error)
    return null
  }

  return {
    id: data.id,
    tipo: data.tipo,
    categoria: data.categoria,
    concepto: data.concepto,
    monto: parseFloat(data.monto),
    metodo_pago: data.metodo_pago,
    pedido_id: data.pedido_id,
    proyecto_id: data.proyecto_id,
    observaciones: data.observaciones,
    created_at: new Date(data.created_at),
  }
}

export async function deleteMovimientoCaja(id: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('movimientos_caja')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting movimiento caja:', error)
    return false
  }

  return true
}

