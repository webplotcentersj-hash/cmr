'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X, MessageSquare, CheckCircle, XCircle, Package } from 'lucide-react'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } from '@/lib/db/notifications'
import { Notification } from '@/types'
import Link from 'next/link'

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(undefined, false), // Cargar todas las notificaciones
        getUnreadCount(undefined), // Contar no leídas
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Recargar notificaciones cada 30 segundos
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id)
    await loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(undefined)
    await loadNotifications()
  }

  const getNotificationIcon = (type: string) => {
    if (type.includes('approved')) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (type.includes('rejected')) return <XCircle className="w-5 h-5 text-red-500" />
    if (type.includes('commented')) return <MessageSquare className="w-5 h-5 text-blue-500" />
    return <Package className="w-5 h-5 text-orange-500" />
  }

  const getNotificationColor = (type: string) => {
    if (type.includes('approved')) return 'bg-green-50 border-green-200'
    if (type.includes('rejected')) return 'bg-red-50 border-red-200'
    if (type.includes('commented')) return 'bg-blue-50 border-blue-200'
    return 'bg-orange-50 border-orange-200'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 z-50 max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-purple-600" />
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Cargando notificaciones...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-purple-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {notification.title && (
                            <h4 className="text-sm font-semibold text-gray-800 mb-1">
                              {notification.title}
                            </h4>
                          )}
                          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <div className="flex items-center space-x-2">
                              {notification.related_id && (
                                <Link
                                  href={`/pedidos`}
                                  onClick={() => setIsOpen(false)}
                                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                >
                                  Ver pedido
                                </Link>
                              )}
                              {!notification.is_read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                  title="Marcar como leída"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <Link
                  href="/pedidos"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Ver todos los pedidos
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

