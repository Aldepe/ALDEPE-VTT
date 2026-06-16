import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BattleArea, BattleMap, MapAsset, Token, TurnOrder } from '@domain/entities/battlemap'
import type { AudioSettings } from '@domain/entities/audio'
import type { CampaignMember, LoadStatus, SaveStatus } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import type { LoreEntry } from '@domain/entities/lore'
import type { CampaignNote } from '@domain/entities/note'
import type { Quest, TimelineSession } from '@domain/entities/timeline'
import type { AuthCredentials, AuthSession } from '@domain/repositories/authRepository'
import type { CampaignWorkspace } from '@domain/repositories/campaignRepository'
import { defaultAudioSettings, SetVolumeUseCase, ToggleSoundUseCase } from '@application/use-cases/audioSettings'
import { LoadBrandingAssetsUseCase } from '@application/use-cases/branding'
import { DeleteMapUseCase } from '@application/use-cases/maps'
import { createBlankCharacter } from '@application/use-cases/workspaceFactories'
import { recalculateCharacterBonuses } from '@domain/services/characterStats'
import { canEditCharacter, canViewCharacter, findMemberByUserId, isDm } from '@domain/services/permissions'
import { createAppRepositories } from '@infrastructure/repositories/repositoryFactory'
import {
  withCharacter,
  withCampaignMember,
  withBattleArea,
  withInventoryContainer,
  withInventoryItem,
  withLoreEntry,
  withMap,
  withMapAsset,
  withNote,
  withQuest,
  withSession,
  withToken,
  withTurnOrder,
  withoutLoreEntry,
  withoutBattleArea,
  withoutInventoryContainer,
  withoutInventoryItem,
  withoutMapAsset,
  withoutNote,
  withoutQuest,
  withoutSession,
  withoutToken,
} from '@application/use-cases/workspaceMutations'
import { AppShell, type MainTab } from '@ui/layout/AppShell'
import { AuthPanel } from '@ui/pages/AuthPanel'
import { BattlemapPage } from '@ui/pages/BattlemapPage'
import { CharacterSheetPage } from '@ui/pages/CharacterSheetPage'
import { LorePage } from '@ui/pages/LorePage'
import { NotesPage } from '@ui/pages/NotesPage'
import { TimelinePage } from '@ui/pages/TimelinePage'
import './ui/styles/app.css'

function getVisibleMember(workspace: CampaignWorkspace | null, session: AuthSession | null): CampaignMember | undefined {
  if (!workspace || !session) {
    return undefined
  }

  return findMemberByUserId(workspace.members, session.profile.id) ?? workspace.members.find((member) => member.role === session.preferredRole)
}

