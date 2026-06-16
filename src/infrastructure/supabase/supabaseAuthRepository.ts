import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthCredentials, AuthRepository, AuthSession } from '@domain/repositories/authRepository'

export class SupabaseAuthRepository implements AuthRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getUser()
    if (error || !data.user?.email) {
      return null
    }

    return {
      profile: {
        id: data.user.id,
        email: data.user.email,
        displayName: String(data.user.user_metadata.display_name ?? data.user.email.split('@')[0]),
      },
      preferredRole: data.user.user_metadata.preferred_role === 'dm' ? 'dm' : 'player',
    }
  }

  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error || !data.user?.email) {
      throw new Error(error?.message ?? 'No se pudo iniciar sesión')
    }

    return {
      profile: {
        id: data.user.id,
        email: data.user.email,
        displayName: String(data.user.user_metadata.display_name ?? data.user.email.split('@')[0]),
      },
      preferredRole: data.user.user_metadata.preferred_role === 'dm' ? 'dm' : credentials.preferredRole ?? 'player',
    }
  }

  async signUp(credentials: AuthCredentials): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          display_name: credentials.displayName,
          preferred_role: credentials.preferredRole ?? 'player',
        },
      },
    })

    if (error || !data.user?.email) {
      throw new Error(error?.message ?? 'No se pudo crear la cuenta')
    }

    return {
      profile: {
        id: data.user.id,
        email: data.user.email,
        displayName: credentials.displayName || data.user.email.split('@')[0],
      },
      preferredRole: credentials.preferredRole ?? 'player',
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }
}
