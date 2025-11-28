'use client'

import { useEffect, useState } from 'react'
import { getClientes } from '@/lib/db/clientes'
import { getProyectos } from '@/lib/db/proyectos'
import { Cliente, Proyecto, Estadisticas } from '@/types'
import { Users, FolderKanban, DollarSign, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalClientes: 0,
    totalProyectos: 0,
    proyectosActivos: 0,
    ingresosMes: 0,
    proyectosCompletadosMes: 0,
    promedioTiempoProyecto: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [clientesData, proyectosData] = await Promise.all([
          getClientes(),
          getProyectos(),
        ])
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

  useEffect(() => {
    if (proyectos.length === 0) return

    // Calcular estadísticas
    const proyectosActivos = proyectos.filter(
      p => p.estado === 'en_produccion' || p.estado === 'aprobado'
    ).length

    const ingresosMes = proyectos
      .filter(p => {
        const fecha = p.fechaCreacion
        const ahora = new Date()
        return fecha.getMonth() === ahora.getMonth() && 
               fecha.getFullYear() === ahora.getFullYear()
      })
      .reduce((sum, p) => sum + (p.costoFinal || p.presupuesto || 0), 0)

    const proyectosCompletadosMes = proyectos.filter(
      p => p.estado === 'completado' && 
           p.fechaCreacion.getMonth() === new Date().getMonth()
    ).length

    setEstadisticas({
      totalClientes: clientes.length,
      totalProyectos: proyectos.length,
      proyectosActivos,
      ingresosMes,
      proyectosCompletadosMes,
      promedioTiempoProyecto: 15, // días promedio
    })
  }, [clientes, proyectos])

  const datosGrafico = [
    { mes: 'Ene', proyectos: 5, ingresos: 45000 },
    { mes: 'Feb', proyectos: 8, ingresos: 72000 },
    { mes: 'Mar', proyectos: 12, ingresos: 108000 },
    { mes: 'Abr', proyectos: 10, ingresos: 90000 },
    { mes: 'May', proyectos: 15, ingresos: 135000 },
    { mes: 'Jun', proyectos: proyectos.length, ingresos: estadisticas.ingresosMes },
  ]

  const proyectosPorEstado = [
    { estado: 'Presupuesto', cantidad: proyectos.filter(p => p.estado === 'presupuesto').length },
    { estado: 'Aprobado', cantidad: proyectos.filter(p => p.estado === 'aprobado').length },
    { estado: 'En Producción', cantidad: proyectos.filter(p => p.estado === 'en_produccion').length },
    { estado: 'Completado', cantidad: proyectos.filter(p => p.estado === 'completado').length },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-purple-600 mt-2 font-medium">Resumen general de Plot Center</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100 mb-1">Total Clientes</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.totalClientes}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100 mb-1">Proyectos Activos</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.proyectosActivos}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100 mb-1">Ingresos del Mes</p>
              <p className="text-3xl font-bold mt-2">
                ${estadisticas.ingresosMes.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100 mb-1">Completados (Mes)</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.proyectosCompletadosMes}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border-2 border-purple-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Ingresos por Mes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
              <XAxis dataKey="mes" stroke="#9333ea" />
              <YAxis stroke="#9333ea" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#faf5ff', 
                  border: '2px solid #c084fc',
                  borderRadius: '12px'
                }}
                formatter={(value: number) => `$${value.toLocaleString('es-AR')}`}
              />
              <Bar dataKey="ingresos" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-6 border-2 border-green-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Proyectos por Estado
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proyectosPorEstado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="estado" stroke="#16a34a" />
              <YAxis stroke="#16a34a" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f0fdf4', 
                  border: '2px solid #4ade80',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="cantidad" fill="url(#colorGradientGreen)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proyectos recientes */}
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border-2 border-indigo-100">
        <div className="p-6 border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Proyectos Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Fecha Entrega
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-purple-100">
              {proyectos.slice(0, 5).map((proyecto) => {
                const cliente = clientes.find(c => c.id === proyecto.clienteId)
                const estadoColors: Record<string, string> = {
                  presupuesto: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold shadow-md',
                  aprobado: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-md',
                  en_produccion: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-md',
                  completado: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md',
                  cancelado: 'bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-md',
                }
                
                return (
                  <tr key={proyecto.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">{proyecto.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-700">{cliente?.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        estadoColors[proyecto.estado] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {proyecto.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">
                      ${(proyecto.presupuesto || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {proyecto.fechaEntrega?.toLocaleDateString('es-AR') || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

