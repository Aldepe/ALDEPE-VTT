import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Boxes, CheckCircle2, Circle, Eye, KeyRound, Minus, Network, Plus, ScrollText, ShieldAlert, Skull, UsersRound } from 'lucide-react'
import { bloodOfBhaalDossier, type DossierItem } from '@shared/constants/phandelverDossier'
import { EmptyState } from '@ui/components/EmptyState'

interface CampaignDossierPageProps {
  isDm: boolean
}

const viewIcons = [ScrollText, Network, Eye, UsersRound, ShieldAlert, Boxes, KeyRound]

function renderFactGrid(item: DossierItem) {
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

export function CampaignDossierPage({ isDm }: CampaignDossierPageProps) {
  const [activeViewId, setActiveViewId] = useState(bloodOfBhaalDossier.views[0].id)
  const [reviewedItemIds, setReviewedItemIds] = useState<string[]>([])
  const [clockValues, setClockValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(bloodOfBhaalDossier.clocks.map((clock) => [clock.id, clock.initial])),
  )
  const activeView = useMemo(
    () => bloodOfBhaalDossier.views.find((view) => view.id === activeViewId) ?? bloodOfBhaalDossier.views[0],
    [activeViewId],
  )

  function toggleReviewed(itemId: string) {
    setReviewedItemIds((current) =>
      current.includes(itemId) ? current.filter((reviewedItemId) => reviewedItemId !== itemId) : [...current, itemId],
    )
  }

  function nudgeClock(clockId: string, delta: number) {
    const clock = bloodOfBhaalDossier.clocks.find((candidate) => candidate.id === clockId)
    if (!clock) {
      return
    }

    setClockValues((current) => {
      const nextValue = Math.min(clock.max, Math.max(0, (current[clockId] ?? clock.initial) + delta))
      return { ...current, [clockId]: nextValue }
    })
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

      <section className="dossier-clocks section-panel" aria-label="Relojes operativos">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Relojes de misterio</p>
            <h3>Estado vivo de la operación</h3>
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

      <section className="dossier-cells section-panel" aria-labelledby="cells-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Estructura celular</p>
            <h3 id="cells-title">Células activas en Phandalin</h3>
          </div>
          <UsersRound size={22} aria-hidden="true" />
        </div>
        <div className="dossier-cell-grid">
          {bloodOfBhaalDossier.cells.map((cell) => (
            <article className="dossier-cell" key={cell.name}>
              <span>{cell.role}</span>
              <h4>{cell.name}</h4>
              <p>{cell.members}</p>
              {cell.fields?.length ? (
                <dl className="dossier-mini-facts">
                  {cell.fields.map((field) => (
                    <div key={`${cell.name}-${field.label}`}>
                      <dt>{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <small>{cell.pressure}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="dossier-workspace section-panel" aria-labelledby="dossier-workspace-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Sistema consultable</p>
            <h3 id="dossier-workspace-title">Operativo interactivo</h3>
          </div>
          <Network size={22} aria-hidden="true" />
        </div>

        <div className="dossier-view-tabs segmented wrap" role="tablist" aria-label="Vistas del dossier">
          {bloodOfBhaalDossier.views.map((view, index) => {
            const Icon = viewIcons[index % viewIcons.length]
            const isActive = view.id === activeView.id
            return (
              <button
                aria-selected={isActive}
                className={isActive ? 'is-active' : undefined}
                key={view.id}
                onClick={() => setActiveViewId(view.id)}
                role="tab"
                type="button"
              >
                <Icon size={16} aria-hidden="true" />
                {view.label}
              </button>
            )
          })}
        </div>

        <article className="dossier-active-panel" aria-labelledby={`dossier-view-${activeView.id}`} role="tabpanel">
          <div className="dossier-active-heading">
            <div>
              <p className="eyebrow">{activeView.eyebrow}</p>
              <h3 id={`dossier-view-${activeView.id}`}>{activeView.title}</h3>
            </div>
            <p>{activeView.summary}</p>
          </div>

          <div className="dossier-detail-list">
            {activeView.items.map((item: DossierItem) => {
              const itemId = `${activeView.id}-${item.title}`
              const isReviewed = reviewedItemIds.includes(itemId)
              return (
                <article className={isReviewed ? 'dossier-item dossier-detail-card is-reviewed' : 'dossier-item dossier-detail-card'} key={itemId}>
                  <div className="dossier-item-heading">
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                    <button className="ghost-button" onClick={() => toggleReviewed(itemId)} type="button">
                      {isReviewed ? <CheckCircle2 size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                      {isReviewed ? 'Revisado' : 'Marcar'}
                    </button>
                  </div>
                  {renderFactGrid(item)}
                  <div className="dossier-detail-columns">
                    {renderDetailList('Checks', item.checks)}
                    {renderDetailList('Contenido', item.contents)}
                    {renderDetailList('Seguridad', item.security)}
                    {renderDetailList('Pistas', item.clues)}
                    {renderDetailList('Consecuencias', item.consequences)}
                    {renderDetailList('Notas DM', item.dmNotes)}
                  </div>
                </article>
              )
            })}
          </div>
        </article>
      </section>
    </section>
  )
}
