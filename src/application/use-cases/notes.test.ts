import { describe, expect, it } from 'vitest'
import { createDemoWorkspace } from '@infrastructure/local-demo/demoData'
import { CreateNoteUseCase, DeleteNoteUseCase, ListNotesUseCase, UpdateNoteUseCase } from './notes'

describe('note use cases', () => {
  it('shows party and owned personal notes to players but hides DM notes', () => {
    const workspace = createDemoWorkspace()
    const player = workspace.members.find((member) => member.role === 'player')

    expect(player).toBeDefined()
    const visibleNotes = ListNotesUseCase(workspace.notes, player!)

    expect(visibleNotes.map((note) => note.id)).toContain('note_party_aldepe')
    expect(visibleNotes.map((note) => note.id)).toContain('note_personal_lira')
    expect(visibleNotes.map((note) => note.id)).not.toContain('note_dm_aldepe')
  })

  it('shows all note types to the DM', () => {
    const workspace = createDemoWorkspace()
    const dm = workspace.members.find((member) => member.role === 'dm')

    expect(dm).toBeDefined()
    expect(ListNotesUseCase(workspace.notes, dm!)).toHaveLength(3)
  })

  it('creates, updates and deletes note drafts', () => {
    const note = CreateNoteUseCase({
      campaignId: 'campaign',
      authorUserId: 'player',
      authorName: 'Player',
      type: 'personal',
    })
    const updated = UpdateNoteUseCase(note, { title: 'Clue', tags: ['moon'] })

    expect(updated.title).toBe('Clue')
    expect(updated.tags).toEqual(['moon'])
    expect(DeleteNoteUseCase([updated], updated.id)).toEqual([])
  })
})
