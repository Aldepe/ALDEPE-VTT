import type { AudioSettings } from '@domain/entities/audio'

export interface AudioSettingsRepository {
  loadSettings(): Promise<AudioSettings>
  saveSettings(settings: AudioSettings): Promise<AudioSettings>
}
