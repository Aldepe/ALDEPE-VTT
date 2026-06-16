import type { AuthSession } from '@domain/repositories/authRepository'
import type { CampaignWorkspace } from '@domain/repositories/campaignRepository'

export interface LoadedWorkspaceDto {
  session: AuthSession
  workspace: CampaignWorkspace
}
