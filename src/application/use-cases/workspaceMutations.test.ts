import { describe, expect, it } from 'vitest'
import { createDemoWorkspace } from '@infrastructure/local-demo/demoData'
import { withoutCharacterCascade } from './workspaceMutations'

describe('workspace mutations', () => {
  it('removes a character and its owned workspace references', () => {
    const workspace = createDemoWorkspace()
    const character = workspace.characters[0]
    const linkedToken = workspace.tokens.find((token) => token.ownerCharacterId === character.id)

    const nextWorkspace = withoutCharacterCascade(workspace, character.id)

    expect(nextWorkspace.characters.some((candidate) => candidate.id === character.id)).toBe(false)
    expect(nextWorkspace.members.every((member) => member.characterId !== character.id)).toBe(true)
    expect(nextWorkspace.inventoryContainers.every((container) => container.characterId !== character.id)).toBe(true)
    expect(nextWorkspace.inventoryItems.every((item) => item.characterId !== character.id)).toBe(true)
    expect(nextWorkspace.tokens.every((token) => token.ownerCharacterId !== character.id && token.characterId !== character.id)).toBe(true)
    expect(nextWorkspace.tokens.some((token) => token.kind === 'monster')).toBe(true)
    expect(nextWorkspace.turnOrders.every((turnOrder) => (
      turnOrder.entries.every((entry) => !linkedToken?.id || entry.tokenId !== linkedToken.id)
    ))).toBe(true)
    expect(nextWorkspace.notes.every((note) => !note.linkedCharacterIds.includes(character.id))).toBe(true)
  })
})
