import { describe, expect, it } from 'vitest'
import { getMapAssetDefinition, mapAssetDefinitions } from './mapAssets'

describe('map asset definitions', () => {
  it('contains a useful tactical asset set', () => {
    const types = new Set(mapAssetDefinitions.map((definition) => definition.type))

    expect(types.has('wall')).toBe(true)
    expect(types.has('locked-door')).toBe(true)
    expect(types.has('difficult-terrain')).toBe(true)
    expect(types.has('rune-glyph')).toBe(true)
    expect(types.has('lightning-zone')).toBe(true)
    expect(types.has('portal')).toBe(true)
  })

  it('returns grid sizing metadata for assets', () => {
    expect(getMapAssetDefinition('wall').baseWidthCells).toBeGreaterThanOrEqual(1)
  })
})
