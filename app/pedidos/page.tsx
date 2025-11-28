'use client'

import { useState, useEffect } from 'react'
import { getPedidos, approvePedido, rejectPedido, getPedidoItems } from '@/lib/db/pedidos'
import { getClientes } from '@/lib/db/clientes'
import { Pedido, PedidoItem, Cliente } from '@/types'
import { Plus, Search, CheckCircle, XCircle, Eye, Package, Filter } from 'lucide-react'
import Modal from '@/components/Modal'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const loadPedidos = async () => {
    try {
      const [pedidosData, clientesData] = await Promise.all([
        getPedidos(approvalFilter === 'all' ? undefined : approvalFilter),
        getClientes(),
      ])
      setPedidos(pedidosData)
      setClientes(clientesData)
    } catch (error) {
      console.error('Error loading pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPedidos()
  }, [approvalFilter])

  const handlePreview = async (pedido: Pedido) => {
    setSelectedPedido(pedido)
    const items = await getPedidoItems(pedido.id)
    setPedidoItems(items)
    setShowPreview(true)
  }

  const handleApprove = async (id: number) => {
    if (confirm('¿Aprobar este pedido?')) {
      const success = await approvePedido(id, 'current-user-id')
      if (success) {
        loadPedidos()
      }
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt('Motivo del rechazo:')
    if (reason) {
      const success = await rejectPedido(id, reason)
      if (success) {
        loadPedidos()
      }
    }
  }

  const filteredPedidos = pedidos.filter(p => {
    if (searchTerm && !p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando pedidos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Pedidos
          </h1>
          <p className="text-orange-600 mt-2 font-medium">Gestiona los pedidos de clientes</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nuevo Pedido</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-2 border-orange-100">
        <div className="p-4 border-b-2 border-orange-200 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-orange-500" />
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="border-2 border-orange-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/80 backdrop-blur-sm font-medium text-orange-700"
              >
                <option value="all">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-100 to-red-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase">Aprobación</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-orange-100">
              {filteredPedidos.map((pedido) => {
                const cliente = clientes.find(c => c.id === pedido.cliente_id)
                return (
                  <tr key={pedido.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">{pedido.client_name}</div>
                      {cliente && <div className="text-xs text-gray-500">{cliente.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800 max-w-md truncate">{pedido.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        pedido.status === 'Completado' ? 'bg-green-100 text-green-800' :
                        pedido.status === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        pedido.approval_status === 'Aprobado' ? 'bg-green-100 text-green-800' :
                        pedido.approval_status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pedido.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(pedido.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreview(pedido)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {pedido.approval_status === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => handleApprove(pedido.id)}
                              className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Aprobar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(pedido.id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rechazar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPedidos.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No se encontraron pedidos</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Pedido: ${selectedPedido?.client_name}`}
        size="lg"
      >
        {selectedPedido && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
              <p className="text-gray-600">{selectedPedido.description}</p>
            </div>
            {selectedPedido.image_url && (
              <div>
                <img src={selectedPedido.image_url} alt="Pedido" className="w-full rounded-lg" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Artículos</h3>
              <div className="space-y-2">
                {pedidoItems.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Artículo ID: {item.articulo_id} - Cantidad: {item.cantidad}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

