import type { AuthCredentials, AuthRepository, AuthSession } from '@domain/repositories/authRepository'

const sessionKey = 'aldepe-vtt-demo-session'

function sessionFromCredentials(credentials: AuthCredentials): AuthSession {
  const preferredRole = credentials.preferredRole ?? 'player'
  const profileId = preferredRole === 'dm' ? 'demo-dm' : 'demo-player'
  const email = credentials.email || (preferredRole === 'dm' ? 'dm@example.local' : 'player@example.local')

  return {
    profile: {
      id: profileId,
      email,
      displayName: credentials.displayName || email.split('@')[0] || (preferredRole === 'dm' ? 'DM Demo' : 'Player Demo'),
    },
    preferredRole,
  }
}

export class LocalAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    const stored = localStorage.getItem(sessionKey)
    return stored ? (JSON.parse(stored) as AuthSession) : null
  }

  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    const session = sessionFromCredentials(credentials)
    localStorage.setItem(sessionKey, JSON.stringify(session))
    return session
  }

  async signUp(credentials: AuthCredentials): Promise<AuthSession> {
    return this.signIn(credentials)
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(sessionKey)
  }
}
