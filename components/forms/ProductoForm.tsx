'use client'

import { useState, useEffect } from 'react'
import { Producto } from '@/types'
import { createProducto, updateProducto } from '@/lib/db/productos'

interface ProductoFormProps {
  producto?: Producto
  onSuccess: () => void
  onCancel: () => void
}

export default function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    precioBase: 0,
    unidad: 'm2',
    activo: true,
  })

  const categorias = ['Banners', 'Señalética', 'Corte', 'Impresión', 'Servicios', 'Otros']
  const unidades = ['m2', 'unidad', 'metro', 'hora', 'día', 'otro']

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion || '',
        precioBase: producto.precioBase,
        unidad: producto.unidad,
        activo: producto.activo,
      })
    }
  }, [producto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (producto) {
        await updateProducto(producto.id, formData)
        alert('Producto actualizado correctamente!')
      } else {
        await createProducto(formData)
        alert('Producto creado correctamente!')
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving producto:', error)
      alert('Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            required
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Base *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.precioBase}
            onChange={(e) => setFormData({ ...formData, precioBase: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad *
          </label>
          <select
            required
            value={formData.unidad}
            onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {unidades.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">
            Producto activo
          </label>
        </div>
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
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
        >
          {loading ? 'Guardando...' : producto ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}

