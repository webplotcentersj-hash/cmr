'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProyectoById, updateProyecto, deleteProyecto } from '@/lib/db/proyectos'
import { getClientes } from '@/lib/db/clientes'
import { Proyecto, Cliente } from '@/types'
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, User, FileText, Package } from 'lucide-react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ProyectoForm from '@/components/forms/ProyectoForm'

export default function ProyectoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const proyectoId = params.id as string
  
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const proyectoData = await getProyectoById(proyectoId)
        if (proyectoData) {
          setProyecto(proyectoData)
          const clientesData = await getClientes()
          const clienteData = clientesData.find(c => c.id === proyectoData.clienteId)
          setCliente(clienteData || null)
        }
      } catch (error) {
        console.error('Error loading proyecto:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [proyectoId])

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      const success = await deleteProyecto(proyectoId)
      if (success) {
        router.push('/proyectos')
      } else {
        alert('Error al eliminar el proyecto')
      }
    }
  }

  const estadoColors: Record<string, string> = {
    presupuesto: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
    aprobado: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    en_produccion: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    completado: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    cancelado: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando proyecto...</div>
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Proyecto no encontrado</p>
        <Link
          href="/proyectos"
          className="text-green-600 hover:text-green-800 font-semibold hover:underline flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Proyectos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/proyectos"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {proyecto.nombre}
            </h1>
            <p className="text-green-600 mt-2 font-medium">Detalles del proyecto</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Edit className="w-4 h-4" />
            <span className="font-semibold">Editar</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-semibold">Eliminar</span>
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-green-600" />
              Información General
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="text-gray-800 mt-1">{proyecto.descripcion || 'Sin descripción'}</p>
              </div>
              {proyecto.notas && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notas</label>
                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{proyecto.notas}</p>
                </div>
              )}
            </div>
          </div>

          {proyecto.items && proyecto.items.length > 0 && (
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Package className="w-6 h-6 mr-2 text-green-600" />
                Items del Proyecto
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-green-700 uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-green-700 uppercase">Cantidad</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-green-700 uppercase">Precio Unit.</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-green-700 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/80 divide-y divide-green-100">
                    {proyecto.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-800">{item.descripcion || `Producto ${item.productoId}`}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.cantidad}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${item.precioUnitario.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">${item.subtotal.toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estado</h2>
            <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${estadoColors[proyecto.estado] || 'bg-gray-100 text-gray-800'}`}>
              {proyecto.estado.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Cliente
            </h2>
            {cliente ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">{cliente.nombre}</p>
                {cliente.empresa && <p className="text-sm text-gray-600">{cliente.empresa}</p>}
                <p className="text-sm text-gray-600">{cliente.email}</p>
                {cliente.telefono && <p className="text-sm text-gray-600">{cliente.telefono}</p>}
              </div>
            ) : (
              <p className="text-gray-500">Cliente no encontrado</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Fechas
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                <p className="text-gray-800 mt-1">{proyecto.fechaCreacion.toLocaleDateString('es-AR')}</p>
              </div>
              {proyecto.fechaEntrega && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Entrega</label>
                  <p className="text-gray-800 mt-1">{proyecto.fechaEntrega.toLocaleDateString('es-AR')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Financiero
            </h2>
            <div className="space-y-3">
              {proyecto.presupuesto && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Presupuesto</label>
                    <p className="text-gray-800 mt-1 font-semibold">${proyecto.presupuesto.toLocaleString('es-AR')}</p>
                </div>
              )}
              {proyecto.costoFinal && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Costo Final</label>
                  <p className="text-gray-800 mt-1 font-semibold">${proyecto.costoFinal.toLocaleString('es-AR')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Proyecto"
        size="lg"
      >
        <ProyectoForm
          proyecto={proyecto}
          onSuccess={() => {
            setIsEditModalOpen(false)
            // Recargar datos
            getProyectoById(proyectoId).then(data => {
              if (data) {
                setProyecto(data)
                getClientes().then(clientes => {
                  const clienteData = clientes.find(c => c.id === data.clienteId)
                  setCliente(clienteData || null)
                })
              }
            })
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

