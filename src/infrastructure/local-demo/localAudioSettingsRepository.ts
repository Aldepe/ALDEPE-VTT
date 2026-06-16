import type { AudioSettings } from '@domain/entities/audio'
import type { AudioSettingsRepository } from '@domain/repositories/audioSettingsRepository'
import { defaultAudioSettings } from '@application/use-cases/audioSettings'

const audioSettingsKey = 'aldepe-vtt-audio-settings'

export class LocalAudioSettingsRepository implements AudioSettingsRepository {
  async loadSettings(): Promise<AudioSettings> {
    const stored = localStorage.getItem(audioSettingsKey)
    return stored ? { ...defaultAudioSettings, ...(JSON.parse(stored) as Partial<AudioSettings>) } : defaultAudioSettings
  }

  async saveSettings(settings: AudioSettings): Promise<AudioSettings> {
    localStorage.setItem(audioSettingsKey, JSON.stringify(settings))
    return settings
  }
}
