import { describe, expect, it } from 'vitest'
import { defaultAudioSettings, SetVolumeUseCase, ToggleSoundUseCase } from './audioSettings'

describe('audio settings use cases', () => {
  it('starts disabled so browsers do not autoplay sound', () => {
    expect(defaultAudioSettings.enabled).toBe(false)
  })

  it('toggles sound and clamps volume', () => {
    const enabled = ToggleSoundUseCase(defaultAudioSettings)

    expect(enabled.enabled).toBe(true)
    expect(SetVolumeUseCase(enabled, 2).volume).toBe(1)
    expect(SetVolumeUseCase(enabled, -1).volume).toBe(0)
  })
})
