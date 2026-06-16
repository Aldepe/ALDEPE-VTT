import type { CampaignMember } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import { canEditCharacter } from '@domain/services/permissions'

export function ValidateCharacterEditPermissionsUseCase(member: CampaignMember | undefined, character: Character): boolean {
  return canEditCharacter(member, character)
}
