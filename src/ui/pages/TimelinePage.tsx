import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { CalendarPlus, CheckCircle2, ImagePlus, Search, Trash2 } from 'lucide-react'
import type { CampaignMember } from '@domain/entities/common'
import type { Quest, QuestStatus, TimelineSession } from '@domain/entities/timeline'
import { canViewQuest } from '@domain/services/permissions'
import { createBlankQuest, createBlankSession } from '@application/use-cases/workspaceFactories'
import { ApplyHologramSessionPhotoStyleUseCase, UploadTimelineSessionPhotoUseCase } from '@application/use-cases/timelinePhotos'
import { fileToDataUrl } from '@shared/utils/fileToDataUrl'
import { Field, SelectInput, TextArea, TextInput, NumberInput } from '@ui/components/FormControls'
import { EmptyState } from '@ui/components/EmptyState'
import { LineIcon } from '@ui/components/LineIcon'

interface TimelinePageProps {
  campaignId: string
  isDm: boolean
  onDeleteQuest: (questId: string) => Promise<void>
  onDeleteSession: (sessionId: string) => Promise<void>
  onSaveQuest: (quest: Quest) => Promise<void>
  onSaveSession: (session: TimelineSession) => Promise<void>
  quests: Quest[]
  sessions: TimelineSession[]
  viewerMember: CampaignMember
}

const questStatusOptions: QuestStatus[] = ['pending', 'active', 'completed', 'failed', 'hidden']

function questStatusLabel(status: QuestStatus): string {
  const labels: Record<QuestStatus, string> = {
    pending: 'Pendiente',
    active: 'Activa',
    completed: 'Completada',
    failed: 'Fallida',
    hidden: 'Oculta',
  }

  return labels[status]
}

function parseSteps(value: string): Quest['steps'] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `step_${index}_${line.toLowerCase().replaceAll(' ', '_').slice(0, 20)}`,
      title: line.replace(/^\[[ xX]\]\s*/, ''),
      done: /^\[[xX]\]/.test(line),
    }))
}

function stringifySteps(steps: Quest['steps']): string {
  return steps.map((step) => `${step.done ? '[x]' : '[ ]'} ${step.title}`).join('\n')
}