export default function App() {
  const repositories = useMemo(() => createAppRepositories(), [])
  const branding = useMemo(() => LoadBrandingAssetsUseCase(repositories.branding), [repositories.branding])
  const [session, setSession] = useState<AuthSession | null>(null)
  const [workspace, setWorkspace] = useState<CampaignWorkspace | null>(null)
  const [activeTab, setActiveTab] = useState<MainTab>('character')
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(defaultAudioSettings)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>()
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const viewerMember = getVisibleMember(workspace, session)
  const visibleCharacters = workspace?.characters.filter((character) => canViewCharacter(viewerMember, character)) ?? []
  const selectedCharacter =
    visibleCharacters.find((character) => character.id === selectedCharacterId) ??
    visibleCharacters.find((character) => character.id === viewerMember?.characterId) ??
    visibleCharacters.find((character) => character.ownerUserId === viewerMember?.userId) ??
    visibleCharacters[0]

  useEffect(() => {
    document.body.style.setProperty('--app-background-layer', `url("${branding.backgroundPath}") center / cover fixed`)

    return () => {
      document.body.style.removeProperty('--app-background-layer')
    }
  }, [branding.backgroundPath])

  const loadWorkspace = useCallback(
    async (nextSession: AuthSession) => {
      setLoadStatus('loading')
      setError(null)

      try {
        const nextWorkspace = await repositories.campaign.loadWorkspace(
          nextSession.profile.id,
          nextSession.preferredRole,
          nextSession.profile.displayName,
        )
        setWorkspace(nextWorkspace)
        const member = getVisibleMember(nextWorkspace, nextSession)
        const firstVisibleCharacter = nextWorkspace.characters.find((character) => canViewCharacter(member, character))
        setSelectedCharacterId(member?.characterId ?? firstVisibleCharacter?.id)
        setLoadStatus('ready')
      } catch (workspaceError) {
        setError(workspaceError instanceof Error ? workspaceError.message : 'No se pudo cargar la campaña')
        setLoadStatus('error')
      }
    },
    [repositories.campaign],
  )

  useEffect(() => {
    let mounted = true

    repositories.auth
      .getSession()
      .then(async (storedSession) => {
        if (!mounted) {
          return
        }

        if (!storedSession) {
          setLoadStatus('ready')
          return
        }

        setSession(storedSession)
        await loadWorkspace(storedSession)
      })
      .catch((sessionError) => {
        if (mounted) {
          setError(sessionError instanceof Error ? sessionError.message : 'No se pudo leer la sesión')
          setLoadStatus('error')
        }
      })

    return () => {
      mounted = false
    }
  }, [loadWorkspace, repositories.auth])

  useEffect(() => {
    let mounted = true
    repositories.audio.loadSettings().then((settings) => {
      if (mounted) {
        setAudioSettings(settings)
      }
    })

    return () => {
      mounted = false
    }
  }, [repositories.audio])

  useEffect(() => {
    if (!workspace || !session) {
      return undefined
    }

    return repositories.realtime.subscribeToCampaign(workspace.campaign.id, () => {
      void loadWorkspace(session)
    })
  }, [loadWorkspace, repositories.realtime, session, workspace])

  async function handleAuth(credentials: AuthCredentials, mode: 'sign-in' | 'sign-up') {
    setLoadStatus('loading')
    setError(null)

    try {
      const nextSession =
        mode === 'sign-in' ? await repositories.auth.signIn(credentials) : await repositories.auth.signUp(credentials)
      setSession(nextSession)
      await loadWorkspace(nextSession)
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo autenticar')
      setLoadStatus('error')
    }
  }

  async function handleSignOut() {
    await repositories.auth.signOut()
    setSession(null)
    setWorkspace(null)
    setSelectedCharacterId(undefined)
    setActiveTab('character')
  }

  async function persist<T>(operation: () => Promise<T>): Promise<T | null> {
    setSaveStatus('saving')
    setError(null)

    try {
      const result = await operation()
      setSaveStatus('saved')
      window.setTimeout(() => setSaveStatus('idle'), 1200)
      return result
    } catch (saveError) {
      setSaveStatus('error')
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar')
      return null
    }
  }

  async function saveCharacter(character: Character) {
    const normalized = recalculateCharacterBonuses(character)
    setWorkspace((current) => (current ? withCharacter(current, normalized) : current))
    await persist(() => repositories.campaign.saveCharacter(normalized))
  }

  async function createCharacterForPlayer(ownerUserId: string) {
    if (!workspace) {
      return
    }

    const character = createBlankCharacter(workspace.campaign.id, ownerUserId)
    setSelectedCharacterId(character.id)
    setWorkspace((current) => (current ? withCharacter(current, character) : current))
    await persist(() => repositories.campaign.saveCharacter(character))
  }

  async function assignCharacterToPlayer(characterId: string, ownerUserId: string) {
    if (!workspace) {
      return
    }

    const character = workspace.characters.find((candidate) => candidate.id === characterId)
    const member = workspace.members.find((candidate) => candidate.userId === ownerUserId)
    if (!character) {
      return
    }

    const nextCharacter = recalculateCharacterBonuses({
      ...character,
      ownerUserId,
      isVisibleToPlayer: true,
    })
    const nextMember = member ? { ...member, characterId } : undefined

    setWorkspace((current) => {
      if (!current) {
        return current
      }

      const withNextCharacter = withCharacter(current, nextCharacter)
      return nextMember ? withCampaignMember(withNextCharacter, nextMember) : withNextCharacter
    })
    setSelectedCharacterId(characterId)
    await persist(async () => {
      await repositories.campaign.saveCharacter(nextCharacter)
      if (nextMember) {
        await repositories.campaign.saveCampaignMember(nextMember)
      }
      return nextCharacter
    })
  }

  async function saveSession(sessionEntry: TimelineSession) {
    setWorkspace((current) => (current ? withSession(current, sessionEntry) : current))
    await persist(() => repositories.campaign.saveSession(sessionEntry))
  }

  async function deleteSession(sessionId: string) {
    setWorkspace((current) => (current ? withoutSession(current, sessionId) : current))
    await persist(() => repositories.campaign.deleteSession(sessionId))
  }

  async function saveQuest(quest: Quest) {
    setWorkspace((current) => (current ? withQuest(current, quest) : current))
    await persist(() => repositories.campaign.saveQuest(quest))
  }

  async function deleteQuest(questId: string) {
    setWorkspace((current) => (current ? withoutQuest(current, questId) : current))
    await persist(() => repositories.campaign.deleteQuest(questId))
  }

  async function saveLoreEntry(entry: LoreEntry) {
    setWorkspace((current) => (current ? withLoreEntry(current, entry) : current))
    await persist(() => repositories.campaign.saveLoreEntry(entry))
  }

  async function deleteLoreEntry(entryId: string) {
    setWorkspace((current) => (current ? withoutLoreEntry(current, entryId) : current))
    await persist(() => repositories.campaign.deleteLoreEntry(entryId))
  }

  async function saveMap(map: BattleMap) {
    setWorkspace((current) => (current ? withMap(current, map) : current))
    await persist(() => repositories.campaign.saveMap(map))
  }

  async function deleteMap(mapId: string) {
    setWorkspace((current) => (current ? DeleteMapUseCase(current, mapId) : current))
    await persist(() => repositories.campaign.deleteMap(mapId))
  }

  async function saveToken(token: Token) {
    setWorkspace((current) => (current ? withToken(current, token) : current))
    await persist(() => repositories.campaign.saveToken(token))
  }

  async function deleteToken(tokenId: string) {
    setWorkspace((current) => (current ? withoutToken(current, tokenId) : current))
    await persist(() => repositories.campaign.deleteToken(tokenId))
  }

  async function saveBattleArea(area: BattleArea) {
    setWorkspace((current) => (current ? withBattleArea(current, area) : current))
    await persist(() => repositories.campaign.saveBattleArea(area))
  }

  async function deleteBattleArea(areaId: string) {
    setWorkspace((current) => (current ? withoutBattleArea(current, areaId) : current))
    await persist(() => repositories.campaign.deleteBattleArea(areaId))
  }

  async function saveMapAsset(asset: MapAsset) {
    setWorkspace((current) => (current ? withMapAsset(current, asset) : current))
    await persist(() => repositories.campaign.saveMapAsset(asset))
  }

  async function deleteMapAsset(assetId: string) {
    setWorkspace((current) => (current ? withoutMapAsset(current, assetId) : current))
    await persist(() => repositories.campaign.deleteMapAsset(assetId))
  }

  async function saveNote(note: CampaignNote) {
    setWorkspace((current) => (current ? withNote(current, note) : current))
    await persist(() => repositories.campaign.saveNote(note))
  }

  async function deleteNote(noteId: string) {
    setWorkspace((current) => (current ? withoutNote(current, noteId) : current))
    await persist(() => repositories.campaign.deleteNote(noteId))
  }

  async function saveInventoryContainer(container: InventoryContainer) {
    setWorkspace((current) => (current ? withInventoryContainer(current, container) : current))
    await persist(() => repositories.campaign.saveInventoryContainer(container))
  }

  async function deleteInventoryContainer(containerId: string) {
    setWorkspace((current) => (current ? withoutInventoryContainer(current, containerId) : current))
    await persist(() => repositories.campaign.deleteInventoryContainer(containerId))
  }

  async function saveInventoryItem(item: InventoryItem) {
    setWorkspace((current) => (current ? withInventoryItem(current, item) : current))
    await persist(() => repositories.campaign.saveInventoryItem(item))
  }

  async function deleteInventoryItem(itemId: string) {
    setWorkspace((current) => (current ? withoutInventoryItem(current, itemId) : current))
    await persist(() => repositories.campaign.deleteInventoryItem(itemId))
  }

  async function saveTurnOrder(turnOrder: TurnOrder) {
    setWorkspace((current) => (current ? withTurnOrder(current, turnOrder) : current))
    await persist(() => repositories.campaign.saveTurnOrder(turnOrder))
  }

  async function toggleSound() {
    const nextSettings = ToggleSoundUseCase(audioSettings)
    setAudioSettings(nextSettings)
    await repositories.audio.saveSettings(nextSettings)
  }

  async function setVolume(volume: number) {
    const nextSettings = SetVolumeUseCase(audioSettings, volume)
    setAudioSettings(nextSettings)
    await repositories.audio.saveSettings(nextSettings)
  }

  if (!session || !workspace || !viewerMember) {
    return (
      <AuthPanel
        error={error}
        loadStatus={loadStatus}
        mode={repositories.mode}
        onAuth={handleAuth}
      />
    )
  }

  return (
    <AppShell
      activeTab={activeTab}
      audioSettings={audioSettings}
      branding={branding}
      campaign={workspace.campaign}
      characters={workspace.characters}
      members={workspace.members}
      mode={repositories.mode}
      onAssignCharacter={assignCharacterToPlayer}
      onCreateCharacter={createCharacterForPlayer}
      onSetVolume={setVolume}
      onSelectCharacter={setSelectedCharacterId}
      onSignOut={handleSignOut}
      onTabChange={setActiveTab}
      onToggleSound={toggleSound}
      saveStatus={saveStatus}
      selectedCharacterId={selectedCharacter?.id}
      session={session}
      viewerMember={viewerMember}
    >
      {error ? <div className="app-alert" role="alert">{error}</div> : null}
      {activeTab === 'character' && selectedCharacter ? (
        <CharacterSheetPage
          canEdit={canEditCharacter(viewerMember, selectedCharacter)}
          character={selectedCharacter}
          inventoryContainers={workspace.inventoryContainers.filter((container) => container.characterId === selectedCharacter.id)}
          inventoryItems={workspace.inventoryItems.filter((item) => item.characterId === selectedCharacter.id)}
          key={selectedCharacter.id}
          onDeleteInventoryContainer={deleteInventoryContainer}
          onDeleteInventoryItem={deleteInventoryItem}
          onSaveInventoryContainer={saveInventoryContainer}
          onSaveInventoryItem={saveInventoryItem}
          onSave={saveCharacter}
          saveStatus={saveStatus}
          viewerIsDm={isDm(viewerMember)}
        />
      ) : null}
      {activeTab === 'timeline' ? (
        <TimelinePage
          isDm={isDm(viewerMember)}
          onDeleteQuest={deleteQuest}
          onDeleteSession={deleteSession}
          onSaveQuest={saveQuest}
          onSaveSession={saveSession}
          quests={workspace.quests}
          sessions={workspace.sessions}
          viewerMember={viewerMember}
          campaignId={workspace.campaign.id}
        />
      ) : null}
      {activeTab === 'lore' ? (
        <LorePage
          campaignId={workspace.campaign.id}
          entries={workspace.loreEntries}
          isDm={isDm(viewerMember)}
          members={workspace.members}
          onDelete={deleteLoreEntry}
          onSave={saveLoreEntry}
          viewerMember={viewerMember}
        />
      ) : null}
      {activeTab === 'notes' ? (
        <NotesPage
          campaignId={workspace.campaign.id}
          notes={workspace.notes}
          onDelete={deleteNote}
          onSave={saveNote}
          viewerMember={viewerMember}
        />
      ) : null}
      {activeTab === 'battlemap' ? (
        <BattlemapPage
          campaign={workspace.campaign}
          battleAreas={workspace.battleAreas}
          characters={workspace.characters}
          drawings={workspace.drawings}
          isDm={isDm(viewerMember)}
          mapAssets={workspace.mapAssets}
          maps={workspace.maps}
          onDeleteBattleArea={deleteBattleArea}
          onDeleteMap={deleteMap}
          onDeleteMapAsset={deleteMapAsset}
          onDeleteToken={deleteToken}
          onSaveBattleArea={saveBattleArea}
          onSaveMap={saveMap}
          onSaveMapAsset={saveMapAsset}
          onSaveToken={saveToken}
          onSaveTurnOrder={saveTurnOrder}
          selectedCharacter={selectedCharacter}
          tokens={workspace.tokens}
          turnOrders={workspace.turnOrders}
          viewerMember={viewerMember}
        />
      ) : null}
    </AppShell>
  )
}
