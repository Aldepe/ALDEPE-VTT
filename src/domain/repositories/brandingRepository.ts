import type { BrandingAssets } from '@domain/entities/branding'

export interface BrandingRepository {
  loadAssets(): BrandingAssets
}
