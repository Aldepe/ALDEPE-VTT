import type { TimelineSession } from '@domain/entities/timeline'

interface SessionPhotoInput {
  dataUrl: string
  fileName: string
  sessionId: string
}

export function UploadTimelineSessionPhotoUseCase({ dataUrl, fileName, sessionId }: SessionPhotoInput): Pick<TimelineSession, 'sessionImageUrl' | 'sessionImagePath'> {
  const safeFileName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  return {
    sessionImageUrl: dataUrl,
    sessionImagePath: `timeline-sessions/${sessionId}/${safeFileName}`,
  }
}

export function ApplyHologramSessionPhotoStyleUseCase(session: TimelineSession, enabled = true): TimelineSession {
  return {
    ...session,
    sessionImageHoloEnabled: enabled,
  }
}
