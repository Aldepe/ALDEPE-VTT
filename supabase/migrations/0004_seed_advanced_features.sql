insert into public.battlemap_areas (
  id, "campaignId", "mapId", type, name, x, y, start, "end", width, height, radius, length, angle,
  rotation, color, opacity, "strokeWidth", "placementMode", visibility, notes, locked, hidden,
  "createdByUserId", "updatedByUserId"
)
values
  (
    'area_prism_circle',
    'campaign_demo',
    'map_aldepe_forest',
    'circle',
    'Aura prismatica',
    1040,
    620,
    '{"x":1040,"y":620}'::jsonb,
    '{"x":1250,"y":620}'::jsonb,
    210,
    0,
    210,
    210,
    0,
    0,
    '#22f0c8',
    0.26,
    5,
    'cell-center',
    'public',
    'Area persistente editable desde el inspector.',
    false,
    false,
    'REPLACE_WITH_DM_USER_ID',
    'REPLACE_WITH_DM_USER_ID'
  ),
  (
    'area_hidden_cone',
    'campaign_demo',
    'map_aldepe_forest',
    'cone',
    'Cono secreto de bruma',
    770,
    760,
    '{"x":770,"y":760}'::jsonb,
    '{"x":980,"y":690}'::jsonb,
    210,
    70,
    221,
    221,
    -18,
    0,
    '#ff4fa3',
    0.18,
    5,
    'grid-intersection',
    'dm',
    'Solo visible para DM.',
    false,
    false,
    'REPLACE_WITH_DM_USER_ID',
    'REPLACE_WITH_DM_USER_ID'
  )
on conflict (id) do nothing;

insert into public.inventory_containers (id, "characterId", name, description, weight, "sortOrder")
values
  ('container_backpack', 'character_lira', 'Backpack', 'Mochila encerada con bolsillos cosidos en hilo fosforescente.', 5, 1),
  ('container_scroll_case', 'character_lira', 'Scroll case', 'Tubo de madera negra para mapas pequenos y notas selladas.', 1, 2)
on conflict (id) do nothing;

insert into public.inventory_items (
  id, "characterId", "containerId", name, type, rarity, "requiresAttunement", equipped, quantity,
  weight, cost, source, description, notes, tags
)
values
  (
    'item_lantern',
    'character_lira',
    'container_backpack',
    'Lampara violeta',
    'Adventuring gear',
    'Custom',
    false,
    true,
    1,
    2,
    'priceless favor',
    'Custom campaign',
    'Una lampara que respira luz morada cuando hay puertas secretas cerca.',
    'No contiene texto oficial. Totalmente editable.',
    '{light,mystery}'
  ),
  (
    'item_ink',
    'character_lira',
    null,
    'Tinta de lluvia verde',
    'Tool supply',
    'Uncommon custom',
    false,
    false,
    3,
    0.1,
    '12 gp',
    'Vespera market',
    'Tinta inventada que solo aparece sobre papel humedo.',
    '',
    '{map,consumable}'
  )
on conflict (id) do nothing;
