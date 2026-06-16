import type { CharacterFeature } from '@domain/entities/character'
import { createId } from '@shared/utils/id'
import { createDefaultFeature } from './workspaceFactories'

export const featureIconLabels = {
  spark: 'Destello',
  shield: 'Defensa',
  blade: 'Ataque',
  boots: 'Movimiento',
  heart: 'Curacion',
  eye: 'Percepcion',
  crown: 'Social',
  book: 'Conocimiento',
  star: 'Recurso',
  rune: 'Runa',
} as const

export function CreateCharacterFeatureUseCase(patch: Partial<CharacterFeature> = {}): CharacterFeature {
  return {
    ...createDefaultFeature(),
    ...patch,
    id: patch.id ?? createId('feature'),
  }
}

export function UpdateCharacterFeatureUseCase(
  feature: CharacterFeature,
  patch: Partial<CharacterFeature>,
): CharacterFeature {
  return {
    ...feature,
    ...patch,
    id: feature.id,
  }
}

export function DuplicateCharacterFeatureUseCase(feature: CharacterFeature): CharacterFeature {
  return {
    ...feature,
    id: createId(feature.type === 'passive' ? 'trait' : 'feature'),
    name: `${feature.name} copy`,
    active: false,
    highlightedByDm: false,
  }
}

export function DeleteCharacterFeatureUseCase(features: CharacterFeature[], featureId: string): CharacterFeature[] {
  return features.filter((feature) => feature.id !== featureId)
}

export function HighlightFeatureForPlayerUseCase(feature: CharacterFeature, highlighted: boolean): CharacterFeature {
  return {
    ...feature,
    highlightedByDm: highlighted,
    highlightForPlayer: highlighted || feature.highlightForPlayer,
  }
}
