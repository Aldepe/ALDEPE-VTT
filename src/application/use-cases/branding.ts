import type { BrandingAssets } from '@domain/entities/branding'
import type { BrandingRepository } from '@domain/repositories/brandingRepository'
import { publicAssetPath } from '@shared/utils/assetPath'

export const aldepeBrandingAssets: BrandingAssets = {
  appName: 'Aldepe VTT',
  campaignName: 'Aldepe D&D',
  iconPath: publicAssetPath('assets/branding/aldepe-vtt-icon.png'),
  backgroundPath: publicAssetPath('assets/branding/aldepe-vtt-background.png'),
  audioBasePath: publicAssetPath('assets/audio/'),
}

export function LoadBrandingAssetsUseCase(repository?: BrandingRepository): BrandingAssets {
  return repository?.loadAssets() ?? aldepeBrandingAssets
}
