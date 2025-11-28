'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOrdenesCompra, createOrdenCompra, updateOrdenCompra, deleteOrdenCompra } from '@/lib/db/compras'
import { getArticulos } from '@/lib/db/articulos'
import { OrdenCompra, Articulo } from '@/types'
import { getCurrentUser, canCreateOrdenesCompra, UserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash2, ShoppingCart, Filter, CheckCircle, AlertCircle } from 'lucide-react'
import Modal from '@/components/Modal'

export default function ComprasPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [canAccess, setCanAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrden, setEditingOrden] = useState<OrdenCompra | undefined>()
  const [formData, setFormData] = useState<{
    articulo_id: number
    cantidad: number
    proveedor: string
    observaciones: string
    status: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada'
  }>({
    articulo_id: 0,
    cantidad: 0,
    proveedor: 'Por definir',
    observaciones: '',
    status: 'Pendiente',
  })

  const loadData = async () => {
    try {
      const [ordenesData, articulosData] = await Promise.all([
        getOrdenesCompra(statusFilter === 'all' ? undefined : statusFilter),
        getArticulos(),
      ])
      setOrdenes(ordenesData)
      setArticulos(articulosData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      
      const hasAccess = canCreateOrdenesCompra(currentUser)
      if (!hasAccess) {
        setLoading(false)
        return
      }
      
      setUser(currentUser)
      setCanAccess(true)
      await loadData()
      setLoading(false)
    }
    init()
  }, [statusFilter, router])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }
  
  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">Acceso Denegado</h2>
        <p className="text-gray-600">Solo usuarios con rol "Compras" o "Administrador" pueden acceder a esta sección.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    )
  }

  const handleCreate = () => {
    setEditingOrden(undefined)
    setFormData({
      articulo_id: 0,
      cantidad: 0,
      proveedor: 'Por definir',
      observaciones: '',
      status: 'Pendiente',
    })
    setIsModalOpen(true)
  }

  const handleEdit = (orden: OrdenCompra) => {
    setEditingOrden(orden)
    setFormData({
      articulo_id: orden.articulo_id,
      cantidad: orden.cantidad,
      proveedor: orden.proveedor,
      observaciones: orden.observaciones || '',
      status: orden.status,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta orden de compra?')) {
      const success = await deleteOrdenCompra(id)
      if (success) {
        loadData()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingOrden) {
        await updateOrdenCompra(editingOrden.id, formData)
      } else {
        await createOrdenCompra(formData as any)
      }
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving orden:', error)
      alert('Error al guardar la orden de compra')
    }
  }

  const filteredOrdenes = ordenes.filter(o => {
    if (searchTerm) {
      const articulo = articulos.find(a => a.id === o.articulo_id)
      if (articulo && !articulo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando órdenes de compra...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Órdenes de Compra
          </h1>
          <p className="text-purple-600 mt-2 font-medium">Gestiona las compras a proveedores</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nueva Orden</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border-2 border-indigo-100">
        <div className="p-4 border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar órdenes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-indigo-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm font-medium text-indigo-700"
              >
                <option value="all">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase">Artículo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase">Cantidad</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase">Proveedor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-indigo-100">
              {filteredOrdenes.map((orden) => {
                const articulo = articulos.find(a => a.id === orden.articulo_id)
                return (
                  <tr key={orden.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-800">{articulo?.descripcion || `Artículo #${orden.articulo_id}`}</div>
                      <div className="text-xs text-gray-500">{articulo?.codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {orden.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {orden.proveedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        orden.status === 'Completada' ? 'bg-green-100 text-green-800' :
                        orden.status === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                        orden.status === 'Cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {orden.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(orden.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(orden)}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(orden.id)}
                          className="text-red-600 hover:text-red-800 font-semibold hover:underline flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredOrdenes.length === 0 && (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No se encontraron órdenes de compra</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrden ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artículo *</label>
              <select
                required
                value={formData.articulo_id}
                onChange={(e) => setFormData({ ...formData, articulo_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">Seleccionar artículo</option>
                {articulos.map(art => (
                  <option key={art.id} value={art.id}>{art.codigo} - {art.descripcion}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada' })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {editingOrden ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

