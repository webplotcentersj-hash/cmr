'use client'

import { useState, useEffect } from 'react'
import { Pedido, PedidoItem, Comment, Articulo, Cliente } from '@/types'
import { getPedidoItems } from '@/lib/db/pedidos'
import { getCommentsByPedido, createComment } from '@/lib/db/comments'
import { getArticulos } from '@/lib/db/articulos'
import { getClientes } from '@/lib/db/clientes'
import { X, Send, User, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import Modal from '@/components/Modal'

interface PedidoDetailModalProps {
  pedido: Pedido | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function PedidoDetailModal({ pedido, isOpen, onClose, onUpdate }: PedidoDetailModalProps) {
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pedido && isOpen) {
      loadData()
    }
  }, [pedido, isOpen])

  const loadData = async () => {
    if (!pedido) return
    
    try {
      const [items, commentsData, articulosData, clientesData] = await Promise.all([
        getPedidoItems(pedido.id),
        getCommentsByPedido(pedido.id),
        getArticulos(),
        getClientes(),
      ])
      setPedidoItems(items)
      setComments(commentsData)
      setArticulos(articulosData)
      setClientes(clientesData)
    } catch (error) {
      console.error('Error loading pedido data:', error)
    }
  }

  const handleAddComment = async () => {
    if (!pedido || !newComment.trim()) return

    setLoading(true)
    try {
      await createComment({
        pedido_id: pedido.id,
        user_id: undefined, // TODO: Obtener del usuario actual
        content: newComment.trim(),
      })
      setNewComment('')
      loadData()
      onUpdate()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Error al agregar comentario')
    } finally {
      setLoading(false)
    }
  }

  if (!pedido) return null

  const cliente = clientes.find(c => c.id === pedido.cliente_id)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pedido: ${pedido.client_name}`} size="xl">
      <div className="space-y-6">
        {/* Información del pedido */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Cliente</h3>
              <p className="text-lg font-bold text-gray-800">{pedido.client_name}</p>
              {cliente && (
                <p className="text-sm text-gray-600">{cliente.email} | {cliente.telefono}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Estado</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded ${
                  pedido.status === 'Completado' ? 'bg-green-100 text-green-800' :
                  pedido.status === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {pedido.status}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded ${
                  pedido.approval_status === 'Aprobado' ? 'bg-green-100 text-green-800' :
                  pedido.approval_status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {pedido.approval_status === 'Aprobado' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                  {pedido.approval_status === 'Rechazado' && <XCircle className="w-4 h-4 inline mr-1" />}
                  {pedido.approval_status}
                </span>
              </div>
              {pedido.approved_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Aprobado el {new Date(pedido.approved_at).toLocaleDateString('es-AR')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
          <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{pedido.description}</p>
        </div>

        {/* Imagen */}
        {pedido.image_url && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Imagen</h3>
            <img src={pedido.image_url} alt="Pedido" className="w-full rounded-lg border-2 border-gray-200" />
          </div>
        )}

        {/* Artículos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Artículos del Pedido</h3>
          <div className="space-y-2">
            {pedidoItems.length > 0 ? (
              pedidoItems.map(item => {
                const articulo = articulos.find(a => a.id === item.articulo_id)
                return (
                  <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {articulo ? `${articulo.codigo} - ${articulo.descripcion}` : `Artículo ID: ${item.articulo_id}`}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Cantidad: {item.cantidad} | Stock disponible: {item.stock_disponible}
                        </p>
                      </div>
                      {item.cantidad > item.stock_disponible && (
                        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                          Stock insuficiente
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay artículos en este pedido</p>
            )}
          </div>
        </div>

        {/* Razón de rechazo */}
        {pedido.approval_status === 'Rechazado' && pedido.rejection_reason && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              Motivo del Rechazo
            </h3>
            <p className="text-red-700">{pedido.rejection_reason}</p>
          </div>
        )}

        {/* Comentarios y comunicación */}
        <div className="border-t-2 border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
            Comentarios y Comunicación
          </h3>
          
          {/* Lista de comentarios */}
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-600">
                          {comment.user_id ? `Usuario ${comment.user_id.slice(0, 8)}` : 'Sistema'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay comentarios aún</p>
            )}
          </div>

          {/* Formulario de nuevo comentario */}
          <div className="flex items-start space-x-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={2}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddComment()
                }
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Presiona Ctrl+Enter para enviar</p>
        </div>
      </div>
    </Modal>
  )
}

