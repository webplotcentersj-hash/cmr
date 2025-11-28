'use client'

import { useState, useEffect } from 'react'
import { getPedidos, approvePedido, rejectPedido, getPedidoItems, deletePedido } from '@/lib/db/pedidos'
import { getClientes } from '@/lib/db/clientes'
import { getArticulos } from '@/lib/db/articulos'
import { Pedido, PedidoItem, Cliente, Articulo } from '@/types'
import { Plus, Search, CheckCircle, XCircle, Eye, Package, Filter, Edit, Trash2, MessageSquare } from 'lucide-react'
import { getCurrentUser, canApprovePedidos, UserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/Modal'
import PedidoForm from '@/components/forms/PedidoForm'
import PedidoDetailModal from '@/components/PedidoDetailModal'

export default function PedidosPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [canApprove, setCanApprove] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingPedido, setEditingPedido] = useState<Pedido | undefined>()
  const [approvalComment, setApprovalComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: 'approve' | 'reject', pedidoId: number } | null>(null)

  const loadPedidos = async () => {
    setLoading(true)
    try {
      const [pedidosData, clientesData, articulosData] = await Promise.all([
        getPedidos(approvalFilter === 'all' ? undefined : approvalFilter),
        getClientes(),
        getArticulos(),
      ])
      console.log('Pedidos cargados:', pedidosData.length)
      setPedidos(pedidosData)
      setClientes(clientesData)
      setArticulos(articulosData)
    } catch (error) {
      console.error('Error loading pedidos:', error)
      alert('Error al cargar los pedidos. Por favor, recarga la página.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setCanApprove(canApprovePedidos(currentUser))
      await loadPedidos()
    }
    init()
  }, [approvalFilter])

  const handlePreview = async (pedido: Pedido) => {
    setSelectedPedido(pedido)
    setIsDetailModalOpen(true)
  }

  const handleApproveClick = (pedido: Pedido) => {
    setPendingAction({ type: 'approve', pedidoId: pedido.id })
    setSelectedPedido(pedido)
    setShowApprovalModal(true)
  }

  const handleRejectClick = (pedido: Pedido) => {
    setPendingAction({ type: 'reject', pedidoId: pedido.id })
    setSelectedPedido(pedido)
    setShowRejectionModal(true)
  }

  const handleApprove = async () => {
    if (!pendingAction || !user) return
    
    const success = await approvePedido(pendingAction.pedidoId, user.id, approvalComment || undefined)
    if (success) {
      setShowApprovalModal(false)
      setApprovalComment('')
      setPendingAction(null)
      loadPedidos()
      if (selectedPedido) {
        setSelectedPedido({ ...selectedPedido, approval_status: 'Aprobado' })
      }
    } else {
      alert('Error al aprobar el pedido')
    }
  }

  const handleReject = async () => {
    if (!pendingAction || !rejectionReason.trim() || !user) {
      alert('Debes ingresar un motivo para rechazar el pedido')
      return
    }
    
    const success = await rejectPedido(pendingAction.pedidoId, rejectionReason, user.id)
    if (success) {
      setShowRejectionModal(false)
      setRejectionReason('')
      setPendingAction(null)
      loadPedidos()
      if (selectedPedido) {
        setSelectedPedido({ ...selectedPedido, approval_status: 'Rechazado', rejection_reason: rejectionReason })
      }
    } else {
      alert('Error al rechazar el pedido')
    }
  }

  const handleCreate = () => {
    setEditingPedido(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      const success = await deletePedido(id)
      if (success) {
        loadPedidos()
      } else {
        alert('Error al eliminar el pedido')
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
            Pedidos de Materiales
          </h1>
          <p className="text-orange-600 mt-2 font-medium">
            Sistema de pedidos de stock - Los pedidos se envían al área de Compras para aprobación
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
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
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase">Número</th>
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
                      <div className="text-sm font-bold text-purple-600">{pedido.numero}</div>
                    </td>
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
                          title="Ver detalles y comentarios"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(pedido)}
                          className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {pedido.approval_status === 'Pendiente' && canApprove && (
                          <>
                            <button
                              onClick={() => handleApproveClick(pedido)}
                              className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Aprobar pedido"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(pedido)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rechazar pedido"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(pedido.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPedidos.length === 0 && !loading && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              {pedidos.length === 0 
                ? 'No hay pedidos creados aún' 
                : 'No se encontraron pedidos con los filtros aplicados'}
            </p>
            {pedidos.length === 0 && (
              <button
                onClick={handleCreate}
                className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Crear Primer Pedido</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalles con comentarios */}
      <PedidoDetailModal
        pedido={selectedPedido}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedPedido(null)
        }}
        onUpdate={loadPedidos}
      />

      {/* Modal de aprobación */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false)
          setApprovalComment('')
          setPendingAction(null)
        }}
        title="Aprobar Pedido"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres aprobar este pedido?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Agrega un comentario sobre la aprobación..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowApprovalModal(false)
                setApprovalComment('')
                setPendingAction(null)
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Aprobar Pedido
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de rechazo */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false)
          setRejectionReason('')
          setPendingAction(null)
        }}
        title="Rechazar Pedido"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres rechazar este pedido?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del rechazo *
            </label>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Explica el motivo del rechazo..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowRejectionModal(false)
                setRejectionReason('')
                setPendingAction(null)
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rechazar Pedido
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPedido(undefined)
        }}
        title={editingPedido ? 'Editar Pedido' : 'Nuevo Pedido'}
        size="xl"
      >
        <PedidoForm
          pedido={editingPedido}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingPedido(undefined)
            loadPedidos()
          }}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingPedido(undefined)
          }}
        />
      </Modal>
    </div>
  )
}

