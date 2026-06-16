import { describe, expect, it } from 'vitest'
import {
  CreateCharacterFeatureUseCase,
  DeleteCharacterFeatureUseCase,
  DuplicateCharacterFeatureUseCase,
  HighlightFeatureForPlayerUseCase,
} from './characterFeatures'

describe('character feature use cases', () => {
  it('creates, duplicates, highlights and deletes visual features', () => {
    const feature = CreateCharacterFeatureUseCase({ name: 'Prismatic step', icon: 'boots', functionalType: 'movement' })
    const highlighted = HighlightFeatureForPlayerUseCase(feature, true)
    const duplicate = DuplicateCharacterFeatureUseCase(highlighted)

    expect(highlighted.highlightForPlayer).toBe(true)
    expect(highlighted.highlightedByDm).toBe(true)
    expect(duplicate.id).not.toBe(feature.id)
    expect(duplicate.icon).toBe('boots')
    expect(DeleteCharacterFeatureUseCase([feature, duplicate], feature.id)).toEqual([duplicate])
  })
})
