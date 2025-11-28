'use client'

import { useState, useEffect } from 'react'
import { Pedido, PedidoItem, Cliente, Articulo } from '@/types'
import { createPedidoWithItems, updatePedido } from '@/lib/db/pedidos'
import { getClientes } from '@/lib/db/clientes'
import { getArticulos } from '@/lib/db/articulos'
import { Plus, Trash2 } from 'lucide-react'

interface PedidoFormProps {
  pedido?: Pedido | null
  onSuccess: () => void
  onCancel: () => void
}

export default function PedidoForm({ pedido, onSuccess, onCancel }: PedidoFormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Omit<PedidoItem, 'id' | 'pedido_id' | 'created_at'>[]>([])
  const [formData, setFormData] = useState({
    clienteId: '',
    client_name: '',
    description: '',
    image_url: '',
    status: 'Pendiente',
    approval_status: 'Pendiente' as 'Pendiente' | 'Aprobado' | 'Rechazado',
  })

  useEffect(() => {
    async function loadData() {
      const [clientesData, articulosData] = await Promise.all([
        getClientes(),
        getArticulos(),
      ])
      setClientes(clientesData)
      setArticulos(articulosData)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (pedido) {
      setFormData({
        clienteId: pedido.cliente_id || '',
        client_name: pedido.client_name,
        description: pedido.description,
        image_url: pedido.image_url || '',
        status: pedido.status,
        approval_status: pedido.approval_status,
      })
    }
  }, [pedido])

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId)
    setFormData({
      ...formData,
      clienteId,
      client_name: cliente ? cliente.nombre : '',
    })
  }

  const agregarItem = () => {
    setItems([...items, {
      articulo_id: 0,
      cantidad: 1,
      stock_disponible: 0,
    }])
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const actualizarItem = (index: number, field: keyof PedidoItem, value: any) => {
    const nuevosItems = [...items]
    nuevosItems[index] = { ...nuevosItems[index], [field]: value }
    
    // Si cambia artículo, actualizar stock disponible
    if (field === 'articulo_id' && value) {
      const articulo = articulos.find(a => a.id === value)
      if (articulo) {
        nuevosItems[index].stock_disponible = articulo.stock
      }
    }
    
    setItems(nuevosItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.client_name) {
      alert('Debes ingresar el nombre del cliente')
      return
    }
    
    if (items.length === 0) {
      alert('Debes agregar al menos un artículo al pedido')
      return
    }

    setLoading(true)
    try {
      const pedidoData = {
        client_name: formData.client_name,
        description: formData.description,
        image_url: formData.image_url || undefined,
        status: formData.status,
        cliente_id: formData.clienteId || undefined,
        approval_status: formData.approval_status,
      }

      if (pedido) {
        await updatePedido(pedido.id, pedidoData)
        alert('Pedido actualizado correctamente!')
      } else {
        await createPedidoWithItems(pedidoData as any, items)
        alert('Pedido creado correctamente!')
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving pedido:', error)
      alert('Error al guardar el pedido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select
            value={formData.clienteId}
            onChange={(e) => handleClienteChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Seleccionar cliente (opcional)</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.empresa && `- ${cliente.empresa}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
          <input
            type="text"
            required
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Nombre del cliente"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Descripción detallada del pedido..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completado">Completado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Aprobación</label>
          <select
            value={formData.approval_status}
            onChange={(e) => setFormData({ ...formData, approval_status: e.target.value as any })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
          <input
            type="text"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Items del pedido */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Artículos del Pedido *</label>
          <button
            type="button"
            onClick={agregarItem}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Artículo</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Artículo {index + 1}</span>
                <button
                  type="button"
                  onClick={() => eliminarItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Artículo *</label>
                  <select
                    required
                    value={item.articulo_id}
                    onChange={(e) => actualizarItem(index, 'articulo_id', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="0">Seleccionar artículo</option>
                    {articulos.map(articulo => (
                      <option key={articulo.id} value={articulo.id}>
                        {articulo.codigo} - {articulo.descripcion} (Stock: {articulo.stock})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No hay artículos agregados. Haz clic en "Agregar Artículo" para comenzar.</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : (pedido ? 'Actualizar Pedido' : 'Crear Pedido')}
        </button>
      </div>
    </form>
  )
}

