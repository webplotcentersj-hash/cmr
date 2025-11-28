'use client'

import { useState, useEffect } from 'react'
import { getMovimientosCaja, getResumenCaja, createMovimientoCaja, deleteMovimientoCaja } from '@/lib/db/caja'
import { MovimientoCaja } from '@/types'
import { Plus, Search, Trash2, TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react'
import Modal from '@/components/Modal'

export default function CajaPage() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([])
  const [resumen, setResumen] = useState({ ingresos: 0, egresos: 0, balance: 0 })
  const [loading, setLoading] = useState(true)
  const [tipoFilter, setTipoFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'Ingreso' as 'Ingreso' | 'Egreso',
    categoria: 'General',
    concepto: '',
    monto: 0,
    metodo_pago: 'Efectivo',
    observaciones: '',
  })

  const loadData = async () => {
    try {
      const [movimientosData, resumenData] = await Promise.all([
        getMovimientosCaja(tipoFilter === 'all' ? undefined : tipoFilter),
        getResumenCaja(),
      ])
      setMovimientos(movimientosData)
      setResumen(resumenData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tipoFilter])

  const handleCreate = () => {
    setFormData({
      tipo: 'Ingreso',
      categoria: 'General',
      concepto: '',
      monto: 0,
      metodo_pago: 'Efectivo',
      observaciones: '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      const success = await deleteMovimientoCaja(id)
      if (success) {
        loadData()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMovimientoCaja(formData as any)
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Error creating movimiento:', error)
      alert('Error al crear el movimiento')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando movimientos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Caja
          </h1>
          <p className="text-green-600 mt-2 font-medium">Control de ingresos y egresos</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nuevo Movimiento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-green-100 text-sm mb-1">Ingresos</p>
          <p className="text-3xl font-bold">${resumen.ingresos.toLocaleString('es-AR')}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
          <TrendingDown className="w-8 h-8 mb-2" />
          <p className="text-red-100 text-sm mb-1">Egresos</p>
          <p className="text-3xl font-bold">${resumen.egresos.toLocaleString('es-AR')}</p>
        </div>

        <div className={`bg-gradient-to-br rounded-2xl shadow-xl p-6 text-white ${
          resumen.balance >= 0 ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-red-600'
        }`}>
          <DollarSign className="w-8 h-8 mb-2" />
          <p className="text-blue-100 text-sm mb-1">Balance</p>
          <p className="text-3xl font-bold">${resumen.balance.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100">
        <div className="p-4 border-b-2 border-green-200 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar movimientos..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-500" />
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="border-2 border-green-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm font-medium text-green-700"
              >
                <option value="all">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase">Concepto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase">Monto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase">Método</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-green-100">
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      movimiento.tipo === 'Ingreso' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {movimiento.categoria}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-800">{movimiento.concepto}</div>
                    {movimiento.observaciones && (
                      <div className="text-xs text-gray-500">{movimiento.observaciones}</div>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                    movimiento.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movimiento.tipo === 'Ingreso' ? '+' : '-'}${movimiento.monto.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {movimiento.metodo_pago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(movimiento.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(movimiento.id)}
                      className="text-red-600 hover:text-red-800 font-semibold hover:underline flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {movimientos.length === 0 && (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No se encontraron movimientos</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Movimiento"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Ingreso' | 'Egreso' })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
              <input
                type="text"
                required
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                value={formData.metodo_pago}
                onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Crear Movimiento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

