'use client'

import { useState, useEffect } from 'react'
import { getProyectos } from '@/lib/db/proyectos'
import { Proyecto } from '@/types'
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

export default function CalendarioPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProyectos() {
      try {
        const data = await getProyectos()
        setProyectos(data)
      } catch (error) {
        console.error('Error loading proyectos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProyectos()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getProyectosForDate = (date: Date) => {
    return proyectos.filter(p => 
      p.fechaEntrega && isSameDay(new Date(p.fechaEntrega), date)
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando calendario...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Calendario de Entregas
          </h1>
          <p className="text-purple-600 mt-2 font-medium">Visualiza las fechas de entrega de tus proyectos</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            ← Anterior
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Siguiente →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24"></div>
          ))}
          {daysInMonth.map(day => {
            const proyectosDelDia = getProyectosForDate(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div
                key={day.toISOString()}
                className={`h-24 border-2 rounded-lg p-2 ${
                  isToday 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-16">
                  {proyectosDelDia.slice(0, 2).map(proyecto => (
                    <div
                      key={proyecto.id}
                      className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1 py-0.5 rounded truncate"
                      title={proyecto.nombre}
                    >
                      {proyecto.nombre}
                    </div>
                  ))}
                  {proyectosDelDia.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{proyectosDelDia.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Próximas Entregas</h3>
        <div className="space-y-3">
          {proyectos
            .filter(p => p.fechaEntrega && new Date(p.fechaEntrega) >= new Date())
            .sort((a, b) => {
              if (!a.fechaEntrega || !b.fechaEntrega) return 0
              return new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime()
            })
            .slice(0, 10)
            .map(proyecto => (
              <div
                key={proyecto.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">{proyecto.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {proyecto.fechaEntrega && format(new Date(proyecto.fechaEntrega), 'dd MMMM yyyy')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  proyecto.estado === 'completado' 
                    ? 'bg-green-100 text-green-800'
                    : proyecto.estado === 'en_produccion'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {proyecto.estado.replace('_', ' ')}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

