import type { BrandingAssets } from '@domain/entities/branding'

interface BrandingLogoProps {
  assets: BrandingAssets
  size?: 'small' | 'large'
}

export function BrandingLogo({ assets, size = 'small' }: BrandingLogoProps) {
  return (
    <img
      alt={`${assets.appName} dragon emblem`}
      className={`brand-image ${size}`}
      src={assets.iconPath}
    />
  )
}
