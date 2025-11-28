'use client'

import { useState, useEffect } from 'react'
import { getProductos } from '@/lib/db/productos'
import { Producto } from '@/types'
import { Plus, Search, Package, DollarSign } from 'lucide-react'

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('todas')
  const [productosList, setProductosList] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProductos() {
      try {
        const data = await getProductos()
        setProductosList(data)
      } catch (error) {
        console.error('Error loading productos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProductos()
  }, [])

  const categorias = Array.from(new Set(productosList.map(p => p.categoria)))

  const filteredProductos = productosList.filter(producto => {
    const matchesSearch = 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCategoria === 'todas' || producto.categoria === filterCategoria
    return matchesSearch && matchesFilter && producto.activo
  })

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
        <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nuevo Producto</span>
        </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
                className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-white/30 backdrop-blur-sm text-white rounded-lg">
                    {producto.categoria}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{producto.nombre}</h3>
                
                {producto.descripcion && (
                  <p className="text-sm text-white/90 mb-4">{producto.descripcion}</p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-white/30">
                  <div>
                    <p className="text-sm text-white/80">Precio base</p>
                    <p className="text-2xl font-bold text-white flex items-center">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {producto.precioBase.toLocaleString('es-AR')}
                    </p>
                  </div>
                  <span className="text-sm text-white/80 font-medium">/{producto.unidad}</span>
                </div>
              </div>
            )
          })}
        </div>

        {filteredProductos.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  )
}