export function TimelinePage({
  campaignId,
  isDm,
  onDeleteQuest,
  onDeleteSession,
  onSaveQuest,
  onSaveSession,
  quests,
  sessions,
  viewerMember,
}: TimelinePageProps) {
  const nextSessionNumber = Math.max(0, ...sessions.map((session) => session.sessionNumber)) + 1
  const [sessionDraft, setSessionDraft] = useState<TimelineSession>(() => createBlankSession(campaignId, nextSessionNumber))
  const [questDraft, setQuestDraft] = useState<Quest>(() => createBlankQuest(campaignId))
  const [query, setQuery] = useState('')

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return [...sessions]
      .sort((left, right) => left.sessionNumber - right.sessionNumber)
      .filter((session) =>
        normalizedQuery
          ? `${session.title} ${session.summary} ${session.playedAt}`.toLowerCase().includes(normalizedQuery)
          : true,
      )
  }, [query, sessions])

  const visibleQuests = quests.filter((quest) => canViewQuest(viewerMember, quest))

  async function submitSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSaveSession(sessionDraft)
    setSessionDraft(createBlankSession(campaignId, nextSessionNumber + 1))
  }

  async function submitQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSaveQuest(questDraft)
    setQuestDraft(createBlankQuest(campaignId))
  }

  async function confirmDeleteSession(sessionId: string) {
    if (window.confirm('Borrar esta entrada del cronograma?')) {
      await onDeleteSession(sessionId)
    }
  }

  async function confirmDeleteQuest(questId: string) {
    if (window.confirm('Borrar esta mision?')) {
      await onDeleteQuest(questId)
    }
  }

  async function uploadSessionPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const dataUrl = await fileToDataUrl(file)
    setSessionDraft({
      ...sessionDraft,
      ...UploadTimelineSessionPhotoUseCase({ dataUrl, fileName: file.name, sessionId: sessionDraft.id }),
      sessionImageHoloEnabled: true,
    })
  }

  return (
    <section className="page-grid timeline-page" aria-labelledby="timeline-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">Registro de aventura</p>
          <h2 id="timeline-title">Cronograma</h2>
          <p>Sesiones, misiones visibles y secretos de DM separados por permisos.</p>
        </div>
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Buscar sesiones</span>
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por fecha o titulo" value={query} />
        </label>
      </header>

      <div className="timeline-content">
        <div className="timeline-track" aria-label="Sesiones">
          {filteredSessions.length ? (
            filteredSessions.map((session) => (
              <article className="session-entry" key={session.id}>
                {session.sessionImageUrl ? (
                  <button
                    className={session.sessionImageHoloEnabled ? 'session-memory holo-memory' : 'session-memory'}
                    onClick={() => setSessionDraft(session)}
                    type="button"
                  >
                    <img alt={`Foto de grupo de ${session.title || `sesion ${session.sessionNumber}`}`} src={session.sessionImageUrl} />
                  </button>
                ) : null}
                <small>{session.playedAt}</small>
                <h3>
                  #{session.sessionNumber} {session.title || 'Sesion sin titulo'}
                </h3>
                <p>{session.summary}</p>
                <div className="note-strip">{session.visibleNotes}</div>
                {isDm ? (
                  <div className="inline-actions">
                    <button className="ghost-button" onClick={() => setSessionDraft(session)} type="button">
                      Editar
                    </button>
                    <button className="icon-button danger" onClick={() => confirmDeleteSession(session.id)} title="Borrar sesion" type="button">
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <EmptyState
              icon={<CalendarPlus size={32} />}
              message="No hay sesiones que coincidan con el filtro."
              title="Sin sesiones"
            />
          )}
        </div>

        {isDm ? (
          <form className="editor-panel" onSubmit={submitSession}>
            <h3>Entrada de sesion</h3>
            <div className="form-grid compact">
              <Field label="Numero">
                <NumberInput
                  min={1}
                  onChange={(event) => setSessionDraft({ ...sessionDraft, sessionNumber: Number(event.target.value) })}
                  value={sessionDraft.sessionNumber}
                />
              </Field>
              <Field label="Fecha">
                <TextInput onChange={(event) => setSessionDraft({ ...sessionDraft, playedAt: event.target.value })} type="date" value={sessionDraft.playedAt} />
              </Field>
            </div>
            <Field label="Titulo">
              <TextInput onChange={(event) => setSessionDraft({ ...sessionDraft, title: event.target.value })} value={sessionDraft.title} />
            </Field>
            <Field label="Resumen">
              <TextArea onChange={(event) => setSessionDraft({ ...sessionDraft, summary: event.target.value })} value={sessionDraft.summary} />
            </Field>
            <Field label="Notas visibles">
              <TextArea onChange={(event) => setSessionDraft({ ...sessionDraft, visibleNotes: event.target.value })} value={sessionDraft.visibleNotes} />
            </Field>
            <div className="session-photo-editor">
              {sessionDraft.sessionImageUrl ? (
                <div className={sessionDraft.sessionImageHoloEnabled ? 'session-memory holo-memory' : 'session-memory'}>
                  <img alt={`Preview de ${sessionDraft.title || 'sesion'}`} src={sessionDraft.sessionImageUrl} />
                </div>
              ) : null}
              <label className="upload-row">
                <ImagePlus size={18} aria-hidden="true" />
                <span>Foto de grupo</span>
                <input accept="image/*" onChange={uploadSessionPhoto} type="file" />
              </label>
              <label className="check-row">
                <input
                  checked={sessionDraft.sessionImageHoloEnabled}
                  onChange={(event) => setSessionDraft(ApplyHologramSessionPhotoStyleUseCase(sessionDraft, event.target.checked))}
                  type="checkbox"
                />
                <span>Filtro holo</span>
              </label>
            </div>
            <button className="primary-button" type="submit">
              Guardar sesion
            </button>
          </form>
        ) : null}
      </div>

      <aside className={isDm ? 'quest-panel' : 'quest-panel player-mission-panel'} aria-label="Misiones">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{isDm ? 'Misiones' : 'Bitacora arcana'}</p>
            <h3>{isDm ? 'Misiones' : 'Objetivos activos'}</h3>
          </div>
          <span>{visibleQuests.length}</span>
        </div>
        <div className="quest-list">
          {visibleQuests.length ? visibleQuests.map((quest) => (
            <article className={`quest-card status-${quest.status}`} key={quest.id}>
              <div className="card-title-row">
                <div className="mission-title-cluster">
                  <LineIcon label={`Icono de ${quest.title || 'mision'}`} name="mission" />
                  <h4>{quest.title || 'Mision sin titulo'}</h4>
                </div>
                <span>{questStatusLabel(quest.status)}</span>
              </div>
              <p>{quest.description}</p>
              {quest.steps.length ? (
                <ul className="check-list">
                  {quest.steps.map((step) => (
                    <li key={step.id}>
                      {step.done ? <CheckCircle2 size={15} aria-hidden="true" /> : <LineIcon label="Paso pendiente" name="rune" />}
                      <span>{step.title}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {quest.challenges ? <p className="note-strip">{quest.challenges}</p> : null}
              {isDm && quest.secret ? <p className="secret-box">{quest.secret}</p> : null}
              {isDm ? (
                <div className="inline-actions">
                  <button className="ghost-button" onClick={() => setQuestDraft(quest)} type="button">
                    Editar
                  </button>
                  <button className="icon-button danger" onClick={() => confirmDeleteQuest(quest.id)} title="Borrar mision" type="button">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </article>
          )) : (
            <EmptyState
              icon={<LineIcon label="Sin misiones" name="mission" />}
              message={isDm ? 'Crea una mision para verla aqui.' : 'El DM aun no ha revelado objetivos para la party.'}
              title={isDm ? 'Sin misiones' : 'Bitacora en calma'}
            />
          )}
        </div>

        {isDm ? (
          <form className="editor-panel compact-editor" onSubmit={submitQuest}>
            <h3>Mision</h3>
            <Field label="Titulo">
              <TextInput onChange={(event) => setQuestDraft({ ...questDraft, title: event.target.value })} value={questDraft.title} />
            </Field>
            <Field label="Estado">
              <SelectInput onChange={(event) => setQuestDraft({ ...questDraft, status: event.target.value as QuestStatus })} value={questDraft.status}>
                {questStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Descripcion">
              <TextArea onChange={(event) => setQuestDraft({ ...questDraft, description: event.target.value })} value={questDraft.description} />
            </Field>
            <Field label="Pasos">
              <TextArea onChange={(event) => setQuestDraft({ ...questDraft, steps: parseSteps(event.target.value) })} value={stringifySteps(questDraft.steps)} />
            </Field>
            <Field label="Retos">
              <TextArea onChange={(event) => setQuestDraft({ ...questDraft, challenges: event.target.value })} value={questDraft.challenges} />
            </Field>
            <Field label="Secret">
              <TextArea onChange={(event) => setQuestDraft({ ...questDraft, secret: event.target.value })} value={questDraft.secret} />
            </Field>
            <button className="primary-button" type="submit">
              Guardar mision
            </button>
          </form>
        ) : null}
      </aside>
    </section>
  )
}
