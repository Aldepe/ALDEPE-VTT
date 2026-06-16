-- Optional demo seed.
-- Replace the two user ids with real Supabase Auth user UUIDs before running.

do $$
declare
  dm_user_id text := 'REPLACE_WITH_DM_USER_ID';
  player_user_id text := 'REPLACE_WITH_PLAYER_USER_ID';
begin
  insert into public.campaigns (id, name, description, "activeMapId")
  values (
    'campaign_demo',
    'Aldepe D&D',
    'Campana original de fantasia psicodelica preparada para D&D 5e 2024 sin contenido propietario.',
    'map_aldepe_forest'
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    "activeMapId" = excluded."activeMapId";

  insert into public.campaign_members (id, "campaignId", "userId", role, "displayName", "characterId", "canDrawOnMap")
  values
    ('member_dm', 'campaign_demo', dm_user_id, 'dm', 'DM Demo', null, true),
    ('member_player', 'campaign_demo', player_user_id, 'player', 'Player Demo', 'character_lira', true)
  on conflict ("campaignId", "userId") do update set
    role = excluded.role,
    "displayName" = excluded."displayName",
    "characterId" = excluded."characterId",
    "canDrawOnMap" = excluded."canDrawOnMap";

  insert into public.characters (
    id, "campaignId", "ownerUserId", name, portrait, "className", "subclassName", level, species,
    "backgroundName", abilities, "proficiencyBonus", "armorClass", "maxHp", "currentHp", "temporaryHp",
    speed, "passivePerception", "initiativeBonus", "savingThrows", skills, languages, proficiencies,
    equipment, "spellsAndFeatures", lore
  )
  values (
    'character_lira',
    'campaign_demo',
    player_user_id,
    'Lira Nimboferro',
    '{}'::jsonb,
    'Warden de luces',
    'Circulo prismal',
    4,
    'Linaje inventado',
    'Cartografa del sueno',
    '{"str":10,"dex":15,"con":13,"int":14,"wis":12,"cha":16}'::jsonb,
    2,
    14,
    31,
    24,
    3,
    30,
    12,
    2,
    '[]'::jsonb,
    '[]'::jsonb,
    '["Comun del Velo","Luminico"]'::jsonb,
    '["Cartografia","Instrumento de cristal","Armadura ligera"]'::jsonb,
    '["Lampara violeta","Cuerda de seda","Diario impermeable"]'::jsonb,
    'Campos libres para conjuros, recursos y rasgos. Ejemplo original.',
    '{"alignment":"Compasiva, caotica","backstory":"Busca tres llaves que abren una ciudad recordada por mapas."}'::jsonb
  )
  on conflict (id) do nothing;

  insert into public.timeline_sessions (id, "campaignId", "sessionNumber", "playedAt", title, summary, "visibleNotes")
  values
    ('session_1', 'campaign_demo', 1, '2026-06-01', 'El faro bajo la lluvia verde', 'El grupo llego a Vespera y encontro una puerta que respiraba.', 'Pistas abiertas: llave azul y mercado nocturno.'),
    ('session_2', 'campaign_demo', 2, '2026-06-08', 'Rutas que cambian de sitio', 'Una ruta del mapa llevo al grupo hasta claros brillantes.', 'El mapa reacciona a canciones.')
  on conflict (id) do nothing;

  insert into public.quests (id, "campaignId", title, description, status, steps, challenges, secret)
  values (
    'quest_keys',
    'campaign_demo',
    'Tres llaves para una ciudad recordada',
    'Encontrar las llaves prismales antes de que el Candado Rojo selle la entrada.',
    'active',
    '[{"id":"step_blue","title":"Localizar la llave azul","done":false}]'::jsonb,
    'Negociar con facciones rivales y sobrevivir a rutas que cambian.',
    'La tercera llave es un nombre verdadero.'
  )
  on conflict (id) do nothing;

  insert into public.lore_entries (id, "campaignId", type, name, image, "publicFields", secret, "isVisibleToPlayers")
  values
    ('lore_archive', 'campaign_demo', 'organization', 'Archivo Micelio', '{}'::jsonb, '{"description":"Red de escribas y cartografos de mapas vivos.","historyStructure":"Funciona por celulas autonomas."}'::jsonb, 'Una celula trabaja para el Candado Rojo.', true),
    ('lore_vespera', 'campaign_demo', 'zone', 'Vespera', '{}'::jsonb, '{"historia":"Ciudad costera de vidrio negro.","cultura":"Los mensajes se leen bajo lluvia."}'::jsonb, 'Fue construida encima de una entrada sellada.', true)
  on conflict (id) do nothing;

  insert into public.lore_links (source_id, target_id)
  values ('lore_archive', 'lore_vespera'), ('lore_vespera', 'lore_archive')
  on conflict do nothing;

  insert into public.maps (id, "campaignId", name, width, height, "gridSize", background, "isActive")
  values ('map_aldepe_forest', 'campaign_demo', 'Claro tactico de Aldepe', 2800, 1800, 70, '{}'::jsonb, true)
  on conflict (id) do nothing;

  insert into public.tokens (id, "mapId", "ownerCharacterId", kind, name, image, x, y, size, visibility, conditions, stats)
  values
    ('token_lira', 'map_aldepe_forest', 'character_lira', 'player', 'Lira Nimboferro', '{}'::jsonb, 210, 210, 1, 'public', '{}', '{"maxHp":31,"currentHp":24,"armorClass":14,"initiative":2,"speed":30,"notes":""}'::jsonb),
    ('token_rival', 'map_aldepe_forest', null, 'monster', 'Centinela de Vidrio', '{}'::jsonb, 840, 490, 1, 'public', '{marcado}', '{"maxHp":28,"currentHp":28,"armorClass":15,"initiative":12,"speed":30,"notes":"Ejemplo original editable."}'::jsonb)
  on conflict (id) do nothing;

  insert into public.turn_orders (id, "mapId", round, "currentIndex", entries)
  values ('turns_aldepe', 'map_aldepe_forest', 1, 0, '[{"id":"turn_lira","name":"Lira Nimboferro","initiative":16,"kind":"player"},{"id":"turn_sentinel","name":"Centinela de Vidrio","initiative":12,"kind":"monster"}]'::jsonb)
  on conflict (id) do nothing;
end $$;
