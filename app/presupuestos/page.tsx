'use client'

import { useState, useEffect } from 'react'
import { getPresupuestos } from '@/lib/db/presupuestos'
import { getClientes } from '@/lib/db/clientes'
import { getProyectos } from '@/lib/db/proyectos'
import { Presupuesto, Cliente, Proyecto } from '@/types'
import { Plus, Search, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function PresupuestosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [presupuestosList, setPresupuestosList] = useState<Presupuesto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [presupuestosData, clientesData, proyectosData] = await Promise.all([
          getPresupuestos(),
          getClientes(),
          getProyectos(),
        ])
        setPresupuestosList(presupuestosData)
        setClientes(clientesData)
        setProyectos(proyectosData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPresupuestos = presupuestosList.filter(presupuesto => {
    const cliente = clientes.find(c => c.id === presupuesto.clienteId)
    const matchesSearch = 
      presupuesto.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEstado === 'todos' || presupuesto.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  const estadoIcons: Record<string, any> = {
    pendiente: Clock,
    aprobado: CheckCircle,
    rechazado: XCircle,
    vencido: Clock,
  }

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold shadow-md',
    aprobado: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-md',
    rechazado: 'bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-md',
    vencido: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold shadow-md',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando presupuestos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
            Presupuestos
          </h1>
          <p className="text-pink-600 mt-2 font-medium">Gestiona tus presupuestos y cotizaciones</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nuevo Presupuesto</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar presupuestos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPresupuestos.map((presupuesto) => {
                const cliente = clientes.find(c => c.id === presupuesto.clienteId)
                const proyecto = proyectos.find(p => p.id === presupuesto.proyectoId)
                const EstadoIcon = estadoIcons[presupuesto.estado] || FileText
                
                return (
                  <tr key={presupuesto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{presupuesto.numero}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente?.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proyecto?.nombre || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presupuesto.fechaCreacion.toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presupuesto.fechaVencimiento.toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${presupuesto.total.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                        estadoColors[presupuesto.estado] || 'bg-gray-100 text-gray-800'
                      }`}>
                        <EstadoIcon className="w-3 h-3 mr-1" />
                        {presupuesto.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/presupuestos/${presupuesto.id}`}
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

        {filteredPresupuestos.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron presupuestos</p>
          </div>
        )}
      </div>
    </div>
  )
}

