import type { BrandingAssets } from '@domain/entities/branding'
import type { BrandingRepository } from '@domain/repositories/brandingRepository'
import { aldepeBrandingAssets } from '@application/use-cases/branding'

export class LocalBrandingRepository implements BrandingRepository {
  loadAssets(): BrandingAssets {
    return aldepeBrandingAssets
  }
}
