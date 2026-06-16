import type { CampaignRole, UserProfile } from '../entities/common'

export interface AuthCredentials {
  email: string
  password: string
  displayName?: string
  preferredRole?: CampaignRole
}

export interface AuthSession {
  profile: UserProfile
  preferredRole: CampaignRole
}

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>
  signIn(credentials: AuthCredentials): Promise<AuthSession>
  signUp(credentials: AuthCredentials): Promise<AuthSession>
  signOut(): Promise<void>
}
