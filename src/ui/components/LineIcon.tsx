import type { ReactNode, SVGProps } from 'react'
import clsx from 'clsx'

export type LineIconName =
  | 'str'
  | 'dex'
  | 'con'
  | 'int'
  | 'wis'
  | 'cha'
  | 'ac'
  | 'hp'
  | 'tempHp'
  | 'initiative'
  | 'speed'
  | 'perception'
  | 'proficiency'
  | 'skill'
  | 'spark'
  | 'shield'
  | 'blade'
  | 'boots'
  | 'heart'
  | 'eye'
  | 'crown'
  | 'book'
  | 'star'
  | 'rune'
  | 'hand'
  | 'brain'
  | 'mask'
  | 'moon'
  | 'coin'
  | 'coinPlatinum'
  | 'coinGold'
  | 'coinElectrum'
  | 'coinSilver'
  | 'coinCopper'
  | 'language'
  | 'tool'
  | 'armor'
  | 'weapon'
  | 'condition'
  | 'resistance'
  | 'immunity'
  | 'vulnerability'
  | 'spellAbility'
  | 'spellDc'
  | 'spellAttack'
  | 'knownSpells'
  | 'canPrepare'
  | 'preparedNow'
  | 'mission'
  | 'compass'
  | 'scroll'
  | 'personality'
  | 'allies'
  | 'enemy'
  | 'background'
  | 'organization'
  | 'appearance'
  | 'tag'
  | 'check'
  | 'attunement'
  | 'container'
  | 'flame'
  | 'leaf'
  | 'portal'
  | 'hammer'
  | 'snowflake'
  | 'lightning'
  | 'poison'
  | 'mind'
  | 'radiant'
  | 'thunder'
  | 'acid'
  | 'force'
  | 'necrotic'
  | 'piercing'
  | 'slashing'
  | 'hourglass'

interface LineIconProps extends SVGProps<SVGSVGElement> {
  label: string
  name: LineIconName | string
}

