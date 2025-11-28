'use client'

import { useState, useEffect } from 'react'
import { Proyecto } from '@/types'
import { createProyecto, updateProyecto } from '@/lib/db/proyectos'
import { getClientes } from '@/lib/db/clientes'
import { Cliente } from '@/types'

interface ProyectoFormProps {
  proyecto?: Proyecto | null
  onSuccess: () => void
  onCancel: () => void
}

export default function ProyectoForm({ proyecto, onSuccess, onCancel }: ProyectoFormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clienteId: '',
    nombre: '',
    descripcion: '',
    estado: 'presupuesto' as 'presupuesto' | 'aprobado' | 'en_produccion' | 'completado' | 'cancelado',
    fechaEntrega: '',
    presupuesto: '',
    costoFinal: '',
    notas: '',
  })

  useEffect(() => {
    async function loadClientes() {
      const data = await getClientes()
      setClientes(data)
    }
    loadClientes()
  }, [])

  useEffect(() => {
    if (proyecto) {
      setFormData({
        clienteId: proyecto.clienteId,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion || '',
        estado: proyecto.estado,
        fechaEntrega: proyecto.fechaEntrega ? new Date(proyecto.fechaEntrega).toISOString().split('T')[0] : '',
        presupuesto: proyecto.presupuesto?.toString() || '',
        costoFinal: proyecto.costoFinal?.toString() || '',
        notas: proyecto.notas || '',
      })
    }
  }, [proyecto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const proyectoData = {
        clienteId: formData.clienteId,
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        estado: formData.estado,
        fechaEntrega: formData.fechaEntrega ? new Date(formData.fechaEntrega) : undefined,
        presupuesto: formData.presupuesto ? parseFloat(formData.presupuesto) : undefined,
        costoFinal: formData.costoFinal ? parseFloat(formData.costoFinal) : undefined,
        notas: formData.notas || undefined,
      }

      if (proyecto) {
        await updateProyecto(proyecto.id, proyectoData)
        alert('Proyecto actualizado correctamente!')
      } else {
        await createProyecto(proyectoData as any)
        alert('Proyecto creado correctamente!')
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving proyecto:', error)
      alert('Error al guardar el proyecto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select
            required
            value={formData.clienteId}
            onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.empresa && `- ${cliente.empresa}`}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto *</label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ej: Diseño de logo corporativo"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Descripción detallada del proyecto..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
          <select
            required
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="presupuesto">Presupuesto</option>
            <option value="aprobado">Aprobado</option>
            <option value="en_produccion">En Producción</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
          <input
            type="date"
            value={formData.fechaEntrega}
            onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.presupuesto}
            onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Costo Final</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.costoFinal}
            onChange={(e) => setFormData({ ...formData, costoFinal: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Notas adicionales sobre el proyecto..."
          />
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
          className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : (proyecto ? 'Actualizar Proyecto' : 'Crear Proyecto')}
        </button>
      </div>
    </form>
  )
}

