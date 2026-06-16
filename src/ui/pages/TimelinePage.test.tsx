import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CampaignMember } from '@domain/entities/common'
import type { TimelineSession } from '@domain/entities/timeline'
import { TimelinePage } from './TimelinePage'

const dm: CampaignMember = {
  id: 'member_dm',
  campaignId: 'campaign',
  userId: 'dm',
  role: 'dm',
  displayName: 'DM',
  canDrawOnMap: true,
}

describe('TimelinePage', () => {
  it('renders session photos with holo memory styling and upload controls', () => {
    const sessions: TimelineSession[] = [
      {
        id: 'session_1',
        campaignId: 'campaign',
        sessionNumber: 1,
        playedAt: '2026-06-11',
        title: 'Memory',
        summary: 'Short recap',
        visibleNotes: 'Visible clue',
        sessionImageUrl: 'data:image/png;base64,abc',
        sessionImagePath: 'timeline-sessions/session_1/memory.png',
        sessionImageHoloEnabled: true,
      },
    ]

    const { container } = render(
      <TimelinePage
        campaignId="campaign"
        isDm
        onDeleteQuest={vi.fn()}
        onDeleteSession={vi.fn()}
        onSaveQuest={vi.fn()}
        onSaveSession={vi.fn()}
        quests={[]}
        sessions={sessions}
        viewerMember={dm}
      />,
    )

    expect(screen.getByAltText('Foto de grupo de Memory')).toBeInTheDocument()
    expect(screen.getByText('Foto de grupo')).toBeInTheDocument()
    expect(container.querySelector('.holo-memory')).toBeInTheDocument()
  })
})
