'use client'

import { useState, useEffect } from 'react'
import { Presupuesto, PresupuestoItem, Cliente, Proyecto, Producto } from '@/types'
import { createPresupuesto, updatePresupuesto } from '@/lib/db/presupuestos'
import { getClientes } from '@/lib/db/clientes'
import { getProyectos } from '@/lib/db/proyectos'
import { getProductos } from '@/lib/db/productos'
import { Plus, Trash2, X } from 'lucide-react'

interface PresupuestoFormProps {
  presupuesto?: Presupuesto | null
  onSuccess: () => void
  onCancel: () => void
}

export default function PresupuestoForm({ presupuesto, onSuccess, onCancel }: PresupuestoFormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Omit<PresupuestoItem, 'id'>[]>([])
  const [formData, setFormData] = useState({
    clienteId: '',
    proyectoId: '',
    numero: '',
    fechaVencimiento: '',
    descuento: 0,
    impuestos: 0,
    estado: 'pendiente' as 'pendiente' | 'aprobado' | 'rechazado' | 'vencido',
    notas: '',
  })

  useEffect(() => {
    async function loadData() {
      const [clientesData, proyectosData, productosData] = await Promise.all([
        getClientes(),
        getProyectos(),
        getProductos(),
      ])
      setClientes(clientesData)
      setProyectos(proyectosData)
      setProductos(productosData)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (presupuesto) {
      setFormData({
        clienteId: presupuesto.clienteId,
        proyectoId: presupuesto.proyectoId,
        numero: presupuesto.numero,
        fechaVencimiento: presupuesto.fechaVencimiento.toISOString().split('T')[0],
        descuento: presupuesto.descuento,
        impuestos: presupuesto.impuestos,
        estado: presupuesto.estado,
        notas: presupuesto.notas || '',
      })
      setItems(presupuesto.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descripcion: item.descripcion,
        subtotal: item.subtotal,
      })))
    } else {
      // Generar número automático para nuevo presupuesto
      const numeroAuto = `PRES-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      setFormData(prev => ({ ...prev, numero: numeroAuto }))
    }
  }, [presupuesto])

  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const descuento = formData.descuento
    const subtotalConDescuento = subtotal - descuento
    const impuestos = formData.impuestos || (subtotalConDescuento * 0.21) // IVA 21% por defecto
    const total = subtotalConDescuento + impuestos
    return { subtotal, descuento, impuestos, total }
  }

  const agregarItem = () => {
    setItems([...items, {
      productoId: '',
      cantidad: 1,
      precioUnitario: 0,
      descripcion: '',
      subtotal: 0,
    }])
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const actualizarItem = (index: number, field: keyof PresupuestoItem, value: any) => {
    const nuevosItems = [...items]
    nuevosItems[index] = { ...nuevosItems[index], [field]: value }
    
    // Si cambia producto, actualizar precio y descripción
    if (field === 'productoId' && value) {
      const producto = productos.find(p => p.id === value)
      if (producto) {
        nuevosItems[index].precioUnitario = producto.precioBase
        nuevosItems[index].descripcion = producto.nombre
      }
    }
    
    // Recalcular subtotal cuando cambia cantidad o precio
    if (field === 'cantidad' || field === 'precioUnitario') {
      nuevosItems[index].subtotal = nuevosItems[index].cantidad * nuevosItems[index].precioUnitario
    }
    
    setItems(nuevosItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clienteId) {
      alert('Debes seleccionar un cliente')
      return
    }
    
    if (items.length === 0) {
      alert('Debes agregar al menos un item al presupuesto')
      return
    }

    setLoading(true)
    try {
      const { subtotal, descuento, impuestos, total } = calcularTotales()
      
      const presupuestoData = {
        clienteId: formData.clienteId,
        proyectoId: formData.proyectoId || undefined,
        numero: formData.numero,
        fechaVencimiento: new Date(formData.fechaVencimiento),
        items: items,
        subtotal,
        descuento,
        impuestos,
        total,
        estado: formData.estado,
        notas: formData.notas || undefined,
      }

      if (presupuesto) {
        await updatePresupuesto(presupuesto.id, presupuestoData as any)
        alert('Presupuesto actualizado correctamente!')
      } else {
        await createPresupuesto(presupuestoData as any)
        alert('Presupuesto creado correctamente!')
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving presupuesto:', error)
      alert('Error al guardar el presupuesto.')
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, descuento, impuestos, total } = calcularTotales()
  const proyectosFiltrados = proyectos.filter(p => p.clienteId === formData.clienteId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select
            required
            value={formData.clienteId}
            onChange={(e) => setFormData({ ...formData, clienteId: e.target.value, proyectoId: '' })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.empresa && `- ${cliente.empresa}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
          <select
            value={formData.proyectoId}
            onChange={(e) => setFormData({ ...formData, proyectoId: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={!formData.clienteId}
          >
            <option value="">Sin proyecto</option>
            {proyectosFiltrados.map(proyecto => (
              <option key={proyecto.id} value={proyecto.id}>{proyecto.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Presupuesto *</label>
          <input
            type="text"
            required
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento *</label>
          <input
            type="date"
            required
            value={formData.fechaVencimiento}
            onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
          <select
            required
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>
      </div>

      {/* Items del presupuesto */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Items del Presupuesto *</label>
          <button
            type="button"
            onClick={agregarItem}
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Item {index + 1}</span>
                <button
                  type="button"
                  onClick={() => eliminarItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Producto *</label>
                  <select
                    required
                    value={item.productoId}
                    onChange={(e) => actualizarItem(index, 'productoId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>{producto.nombre} - ${producto.precioBase}/{producto.unidad}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={item.cantidad}
                    onChange={(e) => actualizarItem(index, 'cantidad', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Precio Unit. *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) => actualizarItem(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subtotal</label>
                  <input
                    type="text"
                    value={`$${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No hay items agregados. Haz clic en "Agregar Item" para comenzar.</p>
        )}
      </div>

      {/* Totales */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border-2 border-pink-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtotal</label>
            <p className="text-lg font-bold text-gray-800">${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descuento</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.descuento}
              onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Impuestos</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.impuestos}
              onChange={(e) => setFormData({ ...formData, impuestos: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
            <p className="text-xl font-bold text-pink-600">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Notas adicionales sobre el presupuesto..."
        />
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
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : (presupuesto ? 'Actualizar Presupuesto' : 'Crear Presupuesto')}
        </button>
      </div>
    </form>
  )
}

