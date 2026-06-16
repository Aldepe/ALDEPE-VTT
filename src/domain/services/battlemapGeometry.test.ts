import { describe, expect, it } from 'vitest'
import { distanceFeet, sortTurnEntries } from './battlemapGeometry'

describe('battlemap geometry', () => {
  it('converts pixel distance to 5 ft grid distance', () => {
    expect(distanceFeet({ x: 0, y: 0 }, { x: 140, y: 0 }, 70)).toBe(10)
  })

  it('sorts turn order by initiative and name', () => {
    const sorted = sortTurnEntries([
      { name: 'Beta', initiative: 12 },
      { name: 'Alpha', initiative: 12 },
      { name: 'Nova', initiative: 18 },
    ])

    expect(sorted.map((entry) => entry.name)).toEqual(['Nova', 'Alpha', 'Beta'])
  })
})