function lineIconPath(name: string): ReactNode {
  switch (name) {
    case 'str':
      return (
        <>
          <path d="M18 48c9-6 13-14 13-25" />
          <path d="M31 23c9 3 15 11 16 23" />
          <path d="M27 30c7 0 13 4 16 11" />
          <path d="M18 48c8 7 23 7 31-1" />
          <path d="M28 22c2-7 8-10 14-7" />
        </>
      )
    case 'dex':
    case 'hand':
      return (
        <>
          <path d="M20 48l8-27" />
          <path d="M28 21l8 20" />
          <path d="M36 41l10-25" />
          <path d="M18 49c9 5 19 6 30 1" />
          <path d="M15 28c13 2 24 1 34-5" />
        </>
      )
    case 'con':
    case 'heart':
    case 'hp':
      return (
        <>
          <path d="M32 54S13 43 13 27c0-8 5-14 12-14 4 0 7 2 7 5 0-3 3-5 7-5 7 0 12 6 12 14 0 16-19 27-19 27Z" />
          <path d="M16 34h10l4-9 5 17 4-8h9" />
        </>
      )
    case 'int':
    case 'book':
    case 'knownSpells':
    case 'scroll':
      return (
        <>
          <path d="M17 43V17c8-3 14-2 19 4 5-6 11-7 19-4v26c-8-3-14-2-19 4-5-6-11-7-19-4Z" />
          <path d="M36 21v26" />
          <path d="M23 25h7M23 32h8M43 25h7M42 33h8" />
          <path d="M32 12l4-5 4 5" />
        </>
      )
    case 'brain':
    case 'mind':
      return (
        <>
          <path d="M21 43c-5-3-8-8-7-14 1-8 9-15 18-15s17 7 18 15c1 6-2 11-7 14" />
          <path d="M24 21c-5 6-3 13 3 16M40 21c5 6 3 13-3 16" />
          <path d="M26 48h12M29 55h6M32 14V8M22 16l-4-5M42 16l4-5" />
        </>
      )
    case 'wis':
    case 'eye':
    case 'perception':
    case 'spellDc':
      return (
        <>
          <path d="M8 32s9-15 24-15 24 15 24 15-9 15-24 15S8 32 8 32Z" />
          <circle cx="32" cy="32" r="8" />
          <path d="M32 20v-8M32 52v-8M17 20l-5-5M47 20l5-5" />
        </>
      )
    case 'cha':
    case 'mask':
      return (
        <>
          <path d="M16 18c11-5 21-5 32 0v12c0 14-7 23-16 26-9-3-16-12-16-26V18Z" />
          <path d="M23 30c3-3 7-3 10 0M39 30c3-3 7-3 10 0" />
          <path d="M25 42c5 5 10 5 15 0" />
          <path d="M24 15l3-7 5 6 5-6 3 7" />
        </>
      )
    case 'ac':
    case 'tempHp':
    case 'shield':
    case 'armor':
    case 'resistance':
    case 'immunity':
      return (
        <>
          <path d="M32 7l22 9v15c0 15-9 24-22 29C19 55 10 46 10 31V16l22-9Z" />
          <path d="M22 32h20M32 22v22" />
        </>
      )
    case 'initiative':
    case 'lightning':
      return <path d="M37 5L16 35h14l-4 24 22-33H34l3-21Z" />
    case 'speed':
    case 'boots':
      return (
        <>
          <path d="M22 45c9 4 19 4 29-1" />
          <path d="M14 34c11 3 19 1 24-6l7-10" />
          <path d="M38 28l13 9" />
          <path d="M12 49h38" />
        </>
      )
    case 'proficiency':
    case 'star':
      return (
        <>
          <path d="M32 8l7 14 16 2-11 11 3 16-15-8-15 8 3-16L9 24l16-2 7-14Z" />
          <path d="M32 23v14M25 30h14" />
        </>
      )
    case 'blade':
    case 'weapon':
    case 'spellAttack':
    case 'slashing':
    case 'piercing':
      return (
        <>
          <path d="M49 8L26 31" />
          <path d="M18 39l7-7 7 7-7 7-7-7Z" />
          <path d="M14 50l9-9" />
          <path d="M38 10l16 16" />
        </>
      )
    case 'coin':
    case 'coinGold':
    case 'coinElectrum':
    case 'coinSilver':
    case 'coinCopper':
    case 'coinPlatinum':
      return (
        <>
          <circle cx="32" cy="32" r="20" />
          <path d="M24 28c2-5 14-5 16 0 2 6-14 4-12 10 2 5 13 4 16-1" />
          <path d="M32 18v28" />
        </>
      )
    case 'language':
      return (
        <>
          <path d="M15 15h25c5 0 9 4 9 9v25H24c-5 0-9-4-9-9V15Z" />
          <path d="M24 27h16M24 35h12M40 49l9 8v-8" />
        </>
      )
    case 'tool':
    case 'hammer':
      return (
        <>
          <path d="M21 17l10 10" />
          <path d="M15 23l12-12 6 6-12 12z" />
          <path d="M31 31l20 20" />
          <path d="M43 45l-5 5" />
        </>
      )
    case 'condition':
    case 'rune':
    case 'spark':
    case 'force':
      return (
        <>
          <path d="M32 8v12M32 44v12M8 32h12M44 32h12" />
          <path d="M16 16l9 9M39 39l9 9M48 16l-9 9M25 39l-9 9" />
          <circle cx="32" cy="32" r="7" />
        </>
      )
    case 'vulnerability':
      return (
        <>
          <path d="M32 53S14 43 14 27c0-8 5-14 12-14 3 0 6 2 6 5 0-3 3-5 6-5 7 0 12 6 12 14 0 16-18 26-18 26Z" />
          <path d="M35 20l-8 14h9l-6 12" />
        </>
      )
    case 'spellAbility':
    case 'canPrepare':
    case 'preparedNow':
      return (
        <>
          <circle cx="32" cy="32" r="18" />
          <path d="M32 14v36M14 32h36" />
          <path d="M21 21c7 5 15 5 22 0M21 43c7-5 15-5 22 0" />
        </>
      )
    case 'mission':
    case 'compass':
      return (
        <>
          <circle cx="32" cy="32" r="20" />
          <path d="M39 18l-7 19-7 9 7-19 7-9Z" />
          <path d="M32 8v6M32 50v6M8 32h6M50 32h6" />
        </>
      )
    case 'container':
      return (
        <>
          <path d="M14 23h36v27H14z" />
          <path d="M21 23v-5c0-4 3-7 7-7h8c4 0 7 3 7 7v5" />
          <path d="M14 32h36M28 36h8" />
        </>
      )
    case 'crown':
      return (
        <>
          <path d="M14 47h36l4-27-13 10-9-16-9 16-13-10 4 27Z" />
          <path d="M19 54h26" />
        </>
      )
    case 'moon':
      return <path d="M43 51c-16-2-27-13-29-29 8 7 19 9 29 4-5 8-5 17 0 25Z" />
    case 'personality':
    case 'allies':
      return (
        <>
          <circle cx="24" cy="24" r="8" />
          <circle cx="42" cy="27" r="6" />
          <path d="M12 52c2-10 8-15 17-15s15 5 17 15" />
          <path d="M37 40c6 1 10 5 12 12" />
        </>
      )
    case 'enemy':
      return (
        <>
          <circle cx="32" cy="24" r="9" />
          <path d="M17 52c3-11 8-16 15-16s12 5 15 16" />
          <path d="M21 15l-6-5M43 15l6-5" />
        </>
      )
    case 'background':
    case 'organization':
      return (
        <>
          <path d="M13 50h38" />
          <path d="M17 50V24l15-10 15 10v26" />
          <path d="M25 50V35h14v15" />
          <path d="M24 27h16" />
        </>
      )
    case 'appearance':
      return (
        <>
          <path d="M32 9c10 8 17 17 17 28 0 10-7 17-17 17s-17-7-17-17c0-11 7-20 17-28Z" />
          <path d="M24 35c4 4 12 4 16 0M24 27h.1M40 27h.1" />
        </>
      )
    case 'tag':
      return (
        <>
          <path d="M13 31l18-18h20v20L33 51 13 31Z" />
          <circle cx="43" cy="21" r="3" />
        </>
      )
    case 'check':
      return <path d="M14 34l11 11 25-27" />
    case 'attunement':
      return (
        <>
          <path d="M32 8l9 16 17 8-17 8-9 16-9-16-17-8 17-8 9-16Z" />
          <circle cx="32" cy="32" r="6" />
        </>
      )
    case 'flame':
      return <path d="M32 55c-10-4-15-11-15-20 0-8 5-14 11-19 0 7 4 11 9 15 3-6 2-12-1-18 9 6 13 14 13 22 0 9-6 16-17 20Z" />
    case 'leaf':
      return (
        <>
          <path d="M11 45C15 22 35 10 54 12c0 19-12 39-35 43" />
          <path d="M17 50c10-13 21-22 34-31" />
        </>
      )
    case 'portal':
      return (
        <>
          <ellipse cx="32" cy="32" rx="18" ry="24" />
          <path d="M22 24c9-7 20-4 22 6 2 12-10 20-20 13" />
        </>
      )
    case 'snowflake':
      return (
        <>
          <path d="M32 8v48M13 20l38 24M51 20L13 44" />
          <path d="M24 13l8 8 8-8M24 51l8-8 8 8" />
        </>
      )
    case 'poison':
    case 'acid':
      return (
        <>
          <path d="M26 10h12M29 10v12L16 48c-1 3 1 6 4 6h24c3 0 5-3 4-6L35 22V10" />
          <path d="M22 42c5 3 15-3 20 0" />
        </>
      )
    case 'radiant':
      return (
        <>
          <circle cx="32" cy="32" r="9" />
          <path d="M32 6v10M32 48v10M6 32h10M48 32h10M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7" />
        </>
      )
    case 'thunder':
      return (
        <>
          <path d="M16 25h10l15-12v38L26 39H16z" />
          <path d="M47 24c4 5 4 11 0 16M53 18c7 9 7 19 0 28" />
        </>
      )
    case 'necrotic':
      return (
        <>
          <path d="M32 10c11 0 18 8 18 19 0 9-5 15-12 17v8H26v-8c-7-2-12-8-12-17 0-11 7-19 18-19Z" />
          <circle cx="25" cy="30" r="3" />
          <circle cx="39" cy="30" r="3" />
          <path d="M27 43h10" />
        </>
      )
    case 'hourglass':
      return (
        <>
          <path d="M20 10h24M20 54h24M24 10v10c0 5 4 9 8 12-4 3-8 7-8 12v10M40 10v10c0 5-4 9-8 12 4 3 8 7 8 12v10" />
          <path d="M28 22h8M28 44h8" />
        </>
      )
    default:
      return (
        <>
          <path d="M16 17h32v30H16z" />
          <path d="M22 25h20M22 33h13M22 41h17" />
        </>
      )
  }
}

export function LineIcon({ className, label, name, ...props }: LineIconProps) {
  return (
    <svg
      aria-label={label}
      className={clsx('line-icon', `line-icon-${name}`, className)}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.4"
      viewBox="0 0 64 64"
      {...props}
    >
      <title>{label}</title>
      {lineIconPath(name)}
    </svg>
  )
}
