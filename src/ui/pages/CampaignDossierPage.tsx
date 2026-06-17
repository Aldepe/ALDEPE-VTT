import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Dice5,
  Eye,
  Flame,
  Footprints,
  KeyRound,
  Minus,
  Network,
  Plus,
  RefreshCw,
  ShieldAlert,
  Skull,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from 'lucide-react'
import { bloodOfBhaalDossier } from '@shared/constants/phandelverDossier'
import {
  cultMoves,
  cultStatDefinitions,
  initialCultStats,
  locationInvestigations,
  randomStreetEvents,
  underworldSignals,
  type CultMove,
  type CultStatId,
  type DossierIconId,
  type InvestigationMove,
  type LocationInvestigation,
  type StatDelta,
  type StreetEvent,
} from '@shared/constants/phandelverInvestigationGame'
import { EmptyState } from '@ui/components/EmptyState'

interface CampaignDossierPageProps {
  isDm: boolean
}

type MoveOutcome = 'success' | 'failure'

interface SessionLogEntry {
  id: string
  tone: 'player' | 'cult' | 'day' | 'warning'
  text: string
}

interface ActiveEffect {
  id: string
  source: 'players' | 'cult'
  text: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length)
}

function renderDetailList(title: string, items?: string[]) {
  if (!items?.length) {
    return null
  }

  return (
    <details className="dossier-detail-block">
      <summary>{title}</summary>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  )
}

function getMoveProgress(move: InvestigationMove) {
  const explicitProgress = move.progress ?? []
  if (explicitProgress.length) {
    return explicitProgress
  }

  if (move.discoveryId?.includes('piano') || move.discoveryId?.includes('mansion')) {
    return [{ clockId: 'mansion-access', delta: 1 }]
  }
  if (move.discoveryId?.includes('cipher') || move.discoveryId?.includes('pigeon') || move.discoveryId?.includes('dovecote')) {
    return [{ clockId: 'cipher-system', delta: 1 }]
  }
  return [{ clockId: 'bhaal-system', delta: 1 }]
}

function renderDossierIcon(icon: DossierIconId, size: number) {
  const props = { 'aria-hidden': true, size }

  switch (icon) {
    case 'alert':
      return <AlertTriangle {...props} />
    case 'book':
      return <BookOpen {...props} />
    case 'calendar':
      return <CalendarDays {...props} />
    case 'cipher':
      return <KeyRound {...props} />
    case 'eye':
      return <Eye {...props} />
    case 'flame':
      return <Flame {...props} />
    case 'footprints':
      return <Footprints {...props} />
    case 'network':
      return <Network {...props} />
    case 'shield':
      return <ShieldAlert {...props} />
    case 'skull':
      return <Skull {...props} />
    case 'spark':
      return <Sparkles {...props} />
    case 'swords':
      return <Swords {...props} />
    case 'target':
      return <Target {...props} />
    default:
      return <Sparkles {...props} />
  }
}

function getCultPressureLabel(cultStats: Record<CultStatId, number>) {
  const pressure = cultStats.trace + cultStats.intent + cultStats.neutralize
  if (pressure <= 4) {
    return 'La red tantea'
  }
  if (pressure <= 9) {
    return 'El Mata Osos entiende el patrón'
  }
  if (pressure <= 14) {
    return 'Neutralización en marcha'
  }
  return 'Día crítico'
}

function getCultPressureValue(cultStats: Record<CultStatId, number>) {
  return cultStats.trace + cultStats.intent + cultStats.neutralize
}

