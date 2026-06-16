import type { AuthRepository } from '@domain/repositories/authRepository'
import type { AudioSettingsRepository } from '@domain/repositories/audioSettingsRepository'
import type { BrandingRepository } from '@domain/repositories/brandingRepository'
import type { CampaignRepository } from '@domain/repositories/campaignRepository'
import type { RealtimeRepository } from '@domain/repositories/realtimeRepository'
import { LocalAuthRepository } from '@infrastructure/local-demo/localAuthRepository'
import { LocalAudioSettingsRepository } from '@infrastructure/local-demo/localAudioSettingsRepository'
import { LocalBrandingRepository } from '@infrastructure/local-demo/localBrandingRepository'
import { LocalCampaignRepository } from '@infrastructure/local-demo/localCampaignRepository'
import { LocalRealtimeRepository } from '@infrastructure/local-demo/localRealtimeRepository'
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@infrastructure/supabase/client'
import { SupabaseAuthRepository } from '@infrastructure/supabase/supabaseAuthRepository'
import { SupabaseCampaignRepository } from '@infrastructure/supabase/supabaseCampaignRepository'
import { SupabaseRealtimeRepository } from '@infrastructure/supabase/supabaseRealtimeRepository'

export interface AppRepositories {
  audio: AudioSettingsRepository
  auth: AuthRepository
  branding: BrandingRepository
  campaign: CampaignRepository
  realtime: RealtimeRepository
  mode: 'local-demo' | 'supabase'
}

export function createAppRepositories(): AppRepositories {
  const client = createSupabaseBrowserClient()
  if (client && isSupabaseConfigured()) {
    return {
      audio: new LocalAudioSettingsRepository(),
      auth: new SupabaseAuthRepository(client),
      branding: new LocalBrandingRepository(),
      campaign: new SupabaseCampaignRepository(client),
      realtime: new SupabaseRealtimeRepository(client),
      mode: 'supabase',
    }
  }

  return {
    audio: new LocalAudioSettingsRepository(),
    auth: new LocalAuthRepository(),
    branding: new LocalBrandingRepository(),
    campaign: new LocalCampaignRepository(),
    realtime: new LocalRealtimeRepository(),
    mode: 'local-demo',
  }
}
