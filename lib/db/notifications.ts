import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'

export async function getNotifications(userId?: string, unreadOnly: boolean = false): Promise<Notification[]> {
  const supabase = createClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    message: item.message,
    type: item.type,
    related_id: item.related_id,
    is_read: item.is_read,
    created_at: new Date(item.created_at),
  }))
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_id: notification.related_id,
      is_read: notification.is_read,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating notification:', error)
    return null
  }

  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    message: data.message,
    type: data.type,
    related_id: data.related_id,
    is_read: data.is_read,
    created_at: new Date(data.created_at),
  }
}

export async function markNotificationAsRead(id: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
  return true
}

export async function markAllNotificationsAsRead(userId?: string): Promise<boolean> {
  const supabase = createClient()
  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { error } = await query

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
  return true
}

export async function getUnreadCount(userId?: string): Promise<number> {
  const supabase = createClient()
  let query = supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { count, error } = await query

  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }

  return count || 0
}

// Función helper para crear notificaciones de pedidos
export async function createPedidoNotification(
  pedidoId: number,
  pedidoNumero: string,
  type: 'created' | 'approved' | 'rejected' | 'commented',
  userId?: string,
  message?: string
): Promise<void> {
  const notifications: Omit<Notification, 'id' | 'created_at'>[] = []

  // Notificación para el usuario que creó el pedido (si hay userId)
  if (userId) {
    let title = ''
    let notificationMessage = ''

    switch (type) {
      case 'created':
        title = 'Nuevo Pedido Creado'
        notificationMessage = `Se creó el pedido ${pedidoNumero}. Pendiente de aprobación.`
        break
      case 'approved':
        title = 'Pedido Aprobado'
        notificationMessage = message || `El pedido ${pedidoNumero} ha sido aprobado.`
        break
      case 'rejected':
        title = 'Pedido Rechazado'
        notificationMessage = message || `El pedido ${pedidoNumero} ha sido rechazado.`
        break
      case 'commented':
        title = 'Nuevo Comentario'
        notificationMessage = message || `Hay un nuevo comentario en el pedido ${pedidoNumero}.`
        break
    }

    notifications.push({
      user_id: userId,
      title,
      message: notificationMessage,
      type: `pedido_${type}`,
      related_id: pedidoId,
      is_read: false,
    })
  }

  // Notificación para usuarios con rol "Compras" (todos los usuarios por ahora)
  // En el futuro, esto debería filtrarse por rol
  if (type === 'created' || type === 'commented') {
    // Notificar a usuarios de compras sobre nuevos pedidos o comentarios
    // Por ahora, creamos una notificación general (sin user_id específico)
    // En producción, deberías obtener los IDs de usuarios con rol "Compras"
    notifications.push({
      user_id: undefined, // null significa notificación general
      title: type === 'created' ? 'Nuevo Pedido Requiere Revisión' : 'Nuevo Comentario en Pedido',
      message: type === 'created'
        ? `El pedido ${pedidoNumero} requiere tu revisión y aprobación.`
        : `Hay un nuevo comentario en el pedido ${pedidoNumero}.`,
      type: `pedido_${type}`,
      related_id: pedidoId,
      is_read: false,
    })
  }

  // Crear todas las notificaciones
  for (const notification of notifications) {
    await createNotification(notification)
  }
}

