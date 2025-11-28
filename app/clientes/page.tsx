'use client'

import { useState, useEffect } from 'react'
import { getClientes, deleteCliente } from '@/lib/db/clientes'
import { Cliente } from '@/types'
import { Plus, Search, Mail, Phone, Building, Edit, Trash2, Download, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ClienteForm from '@/components/forms/ClienteForm'

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [clientesList, setClientesList] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const loadClientes = async () => {
    try {
      const data = await getClientes()
      setClientesList(data)
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  const handleCreate = () => {
    setSelectedCliente(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      const success = await deleteCliente(id)
      if (success) {
        loadClientes()
      } else {
        alert('Error al eliminar el cliente')
      }
    }
  }

  const handleExport = () => {
    const csv = [
      ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Ciudad', 'Dirección'].join(','),
      ...clientesList.map(c => [
        c.nombre,
        c.email,
        c.telefono,
        c.empresa || '',
        c.ciudad || '',
        c.direccion || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleWhatsApp = (cliente: Cliente) => {
    if (!cliente.telefono) {
      alert('Este cliente no tiene número de teléfono registrado')
      return
    }

    // Limpiar el número de teléfono (quitar espacios, guiones, paréntesis, etc.)
    const numeroLimpio = cliente.telefono.replace(/\D/g, '')
    
    // Si el número no empieza con código de país, agregar código de Argentina (54)
    const numeroFinal = numeroLimpio.startsWith('54') ? numeroLimpio : `54${numeroLimpio}`
    
    // Mensaje predefinido
    const mensaje = encodeURIComponent(`Hola ${cliente.nombre}, te contacto desde Plot Center CRM.`)
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${numeroFinal}?text=${mensaje}`, '_blank')
  }

  const filteredClientes = clientesList.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Clientes
          </h1>
          <p className="text-purple-600 mt-2 font-medium">Gestiona tu base de clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="w-4 h-4" />
            <span className="font-semibold">Exportar CSV</span>
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Nuevo Cliente</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100">
        <div className="p-4 border-b-2 border-blue-200 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-blue-100">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-800">{cliente.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-700 flex items-center font-medium">
                      <Building className="w-4 h-4 mr-2 text-blue-500" />
                      {cliente.empresa || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-purple-500" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-green-500" />
                        {cliente.telefono}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {cliente.ciudad || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {cliente.telefono && (
                        <button
                          onClick={() => handleWhatsApp(cliente)}
                          className="text-green-600 hover:text-green-800 font-semibold hover:underline flex items-center bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="text-red-600 hover:text-red-800 font-semibold hover:underline flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClientes.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron clientes</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <ClienteForm
          cliente={selectedCliente}
          onSuccess={() => {
            setIsModalOpen(false)
            loadClientes()
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