export function CampaignDossierPage({ isDm }: CampaignDossierPageProps) {
  const [campaignDay, setCampaignDay] = useState(1)
  const [activeLocationId, setActiveLocationId] = useState(locationInvestigations[0].id)
  const [streetEventIndex, setStreetEventIndex] = useState(0)
  const [cultMoveIndex, setCultMoveIndex] = useState(0)
  const [playerActionResolved, setPlayerActionResolved] = useState(false)
  const [cultActionResolved, setCultActionResolved] = useState(false)
  const [dayNotice, setDayNotice] = useState('Día 1 iniciado: la secta observa, los players eligen dónde meter presión.')
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([])
  const [cultStats, setCultStats] = useState<Record<CultStatId, number>>(initialCultStats)
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([
    {
      id: 'day-1-start',
      tone: 'day',
      text: 'Día 1: una acción de players, una acción de la secta y un evento urbano posible.',
    },
  ])
  const [clockValues, setClockValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(bloodOfBhaalDossier.clocks.map((clock) => [clock.id, clock.initial])),
  )

  const activeLocation = useMemo(
    () => locationInvestigations.find((investigation) => investigation.id === activeLocationId) ?? locationInvestigations[0],
    [activeLocationId],
  )
  const streetEvent = randomStreetEvents[streetEventIndex] ?? randomStreetEvents[0]
  const cultMove = cultMoves[cultMoveIndex] ?? cultMoves[0]
  const totalProgress = bloodOfBhaalDossier.clocks.reduce((sum, clock) => sum + (clockValues[clock.id] ?? clock.initial), 0)
  const maxProgress = bloodOfBhaalDossier.clocks.reduce((sum, clock) => sum + clock.max, 0)
  const cultPressure = getCultPressureValue(cultStats)
  const canEndDay = playerActionResolved && cultActionResolved

  function addLog(entry: Omit<SessionLogEntry, 'id'>) {
    setSessionLog((current) => [{ ...entry, id: `${Date.now()}-${Math.random()}` }, ...current].slice(0, 9))
  }

  function addEffect(effect: Omit<ActiveEffect, 'id'>) {
    setActiveEffects((current) => [{ ...effect, id: `${Date.now()}-${Math.random()}` }, ...current].slice(0, 5))
  }

  function applyCultStatDeltas(deltas?: StatDelta[]) {
    if (!deltas?.length) {
      return
    }

    setCultStats((current) => {
      const nextStats = { ...current }
      deltas.forEach((delta) => {
        const statDefinition = cultStatDefinitions.find((stat) => stat.id === delta.stat)
        if (!statDefinition) {
          return
        }
        nextStats[delta.stat] = clamp((nextStats[delta.stat] ?? 0) + delta.delta, 0, statDefinition.max)
      })
      return nextStats
    })
  }

  function applyClockProgress(move: InvestigationMove) {
    const progressEntries = getMoveProgress(move)
    setClockValues((current) => {
      const nextValues = { ...current }
      progressEntries.forEach((entry) => {
        const clock = bloodOfBhaalDossier.clocks.find((candidate) => candidate.id === entry.clockId)
        if (!clock) {
          return
        }
        nextValues[entry.clockId] = clamp((nextValues[entry.clockId] ?? clock.initial) + entry.delta, 0, clock.max)
      })
      return nextValues
    })
  }

  function nudgeClock(clockId: string, delta: number) {
    const clock = bloodOfBhaalDossier.clocks.find((candidate) => candidate.id === clockId)
    if (!clock) {
      return
    }

    setClockValues((current) => {
      const nextValue = clamp((current[clockId] ?? clock.initial) + delta, 0, clock.max)
      return { ...current, [clockId]: nextValue }
    })
  }

  function resolvePlayerMove(move: LocationInvestigation | StreetEvent, outcome: MoveOutcome) {
    if (playerActionResolved) {
      setDayNotice('Los players ya han gastado su acción del día. Finaliza el día o reabre manualmente en la siguiente ronda.')
      return
    }

    setPlayerActionResolved(true)

    if (outcome === 'success') {
      applyClockProgress(move)
      applyCultStatDeltas(move.cultStatsOnSuccess)
      addEffect({ source: 'players', text: move.playerBuff ?? 'La próxima investigación empieza con una pista clara.' })
      addLog({ tone: 'player', text: `Players: éxito en "${move.title}". ${move.success}` })
      setDayNotice(`Acción player resuelta: éxito en ${move.title}.`)
      return
    }

    applyCultStatDeltas(move.cultStatsOnFailure)
    addEffect({ source: 'cult', text: move.cultBuff ?? 'La secta gana una ventaja de posicionamiento.' })
    addLog({ tone: 'warning', text: `Players: fallo o abandono en "${move.title}". ${move.failure}` })
    setDayNotice(`Acción player resuelta con coste: ${move.failure}`)
  }

  function resolveCultMove(move: CultMove, outcome: MoveOutcome) {
    if (cultActionResolved) {
      setDayNotice('La secta ya ha hecho su acción de esta ronda.')
      return
    }

    setCultActionResolved(true)

    if (outcome === 'success') {
      applyCultStatDeltas(move.cultStatsOnSuccess)
      addEffect({ source: 'players', text: move.playerBuff ?? 'La red deja una grieta aprovechable.' })
      addLog({ tone: 'player', text: `Secta frustrada: ${move.success}` })
      setDayNotice(`Acción de la secta bloqueada: ${move.title}.`)
      return
    }

    applyCultStatDeltas(move.cultStatsOnFailure)
    addEffect({ source: 'cult', text: move.cultBuff ?? 'La próxima DC relevante sube +1.' })
    addLog({ tone: 'cult', text: `Secta avanza: ${move.ifUnopposed}` })
    setDayNotice(`La secta avanza: ${move.title}.`)
  }

  function skipPlayerAction() {
    if (playerActionResolved) {
      return
    }

    setPlayerActionResolved(true)
    applyCultStatDeltas([{ stat: 'trace', delta: 1 }])
    addEffect({ source: 'cult', text: 'Los players no meten presión: +1 Rastro del grupo.' })
    addLog({ tone: 'warning', text: 'Players pasan el día sin investigar una pista concreta. La red aprovecha el silencio.' })
    setDayNotice('Los players pasan acción. La secta lee ausencia de movimiento como información.')
  }

  function rotateStreetEvent() {
    setStreetEventIndex(randomIndex(randomStreetEvents.length))
    setDayNotice('Evento urbano random cambiado para esta ronda.')
  }

  function endDay() {
    if (!canEndDay) {
      setDayNotice('Para cerrar el día falta resolver una acción player y una acción de la secta.')
      return
    }

    const nextDay = campaignDay + 1
    const nextStreetEventIndex = randomIndex(randomStreetEvents.length)
    const nextCultMoveIndex = randomIndex(cultMoves.length)

    setCampaignDay(nextDay)
    setStreetEventIndex(nextStreetEventIndex)
    setCultMoveIndex(nextCultMoveIndex)
    setPlayerActionResolved(false)
    setCultActionResolved(false)
    setActiveEffects((current) => current.slice(0, 3))
    setDayNotice(`Día ${campaignDay} cerrado. Día ${nextDay}: nuevo evento urbano y nueva acción de El Mata Osos.`)
    addLog({
      tone: 'day',
      text: `Fin del día ${campaignDay}. Presión enemiga ${cultPressure}/18. Progreso player ${totalProgress}/${maxProgress}.`,
    })
  }

  function resetInvestigation() {
    setCampaignDay(1)
    setActiveLocationId(locationInvestigations[0].id)
    setStreetEventIndex(0)
    setCultMoveIndex(0)
    setPlayerActionResolved(false)
    setCultActionResolved(false)
    setDayNotice('Día 1 reiniciado: la secta vuelve a operar desde cobertura completa.')
    setActiveEffects([])
    setCultStats(initialCultStats)
    setClockValues(Object.fromEntries(bloodOfBhaalDossier.clocks.map((clock) => [clock.id, clock.initial])))
    setSessionLog([
      {
        id: 'day-1-reset',
        tone: 'day',
        text: 'Investigación reiniciada. Una acción player, una acción secta, un evento urbano posible.',
      },
    ])
  }

  if (!isDm) {
    return (
      <section className="page-grid dossier-page" aria-labelledby="dossier-title">
        <EmptyState icon={<Skull size={34} />} message="Este dossier es solo para el DM." title="Acceso restringido" />
      </section>
    )
  }

  return (
    <section className="page-grid dossier-page dossier-game-page" aria-labelledby="dossier-title">
      <header className="page-header dossier-header compact-dossier-header">
        <div>
          <p className="eyebrow">Dossier DM · minijuego urbano</p>
          <h2 id="dossier-title">Sangre de Bhaal contra los players</h2>
          <p>Una ronda diaria: los players investigan un frente; El Mata Osos intenta rastrearlos, leerlos y neutralizarlos.</p>
        </div>
        <div className="avatar-chip danger-chip">
          <Skull size={18} aria-hidden="true" />
          <span>Solo DM</span>
        </div>
      </header>

      <section className="dossier-command-grid" aria-label="Estado de la ronda">
        <article className="dossier-command-card">
          <CalendarDays size={22} aria-hidden="true" />
          <span>Día</span>
          <strong>{campaignDay}</strong>
        </article>
        <article className={playerActionResolved ? 'dossier-command-card is-done' : 'dossier-command-card'}>
          {playerActionResolved ? <CheckCircle2 size={22} aria-hidden="true" /> : <Trophy size={22} aria-hidden="true" />}
          <span>Acción player</span>
          <strong>{playerActionResolved ? 'Hecha' : 'Libre'}</strong>
        </article>
        <article className={cultActionResolved ? 'dossier-command-card is-done' : 'dossier-command-card is-danger'}>
          <Flame size={22} aria-hidden="true" />
          <span>Acción secta</span>
          <strong>{cultActionResolved ? 'Hecha' : 'Pendiente'}</strong>
        </article>
        <article className="dossier-command-card">
          <Target size={22} aria-hidden="true" />
          <span>Progreso</span>
          <strong>
            {totalProgress}/{maxProgress}
          </strong>
        </article>
        <article className={`dossier-command-card ${cultPressure >= 10 ? 'is-danger' : ''}`}>
          <CircleAlert size={22} aria-hidden="true" />
          <span>{getCultPressureLabel(cultStats)}</span>
          <strong>{cultPressure}/18</strong>
        </article>
      </section>

      <div className="dossier-day-notice" role="status">
        <Sparkles size={18} aria-hidden="true" />
        <span>{dayNotice}</span>
      </div>

      <section className="dossier-loop-grid" aria-label="Acciones de la ronda">
        <article className="dossier-move-card cult-move-card">
          <div className="dossier-move-heading">
            {renderDossierIcon(cultMove.icon, 28)}
            <div>
              <p className="eyebrow">Acción de El Mata Osos</p>
              <h3>{cultMove.title}</h3>
              <p>{cultMove.objective}</p>
            </div>
          </div>
          <p className="dossier-move-callout">{cultMove.challenge}</p>
          <div className="dossier-detail-columns">
            {renderDetailList('Señales', cultMove.tells)}
            {renderDetailList('Si avanza', [cultMove.ifUnopposed])}
          </div>
          <div className="dossier-choice-bar">
            <button className="success-action" disabled={cultActionResolved} onClick={() => resolveCultMove(cultMove, 'success')} type="button">
              <ShieldAlert size={16} aria-hidden="true" />
              Frustrada
            </button>
            <button className="danger-action" disabled={cultActionResolved} onClick={() => resolveCultMove(cultMove, 'failure')} type="button">
              <Flame size={16} aria-hidden="true" />
              Avanza
            </button>
          </div>
        </article>

        <article className="dossier-move-card street-event-card">
          <div className="dossier-move-heading">
            {renderDossierIcon(streetEvent.icon, 28)}
            <div>
              <p className="eyebrow">Evento random de calle</p>
              <h3>{streetEvent.title}</h3>
              <p>Puede aparecer mientras caminan, compran, preguntan o cruzan la ciudad.</p>
            </div>
          </div>
          <p className="dossier-move-callout">{streetEvent.challenge}</p>
          <div className="dossier-detail-columns">
            {renderDetailList('Señales', streetEvent.tells)}
            {renderDetailList('Éxito', [streetEvent.success])}
            {renderDetailList('Fallo / ignorarlo', [streetEvent.failure])}
          </div>
          <div className="dossier-choice-bar">
            <button className="success-action" disabled={playerActionResolved} onClick={() => resolvePlayerMove(streetEvent, 'success')} type="button">
              <Trophy size={16} aria-hidden="true" />
              Seguir evento
            </button>
            <button className="danger-action" disabled={playerActionResolved} onClick={() => resolvePlayerMove(streetEvent, 'failure')} type="button">
              <AlertTriangle size={16} aria-hidden="true" />
              Dejar pasar
            </button>
            <button className="ghost-button" onClick={rotateStreetEvent} type="button">
              <RefreshCw size={16} aria-hidden="true" />
              Otro random
            </button>
          </div>
        </article>
      </section>

      <section className="dossier-player-panel section-panel" aria-labelledby="player-action-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Acción de los players</p>
            <h3 id="player-action-title">Dónde deciden investigar</h3>
          </div>
          <Dice5 size={22} aria-hidden="true" />
        </div>

        <div className="dossier-location-shell">
          <div className="dossier-location-tabs" role="tablist" aria-label="Localizaciones investigables">
            {locationInvestigations.map((investigation) => {
              const isActive = investigation.id === activeLocation.id
              return (
                <button
                  aria-selected={isActive}
                  className={isActive ? 'is-active' : undefined}
                  key={investigation.id}
                  onClick={() => setActiveLocationId(investigation.id)}
                  role="tab"
                  type="button"
                >
                  {renderDossierIcon(investigation.icon, 16)}
                  <span>{investigation.location}</span>
                </button>
              )
            })}
          </div>

          <article className="dossier-location-detail" role="tabpanel">
            <div className="dossier-move-heading">
              {renderDossierIcon(activeLocation.icon, 30)}
              <div>
                <p className="eyebrow">{activeLocation.location}</p>
                <h3>{activeLocation.title}</h3>
                <p>{activeLocation.challenge}</p>
              </div>
            </div>
            <div className="dossier-detail-columns">
              {renderDetailList('Qué ven', activeLocation.tells)}
              {renderDetailList('Éxito', [activeLocation.success])}
              {renderDetailList('Fallo', [activeLocation.failure])}
              {renderDetailList('Buff/debuff', [activeLocation.playerBuff ?? '', activeLocation.cultBuff ?? ''].filter(Boolean))}
            </div>
            <div className="dossier-choice-bar">
              <button className="success-action" disabled={playerActionResolved} onClick={() => resolvePlayerMove(activeLocation, 'success')} type="button">
                <Trophy size={16} aria-hidden="true" />
                Éxito player
              </button>
              <button className="danger-action" disabled={playerActionResolved} onClick={() => resolvePlayerMove(activeLocation, 'failure')} type="button">
                <AlertTriangle size={16} aria-hidden="true" />
                Fallo / coste
              </button>
              <button className="ghost-button" disabled={playerActionResolved} onClick={skipPlayerAction} type="button">
                Pasan acción
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="dossier-tracking-shell" aria-label="Tracking de investigación">
        <div className="dossier-mini-track">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Descubrimiento player</p>
              <h3>Lo que van entendiendo</h3>
            </div>
            <KeyRound size={20} aria-hidden="true" />
          </div>
          <div className="dossier-compact-clock-grid">
            {bloodOfBhaalDossier.clocks.map((clock) => {
              const value = clockValues[clock.id] ?? clock.initial
              return (
                <article className="dossier-compact-clock" key={clock.id}>
                  <div>
                    <h4>{clock.title}</h4>
                    <strong>
                      {value}/{clock.max}
                    </strong>
                  </div>
                  <div className="dossier-clock-track" style={{ '--clock-slots': clock.max } as CSSProperties} aria-hidden="true">
                    {Array.from({ length: clock.max }).map((_, index) => (
                      <span className={index < value ? 'is-filled' : undefined} key={`${clock.id}-${index}`} />
                    ))}
                  </div>
                  <div className="dossier-clock-controls">
                    <button className="icon-button" onClick={() => nudgeClock(clock.id, -1)} title={`Bajar ${clock.title}`} type="button">
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <button className="icon-button" onClick={() => nudgeClock(clock.id, 1)} title={`Subir ${clock.title}`} type="button">
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="dossier-mini-track">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Máquina enemiga</p>
              <h3>Lo que la secta está logrando</h3>
            </div>
            <Flame size={20} aria-hidden="true" />
          </div>
          <div className="dossier-cult-stat-grid">
            {cultStatDefinitions.map((stat) => {
              const value = cultStats[stat.id]
              return (
                <article className={value >= stat.dangerAt ? 'dossier-cult-stat is-danger' : 'dossier-cult-stat'} key={stat.id}>
                  {renderDossierIcon(stat.icon, 20)}
                  <div>
                    <span>{stat.label}</span>
                    <strong>
                      {value}/{stat.max}
                    </strong>
                    <p>{stat.detail}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="dossier-underworld section-panel" aria-labelledby="underworld-title">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Red de pícaros</p>
            <h3 id="underworld-title">Herramientas ocultas del pueblo</h3>
          </div>
          <Network size={20} aria-hidden="true" />
        </div>
        <div className="underworld-signal-grid">
          {underworldSignals.map((signal) => {
            return (
              <article className="underworld-signal" key={signal.id}>
                {renderDossierIcon(signal.icon, 18)}
                <div>
                  <strong>{signal.label}</strong>
                  <span>{signal.detail}</span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="dossier-bottom-grid" aria-label="Modificadores y crónica">
        <article className="dossier-session-log">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Buffs / debuffs activos</p>
              <h3>Ventajas temporales</h3>
            </div>
            <Sparkles size={18} aria-hidden="true" />
          </div>
          {activeEffects.length ? (
            <ol>
              {activeEffects.map((effect) => (
                <li className={effect.source === 'players' ? 'is-success' : 'is-failure'} key={effect.id}>
                  {effect.source === 'players' ? 'Players: ' : 'Secta: '}
                  {effect.text}
                </li>
              ))}
            </ol>
          ) : (
            <p>No hay modificadores activos todavía.</p>
          )}
        </article>

        <article className="dossier-session-log">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Crónica</p>
              <h3>Últimas consecuencias</h3>
            </div>
            <BookOpen size={18} aria-hidden="true" />
          </div>
          <ol>
            {sessionLog.map((entry) => (
              <li className={`is-${entry.tone}`} key={entry.id}>
                {entry.text}
              </li>
            ))}
          </ol>
        </article>
      </section>

      <div className="dossier-day-controls final-controls">
        <button className="primary-action" onClick={endDay} type="button">
          <CalendarDays size={16} aria-hidden="true" />
          Finalizar día
        </button>
        <button className="ghost-button" onClick={resetInvestigation} type="button">
          Reiniciar tablero
        </button>
      </div>
    </section>
  )
}
