import { describe, expect, it } from 'vitest'
import { LoadBrandingAssetsUseCase } from './branding'

describe('branding use case', () => {
  it('points to Aldepe VTT public assets', () => {
    const branding = LoadBrandingAssetsUseCase()

    expect(branding.appName).toBe('Aldepe VTT')
    expect(branding.campaignName).toBe('Aldepe D&D')
    expect(branding.iconPath).toBe('/assets/branding/aldepe-vtt-icon.png')
    expect(branding.backgroundPath).toBe('/assets/branding/aldepe-vtt-background.png')
  })
})
