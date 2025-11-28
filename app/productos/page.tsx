'use client'

import { useState, useEffect } from 'react'
import { getProductos, deleteProducto } from '@/lib/db/productos'
import { Producto } from '@/types'
import { Plus, Search, Package, DollarSign, Edit, Trash2, ShoppingCart, Eye, Grid, List } from 'lucide-react'
import Modal from '@/components/Modal'
import ProductoForm from '@/components/forms/ProductoForm'

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('todas')
  const [productosList, setProductosList] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | undefined>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const loadProductos = async () => {
    try {
      const data = await getProductos()
      setProductosList(data)
    } catch (error) {
      console.error('Error loading productos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductos()
  }, [])

  const categorias = Array.from(new Set(productosList.map(p => p.categoria)))

  const filteredProductos = productosList.filter(producto => {
    const matchesSearch = 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCategoria === 'todas' || producto.categoria === filterCategoria
    return matchesSearch && matchesFilter && producto.activo
  })

  const handleCreate = () => {
    setSelectedProducto(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const success = await deleteProducto(id)
      if (success) {
        loadProductos()
      } else {
        alert('Error al eliminar el producto')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Productos y Servicios
          </h1>
          <p className="text-orange-600 mt-2 font-medium">Catálogo de productos y servicios</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-xl border-2 border-orange-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-2 border-orange-100">
        <div className="p-4 border-b-2 border-orange-200 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="border-2 border-orange-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/80 backdrop-blur-sm font-medium text-orange-700"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredProductos.map((producto, index) => {
              const gradients = [
                'from-purple-500 via-pink-500 to-rose-500',
                'from-blue-500 via-cyan-500 to-teal-500',
                'from-green-500 via-emerald-500 to-teal-500',
                'from-yellow-500 via-orange-500 to-red-500',
                'from-red-500 via-rose-500 to-pink-500',
                'from-indigo-500 via-purple-500 to-pink-500',
                'from-teal-500 via-cyan-500 to-blue-500',
                'from-amber-500 via-yellow-500 to-orange-500',
              ]
              const gradient = gradients[index % gradients.length]
              
              return (
                <div
                  key={producto.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-gray-100 hover:border-orange-300"
                >
                  {/* Imagen/Icono del producto */}
                  <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                    <Package className="w-20 h-20 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg shadow-md">
                        {producto.categoria}
                      </span>
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {producto.nombre}
                    </h3>
                    
                    {producto.descripcion && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{producto.descripcion}</p>
                    )}
                    
                    {/* Precio */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Precio</p>
                        <p className="text-2xl font-bold text-gray-800 flex items-center">
                          <span className="text-lg mr-1">$</span>
                          {producto.precioBase.toLocaleString('es-AR')}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-lg">
                        /{producto.unidad}
                      </span>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-semibold"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredProductos.map((producto, index) => {
              const gradients = [
                'from-purple-500 to-pink-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-yellow-500 to-orange-500',
                'from-red-500 to-rose-500',
                'from-indigo-500 to-purple-500',
              ]
              const gradient = gradients[index % gradients.length]
              
              return (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-300 overflow-hidden"
                >
                  <div className="flex items-center">
                    {/* Imagen/Icono */}
                    <div className={`w-32 h-32 bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                      <Package className="w-12 h-12 text-white" />
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{producto.nombre}</h3>
                            <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-lg">
                              {producto.categoria}
                            </span>
                          </div>
                          {producto.descripcion && (
                            <p className="text-sm text-gray-600 mb-3">{producto.descripcion}</p>
                          )}
                          <div className="flex items-center space-x-6">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Precio</p>
                              <p className="text-2xl font-bold text-gray-800">
                                ${producto.precioBase.toLocaleString('es-AR')} <span className="text-sm text-gray-500 font-normal">/{producto.unidad}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botones */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(producto)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-semibold"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredProductos.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductoForm
          producto={selectedProducto}
          onSuccess={() => {
            setIsModalOpen(false)
            setSelectedProducto(undefined)
            loadProductos()
          }}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedProducto(undefined)
          }}
        />
      </Modal>
    </div>
  )
}

