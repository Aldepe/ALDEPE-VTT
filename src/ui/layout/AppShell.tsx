import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BookOpen, CalendarDays, LogOut, Map, NotebookPen, Plus, Save, Shield, UserRound, UsersRound } from 'lucide-react'
import clsx from 'clsx'
import type { AudioSettings } from '@domain/entities/audio'
import type { BrandingAssets } from '@domain/entities/branding'
import type { Campaign, CampaignMember, SaveStatus } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import type { AuthSession } from '@domain/repositories/authRepository'
import { isDm } from '@domain/services/permissions'
import { AudioControls } from '@ui/components/AudioControls'
import { BrandingLogo } from '@ui/components/BrandingLogo'

export type MainTab = 'character' | 'timeline' | 'lore' | 'notes' | 'battlemap'

interface AppShellProps {
  activeTab: MainTab
  audioSettings: AudioSettings
  branding: BrandingAssets
  campaign: Campaign
  characters: Character[]
  children: ReactNode
  members: CampaignMember[]
  mode: 'local-demo' | 'supabase'
  onAssignCharacter: (characterId: string, ownerUserId: string) => Promise<void>
  onCreateCharacter: (ownerUserId: string) => Promise<void>
  onSetVolume: (volume: number) => Promise<void>
  onSelectCharacter: (characterId: string) => void
  onSignOut: () => void
  onTabChange: (tab: MainTab) => void
  onToggleSound: () => Promise<void>
  saveStatus: SaveStatus
  selectedCharacterId?: string
  session: AuthSession
  viewerMember: CampaignMember
}

const tabs: Array<{ id: MainTab; label: string; icon: typeof UserRound }> = [
  { id: 'character', label: 'Ficha', icon: UserRound },
  { id: 'timeline', label: 'Cronograma', icon: CalendarDays },
  { id: 'lore', label: 'Lore', icon: BookOpen },
  { id: 'notes', label: 'Notas', icon: NotebookPen },
  { id: 'battlemap', label: 'Battlemap', icon: Map },
]

function saveLabel(status: SaveStatus): string {
  if (status === 'saving') {
    return 'Guardando'
  }

  if (status === 'saved') {
    return 'Guardado'
  }

  if (status === 'error') {
    return 'Error'
  }

  return 'Listo'
}

export function AppShell({
  activeTab,
  audioSettings,
  branding,
  campaign,
  characters,
  children,
  members,
  mode,
  onAssignCharacter,
  onCreateCharacter,
  onSetVolume,
  onSelectCharacter,
  onSignOut,
  onTabChange,
  onToggleSound,
  saveStatus,
  selectedCharacterId,
  session,
  viewerMember,
}: AppShellProps) {
  const playerMembers = useMemo(() => members.filter((member) => member.role === 'player'), [members])
  const [selectedOwnerUserId, setSelectedOwnerUserId] = useState(playerMembers[0]?.userId ?? '')
  const ownerUserId = selectedOwnerUserId || playerMembers[0]?.userId || viewerMember.userId

  return (
    <div className="app-frame">
      <aside className="side-nav" aria-label="Navegacion principal">
        <div className="brand-lockup">
          <div className="brand-mark">
            <BrandingLogo assets={branding} />
          </div>
          <div>
            <p className="eyebrow">{branding.appName}</p>
            <h1>{campaign.name}</h1>
          </div>
        </div>

        <nav className="tab-list">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                className={clsx('tab-button', activeTab === tab.id && 'is-active')}
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                type="button"
              >
                <Icon size={19} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {isDm(viewerMember) ? (
          <section className="character-admin-card" aria-label="Gestion de fichas">
            <label className="field compact-field">
              <span>Ficha activa</span>
              <select value={selectedCharacterId} onChange={(event) => onSelectCharacter(event.target.value)}>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field compact-field">
              <span>Jugador asignado</span>
              <select value={ownerUserId} onChange={(event) => setSelectedOwnerUserId(event.target.value)}>
                {playerMembers.map((member) => (
                  <option key={member.id} value={member.userId}>
                    {member.displayName}
                  </option>
                ))}
              </select>
            </label>
            <div className="inline-actions character-admin-actions">
              <button className="ghost-button" onClick={() => onCreateCharacter(ownerUserId)} type="button">
                <Plus size={15} aria-hidden="true" />
                Nueva
              </button>
              {selectedCharacterId ? (
                <button className="ghost-button" onClick={() => onAssignCharacter(selectedCharacterId, ownerUserId)} type="button">
                  <UsersRound size={15} aria-hidden="true" />
                  Asignar
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="session-card">
          <div className="avatar-chip">
            <Shield size={18} aria-hidden="true" />
            <span>{viewerMember.role.toUpperCase()}</span>
          </div>
          <strong>{session.profile.displayName}</strong>
          <small>{mode === 'supabase' ? 'Supabase' : 'Demo local'}</small>
          <div className={clsx('save-chip', saveStatus)}>
            <Save size={15} aria-hidden="true" />
            <span>{saveLabel(saveStatus)}</span>
          </div>
          <AudioControls settings={audioSettings} onSetVolume={onSetVolume} onToggle={onToggleSound} />
          <button className="ghost-button" onClick={onSignOut} type="button">
            <LogOut size={16} aria-hidden="true" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <main className="workspace-shell">{children}</main>
    </div>
  )
}
