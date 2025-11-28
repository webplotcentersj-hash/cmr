'use client'

import { Settings, User, Bell, Shield, Palette } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Configuración
        </h1>
        <p className="text-purple-600 mt-2 font-medium">Ajustes y preferencias del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Perfil de Usuario</h2>
          </div>
          <p className="text-blue-100 mb-4">Gestiona tu información personal y preferencias</p>
          <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all">
            Editar perfil →
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Notificaciones</h2>
          </div>
          <p className="text-green-100 mb-4">Configura cómo y cuándo recibir notificaciones</p>
          <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all">
            Configurar notificaciones →
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Seguridad</h2>
          </div>
          <p className="text-purple-100 mb-4">Gestiona contraseñas y seguridad de la cuenta</p>
          <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all">
            Configurar seguridad →
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Apariencia</h2>
          </div>
          <p className="text-orange-100 mb-4">Personaliza el tema y la apariencia del sistema</p>
          <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all">
            Cambiar apariencia →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de la Empresa</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              defaultValue="Plot Center"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              defaultValue="Empresa de Gráfica y Comunicación Visual"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}

