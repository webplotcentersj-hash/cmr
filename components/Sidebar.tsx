'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentUser, UserProfile, canCreateOrdenesCompra } from '@/lib/auth'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Package, 
  FileText,
  Settings,
  Calendar,
  BarChart3,
  Warehouse,
  ShoppingBag,
  ShoppingCart,
  DollarSign
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [canAccessCompras, setCanAccessCompras] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setCanAccessCompras(canCreateOrdenesCompra(currentUser))
    }
    loadUser()
  }, [])

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/proyectos', label: 'Proyectos', icon: FolderKanban },
    { href: '/productos', label: 'Productos', icon: Package },
    { href: '/presupuestos', label: 'Presupuestos', icon: FileText },
    { href: '/stock', label: 'Stock', icon: Warehouse },
    { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
    ...(canAccessCompras ? [{ href: '/compras', label: 'Compras', icon: ShoppingCart }] : []),
    { href: '/caja', label: 'Caja', icon: DollarSign },
    { href: '/calendario', label: 'Calendario', icon: Calendar },
    { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  ]

  const menuColors = [
    { bg: 'bg-gradient-primary', hover: 'hover:from-purple-600 hover:to-pink-600' },
    { bg: 'bg-gradient-blue', hover: 'hover:from-blue-600 hover:to-purple-600' },
    { bg: 'bg-gradient-secondary', hover: 'hover:from-orange-600 hover:to-yellow-600' },
    { bg: 'bg-gradient-success', hover: 'hover:from-green-600 hover:to-emerald-600' },
    { bg: 'bg-gradient-to-r from-pink-500 to-rose-500', hover: 'hover:from-pink-600 hover:to-rose-600' },
    { bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', hover: 'hover:from-emerald-600 hover:to-teal-600' },
    { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', hover: 'hover:from-amber-600 hover:to-orange-600' },
    ...(canAccessCompras ? [{ bg: 'bg-gradient-to-r from-indigo-500 to-purple-500', hover: 'hover:from-indigo-600 hover:to-purple-600' }] : []),
    { bg: 'bg-gradient-to-r from-lime-500 to-green-500', hover: 'hover:from-lime-600 hover:to-green-600' },
    { bg: 'bg-gradient-to-r from-cyan-500 to-blue-500', hover: 'hover:from-cyan-600 hover:to-blue-600' },
    { bg: 'bg-gradient-to-r from-red-500 to-orange-500', hover: 'hover:from-red-600 hover:to-orange-600' },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white flex flex-col shadow-2xl">
      <div className="p-6 border-b border-purple-700/50 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Plot Center
        </h1>
        <p className="text-sm text-purple-200 mt-1 font-medium">CRM</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const colors = menuColors[index % menuColors.length]
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `${colors.bg} text-white shadow-lg shadow-purple-500/50 transform scale-105`
                      : 'text-purple-100 hover:bg-purple-700/50 hover:text-white hover:shadow-md hover:transform hover:scale-102'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-purple-700/50">
        <Link
          href="/configuracion"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-purple-700/50 hover:text-white transition-all duration-200 hover:shadow-md"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configuración</span>
        </Link>
      </div>
    </aside>
  )
}
