'use client'

import { useState, useEffect } from 'react'
import { Pedido, PedidoItem, Cliente, Articulo } from '@/types'
import { createPedidoWithItems, updatePedido } from '@/lib/db/pedidos'
import { getClientes } from '@/lib/db/clientes'
import { getArticulos } from '@/lib/db/articulos'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Search, Package } from 'lucide-react'

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
  const [articuloSearchTerm, setArticuloSearchTerm] = useState<string[]>([]) // Array de términos de búsqueda por item
  const [formData, setFormData] = useState({
    clienteId: '',
    description: '',
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
        description: pedido.description,
      })
    }
  }, [pedido])

  const agregarItem = () => {
    setItems([...items, {
      articulo_id: 0,
      cantidad: 1,
      stock_disponible: 0,
    }])
    setArticuloSearchTerm([...articuloSearchTerm, ''])
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
    setArticuloSearchTerm(articuloSearchTerm.filter((_, i) => i !== index))
  }

  const actualizarItem = (index: number, field: keyof PedidoItem, value: any) => {
    const nuevosItems = [...items]
    nuevosItems[index] = { ...nuevosItems[index], [field]: value }
    
    // Si cambia artículo, actualizar stock disponible
    if (field === 'articulo_id' && value) {
      const articulo = articulos.find(a => a.id === value)
      if (articulo) {
        nuevosItems[index].stock_disponible = articulo.stock
        // Limpiar búsqueda cuando se selecciona un artículo
        const nuevosTerminos = [...articuloSearchTerm]
        nuevosTerminos[index] = ''
        setArticuloSearchTerm(nuevosTerminos)
      }
    }
    
    setItems(nuevosItems)
  }

  const actualizarBusqueda = (index: number, term: string) => {
    const nuevosTerminos = [...articuloSearchTerm]
    nuevosTerminos[index] = term
    setArticuloSearchTerm(nuevosTerminos)
  }

  const getArticulosFiltrados = (index: number) => {
    const term = articuloSearchTerm[index]?.toLowerCase() || ''
    if (!term) return articulos
    
    return articulos.filter(a => 
      a.codigo.toLowerCase().includes(term) ||
      a.descripcion.toLowerCase().includes(term) ||
      a.sector.toLowerCase().includes(term)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      alert('Debes ingresar una descripción del pedido')
      return
    }
    
    if (items.length === 0) {
      alert('Debes agregar al menos un artículo al pedido')
      return
    }

    setLoading(true)
    try {
      const pedidoData = {
        client_name: 'Pedido de Materiales', // Nombre por defecto para pedidos de stock
        description: formData.description,
        image_url: undefined,
        status: 'Pendiente', // Siempre pendiente al crear
        cliente_id: formData.clienteId || undefined,
        approval_status: 'Pendiente' as 'Pendiente', // Siempre pendiente al crear - será aprobado por Compras
      }

      if (pedido) {
        await updatePedido(pedido.id, pedidoData)
        alert('Pedido actualizado correctamente!')
      } else {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const currentUserId = user?.id
        
        if (!currentUserId) {
          alert('Debes estar autenticado para crear pedidos')
          return
        }
        
        console.log('Creando pedido con datos:', pedidoData)
        console.log('Items:', items)
        const nuevoPedido = await createPedidoWithItems(pedidoData as any, items, currentUserId)
        if (nuevoPedido) {
          alert(`Pedido creado correctamente! Número: ${nuevoPedido.numero}`)
          onSuccess()
        } else {
          alert('Error al crear el pedido. Por favor, revisa la consola para más detalles e intenta nuevamente.')
        }
      }
    } catch (error) {
      console.error('Error saving pedido:', error)
      alert('Error al guardar el pedido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
          <select
            value={formData.clienteId}
            onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Sin cliente asociado</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.empresa && `- ${cliente.empresa}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Pedido *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Describe el pedido de materiales necesario..."
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={articuloSearchTerm[index] || ''}
                      onChange={(e) => actualizarBusqueda(index, e.target.value)}
                      placeholder="Buscar por código, descripción o sector..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                    {articuloSearchTerm[index] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getArticulosFiltrados(index).length > 0 ? (
                          getArticulosFiltrados(index).map(articulo => (
                            <button
                              key={articulo.id}
                              type="button"
                              onClick={() => {
                                actualizarItem(index, 'articulo_id', articulo.id)
                                actualizarBusqueda(index, '')
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-orange-50 border-b border-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-800">{articulo.codigo}</p>
                                  <p className="text-xs text-gray-600">{articulo.descripcion}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {articulo.sector}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      articulo.stock <= articulo.stock_minimo 
                                        ? 'bg-red-100 text-red-600' 
                                        : 'bg-green-100 text-green-600'
                                    }`}>
                                      Stock: {articulo.stock}
                                    </span>
                                  </div>
                                </div>
                                <Package className="w-5 h-5 text-gray-400 ml-2" />
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No se encontraron artículos
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {item.articulo_id > 0 && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs font-semibold text-orange-800">
                        {articulos.find(a => a.id === item.articulo_id)?.codigo} - {articulos.find(a => a.id === item.articulo_id)?.descripcion}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Stock disponible: {item.stock_disponible} unidades
                      </p>
                    </div>
                  )}
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

