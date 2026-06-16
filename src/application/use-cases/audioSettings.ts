import type { AudioSettings } from '@domain/entities/audio'

export const defaultAudioSettings: AudioSettings = {
  enabled: false,
  volume: 0.45,
}

export function ToggleSoundUseCase(current: AudioSettings, forcedValue?: boolean): AudioSettings {
  return {
    ...current,
    enabled: forcedValue ?? !current.enabled,
  }
}

export function SetVolumeUseCase(current: AudioSettings, volume: number): AudioSettings {
  return {
    ...current,
    volume: Math.min(1, Math.max(0, volume)),
  }
}
