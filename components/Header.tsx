'use client'

import { Bell, Search, User } from 'lucide-react'

export default function Header() {
  return (
    <header className="glass-effect border-b border-purple-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clientes, proyectos, productos..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 ml-6">
          <button className="relative p-2.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg"></span>
          </button>
          
          <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-full shadow-lg">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block pr-3">
              <p className="text-sm font-semibold text-white">Usuario</p>
              <p className="text-xs text-purple-100">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

