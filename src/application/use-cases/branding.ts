import type { BrandingAssets } from '@domain/entities/branding'
import type { BrandingRepository } from '@domain/repositories/brandingRepository'

export const aldepeBrandingAssets: BrandingAssets = {
  appName: 'Aldepe VTT',
  campaignName: 'Aldepe D&D',
  iconPath: '/assets/branding/aldepe-vtt-icon.png',
  backgroundPath: '/assets/branding/aldepe-vtt-background.png',
  audioBasePath: '/assets/audio/',
}

export function LoadBrandingAssetsUseCase(repository?: BrandingRepository): BrandingAssets {
  return repository?.loadAssets() ?? aldepeBrandingAssets
}
