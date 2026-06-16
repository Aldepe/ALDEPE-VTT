import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import type { ID } from '@domain/entities/common'
import type { RealtimeEventName, RealtimeRepository } from '@domain/repositories/realtimeRepository'

const realtimeTables: RealtimeEventName[] = [
  'campaign_members',
  'maps',
  'notes',
  'characters',
  'timeline_sessions',
  'character_actions',
  'character_attacks',
  'character_features',
  'character_traits',
  'character_triggers',
  'character_resources',
  'character_spell_slots',
  'character_spells',
  'character_resistances',
  'character_conditions',
  'character_tools',
  'character_weapons',
  'character_armor',
  'character_turn_plans',
  'character_turn_plan_items',
  'character_turn_history',
  'battlemap_areas',
  'map_assets',
  'tokens',
  'turn_orders',
  'inventory_containers',
  'inventory_items',
]

export class SupabaseRealtimeRepository implements RealtimeRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  subscribeToCampaign(campaignId: ID, onChange: (eventName: RealtimeEventName) => void): () => void {
    const channel: RealtimeChannel = this.client.channel(`campaign:${campaignId}`)

    realtimeTables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        () => onChange(table),
      )
    })

    channel.subscribe()

    return () => {
      void this.client.removeChannel(channel)
    }
  }
}
