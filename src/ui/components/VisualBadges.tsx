import clsx from 'clsx'
import { LineIcon } from './LineIcon'
import { rarityTone } from './rarityTone'

interface RarityBadgeProps {
  rarity: string
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  return (
    <span className={clsx('rarity-badge', `rarity-${rarityTone(rarity)}`)}>
      <LineIcon aria-hidden="true" className="chip-line-icon" label="" name="star" />
      {rarity || 'Common'}
    </span>
  )
}
