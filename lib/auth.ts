import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  nombre: string
  role: 'Compras' | 'Taller Gráfico' | 'Metalúrgica' | 'Mostrador' | 'Administrador'
  activo: boolean
  created_at: Date
  updated_at: Date
}

// Cliente
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .eq('activo', true)
    .single()

  if (error || !profile) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    nombre: profile.nombre,
    role: profile.role,
    activo: profile.activo,
    created_at: new Date(profile.created_at),
    updated_at: new Date(profile.updated_at),
  }
}

export function hasRole(user: UserProfile | null, roles: string[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

export function canApprovePedidos(user: UserProfile | null): boolean {
  return hasRole(user, ['Compras', 'Administrador'])
}

export function canCreateOrdenesCompra(user: UserProfile | null): boolean {
  return hasRole(user, ['Compras', 'Administrador'])
}

export function canManageUsers(user: UserProfile | null): boolean {
  return hasRole(user, ['Administrador'])
}

