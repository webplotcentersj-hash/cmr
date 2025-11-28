import { createClient } from '@/lib/supabase/client'
import { Comment } from '@/types'

export async function getCommentsByPedido(pedidoId: number): Promise<Comment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    pedido_id: item.pedido_id,
    user_id: item.user_id,
    content: item.content,
    created_at: new Date(item.created_at),
  }))
}

export async function createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({
      pedido_id: comment.pedido_id,
      user_id: comment.user_id,
      content: comment.content,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating comment:', error)
    return null
  }

  return {
    id: data.id,
    pedido_id: data.pedido_id,
    user_id: data.user_id,
    content: data.content,
    created_at: new Date(data.created_at),
  }
}

export async function deleteComment(id: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting comment:', error)
    return false
  }

  return true
}

