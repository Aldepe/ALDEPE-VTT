import { useState } from 'react'
import type { FormEvent } from 'react'
import { LockKeyhole, UserPlus } from 'lucide-react'
import { LoadBrandingAssetsUseCase } from '@application/use-cases/branding'
import type { CampaignRole, LoadStatus } from '@domain/entities/common'
import type { AuthCredentials } from '@domain/repositories/authRepository'
import { BrandingLogo } from '@ui/components/BrandingLogo'
import { Field, SelectInput, TextInput } from '@ui/components/FormControls'

interface AuthPanelProps {
  error: string | null
  loadStatus: LoadStatus
  mode: 'local-demo' | 'supabase'
  onAuth: (credentials: AuthCredentials, mode: 'sign-in' | 'sign-up') => Promise<void>
}

export function AuthPanel({ error, loadStatus, mode, onAuth }: AuthPanelProps) {
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState(mode === 'local-demo' ? 'dm@example.local' : '')
  const [password, setPassword] = useState(mode === 'local-demo' ? 'demo-password' : '')
  const [displayName, setDisplayName] = useState('')
  const [preferredRole, setPreferredRole] = useState<CampaignRole>('dm')
  const isLoading = loadStatus === 'loading'
  const branding = LoadBrandingAssetsUseCase()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const credentials =
      authMode === 'sign-in'
        ? { email, password }
        : { email, password, displayName: displayName.trim(), preferredRole }

    await onAuth(credentials, authMode)
  }

  async function enterDemo(role: CampaignRole) {
    const nextEmail = role === 'dm' ? 'dm@example.local' : 'player@example.local'
    await onAuth(
      {
        email: nextEmail,
        password: 'demo-password',
        displayName: role === 'dm' ? 'DM Demo' : 'Player Demo',
        preferredRole: role,
      },
      'sign-in',
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="brand-lockup large">
          <div className="brand-mark">
            <BrandingLogo assets={branding} size="large" />
          </div>
          <div>
            <p className="eyebrow">{branding.appName}</p>
            <h1 id="auth-title">{branding.campaignName}</h1>
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="segmented" role="group" aria-label="Modo de autenticación">
            <button className={authMode === 'sign-in' ? 'is-active' : ''} onClick={() => setAuthMode('sign-in')} type="button">
              <LockKeyhole size={17} aria-hidden="true" />
              Iniciar sesión
            </button>
            <button className={authMode === 'sign-up' ? 'is-active' : ''} onClick={() => setAuthMode('sign-up')} type="button">
              <UserPlus size={17} aria-hidden="true" />
              Crear cuenta
            </button>
          </div>

          <Field label="Email">
            <TextInput autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </Field>
          <Field label="Contraseña">
            <TextInput
              autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </Field>
          {authMode === 'sign-up' ? (
            <>
              <Field label="Nombre visible">
                <TextInput autoComplete="name" onChange={(event) => setDisplayName(event.target.value)} required value={displayName} />
              </Field>
              <Field label="Rol inicial">
                <SelectInput onChange={(event) => setPreferredRole(event.target.value as CampaignRole)} value={preferredRole}>
                  <option value="dm">DM</option>
                  <option value="player">Jugador</option>
                </SelectInput>
              </Field>
            </>
          ) : null}

          {error ? <div className="app-alert" role="alert">{error}</div> : null}

          <button className="primary-button" disabled={isLoading} type="submit">
            {isLoading ? 'Cargando' : authMode === 'sign-in' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        {mode === 'local-demo' ? (
          <div className="demo-actions">
            <button className="ghost-button" disabled={isLoading} onClick={() => enterDemo('dm')} type="button">
              Entrar como DM demo
            </button>
            <button className="ghost-button" disabled={isLoading} onClick={() => enterDemo('player')} type="button">
              Entrar como player demo
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}
