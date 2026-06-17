import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Circle,
  Dice5,
  Eye,
  Flame,
  KeyRound,
  Minus,
  Plus,
  RefreshCcw,
  Skull,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { bloodOfBhaalDossier, type DossierDiscovery } from '@shared/constants/phandelverDossier'
import { EmptyState } from '@ui/components/EmptyState'

interface CampaignDossierPageProps {
  isDm: boolean
}

interface FactGridSource {
  title: string
  fields?: Array<{ label: string; value: string }>
}

type DiscoveryOutcome = 'success' | 'failure'

interface SessionLogEntry {
  id: string
  tone: DiscoveryOutcome | 'day'
  text: string
}

const initialDayDiscoveryIds = ['errand-kid-watching', 'chalk-color-crossing', 'laundering-tavern']
const dayEventCounts = [2, 3, 3, 4]
const heatMax = 6

const clockRewardMatchers = [
  { clockId: 'bhaal-system', labels: ['Sistema de Bhaal', 'Tapaderas', 'Operativos', 'Rutas'] },
  { clockId: 'cipher-system', labels: ['Cifrado'] },
  { clockId: 'permit-trail', labels: ['Permiso'] },
  { clockId: 'mansion-access', labels: ['Acceso mansión', 'Mansión'] },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function renderFactGrid(item: FactGridSource) {
  if (!item.fields?.length) {
    return null
  }

  return (
    <dl className="dossier-fact-grid" aria-label={`Datos de ${item.title}`}>
      {item.fields.map((field) => (
        <div key={`${item.title}-${field.label}`}>
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  )
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

function getDiscoveryById(discoveryId: string) {
  return (bloodOfBhaalDossier.discoveries as readonly DossierDiscovery[]).find((discovery) => discovery.id === discoveryId)
}

function getClockRewards(discovery: DossierDiscovery) {
  const matchedClockIds = new Set<string>()

  discovery.rewards?.forEach((reward) => {
    clockRewardMatchers.forEach((matcher) => {
      if (matcher.labels.some((label) => reward.label.includes(label))) {
        matchedClockIds.add(matcher.clockId)
      }
    })
  })

  if (!matchedClockIds.size) {
    if (discovery.category === 'communications') {
      matchedClockIds.add('cipher-system')
    } else if (discovery.category === 'mansion') {
      matchedClockIds.add('mansion-access')
    } else {
      matchedClockIds.add('bhaal-system')
    }
  }

  return Array.from(matchedClockIds)
}

function pickRandomDiscoveries(outcomes: Record<string, DiscoveryOutcome>, count: number) {
  const discoveries = bloodOfBhaalDossier.discoveries as readonly DossierDiscovery[]
  const unresolved = discoveries.filter((discovery) => outcomes[discovery.id] !== 'success')
  const pool = unresolved.length >= count ? unresolved : discoveries
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((discovery) => discovery.id)
}

function getHeatLabel(heat: number) {
  if (heat <= 1) {
    return 'La red está cómoda'
  }
  if (heat <= 3) {
    return 'El Mata Osos sospecha'
  }
  if (heat <= 5) {
    return 'La ciudad se cierra'
  }
  return 'Caza abierta'
}

function getPrimaryBenefit(discovery: DossierDiscovery) {
  return discovery.rewards?.map((reward) => `${reward.label}: ${reward.value}`) ?? ['Sube una pista de progreso relacionada.']
}

function getPrimarySetback(discovery: DossierDiscovery) {
  return discovery.complications ?? ['El Mata Osos gana presión y mueve una pieza antes del siguiente día.']
}

export function CampaignDossierPage({ isDm }: CampaignDossierPageProps) {
  const [activeDiscoveryCategory, setActiveDiscoveryCategory] = useState<string>('all')
  const [usedDiscoveryIds, setUsedDiscoveryIds] = useState<string[]>([])
  const [discoveryOutcomes, setDiscoveryOutcomes] = useState<Record<string, DiscoveryOutcome>>({})
  const [campaignDay, setCampaignDay] = useState(1)
  const [dayEventLimit, setDayEventLimit] = useState(initialDayDiscoveryIds.length)
  const [currentDayDiscoveryIds, setCurrentDayDiscoveryIds] = useState(initialDayDiscoveryIds)
  const [dailyOperationIndex, setDailyOperationIndex] = useState(0)
  const [heat, setHeat] = useState(1)
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([
    {
      id: 'day-1-start',
      tone: 'day',
      text: 'Día 1: el pueblo parece normal, pero ya hay ojos pequeños, tiza y dinero moviéndose bajo la superficie.',
    },
  ])
  const [clockValues, setClockValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(bloodOfBhaalDossier.clocks.map((clock) => [clock.id, clock.initial])),
  )

  const visibleDiscoveries = useMemo(
    () =>
      activeDiscoveryCategory === 'all'
        ? bloodOfBhaalDossier.discoveries
        : bloodOfBhaalDossier.discoveries.filter((discovery) => discovery.category === activeDiscoveryCategory),
    [activeDiscoveryCategory],
  )

  const currentDayDiscoveries = useMemo(
    () => currentDayDiscoveryIds.map(getDiscoveryById).filter((discovery): discovery is DossierDiscovery => Boolean(discovery)),
    [currentDayDiscoveryIds],
  )

  const dailyOperation = bloodOfBhaalDossier.dailyOperations[dailyOperationIndex] ?? bloodOfBhaalDossier.dailyOperations[0]
  const resolvedToday = currentDayDiscoveries.filter((discovery) => discoveryOutcomes[discovery.id]).length
  const totalProgress = bloodOfBhaalDossier.clocks.reduce((sum, clock) => sum + (clockValues[clock.id] ?? clock.initial), 0)
  const maxProgress = bloodOfBhaalDossier.clocks.reduce((sum, clock) => sum + clock.max, 0)

  function addLog(entry: Omit<SessionLogEntry, 'id'>) {
    setSessionLog((current) => [{ ...entry, id: `${Date.now()}-${Math.random()}` }, ...current].slice(0, 8))
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

  function applyClockRewards(discovery: DossierDiscovery) {
    const rewardClockIds = getClockRewards(discovery)
    setClockValues((current) => {
      const nextValues = { ...current }

      rewardClockIds.forEach((clockId) => {
        const clock = bloodOfBhaalDossier.clocks.find((candidate) => candidate.id === clockId)
        if (!clock) {
          return
        }
        nextValues[clockId] = clamp((nextValues[clockId] ?? clock.initial) + 1, 0, clock.max)
      })

      return nextValues
    })
  }

  function toggleDiscoveryUsed(discoveryId: string) {
    setUsedDiscoveryIds((current) =>
      current.includes(discoveryId) ? current.filter((usedDiscoveryId) => usedDiscoveryId !== discoveryId) : [...current, discoveryId],
    )
  }

  function resolveDiscovery(discovery: DossierDiscovery, outcome: DiscoveryOutcome) {
    if (discoveryOutcomes[discovery.id]) {
      return
    }

    setDiscoveryOutcomes((current) => ({ ...current, [discovery.id]: outcome }))
    setUsedDiscoveryIds((current) => (current.includes(discovery.id) ? current : [...current, discovery.id]))

    if (outcome === 'success') {
      applyClockRewards(discovery)
      setHeat((current) => clamp(current - 1, 0, heatMax))
      addLog({
        tone: 'success',
        text: `Éxito en "${discovery.title}": ${getPrimaryBenefit(discovery)[0]}`,
      })
      return
    }

    setHeat((current) => clamp(current + 1, 0, heatMax))
    addLog({
      tone: 'failure',
      text: `Fallo en "${discovery.title}": ${getPrimarySetback(discovery)[0]}`,
    })
  }

  function reopenDiscovery(discoveryId: string) {
    setDiscoveryOutcomes((current) => {
      const nextOutcomes = { ...current }
      delete nextOutcomes[discoveryId]
      return nextOutcomes
    })
    addLog({
      tone: 'day',
      text: 'Has reabierto una escena. Ajusta los relojes manualmente si ya habías aplicado sus consecuencias.',
    })
  }

  function advanceDay() {
    const nextDay = campaignDay + 1
    const nextEventLimit = dayEventCounts[Math.floor(Math.random() * dayEventCounts.length)]
    const nextOperationIndex = Math.floor(Math.random() * bloodOfBhaalDossier.dailyOperations.length)
    const nextDiscoveryIds = pickRandomDiscoveries(discoveryOutcomes, nextEventLimit)
    const nextOperation = bloodOfBhaalDossier.dailyOperations[nextOperationIndex]

    setCampaignDay(nextDay)
    setDayEventLimit(nextEventLimit)
    setDailyOperationIndex(nextOperationIndex)
    setCurrentDayDiscoveryIds(nextDiscoveryIds)
    setHeat((current) => clamp(current + (current >= 4 ? 1 : 0), 0, heatMax))
    addLog({
      tone: 'day',
      text: `Día ${nextDay}: aparecen ${nextEventLimit} frentes activos. Operación enemiga: ${nextOperation.title}.`,
    })
  }

  function resetInvestigation() {
    setDiscoveryOutcomes({})
    setUsedDiscoveryIds([])
    setCampaignDay(1)
    setDayEventLimit(initialDayDiscoveryIds.length)
    setCurrentDayDiscoveryIds(initialDayDiscoveryIds)
    setDailyOperationIndex(0)
    setHeat(1)
    setClockValues(Object.fromEntries(bloodOfBhaalDossier.clocks.map((clock) => [clock.id, clock.initial])))
    setSessionLog([
      {
        id: 'day-1-start-reset',
        tone: 'day',
        text: 'Día 1: investigación reiniciada. La Sangre de Bhaal vuelve a moverse desde las sombras.',
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
    <section className="page-grid dossier-page" aria-labelledby="dossier-title">
      <header className="page-header dossier-header">
        <div>
          <p className="eyebrow">Dossier secreto de campaña</p>
          <h2 id="dossier-title">{bloodOfBhaalDossier.title}</h2>
          <p>{bloodOfBhaalDossier.subtitle}</p>
        </div>
        <div className="avatar-chip danger-chip">
          <Skull size={18} aria-hidden="true" />
          <span>Solo DM</span>
        </div>
      </header>

      <article className="dossier-intro section-panel">
        <div>
          <p className="eyebrow">Premisa</p>
          <p>{bloodOfBhaalDossier.premise}</p>
        </div>
        <div>
          <p className="eyebrow">Doctrina operativa</p>
          <p>{bloodOfBhaalDossier.doctrine}</p>
        </div>
      </article>

      <div className="dossier-metrics" aria-label="Resumen operativo">
        {bloodOfBhaalDossier.metrics.map((metric) => (
          <section className="dossier-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </section>
        ))}
      </div>

      <section className="dossier-game section-panel" aria-labelledby="dossier-game-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Juego de investigación</p>
            <h3 id="dossier-game-title">Día {campaignDay}: decisiones en Phandalin</h3>
          </div>
          <Dice5 size={22} aria-hidden="true" />
        </div>

        <div className="dossier-game-board">
          <article className="dossier-status-card">
            <CalendarDays size={22} aria-hidden="true" />
            <span>Frentes activos</span>
            <strong>
              {resolvedToday}/{dayEventLimit}
            </strong>
            <p>Resuelve cada escena con tiradas, rol, combate o deducción. El éxito revela estructura; el fallo da ventaja a la secta.</p>
          </article>
          <article className="dossier-status-card">
            <Target size={22} aria-hidden="true" />
            <span>Progreso global</span>
            <strong>
              {totalProgress}/{maxProgress}
            </strong>
            <p>Cuando los relojes se llenen, la ruta lleva al permiso bajo la mansión y al piano de Dies Irae.</p>
          </article>
          <article className={`dossier-status-card heat-${heat}`}>
            <Flame size={22} aria-hidden="true" />
            <span>Presión enemiga</span>
            <strong>
              {heat}/{heatMax}
            </strong>
            <p>{getHeatLabel(heat)}. A presión alta, El Mata Osos mueve alijos, silencia testigos y cierra rutas.</p>
          </article>
        </div>

        <article className="dossier-operation-card">
          <div className="dossier-operation-roll">{dailyOperation.roll}</div>
          <div>
            <p className="eyebrow">Operación enemiga del día</p>
            <h4>{dailyOperation.title}</h4>
            <p>{dailyOperation.routine}</p>
            <div className="dossier-detail-columns">
              {renderDetailList('Señales en la ciudad', dailyOperation.signs)}
              {renderDetailList('Cómo interceptarlo', dailyOperation.counterplay)}
              {renderDetailList('Si no lo paran', dailyOperation.consequences)}
            </div>
          </div>
        </article>

        <div className="dossier-day-controls">
          <button className="primary-action" onClick={advanceDay} type="button">
            <RefreshCcw size={16} aria-hidden="true" />
            Generar siguiente día
          </button>
          <button className="ghost-button" onClick={resetInvestigation} type="button">
            Reiniciar investigación
          </button>
        </div>

        <div className="dossier-day-grid" aria-label="Encuentros activos del día">
          {currentDayDiscoveries.map((discovery, index) => {
            const category = bloodOfBhaalDossier.discoveryCategories.find((candidate) => candidate.id === discovery.category)
            const outcome = discoveryOutcomes[discovery.id]
            return (
              <article className={outcome ? `dossier-day-event is-${outcome}` : 'dossier-day-event'} key={discovery.id}>
                <div className="dossier-event-heading">
                  <div>
                    <span>
                      Escena {index + 1} · {category?.label ?? discovery.category}
                    </span>
                    <h4>{discovery.title}</h4>
                  </div>
                  {outcome ? (
                    <strong className={`dossier-result-chip is-${outcome}`}>{outcome === 'success' ? 'Éxito' : 'Fallo'}</strong>
                  ) : (
                    <strong className="dossier-result-chip">Pendiente</strong>
                  )}
                </div>
                <p>{discovery.trigger}</p>
                <p className="dossier-setup-line">{discovery.setup}</p>
                <div className="dossier-challenge-strip">
                  <span>{discovery.challengeKind}</span>
                  <strong>{discovery.difficulty}</strong>
                </div>
                <p className="dossier-goal-line">{discovery.goal}</p>
                <div className="dossier-detail-columns">
                  {renderDetailList('Reto / DC', discovery.checks)}
                  {renderDetailList('Pistas', discovery.clues)}
                  {renderDetailList('Beneficio por éxito', getPrimaryBenefit(discovery))}
                  {renderDetailList('Coste por fallo', getPrimarySetback(discovery))}
                  {renderDetailList('Siguientes pistas', discovery.nextLeads)}
                </div>
                <div className="dossier-choice-bar">
                  <button className="success-action" disabled={Boolean(outcome)} onClick={() => resolveDiscovery(discovery, 'success')} type="button">
                    <Trophy size={16} aria-hidden="true" />
                    Éxito
                  </button>
                  <button className="danger-action" disabled={Boolean(outcome)} onClick={() => resolveDiscovery(discovery, 'failure')} type="button">
                    <AlertTriangle size={16} aria-hidden="true" />
                    Fallo / coste
                  </button>
                  {outcome ? (
                    <button className="ghost-button" onClick={() => reopenDiscovery(discovery.id)} type="button">
                      Reabrir
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        <aside className="dossier-session-log" aria-label="Crónica de investigación">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Crónica viva</p>
              <h4>Consecuencias recientes</h4>
            </div>
            <Sparkles size={18} aria-hidden="true" />
          </div>
          <ol>
            {sessionLog.map((entry) => (
              <li className={`is-${entry.tone}`} key={entry.id}>
                {entry.text}
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="dossier-clocks section-panel" aria-label="Relojes operativos">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Relojes de misterio</p>
            <h3>Progreso visible de la investigación</h3>
          </div>
          <KeyRound size={22} aria-hidden="true" />
        </div>
        <div className="dossier-clock-grid">
          {bloodOfBhaalDossier.clocks.map((clock) => {
            const value = clockValues[clock.id] ?? clock.initial
            return (
              <article className="dossier-clock" key={clock.id}>
                <div className="dossier-clock-heading">
                  <div>
                    <h4>{clock.title}</h4>
                    <p>{clock.detail}</p>
                  </div>
                  <div className="dossier-clock-controls">
                    <button className="icon-button" onClick={() => nudgeClock(clock.id, -1)} title={`Bajar ${clock.title}`} type="button">
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <strong>{value}/{clock.max}</strong>
                    <button className="icon-button" onClick={() => nudgeClock(clock.id, 1)} title={`Subir ${clock.title}`} type="button">
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="dossier-clock-track" style={{ '--clock-slots': clock.max } as CSSProperties} aria-hidden="true">
                  {Array.from({ length: clock.max }).map((_, index) => (
                    <span className={index < value ? 'is-filled' : undefined} key={`${clock.id}-${index}`} />
                  ))}
                </div>
                <ol className="dossier-clock-segments">
                  {clock.segments.map((segment, index) => (
                    <li className={index < value ? 'is-active' : undefined} key={segment}>
                      {segment}
                    </li>
                  ))}
                </ol>
              </article>
            )
          })}
        </div>
      </section>

      <section className="dossier-investigation section-panel" aria-labelledby="investigation-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Biblioteca de escenas</p>
            <h3 id="investigation-title">Preparar o buscar un hallazgo concreto</h3>
          </div>
          <Eye size={22} aria-hidden="true" />
        </div>
        <p className="dossier-section-copy">
          Usa esta biblioteca cuando quieras elegir una pista manualmente. El tablero del día de arriba es la partida viva; esto es tu caja
          de herramientas para improvisar.
        </p>

        <div className="dossier-category-tabs segmented wrap" role="tablist" aria-label="Tipos de hallazgo">
          <button
            aria-selected={activeDiscoveryCategory === 'all'}
            className={activeDiscoveryCategory === 'all' ? 'is-active' : undefined}
            onClick={() => setActiveDiscoveryCategory('all')}
            role="tab"
            type="button"
          >
            Todo
          </button>
          {bloodOfBhaalDossier.discoveryCategories.map((category) => (
            <button
              aria-selected={activeDiscoveryCategory === category.id}
              className={activeDiscoveryCategory === category.id ? 'is-active' : undefined}
              key={category.id}
              onClick={() => setActiveDiscoveryCategory(category.id)}
              role="tab"
              type="button"
              title={category.detail}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="dossier-discovery-grid">
          {visibleDiscoveries.map((discovery: DossierDiscovery) => {
            const category = bloodOfBhaalDossier.discoveryCategories.find((candidate) => candidate.id === discovery.category)
            const isUsed = usedDiscoveryIds.includes(discovery.id)
            const outcome = discoveryOutcomes[discovery.id]
            return (
              <article className={isUsed ? 'dossier-discovery-card is-used' : 'dossier-discovery-card'} key={discovery.id}>
                <div className="dossier-discovery-heading">
                  <div>
                    <span>{category?.label ?? discovery.category}</span>
                    <h4>{discovery.title}</h4>
                  </div>
                  <button className="ghost-button" onClick={() => toggleDiscoveryUsed(discovery.id)} type="button">
                    {isUsed ? <CheckCircle2 size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                    {outcome === 'success' ? 'Éxito' : outcome === 'failure' ? 'Fallo' : isUsed ? 'Usado' : 'Usar'}
                  </button>
                </div>
                <p>{discovery.trigger}</p>
                <p className="dossier-setup-line">{discovery.setup}</p>
                <div className="dossier-challenge-strip">
                  <span>{discovery.challengeKind}</span>
                  <strong>{discovery.difficulty}</strong>
                </div>
                <p className="dossier-goal-line">{discovery.goal}</p>
                {renderFactGrid(discovery)}
                <div className="dossier-detail-columns">
                  {renderDetailList('Reto / DC', discovery.checks)}
                  {renderDetailList('Contenido', discovery.contents)}
                  {renderDetailList('Seguridad', discovery.security)}
                  {renderDetailList('Acertijo', discovery.puzzle)}
                  {renderDetailList('Combate', discovery.combat)}
                  {renderDetailList('Pistas', discovery.clues)}
                  {renderDetailList('Recompensas', discovery.rewards?.map((reward) => `${reward.label}: ${reward.value}`))}
                  {renderDetailList('Complicaciones', discovery.complications)}
                  {renderDetailList('Siguientes pistas', discovery.nextLeads)}
                  {renderDetailList('Notas DM', discovery.dmNotes)}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}
