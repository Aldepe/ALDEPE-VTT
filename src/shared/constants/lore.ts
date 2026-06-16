import type { LoreType } from '@domain/entities/lore'

export const loreTypeLabels: Record<LoreType, string> = {
  artifact: 'Artefacto',
  person: 'Personaje',
  zone: 'Zona',
  creature: 'Creature',
  ethnicity: 'Etnia',
  event: 'Evento',
  myth: 'Myth',
  organization: 'Organization',
}

export const loreFieldTemplates: Record<LoreType, string[]> = {
  artifact: ['descripcion', 'origen', 'historia'],
  person: ['descripcion', 'traitsMotivations', 'routine'],
  zone: ['historia', 'cultura'],
  creature: ['descripcion', 'comportamiento', 'habilidades'],
  ethnicity: ['descripcion', 'cultura', 'historia'],
  event: ['descripcion', 'significance', 'aftermath'],
  myth: ['story', 'moral', 'culturalSignificance'],
  organization: ['description', 'historyStructure'],
}
