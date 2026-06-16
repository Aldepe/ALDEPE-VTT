import type { CharacterCurrency } from '@domain/entities/character'
import { NumberInput } from './FormControls'
import { LineIcon, type LineIconName } from './LineIcon'

interface CurrencyBarProps {
  canEdit: boolean
  currency: CharacterCurrency
  onChange: (currency: CharacterCurrency) => void
}

const currencyItems: Array<{ key: keyof CharacterCurrency; label: string; short: string; icon: LineIconName }> = [
  { key: 'platinum', label: 'Platinum', short: 'PP', icon: 'coinPlatinum' },
  { key: 'gold', label: 'Gold', short: 'GP', icon: 'coinGold' },
  { key: 'electrum', label: 'Electrum', short: 'EP', icon: 'coinElectrum' },
  { key: 'silver', label: 'Silver', short: 'SP', icon: 'coinSilver' },
  { key: 'copper', label: 'Copper', short: 'CP', icon: 'coinCopper' },
]

export function CurrencyBar({ canEdit, currency, onChange }: CurrencyBarProps) {
  return (
    <section className="currency-bar" aria-label="Monedas del personaje">
      {currencyItems.map((item) => (
        <label className={`currency-pill currency-${item.key}`} key={item.key}>
          <LineIcon label={`Icono de ${item.label}`} name={item.icon} />
          <span>{item.short}</span>
          {canEdit ? (
            <NumberInput
              aria-label={item.label}
              min={0}
              onChange={(event) => onChange({ ...currency, [item.key]: Number(event.target.value) })}
              value={currency[item.key]}
            />
          ) : (
            <strong>{currency[item.key]}</strong>
          )}
        </label>
      ))}
    </section>
  )
}
