'use client'

import { useState, useEffect } from 'react'
import { getArticulos, createArticulo, updateArticulo, deleteArticulo } from '@/lib/db/articulos'
import { Articulo } from '@/types'
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, FolderOpen, Printer, Monitor, Wrench, ShoppingCart } from 'lucide-react'
import Modal from '@/components/Modal'

const SECTORS = ['Gral', 'Imprenta', 'Mostrador', 'Taller', 'Compras']

const SECTOR_CONFIG = {
  'all': { label: 'Todos', icon: Package, color: 'blue' },
  'Gral': { label: 'General', icon: FolderOpen, color: 'gray' },
  'Imprenta': { label: 'Imprenta', icon: Printer, color: 'purple' },
  'Mostrador': { label: 'Mostrador', icon: Monitor, color: 'blue' },
  'Taller': { label: 'Taller', icon: Printer, color: 'green' },
  'Compras': { label: 'Compras', icon: ShoppingCart, color: 'orange' },
}

export default function StockPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticulo, setEditingArticulo] = useState<Articulo | undefined>()
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    sector: 'Gral',
    stock: 100,
    stock_minimo: 10,
    precio: 0,
    imagen: '',
  })

  const loadArticulos = async () => {
    try {
      const data = await getArticulos(selectedSector === 'all' ? undefined : selectedSector, searchTerm)
      setArticulos(data)
    } catch (error) {
      console.error('Error loading articulos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticulos()
  }, [selectedSector, searchTerm])

  const handleCreate = () => {
    setEditingArticulo(undefined)
    setFormData({
      codigo: '',
      descripcion: '',
      sector: 'Gral',
      stock: 100,
      stock_minimo: 10,
      precio: 0,
      imagen: '',
    })
    setIsModalOpen(true)
  }

  const handleEdit = (articulo: Articulo) => {
    setEditingArticulo(articulo)
    setFormData({
      codigo: articulo.codigo,
      descripcion: articulo.descripcion,
      sector: articulo.sector,
      stock: articulo.stock,
      stock_minimo: articulo.stock_minimo,
      precio: articulo.precio,
      imagen: articulo.imagen || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      const success = await deleteArticulo(id)
      if (success) {
        loadArticulos()
      } else {
        alert('Error al eliminar el artículo')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingArticulo) {
        await updateArticulo(editingArticulo.id, formData)
      } else {
        await createArticulo(formData as any)
      }
      setIsModalOpen(false)
      loadArticulos()
    } catch (error) {
      console.error('Error saving articulo:', error)
      alert('Error al guardar el artículo')
    }
  }

  const filteredArticulos = articulos.filter(a => {
    if (selectedSector !== 'all' && a.sector !== selectedSector) return false
    if (searchTerm && !a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !a.codigo.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando stock...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Gestión de Stock
          </h1>
          <p className="text-emerald-600 mt-2 font-medium">Administra tu inventario de materiales</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nuevo Artículo</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-xl border-2 border-emerald-100">
        <div className="p-6 border-b-2 border-emerald-200 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Artículos</h2>
          
          {/* Filtros por sector - Botones */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {Object.entries(SECTOR_CONFIG).map(([key, config]) => {
              const Icon = config.icon
              const isActive = selectedSector === key
              const colorClasses = {
                blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                gray: isActive ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
                purple: isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
                green: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
                orange: isActive ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
              }
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSector(key)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${colorClasses[config.color as keyof typeof colorClasses]}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{config.label}</span>
                </button>
              )
            })}
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-100 to-teal-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase">Código</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase">Sector</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase">Mínimo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-emerald-100">
              {filteredArticulos.map((articulo) => {
                const stockBajo = articulo.stock <= articulo.stock_minimo
                return (
                  <tr key={articulo.id} className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all ${stockBajo ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">{articulo.codigo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">{articulo.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={articulo.sector}
                        onChange={async (e) => {
                          const nuevoSector = e.target.value
                          const success = await updateArticulo(articulo.id, { sector: nuevoSector })
                          if (success) {
                            loadArticulos()
                          } else {
                            alert('Error al actualizar el sector')
                          }
                        }}
                        className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded border border-emerald-300 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {SECTORS.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${stockBajo ? 'text-red-600' : 'text-gray-800'}`}>
                          {articulo.stock}
                        </span>
                        {stockBajo && <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {articulo.stock_minimo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      ${articulo.precio.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(articulo)}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(articulo.id)}
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

        {filteredArticulos.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No se encontraron artículos</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticulo ? 'Editar Artículo' : 'Nuevo Artículo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
              <select
                required
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <input
                type="text"
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
              <input
                type="text"
                value={formData.imagen}
                onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://..."
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
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {editingArticulo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

