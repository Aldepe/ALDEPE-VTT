import { Boxes, Eye, KeyRound, Network, ScrollText, ShieldAlert, Skull, UsersRound } from 'lucide-react'
import { bloodOfBhaalDossier } from '@shared/constants/phandelverDossier'
import { EmptyState } from '@ui/components/EmptyState'

interface CampaignDossierPageProps {
  isDm: boolean
}

const sectionIcons = [Boxes, ScrollText, KeyRound, Network, Eye, ShieldAlert]

export function CampaignDossierPage({ isDm }: CampaignDossierPageProps) {
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
              <small>{cell.pressure}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="dossier-section-grid">
        {bloodOfBhaalDossier.sections.map((section, index) => {
          const Icon = sectionIcons[index % sectionIcons.length]
          return (
            <section className="dossier-section section-panel" key={section.title}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{section.eyebrow}</p>
                  <h3>{section.title}</h3>
                </div>
                <Icon size={21} aria-hidden="true" />
              </div>
              <p>{section.body}</p>
              <div className="dossier-item-list">
                {section.items.map((item) => (
                  <article className="dossier-item" key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
