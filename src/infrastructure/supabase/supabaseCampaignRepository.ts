import type { SupabaseClient } from '@supabase/supabase-js'
import type { BattleArea, BattleMap, Drawing, MapAsset, Token, TurnOrder } from '@domain/entities/battlemap'
import type { CampaignMember, ID } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import type { LoreEntry } from '@domain/entities/lore'
import type { CampaignNote } from '@domain/entities/note'
import type { Quest, TimelineSession } from '@domain/entities/timeline'
import type { CampaignRepository, CampaignWorkspace } from '@domain/repositories/campaignRepository'
import { NormalizeTokenUseCase } from '@application/use-cases/battlemapTokens'
import { createBlankMap, hydrateCharacterDefaults } from '@application/use-cases/workspaceFactories'
import { createId } from '@shared/utils/id'

export class SupabaseCampaignRepository implements CampaignRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async loadWorkspace(userId: ID, preferredRole: CampaignMember['role'], displayName = 'Dungeon Master'): Promise<CampaignWorkspace> {
    const campaignId = await this.findCampaignIdForCurrentUser(userId)

    if (campaignId) {
      return this.loadWorkspaceByCampaignId(campaignId)
    }

    if (preferredRole === 'dm') {
      return this.createInitialDmWorkspace(userId, displayName)
    }

