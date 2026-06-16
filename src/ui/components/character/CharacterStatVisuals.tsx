import type { SVGProps } from 'react'
import clsx from 'clsx'
import type { AbilityKey } from '@domain/entities/character'
import type { SaveStatus } from '@domain/entities/common'
import { NumberInput } from '@ui/components/FormControls'
import { LineIcon } from '@ui/components/LineIcon'

export type StatIconType =
  | AbilityKey
  | 'ac'
  | 'hp'
  | 'tempHp'
  | 'initiative'
  | 'speed'
  | 'perception'
  | 'proficiency'
  | 'skill'

interface StatIconProps extends SVGProps<SVGSVGElement> {
  label: string
  type: StatIconType
}

export function StatIcon({ label, type, className, ...props }: StatIconProps) {
  return (
    <LineIcon
      className={clsx('stat-icon', `stat-icon-${type}`, className)}
      label={label}
      name={type}
      {...props}
    />
  )
}

interface AbilityScoreCardProps {
  ability: AbilityKey
  canEdit: boolean
  label: string
  modifier: string
  onChange: (value: number) => void
  saveStatus: SaveStatus
  value: number
}

function saveStatusLabel(status: SaveStatus): string {
  if (status === 'saving') {
    return 'Guardando'
  }

  if (status === 'saved') {
    return 'Guardado'
  }

  if (status === 'error') {
    return 'Error'
  }

  return 'Editable'
}

export function AbilityScoreCard({ ability, canEdit, label, modifier, onChange, saveStatus, value }: AbilityScoreCardProps) {
  return (
    <article className={clsx('ability-score-card', `ability-${ability}`)}>
      <StatIcon label={`Icono de ${label}`} type={ability} />
      <span className="ability-name">{label}</span>
      {canEdit ? (
        <label className="ability-value-field">
          <span className="sr-only">Valor de {label}</span>
          <NumberInput
            aria-label={`Valor de ${label}`}
            max={30}
            min={1}
            onChange={(event) => onChange(Number(event.target.value))}
            value={value}
          />
        </label>
      ) : (
        <strong className="ability-value-readonly" aria-label={`Valor de ${label}`}>{value}</strong>
      )}
      <strong className="ability-modifier">{modifier}</strong>
      <span className={clsx('mini-save-state', saveStatus)}>{canEdit ? saveStatusLabel(saveStatus) : 'Solo lectura'}</span>
    </article>
  )
}

interface CharacterStatBadgeProps {
  canEdit?: boolean
  icon: StatIconType
  label: string
  onChange?: (value: number) => void
  suffix?: string
  value: number | string
}

export function CharacterStatBadge({ canEdit = false, icon, label, onChange, suffix, value }: CharacterStatBadgeProps) {
  return (
    <article className="character-stat-badge">
      <StatIcon label={`Icono de ${label}`} type={icon} />
      <div>
        <span>{label}</span>
        {canEdit && typeof value === 'number' && onChange ? (
          <NumberInput
            aria-label={label}
            onChange={(event) => onChange(Number(event.target.value))}
            value={value}
          />
        ) : (
          <strong>{value}{suffix ? ` ${suffix}` : ''}</strong>
        )}
      </div>
    </article>
  )
}

interface ArmorClassShieldProps {
  canEdit: boolean
  onChange: (value: number) => void
  value: number
}

export function ArmorClassShield({ canEdit, onChange, value }: ArmorClassShieldProps) {
  return (
    <article className="armor-class-shield">
      <StatIcon label="Icono de clase de armadura" type="ac" />
      <span>AC</span>
      {canEdit ? (
        <NumberInput
          aria-label="Armor Class"
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          value={value}
        />
      ) : (
        <strong aria-label="Armor Class">{value}</strong>
      )}
    </article>
  )
}

interface HitPointOrbProps {
  canEdit: boolean
  current: number
  max: number
  onCurrentChange: (value: number) => void
  onMaxChange: (value: number) => void
  onTempChange: (value: number) => void
  temporary: number
}

export function HitPointOrb({
  canEdit,
  current,
  max,
  onCurrentChange,
  onMaxChange,
  onTempChange,
  temporary,
}: HitPointOrbProps) {
  const hpRatio = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0

  return (
    <article className="hit-point-orb">
      <div className="hp-orb-visual" aria-hidden="true">
        <StatIcon label="Icono de puntos de golpe" type="hp" />
      </div>
      <div className="hp-content">
        <span>HP</span>
        <div className="hp-inputs">
          {canEdit ? (
            <>
              <NumberInput aria-label="HP actual" min={0} onChange={(event) => onCurrentChange(Number(event.target.value))} value={current} />
              <span>/</span>
              <NumberInput aria-label="HP maximo" min={1} onChange={(event) => onMaxChange(Number(event.target.value))} value={max} />
            </>
          ) : (
            <strong aria-label="HP actual">{current} / {max}</strong>
          )}
        </div>
        <div className="hp-bar" aria-label={`Vida ${current} de ${max}`}>
          <span style={{ width: `${hpRatio}%` }} />
        </div>
        <div className="temp-hp-field">
          <StatIcon label="Icono de HP temporal" type="tempHp" />
          <span>Temp</span>
          {canEdit ? (
            <NumberInput aria-label="HP temporal" min={0} onChange={(event) => onTempChange(Number(event.target.value))} value={temporary} />
          ) : (
            <strong aria-label="HP temporal">{temporary}</strong>
          )}
        </div>
      </div>
    </article>
  )
}

interface SkillBadgeProps {
  ability: AbilityKey
  bonus: string
  canEdit: boolean
  expertise?: boolean
  label: string
  onExpertiseChange?: (value: boolean) => void
  onProficientChange: (value: boolean) => void
  proficient: boolean
  subtitle: string
}

export function SkillBadge({
  ability,
  bonus,
  canEdit,
  expertise,
  label,
  onExpertiseChange,
  onProficientChange,
  proficient,
  subtitle,
}: SkillBadgeProps) {
  return (
    <article className={clsx('skill-badge', proficient && 'is-proficient', expertise && 'is-expertise')}>
      <StatIcon label={`Icono de ${subtitle}`} type={ability} />
      <div className="skill-badge-text">
        <strong>{label}</strong>
        <small>{subtitle}</small>
      </div>
      {canEdit ? (
        <>
          <label title="Proficient">
            <input
              checked={proficient}
              onChange={(event) => onProficientChange(event.target.checked)}
              type="checkbox"
            />
            P
          </label>
          {onExpertiseChange ? (
            <label title="Expertise">
              <input
                checked={Boolean(expertise)}
                onChange={(event) => onExpertiseChange(event.target.checked)}
                type="checkbox"
              />
              E
            </label>
          ) : null}
        </>
      ) : (
        <>
          <span className={clsx('skill-state-rune', proficient && 'is-lit')} aria-label={proficient ? 'Proficient' : 'Not proficient'}>P</span>
          {onExpertiseChange ? <span className={clsx('skill-state-rune', expertise && 'is-lit')} aria-label={expertise ? 'Expertise' : 'No expertise'}>E</span> : null}
        </>
      )}
      <span className="skill-bonus">{bonus}</span>
    </article>
  )
}
