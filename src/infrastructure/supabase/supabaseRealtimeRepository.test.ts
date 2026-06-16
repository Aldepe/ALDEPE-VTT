import { describe, expect, it, vi } from 'vitest'
import { SupabaseRealtimeRepository } from './supabaseRealtimeRepository'

describe('SupabaseRealtimeRepository', () => {
  it('subscribes to maps, notes, battle areas and inventory tables', () => {
    const subscribedTables: string[] = []
    const channel = {
      on: vi.fn((event, config, handler) => {
        void event
        void handler
        subscribedTables.push(config.table)
        return channel
      }),
      subscribe: vi.fn(),
    }
    const client = {
      channel: vi.fn(() => channel),
      removeChannel: vi.fn(),
    }
    const repository = new SupabaseRealtimeRepository(client as never)
    const unsubscribe = repository.subscribeToCampaign('campaign', vi.fn())

    expect(subscribedTables).toContain('maps')
    expect(subscribedTables).toContain('notes')
    expect(subscribedTables).toContain('characters')
    expect(subscribedTables).toContain('character_spells')
    expect(subscribedTables).toContain('character_conditions')
    expect(subscribedTables).toContain('character_turn_plans')
    expect(subscribedTables).toContain('character_turn_plan_items')
    expect(subscribedTables).toContain('timeline_sessions')
    expect(subscribedTables).toContain('battlemap_areas')
    expect(subscribedTables).toContain('inventory_items')
    expect(channel.subscribe).toHaveBeenCalled()
    unsubscribe()
    expect(client.removeChannel).toHaveBeenCalled()
  })
})
