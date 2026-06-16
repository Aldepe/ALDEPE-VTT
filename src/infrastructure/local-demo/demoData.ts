import type { BattleArea, BattleMap, Drawing, MapAsset, Token, TurnOrder } from '@domain/entities/battlemap'
import type { Campaign, CampaignMember } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import type { LoreEntry } from '@domain/entities/lore'
import type { CampaignNote } from '@domain/entities/note'
import type { Quest, TimelineSession } from '@domain/entities/timeline'
import type { CampaignWorkspace } from '@domain/repositories/campaignRepository'
import {
  createDefaultArmor,
  createDefaultAttack,
  createDefaultFeature,
  createDefaultSpell,
  createDefaultSpellSlot,
  createDefaultTool,
  createDefaultTrigger,
  createDefaultTurnState,
  createDefaultWeapon,
  createMapAsset,
  createPlayerToken,
} from '@application/use-cases/workspaceFactories'
import { CreateBattleAreaUseCase } from '@application/use-cases/battleAreas'
import { createDefaultSavingThrows, createDefaultSkills, recalculateCharacterBonuses } from '@domain/services/characterStats'

const campaignId = 'campaign_demo'
const mapId = 'map_aldepe_forest'
const playerCharacterId = 'character_lira'

function createDemoCharacter(): Character {
  const partial: Character = {
    id: playerCharacterId,
    campaignId,
    ownerUserId: 'demo-player',
    isVisibleToPlayer: true,
    name: 'Lira Nimboferro',
    portrait: {},
    className: 'Warden de luces',
    subclassName: 'Circulo prismal',
    level: 4,
    species: 'Linaje inventado',
    backgroundName: 'Cartografa del sueno',
    abilities: {
      str: 10,
      dex: 15,
      con: 13,
      int: 14,
      wis: 12,
      cha: 16,
    },
    proficiencyBonus: 2,
    armorClass: 14,
    maxHp: 31,
    currentHp: 24,
    temporaryHp: 3,
    speed: 30,
    passivePerception: 10,
    passiveInvestigation: 10,
    passiveInsight: 10,
    passiveOverrides: {},
    initiativeBonus: 0,
    deathSaves: { successes: 0, failures: 0 },
    hitDice: { die: 'd8', total: 4, remaining: 3 },
    exhaustion: 0,
    savingThrows: [],
    skills: [],
    languages: ['Comun del Velo', 'Luminico'],
    proficiencies: ['Cartografia', 'Instrumento de cristal', 'Armadura ligera'],
    tools: [
      createDefaultTool(),
      { id: 'tool_glass', name: 'Glassblower tools', proficient: false, bonus: 2, notes: 'Para reparar cristales arcanos.' },
    ],
    weapons: [
      { ...createDefaultWeapon(), id: 'weapon_prism_blade', name: 'Prism blade', hitBonus: 5, damage: '1d8 + 3', damageType: 'slashing' },
    ],
    armor: [
      { ...createDefaultArmor(), id: 'armor_luminous_leather', name: 'Luminous leather', baseAc: 11, bonus: 3 },
    ],
    resistances: ['radiant shimmer'],
    immunities: [],
    vulnerabilities: [],
    conditions: ['marcado'],
    senses: ['Passive Perception 11', 'Dark paths by lantern light'],
    equipment: ['Lampara violeta', 'Cuerda de seda', 'Diario impermeable'],
    currency: {
      platinum: 1,
      gold: 24,
      electrum: 0,
      silver: 13,
      copper: 42,
    },
    spellsAndFeatures:
      'Campos libres para conjuros, recursos y rasgos. Este ejemplo es original y no reproduce reglas oficiales.',
    turnState: createDefaultTurnState(30, 1),
    actions: [
      {
        id: 'action_arcane_device',
        name: 'Arcane Device',
        actionCost: 'action',
        range: '5 ft',
        description: 'Activa un mecanismo, foco, palanca o cristal tactico.',
        quickNotes: 'Consume Action y queda registrado antes de gastar recursos.',
        applicableTriggerIds: [],
        used: false,
      },
    ],
    attacks: [
      {
        ...createDefaultAttack(),
        id: 'attack_prism_blade',
        name: 'Prism blade',
        hitBonus: 5,
        damageDice: '1d8',
        damageBonus: 3,
        damageType: 'slashing',
        versatile: '1d10 + 3 slashing',
        applicableTriggerIds: ['trigger_advantage'],
      },
      {
        ...createDefaultAttack(),
        id: 'attack_lantern_bolt',
        name: 'Lantern bolt',
        range: '60 ft',
        hitBonus: 4,
        damageDice: '1d6',
        damageBonus: 2,
        damageType: 'radiant',
        versatile: undefined,
        applicableTriggerIds: ['trigger_mark'],
      },
    ],
    triggers: [
      { ...createDefaultTrigger(), id: 'trigger_advantage' },
      {
        id: 'trigger_mark',
        name: 'Hunter mark custom',
        appliesWhen: 'Si el objetivo esta marcado por tu lampara.',
        summary: 'Suma daño extra configurable una vez por impacto.',
        active: false,
        duration: 'Concentracion',
        usesRemaining: 3,
      },
    ],
    features: [
      { ...createDefaultFeature(), id: 'feature_second_wind' },
      {
        id: 'feature_action_surge',
        name: 'Action Surge',
        origin: 'class',
        sourceType: 'class',
        sourceClass: 'Fighter',
        functionalType: 'combat',
        icon: 'blade',
        type: 'passive',
        maxUses: 1,
        currentUses: 1,
        recovery: 'shortRest',
        summary: 'Gana una accion adicional este turno.',
        beginnerHint: 'Recuerda usarlo cuando un ataque extra pueda cambiar la escena.',
        mechanicalEffect: 'Configurable por DM.',
        consumesTurnResource: false,
        modifies: ['attack', 'utility'],
        active: false,
        highlightForPlayer: true,
        highlightedByDm: true,
        tags: ['turn', 'burst'],
      },
    ],
    traits: [
      {
        id: 'trait_luminous_steps',
        name: 'Luminous steps',
        origin: 'species',
        sourceType: 'species',
        sourceClass: '',
        functionalType: 'movement',
        icon: 'boots',
        type: 'passive',
        recovery: 'custom',
        summary: 'Deja huellas de luz tenue cuando se mueve.',
        beginnerHint: 'Puede servir para marcar rutas, pistas o presencia en la escena.',
        mechanicalEffect: 'Rastro visual narrativo editable.',
        consumesTurnResource: false,
        modifies: ['movement'],
        active: true,
        highlightForPlayer: false,
        highlightedByDm: false,
        tags: ['movement', 'light'],
      },
    ],
    spellSlots: [
      { ...createDefaultSpellSlot(), id: 'slot_level_1', spellLevel: 1, maxSlots: 3, currentSlots: 3 },
      { ...createDefaultSpellSlot(), id: 'slot_level_2', spellLevel: 2, maxSlots: 2, currentSlots: 1 },
    ],
    spells: [
      createDefaultSpell(),
      {
        ...createDefaultSpell(),
        id: 'spell_protective_gleam',
        name: 'Protective gleam',
        spellLevel: 2,
        castingTime: 'reaction',
        range: '30 ft',
        hitBonus: undefined,
        saveDc: 12,
        duration: '1 round',
        requiresConcentration: false,
        summary: 'Protege a un aliado con un destello configurable.',
        damageOrHealing: 'Reduce daño según DM',
        damageType: 'ward',
        prepared: true,
        usageExamples: ['Usalo para proteger a un aliado.', 'Usalo cuando alguien reciba un golpe grande.'],
      },
    ],
    spellcasting: {
      isSpellcaster: true,
      ability: 'cha',
      saveDc: 13,
      attackBonus: 5,
      knownSpells: 2,
      preparedSpells: 2,
    },
    lore: {
      alignment: 'Compasiva, caotica',
      gender: 'No binario',
      eyes: 'Verde neon',
      size: 'Mediana',
      height: '1.72 m',
      faith: 'La constelacion que escucha',
      hair: 'Azul oscuro',
      skin: 'Cobriza con pecas luminosas',
      age: '29',
      weight: '67 kg',
      personalityTraits: 'Hace mapas incluso de conversaciones dificiles.',
      ideals: 'Toda frontera deberia tener una puerta secreta.',
      bonds: 'Debe una promesa al faro hundido de Vespera.',
      flaws: 'Confunde peligro con invitacion.',
      appearance: 'Capas de viaje, tintas brillantes y botas llenas de polvo estelar.',
      background: 'Crecio copiando rutas imposibles en un archivo ambulante.',
      organizations: 'Archivo Micelio',
      allies: 'Nara, voz del observatorio',
      enemies: 'La Hermandad del Candado Rojo',
      backstory: 'Busca tres llaves que abren una ciudad recordada por mapas, no por personas.',
      other: 'Suenos recurrentes con una puerta bajo agua clara.',
    },
    updatedAt: new Date().toISOString(),
  }

  return recalculateCharacterBonuses({
    ...partial,
    savingThrows: createDefaultSavingThrows(partial),
    skills: createDefaultSkills(partial).map((skill) =>
      skill.name === 'arcana' || skill.name === 'persuasion' || skill.name === 'stealth'
        ? { ...skill, proficient: true }
        : skill,
    ),
  })
}

