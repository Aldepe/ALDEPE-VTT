import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InventoryPanel } from './InventoryPanel'

describe('InventoryPanel', () => {
  it('renders containers and rich item information', () => {
    render(
      <InventoryPanel
        canEdit
        characterId="character"
        containers={[
          {
            id: 'container',
            characterId: 'character',
            name: 'Backpack',
            description: 'Travel gear',
            weight: 5,
            sortOrder: 1,
            createdAt: '',
            updatedAt: '',
          },
        ]}
        currency={{ platinum: 0, gold: 12, electrum: 0, silver: 5, copper: 20 }}
        items={[
          {
            id: 'item',
            characterId: 'character',
            containerId: 'container',
            name: 'Glowcap vial',
            type: 'Custom gear',
            rarity: 'Rare custom',
            requiresAttunement: false,
            equipped: true,
            quantity: 1,
            weight: 0.2,
            cost: 'favor',
            source: 'Custom',
            description: 'Bright mushroom extract.',
            notes: '',
            tags: ['glow'],
            createdAt: '',
            updatedAt: '',
          },
        ]}
        onCurrencyChange={vi.fn()}
        onDeleteContainer={vi.fn()}
        onDeleteItem={vi.fn()}
        onSaveContainer={vi.fn()}
        onSaveItem={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Backpack').length).toBeGreaterThan(0)
    expect(screen.getByText('Glowcap vial')).toBeInTheDocument()
    expect(screen.getByText('Custom gear')).toBeInTheDocument()
    expect(screen.getAllByText('Rare custom').length).toBeGreaterThan(0)
  })
})
