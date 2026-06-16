import type { ID } from './common'

export interface TimelineSession {
  id: ID
  campaignId: ID
  sessionNumber: number
  playedAt: string
  title: string
  summary: string
  visibleNotes: string
  sessionImageUrl?: string
  sessionImagePath?: string
  sessionImageHoloEnabled: boolean
}

export type QuestStatus = 'pending' | 'active' | 'completed' | 'failed' | 'hidden'

export interface QuestStep {
  id: ID
  title: string
  done: boolean
}

export interface Quest {
  id: ID
  campaignId: ID
  title: string
  description: string
  status: QuestStatus
  steps: QuestStep[]
  challenges: string
  secret: string
}
