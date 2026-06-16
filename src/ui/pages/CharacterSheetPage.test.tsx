import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBlankCharacter } from '@application/use-cases/workspaceFactories'
import { CharacterSheetPage } from './CharacterSheetPage'

describe('CharacterSheetPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders and edits the character name field', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const character = createBlankCharacter('campaign', 'player')

    render(
      <CharacterSheetPage
        canEdit
        character={character}
        inventoryContainers={[]}
        inventoryItems={[]}
        onDeleteInventoryContainer={vi.fn()}
        onDeleteInventoryItem={vi.fn()}
        onSave={onSave}
        onSaveInventoryContainer={vi.fn()}
        onSaveInventoryItem={vi.fn()}
        saveStatus="idle"
        viewerIsDm
      />,
    )

    expect(screen.getAllByRole('img', { name: 'Icono de Fuerza' }).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Armor Class')).toBeInTheDocument()
    expect(screen.getByLabelText('HP actual')).toBeInTheDocument()
    expect(screen.getByText('Investigation pasiva')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Libro de magia' })).not.toBeInTheDocument()
    await user.click(screen.getByLabelText('Spellcasting enabled'))
    expect(screen.getByRole('tab', { name: 'Libro de magia' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Libro de magia' }))
    expect(screen.getByText('Foco arcano')).toBeInTheDocument()
    expect(screen.getAllByText('Prepared Now').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('tab', { name: 'Resumen' }))
    const editableNameInput = screen.getByLabelText('Nombre del personaje')
    await user.clear(editableNameInput)
    await user.type(editableNameInput, 'Astra Prisma')
    await user.click(screen.getByRole('button', { name: /guardar ficha/i }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Astra Prisma' }))
  }, 10000)

  it('shows the ADHD-friendly actions tab with turn resources and manual roll input', async () => {
    const user = userEvent.setup()
    const character = createBlankCharacter('campaign', 'player')

    render(
      <CharacterSheetPage
        canEdit
        character={character}
        inventoryContainers={[]}
        inventoryItems={[]}
        onDeleteInventoryContainer={vi.fn()}
        onDeleteInventoryItem={vi.fn()}
        onSave={vi.fn()}
        onSaveInventoryContainer={vi.fn()}
        onSaveInventoryItem={vi.fn()}
        saveStatus="idle"
        viewerIsDm={false}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Acciones' }))

    expect(screen.getByText('Recursos disponibles')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset Turn/i })).toBeInTheDocument()
    expect(screen.getByText('Plan del turno')).toBeInTheDocument()
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Free Action/i })).toBeInTheDocument()
    expect(screen.getByText('Ataques')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Dodge/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Help/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ready/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Search/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cast Spell/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Attack/i }))
    await user.click(screen.getByRole('button', { name: /Anadir al plan/i }))
    expect(screen.getByText('Roll d20 + 4')).toBeInTheDocument()
    expect(screen.getByText('Total:')).toBeInTheDocument()
  })

  it('shows a visual read-only player sheet without DM editor controls', () => {
    const character = createBlankCharacter('campaign', 'player')

    render(
      <CharacterSheetPage
        canEdit
        character={character}
        inventoryContainers={[]}
        inventoryItems={[]}
        onDeleteInventoryContainer={vi.fn()}
        onDeleteInventoryItem={vi.fn()}
        onSave={vi.fn()}
        onSaveInventoryContainer={vi.fn()}
        onSaveInventoryItem={vi.fn()}
        saveStatus="idle"
        viewerIsDm={false}
      />,
    )

    expect(screen.getAllByRole('img', { name: 'Icono de Fuerza' }).length).toBeGreaterThan(0)
    expect(screen.queryByLabelText('Nombre del personaje')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Spellcasting enabled')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar ficha/i })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Acciones/i })).toBeInTheDocument()
    expect(screen.getAllByText('Solo lectura').length).toBeGreaterThan(0)
  })

  it('splits inventory, features and lore into their own sheet tabs', async () => {
    const user = userEvent.setup()
    const character = createBlankCharacter('campaign', 'player')

    render(
      <CharacterSheetPage
        canEdit
        character={character}
        inventoryContainers={[]}
        inventoryItems={[]}
        onDeleteInventoryContainer={vi.fn()}
        onDeleteInventoryItem={vi.fn()}
        onSave={vi.fn()}
        onSaveInventoryContainer={vi.fn()}
        onSaveInventoryItem={vi.fn()}
        saveStatus="idle"
        viewerIsDm={false}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Inventario' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Features & Traits' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Historia' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Detalles' }))
    expect(screen.getByText('Rasgos visibles')).toBeInTheDocument()
    expect(screen.queryByText('Tools Proficiencies')).not.toBeInTheDocument()
    expect(screen.queryByText('Proficiencies')).not.toBeInTheDocument()
    expect(screen.getByText('Resistances')).toBeInTheDocument()
    expect(screen.queryByText('Equipment / Inventory')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Features & Traits' }))
    expect(screen.getByText('Features activables')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Historia' }))
    expect(screen.getByText('Historia / Lore')).toBeInTheDocument()
    expect(screen.getByLabelText('Historia del personaje')).toBeInTheDocument()
  })
})
