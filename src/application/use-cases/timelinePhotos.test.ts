import { describe, expect, it } from 'vitest'
import { createBlankSession } from './workspaceFactories'
import { ApplyHologramSessionPhotoStyleUseCase, UploadTimelineSessionPhotoUseCase } from './timelinePhotos'

describe('timeline photo use cases', () => {
  it('creates a stable session photo path and toggles holo style', () => {
    const upload = UploadTimelineSessionPhotoUseCase({
      dataUrl: 'data:image/png;base64,abc',
      fileName: 'Group Photo!.png',
      sessionId: 'session_1',
    })
    const session = ApplyHologramSessionPhotoStyleUseCase({ ...createBlankSession('campaign', 1), ...upload }, true)

    expect(upload.sessionImagePath).toBe('timeline-sessions/session_1/group-photo-.png')
    expect(session.sessionImageHoloEnabled).toBe(true)
  })
})
