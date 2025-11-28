'use client'

import { useState, useEffect } from 'react'
import { getProyectos } from '@/lib/db/proyectos'
import { getClientes } from '@/lib/db/clientes'
import { Proyecto, Cliente } from '@/types'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function ProyectosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [proyectosList, setProyectosList] = useState<Proyecto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [proyectosData, clientesData] = await Promise.all([
          getProyectos(),
          getClientes(),
        ])
        setProyectosList(proyectosData)
        setClientes(clientesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredProyectos = proyectosList.filter(proyecto => {
    const cliente = clientes.find(c => c.id === proyecto.clienteId)
    const matchesSearch = 
      proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEstado === 'todos' || proyecto.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  const estadoColors: Record<string, string> = {
    presupuesto: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold shadow-md',
    aprobado: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-md',
    en_produccion: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-md',
    completado: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md',
    cancelado: 'bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-md',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando proyectos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Proyectos
          </h1>
          <p className="text-green-600 mt-2 font-medium">Gestiona tus proyectos y pedidos</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nuevo Proyecto</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100">
        <div className="p-4 border-b-2 border-green-200 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-500" />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="border-2 border-green-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm font-medium text-green-700"
              >
                <option value="todos">Todos los estados</option>
                <option value="presupuesto">Presupuesto</option>
                <option value="aprobado">Aprobado</option>
                <option value="en_produccion">En Producción</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProyectos.map((proyecto) => {
                const cliente = clientes.find(c => c.id === proyecto.clienteId)
                return (
                  <tr key={proyecto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{proyecto.nombre}</div>
                      {proyecto.descripcion && (
                        <div className="text-sm text-gray-500 mt-1">{proyecto.descripcion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente?.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        estadoColors[proyecto.estado] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {proyecto.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(proyecto.presupuesto || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proyecto.fechaEntrega?.toLocaleDateString('es-AR') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/proyectos/${proyecto.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProyectos.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron proyectos</p>
          </div>
        )}
      </div>
    </div>
  )
}