export function createDemoWorkspace(): CampaignWorkspace {
  const campaign: Campaign = {
    id: campaignId,
    name: 'Aldepe D&D',
    description: 'Campana original de fantasia psicodelica preparada para una mesa de D&D 5e 2024.',
    activeMapId: mapId,
  }

  const members: CampaignMember[] = [
    {
      id: 'member_dm',
      campaignId,
      userId: 'demo-dm',
      role: 'dm',
      displayName: 'DM Demo',
      canDrawOnMap: true,
    },
    {
      id: 'member_player',
      campaignId,
      userId: 'demo-player',
      role: 'player',
      displayName: 'Player Demo',
      characterId: playerCharacterId,
      canDrawOnMap: true,
    },
  ]

  const character = createDemoCharacter()

  const sessions: TimelineSession[] = [
    {
      id: 'session_1',
      campaignId,
      sessionNumber: 1,
      playedAt: '2026-06-01',
      title: 'El faro bajo la lluvia verde',
      summary: 'El grupo llego a Vespera, encontro una puerta que respiraba y gano la confianza del archivo local.',
      visibleNotes: 'Pistas abiertas: la llave azul, el mercado nocturno y la marca del Candado Rojo.',
      sessionImageHoloEnabled: true,
    },
    {
      id: 'session_2',
      campaignId,
      sessionNumber: 2,
      playedAt: '2026-06-08',
      title: 'Rutas que cambian de sitio',
      summary: 'Una ruta del mapa se movio durante el descanso largo y llevo al grupo hasta claros brillantes.',
      visibleNotes: 'El mapa reacciona a canciones, pero solo cerca de agua quieta.',
      sessionImageHoloEnabled: true,
    },
  ]

  const quests: Quest[] = [
    {
      id: 'quest_keys',
      campaignId,
      title: 'Tres llaves para una ciudad recordada',
      description: 'Encontrar las llaves prismales antes de que el Candado Rojo selle la entrada.',
      status: 'active',
      steps: [
        { id: 'step_blue', title: 'Localizar la llave azul', done: false },
        { id: 'step_lantern', title: 'Preguntar por el farolero de Vespera', done: true },
      ],
      challenges: 'Negociar con facciones rivales y sobrevivir a rutas que cambian.',
      secret: 'La tercera llave no es un objeto: es el nombre verdadero de la ciudad.',
    },
    {
      id: 'quest_hidden',
      campaignId,
      title: 'El precio del observatorio',
      description: 'Mision oculta hasta que el grupo acepte hablar con Nara.',
      status: 'hidden',
      steps: [],
      challenges: 'Revelar demasiado pronto puede romper la alianza.',
      secret: 'Nara esta protegiendo a alguien dentro del Candado Rojo.',
    },
  ]

  const loreEntries: LoreEntry[] = [
    {
      id: 'lore_archive',
      campaignId,
      type: 'organization',
      name: 'Archivo Micelio',
      image: {},
      publicFields: {
        description: 'Red de escribas, cartografos y custodios que conservan mapas vivos.',
        historyStructure: 'Funciona por celulas autonomas llamadas estanterias.',
      },
      secret: 'Una estanteria entera trabaja para el Candado Rojo.',
      linkedEntryIds: ['lore_vespera'],
      isVisibleToPlayers: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lore_vespera',
      campaignId,
      type: 'zone',
      name: 'Vespera',
      image: {},
      publicFields: {
        historia: 'Ciudad costera levantada sobre terrazas de vidrio negro.',
        cultura: 'Sus habitantes dejan mensajes en faroles que solo se leen bajo lluvia.',
      },
      secret: 'La ciudad fue construida encima de una entrada sellada.',
      linkedEntryIds: ['lore_archive'],
      isVisibleToPlayers: true,
      updatedAt: new Date().toISOString(),
    },
  ]

  const maps: BattleMap[] = [
    {
      id: mapId,
      campaignId,
      name: 'Claro tactico de Aldepe',
      width: 2800,
      height: 1800,
      gridSize: 70,
      background: {},
      isActive: true,
    },
  ]

  const tokens: Token[] = [
    { ...createPlayerToken(mapId, character), id: 'token_lira', createdBy: 'demo-dm', updatedBy: 'demo-dm' },
    {
      id: 'token_rival',
      mapId,
      kind: 'monster',
      name: 'Centinela de Vidrio',
      image: {},
      x: 840,
      y: 490,
      size: 1,
      rotation: 0,
      scale: 1,
      accentColor: '#ff4fa3',
      borderColor: '#160611',
      visibility: 'public',
      conditions: ['marcado'],
      isLocked: false,
      isInTurnOrder: true,
      active: true,
      createdBy: 'demo-dm',
      updatedBy: 'demo-dm',
      stats: {
        maxHp: 28,
        currentHp: 28,
        temporaryHp: 0,
        armorClass: 15,
        initiative: 12,
        speed: 30,
        creatureType: 'Constructo',
        visibleNotes: 'Armadura de vidrio vivo.',
        secretNotes: 'Huye si pierde el brillo central.',
        notes: 'Ejemplo original editable.',
      },
    },
  ]

  const drawings: Drawing[] = [
    {
      id: 'drawing_zone',
      mapId,
      createdByUserId: 'demo-dm',
      shape: 'circle',
      start: { x: 1040, y: 620 },
      end: { x: 1250, y: 620 },
      color: '#22f0c8',
      visibility: 'public',
    },
  ]

  const battleAreas: BattleArea[] = [
    {
      ...CreateBattleAreaUseCase({
        campaignId,
        mapId,
        userId: 'demo-dm',
        type: 'circle',
        start: { x: 1040, y: 620 },
        end: { x: 1250, y: 620 },
        color: '#22f0c8',
        visibility: 'public',
        placementMode: 'cell-center',
      }),
      id: 'area_prism_circle',
      name: 'Aura prismatica',
      notes: 'Area persistente editable desde el inspector.',
    },
    {
      ...CreateBattleAreaUseCase({
        campaignId,
        mapId,
        userId: 'demo-dm',
        type: 'cone',
        start: { x: 770, y: 760 },
        end: { x: 980, y: 690 },
        color: '#ff4fa3',
        visibility: 'dm_only',
        placementMode: 'grid-intersection',
      }),
      id: 'area_hidden_cone',
      name: 'Cono secreto de bruma',
      opacity: 0.18,
    },
  ]

  const mapAssets: MapAsset[] = [
    {
      ...createMapAsset(mapId, 'wall', 610, 580, 'public'),
      id: 'asset_wall',
      label: 'Muro cristalino',
      name: 'Muro cristalino',
      width: 280,
      height: 24,
      notes: 'Cobertura improvisada.',
    },
    {
      ...createMapAsset(mapId, 'rune-glyph', 1160, 360, 'dm_only'),
      id: 'asset_trap',
      label: 'Glifo latente',
      name: 'Glifo latente',
      notes: 'Solo visible para DM.',
    },
    {
      ...createMapAsset(mapId, 'light-source', 420, 840, 'public'),
      id: 'asset_lantern',
      label: 'Foco bioluminiscente',
      name: 'Foco bioluminiscente',
      notes: 'Fuente de luz bioluminiscente.',
    },
  ]

  const inventoryContainers: InventoryContainer[] = [
    {
      id: 'container_backpack',
      characterId: playerCharacterId,
      name: 'Backpack',
      description: 'Mochila encerada con bolsillos cosidos en hilo fosforescente.',
      weight: 5,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'container_scroll_case',
      characterId: playerCharacterId,
      name: 'Scroll case',
      description: 'Tubo de madera negra para mapas pequenos y notas selladas.',
      weight: 1,
      sortOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const inventoryItems: InventoryItem[] = [
    {
      id: 'item_lantern',
      characterId: playerCharacterId,
      containerId: 'container_backpack',
      name: 'Lampara violeta',
      type: 'Adventuring gear',
      rarity: 'Custom',
      requiresAttunement: false,
      equipped: true,
      quantity: 1,
      weight: 2,
      cost: 'priceless favor',
      source: 'Custom campaign',
      description: 'Una lampara que respira luz morada cuando hay puertas secretas cerca.',
      notes: 'No contiene texto oficial. Totalmente editable.',
      tags: ['light', 'mystery'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item_ink',
      characterId: playerCharacterId,
      name: 'Tinta de lluvia verde',
      type: 'Tool supply',
      rarity: 'Uncommon custom',
      requiresAttunement: false,
      equipped: false,
      quantity: 3,
      weight: 0.1,
      cost: '12 gp',
      source: 'Vespera market',
      description: 'Tinta inventada que solo aparece sobre papel humedo.',
      notes: '',
      tags: ['map', 'consumable'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const turnOrders: TurnOrder[] = [
    {
      id: 'turns_aldepe',
      mapId,
      round: 1,
      currentIndex: 0,
      entries: [
        { id: 'turn_lira', tokenId: 'token_lira', name: 'Lira Nimboferro', initiative: 16, kind: 'player', visibility: 'public' },
        { id: 'turn_sentinel', tokenId: 'token_rival', name: 'Centinela de Vidrio', initiative: 12, kind: 'monster', visibility: 'public' },
      ],
    },
  ]

  const now = new Date().toISOString()
  const notes: CampaignNote[] = [
    {
      id: 'note_party_aldepe',
      campaignId,
      title: 'Pistas compartidas',
      content: 'La luz cyan responde a canciones lentas y el emblema draconico aparece cerca de portales activos.',
      tags: ['pistas', 'portal'],
      type: 'party',
      authorUserId: 'demo-dm',
      authorName: 'DM Demo',
      pinned: true,
      linkedCharacterIds: [playerCharacterId],
      linkedLoreEntryIds: ['lore_vespera'],
      linkedMapIds: [mapId],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'note_dm_aldepe',
      campaignId,
      title: 'Secreto del claro',
      content: 'El primer enemigo huira si el grupo activa tres glifos sin romper el circulo central.',
      tags: ['dm', 'encuentro'],
      type: 'dm',
      authorUserId: 'demo-dm',
      authorName: 'DM Demo',
      pinned: false,
      linkedCharacterIds: [],
      linkedLoreEntryIds: [],
      linkedMapIds: [mapId],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'note_personal_lira',
      campaignId,
      title: 'Promesa de Lira',
      content: 'No confiar en el Candado Rojo hasta descubrir quien protege Nara.',
      tags: ['personaje'],
      type: 'personal',
      authorUserId: 'demo-player',
      authorName: 'Player Demo',
      pinned: false,
      linkedCharacterIds: [playerCharacterId],
      linkedLoreEntryIds: [],
      linkedMapIds: [],
      createdAt: now,
      updatedAt: now,
    },
  ]

  return {
    campaign,
    members,
    characters: [character],
    sessions,
    quests,
    loreEntries,
    maps,
    tokens,
    drawings,
    battleAreas,
    mapAssets,
    notes,
    inventoryContainers,
    inventoryItems,
    turnOrders,
  }
}