    throw new Error('No hay campañas vinculadas a este usuario. Pide al DM que te añada a una campaña.')
  }

  private async findCampaignIdForCurrentUser(userId: ID): Promise<ID | null> {
    const { data: membership, error: membershipError } = await this.client
      .from('campaign_members')
      .select('campaignId')
      .eq('userId', userId)
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      throw new Error(membershipError.message)
    }

    return (membership?.campaignId as ID | undefined) ?? null
  }

  private async createInitialDmWorkspace(userId: ID, displayName: string): Promise<CampaignWorkspace> {
    const campaignId = createId('campaign')
    const activeMapId = createId('map')
    const campaign = {
      id: campaignId,
      name: 'Aldepe D&D',
      description: 'Campaña inicial creada para el DM.',
      activeMapId,
    }
    const member: CampaignMember = {
      id: createId('member'),
      campaignId,
      userId,
      role: 'dm',
      displayName: displayName.trim() || 'Dungeon Master',
      canDrawOnMap: true,
    }
    const map = {
      ...createBlankMap(campaignId),
      id: activeMapId,
      name: 'Claro bioluminiscente',
      isActive: true,
    }

    const { error: campaignError } = await this.client.from('campaigns').insert(campaign)
    if (campaignError) {
      throw new Error(campaignError.message)
    }

    const { error: memberError } = await this.client.from('campaign_members').insert(member)
    if (memberError) {
      throw new Error(memberError.message)
    }

    const { error: mapError } = await this.client.from('maps').insert(map)
    if (mapError) {
      throw new Error(mapError.message)
    }

    return this.loadWorkspaceByCampaignId(campaignId)
  }

  private async loadWorkspaceByCampaignId(campaignId: ID): Promise<CampaignWorkspace> {
    const [
      campaignResult,
      membersResult,
      charactersResult,
      sessionsResult,
      questsResult,
      loreResult,
      mapsResult,
      inventoryContainersResult,
      inventoryItemsResult,
      tokensResult,
      drawingsResult,
      areasResult,
      assetsResult,
      notesResult,
      turnsResult,
    ] = await Promise.all([
      this.client.from('campaigns').select('*').eq('id', campaignId).single(),
      this.client.from('campaign_members').select('*').eq('campaignId', campaignId),
      this.client.from('characters').select('*').eq('campaignId', campaignId),
      this.client.from('timeline_sessions').select('*').eq('campaignId', campaignId),
      this.client.from('quests').select('*').eq('campaignId', campaignId),
      this.client.from('lore_entries').select('*, lore_links!lore_links_source_id_fkey(target_id)').eq('campaignId', campaignId),
      this.client.from('maps').select('*').eq('campaignId', campaignId),
      this.client.from('inventory_containers').select('*'),
      this.client.from('inventory_items').select('*'),
      this.client.from('tokens').select('*').in('mapId', []),
      this.client.from('drawings').select('*').in('mapId', []),
      this.client.from('battlemap_areas').select('*').in('mapId', []),
      this.client.from('map_assets').select('*').in('mapId', []),
      this.client.from('notes').select('*').eq('campaignId', campaignId),
      this.client.from('turn_orders').select('*').in('mapId', []),
    ])

    if (campaignResult.error) {
      throw new Error(campaignResult.error.message)
    }

    if (
      membersResult.error ||
      charactersResult.error ||
      sessionsResult.error ||
      questsResult.error ||
      loreResult.error ||
      mapsResult.error ||
      notesResult.error
    ) {
      throw new Error('No se pudo cargar todo el workspace de Supabase')
    }

    const maps = (mapsResult.data ?? []) as BattleMap[]
    const mapIds = maps.map((map) => map.id)
    const [tokenRows, drawingRows, areaRows, assetRows, turnRows] = mapIds.length
      ? await Promise.all([
          this.client.from('tokens').select('*').in('mapId', mapIds),
          this.client.from('drawings').select('*').in('mapId', mapIds),
          this.client.from('battlemap_areas').select('*').in('mapId', mapIds),
          this.client.from('map_assets').select('*').in('mapId', mapIds),
          this.client.from('turn_orders').select('*').in('mapId', mapIds),
        ])
      : [tokensResult, drawingsResult, areasResult, assetsResult, turnsResult]

    return {
      campaign: campaignResult.data as CampaignWorkspace['campaign'],
      members: (membersResult.data ?? []) as CampaignMember[],
      characters: ((charactersResult.data ?? []) as Character[]).map((character) => hydrateCharacterDefaults(character)),
      sessions: ((sessionsResult.data ?? []) as TimelineSession[]).map((session) => ({
        ...session,
        sessionImageHoloEnabled: session.sessionImageHoloEnabled ?? true,
      })),
      quests: (questsResult.data ?? []) as Quest[],
      loreEntries: ((loreResult.data ?? []) as Array<LoreEntry & { lore_links?: { target_id: ID }[] }>).map((entry) => ({
        ...entry,
        linkedEntryIds: entry.lore_links?.map((link) => link.target_id) ?? entry.linkedEntryIds ?? [],
      })),
      maps,
      tokens: ((tokenRows.data ?? []) as Token[]).map(NormalizeTokenUseCase),
      drawings: (drawingRows.data ?? []) as Drawing[],
      battleAreas: (areaRows.data ?? []) as BattleArea[],
      mapAssets: (assetRows.data ?? []) as MapAsset[],
      notes: (notesResult.data ?? []) as CampaignNote[],
      inventoryContainers: (inventoryContainersResult.data ?? []) as InventoryContainer[],
      inventoryItems: (inventoryItemsResult.data ?? []) as InventoryItem[],
      turnOrders: (turnRows.data ?? []) as TurnOrder[],
    }
  }

  async saveCampaignMember(member: CampaignMember): Promise<CampaignMember> {
    return this.upsert('campaign_members', member)
  }

  async saveCharacter(character: Character): Promise<Character> {
    return this.upsert('characters', character)
  }

  async saveSession(session: TimelineSession): Promise<TimelineSession> {
    return this.upsert('timeline_sessions', session)
  }

  async deleteSession(sessionId: ID): Promise<void> {
    await this.deleteById('timeline_sessions', sessionId)
  }

  async saveQuest(quest: Quest): Promise<Quest> {
    return this.upsert('quests', quest)
  }

  async deleteQuest(questId: ID): Promise<void> {
    await this.deleteById('quests', questId)
  }

  async saveLoreEntry(entry: LoreEntry): Promise<LoreEntry> {
    const { linkedEntryIds, ...row } = entry
    const saved = await this.upsert<LoreEntry>('lore_entries', row)
    await this.client.from('lore_links').delete().eq('source_id', entry.id)
    if (linkedEntryIds.length) {
      const { error } = await this.client.from('lore_links').insert(
        linkedEntryIds.map((targetId) => ({
          source_id: entry.id,
          target_id: targetId,
        })),
      )
      if (error) {
        throw new Error(error.message)
      }
    }

    return { ...saved, linkedEntryIds }
  }

  async deleteLoreEntry(entryId: ID): Promise<void> {
    await this.deleteById('lore_entries', entryId)
  }

  async saveMap(map: BattleMap): Promise<BattleMap> {
    return this.upsert('maps', map)
  }

  async deleteMap(mapId: ID): Promise<void> {
    const { data: targetMap, error: selectError } = await this.client
      .from('maps')
      .select('campaignId')
      .eq('id', mapId)
      .single()

    if (selectError) {
      throw new Error(selectError.message)
    }

    const campaignId = (targetMap as { campaignId: ID }).campaignId
    await this.deleteById('maps', mapId)

    const { data: nextMaps, error: nextError } = await this.client
      .from('maps')
      .select('id')
      .eq('campaignId', campaignId)
      .order('name')
      .limit(1)

    if (nextError) {
      throw new Error(nextError.message)
    }

    const nextActiveMapId = ((nextMaps ?? []) as Array<{ id: ID }>)[0]?.id
    const { error: campaignError } = await this.client
      .from('campaigns')
      .update({ activeMapId: nextActiveMapId ?? null })
      .eq('id', campaignId)

    if (campaignError) {
      throw new Error(campaignError.message)
    }

    if (nextActiveMapId) {
      const { error: mapError } = await this.client.from('maps').update({ isActive: true }).eq('id', nextActiveMapId)
      if (mapError) {
        throw new Error(mapError.message)
      }
    }
  }

  async saveToken(token: Token): Promise<Token> {
    return this.upsert('tokens', token)
  }

  async deleteToken(tokenId: ID): Promise<void> {
    await this.deleteById('tokens', tokenId)
  }

  async saveDrawing(drawing: Drawing): Promise<Drawing> {
    return this.upsert('drawings', drawing)
  }

  async saveBattleArea(area: BattleArea): Promise<BattleArea> {
    return this.upsert('battlemap_areas', area)
  }

  async deleteBattleArea(areaId: ID): Promise<void> {
    await this.deleteById('battlemap_areas', areaId)
  }

  async saveMapAsset(asset: MapAsset): Promise<MapAsset> {
    return this.upsert('map_assets', asset)
  }

  async deleteMapAsset(assetId: ID): Promise<void> {
    await this.deleteById('map_assets', assetId)
  }

  async saveNote(note: CampaignNote): Promise<CampaignNote> {
    return this.upsert('notes', note)
  }

  async deleteNote(noteId: ID): Promise<void> {
    await this.deleteById('notes', noteId)
  }

  async saveInventoryContainer(container: InventoryContainer): Promise<InventoryContainer> {
    return this.upsert('inventory_containers', container)
  }

  async deleteInventoryContainer(containerId: ID): Promise<void> {
    await this.deleteById('inventory_containers', containerId)
  }

  async saveInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    return this.upsert('inventory_items', item)
  }

  async deleteInventoryItem(itemId: ID): Promise<void> {
    await this.deleteById('inventory_items', itemId)
  }

  async saveTurnOrder(turnOrder: TurnOrder): Promise<TurnOrder> {
    return this.upsert('turn_orders', turnOrder)
  }

  private async upsert<T extends { id: ID }>(tableName: string, row: Partial<T>): Promise<T> {
    const { data, error } = await this.client.from(tableName).upsert(row as never).select().single()
    if (error) {
      throw new Error(error.message)
    }

    return data as T
  }

  private async deleteById(tableName: string, id: ID): Promise<void> {
    const { error } = await this.client.from(tableName).delete().eq('id', id)
    if (error) {
      throw new Error(error.message)
    }
  }
}
