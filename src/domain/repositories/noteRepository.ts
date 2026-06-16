import type { ID } from '@domain/entities/common'
import type { CampaignNote } from '@domain/entities/note'

export interface NoteRepository {
  saveNote(note: CampaignNote): Promise<CampaignNote>
  deleteNote(noteId: ID): Promise<void>
}
