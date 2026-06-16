import { beforeEach, describe, expect, it } from 'vitest'
import { LocalCampaignRepository } from './localCampaignRepository'

describe('LocalCampaignRepository', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads the demo campaign with player-visible data', async () => {
    const repository = new LocalCampaignRepository()
    const workspace = await repository.loadWorkspace('demo-player', 'player')

    expect(workspace.campaign.name).toBe('Aldepe D&D')
    expect(workspace.characters).toHaveLength(1)
    expect(workspace.maps[0]?.gridSize).toBeGreaterThan(0)
    expect(workspace.notes.length).toBeGreaterThan(0)
    expect(workspace.characters[0]?.attacks.length).toBeGreaterThan(0)
    expect(workspace.characters[0]?.passiveInvestigation).toBeGreaterThan(0)
  })
})
