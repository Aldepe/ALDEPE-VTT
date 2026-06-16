import type { ID } from '@domain/entities/common'

export type RealtimeEventName =
  | 'campaign_members'
  | 'maps'
  | 'notes'
  | 'characters'
  | 'timeline_sessions'
  | 'character_actions'
  | 'character_attacks'
  | 'character_features'
  | 'character_traits'
  | 'character_triggers'
  | 'character_resources'
  | 'character_spell_slots'
  | 'character_spells'
  | 'character_resistances'
  | 'character_conditions'
  | 'character_tools'
  | 'character_weapons'
  | 'character_armor'
  | 'character_turn_plans'
  | 'character_turn_plan_items'
  | 'character_turn_history'
  | 'battlemap_areas'
  | 'map_assets'
  | 'tokens'
  | 'turn_orders'
  | 'inventory_containers'
  | 'inventory_items'

export interface RealtimeRepository {
  subscribeToCampaign(campaignId: ID, onChange: (eventName: RealtimeEventName) => void): () => void
}
