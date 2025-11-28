'use client'

import { useState, useEffect } from 'react'
import { getClientes } from '@/lib/db/clientes'
import { getProyectos } from '@/lib/db/proyectos'
import { getPresupuestos } from '@/lib/db/presupuestos'
import { Cliente, Proyecto, Presupuesto } from '@/types'
import { Download, FileText, TrendingUp, DollarSign, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ReportesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [clientesData, proyectosData, presupuestosData] = await Promise.all([
          getClientes(),
          getProyectos(),
          getPresupuestos(),
        ])
        setClientes(clientesData)
        setProyectos(proyectosData)
        setPresupuestos(presupuestosData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const proyectosPorEstado = [
    { name: 'Presupuesto', value: proyectos.filter(p => p.estado === 'presupuesto').length },
    { name: 'Aprobado', value: proyectos.filter(p => p.estado === 'aprobado').length },
    { name: 'En Producción', value: proyectos.filter(p => p.estado === 'en_produccion').length },
    { name: 'Completado', value: proyectos.filter(p => p.estado === 'completado').length },
  ]

  const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b']

  const ingresosPorMes = proyectos.reduce((acc, proyecto) => {
    const mes = new Date(proyecto.fechaCreacion).toLocaleDateString('es-AR', { month: 'short' })
    acc[mes] = (acc[mes] || 0) + (proyecto.presupuesto || 0)
    return acc
  }, {} as Record<string, number>)

  const handleExportPDF = () => {
    alert('Función de exportación PDF próximamente')
  }

  const handleExportCSV = () => {
    const csv = [
      ['Reporte', 'Valor'].join(','),
      ['Total Clientes', clientes.length].join(','),
      ['Total Proyectos', proyectos.length].join(','),
      ['Total Presupuestos', presupuestos.length].join(','),
      ['Ingresos Totales', proyectos.reduce((sum, p) => sum + (p.presupuesto || 0), 0)].join(','),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando reportes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Reportes y Estadísticas
          </h1>
          <p className="text-purple-600 mt-2 font-medium">Análisis detallado de tu negocio</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-blue-100 text-sm mb-1">Total Clientes</p>
          <p className="text-3xl font-bold">{clientes.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-green-100 text-sm mb-1">Total Proyectos</p>
          <p className="text-3xl font-bold">{proyectos.length}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
          <FileText className="w-8 h-8 mb-2" />
          <p className="text-yellow-100 text-sm mb-1">Presupuestos</p>
          <p className="text-3xl font-bold">{presupuestos.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2" />
          <p className="text-purple-100 text-sm mb-1">Ingresos Totales</p>
          <p className="text-3xl font-bold">
            ${proyectos.reduce((sum, p) => sum + (p.presupuesto || 0), 0).toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Proyectos por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={proyectosPorEstado}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {proyectosPorEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución de Estados</h2>
          <div className="space-y-3">
            {proyectosPorEstado.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

