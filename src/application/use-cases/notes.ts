import type { CampaignMember, ID } from '@domain/entities/common'
import type { CampaignNote, NoteType } from '@domain/entities/note'
import { canViewNote } from '@domain/services/permissions'
import { createId } from '@shared/utils/id'

interface CreateNoteInput {
  campaignId: ID
  authorUserId: ID
  authorName: string
  type: NoteType
}

export function CreateNoteUseCase(input: CreateNoteInput): CampaignNote {
  const now = new Date().toISOString()
  return {
    id: createId('note'),
    campaignId: input.campaignId,
    title: 'Nueva nota',
    content: '',
    tags: [],
    type: input.type,
    authorUserId: input.authorUserId,
    authorName: input.authorName,
    pinned: false,
    linkedCharacterIds: [],
    linkedLoreEntryIds: [],
    linkedMapIds: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function UpdateNoteUseCase(note: CampaignNote, patch: Partial<CampaignNote>): CampaignNote {
  return {
    ...note,
    ...patch,
    id: note.id,
    campaignId: note.campaignId,
    authorUserId: note.authorUserId,
    createdAt: note.createdAt,
    updatedAt: new Date().toISOString(),
  }
}

export function DeleteNoteUseCase(notes: CampaignNote[], noteId: ID): CampaignNote[] {
  return notes.filter((note) => note.id !== noteId)
}

export function ListNotesUseCase(notes: CampaignNote[], member: CampaignMember, query = '', type?: NoteType): CampaignNote[] {
  const normalizedQuery = query.trim().toLowerCase()
  return notes
    .filter((note) => canViewNote(member, note))
    .filter((note) => !type || note.type === type)
    .filter((note) => {
      if (!normalizedQuery) {
        return true
      }

      return [note.title, note.content, note.authorName, ...note.tags].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      )
    })
    .sort((first, second) => {
      if (first.pinned !== second.pinned) {
        return first.pinned ? -1 : 1
      }

      return second.updatedAt.localeCompare(first.updatedAt)
    })
}
