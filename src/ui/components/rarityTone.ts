export function rarityTone(rarity: string): string {
  const normalized = rarity.toLowerCase()

  if (normalized.includes('artifact')) return 'artifact'
  if (normalized.includes('legendary')) return 'legendary'
  if (normalized.includes('very')) return 'very-rare'
  if (normalized.includes('rare')) return 'rare'
  if (normalized.includes('uncommon')) return 'uncommon'
  return 'common'
}
