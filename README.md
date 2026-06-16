# Aldepe VTT

Aplicacion VTT para campanas de fantasia compatibles con una mesa de D&D 5e 2024 sin incluir textos, reglas ni contenido propietario de libros oficiales. La app usa la identidad visual Aldepe VTT, datos demo originales de `Aldepe D&D`, Supabase Auth, roles DM/player, ficha de personaje, cronograma, lore tipo wiki, notas, inventario y battlemap tactico.

## Stack

- React 19 + TypeScript + Vite.
- Supabase Auth, Postgres, RLS, Storage y realtime.
- Canvas 2D para battlemap con pan, zoom, grid, tokens, medicion, areas editables y assets tacticos.
- Vitest + Testing Library.
- GitHub Pages mediante workflow en `.github/workflows/deploy.yml`.

## Arquitectura

La estructura sigue una arquitectura hexagonal ligera:

- `src/domain`: entidades, puertos de repositorio y servicios puros.
- `src/application`: casos de uso, fabricas y mutaciones de workspace.
- `src/infrastructure`: adaptadores Supabase y demo local.
- `src/ui`: paginas React, layout, componentes y estilos.
- `supabase/migrations`: schema, RLS, buckets y seed demo.
- `public/assets/branding`: icono y fondo de Aldepe VTT.
- `public/assets/audio`: carpeta preparada para ambientes y efectos.

Los permisos viven en `src/domain/services/permissions.ts` y se exponen para ficha con `ValidateCharacterEditPermissionsUseCase`. Los casos de uso nuevos incluyen notas, audio, branding, borrado de mapas, acciones guiadas, spell slots, features visuales, imagenes de inventario y fotos holo de sesiones.

## Instalacion

```bash
npm install
cp .env.example .env
npm run dev
```

Si `.env` no tiene Supabase configurado, la app arranca en modo demo local usando `localStorage`. Puedes entrar como DM o player desde la pantalla de login.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run lint
```

## Branding

La app usa assets locales reales:

- Logo/icono: `public/assets/branding/aldepe-vtt-icon.png`.
- Fondo global: `public/assets/branding/aldepe-vtt-background.png`.
- Manifest PWA: `public/manifest.webmanifest`.

El nombre visible de la app es `Aldepe VTT` y la campana demo es `Aldepe D&D`.

## Direccion visual

Aldepe VTT usa una direccion de fantasia oscura bioluminiscente: bosque nocturno, neones cyan/magenta/violeta, verde acido, oro viejo para elementos DM y paneles de cristal oscuro. Los tokens visuales viven en `src/ui/styles/app.css`:

- Variables de color y glow: `--color-void`, `--panel-glass`, `--glow-cyan`, `--glow-violet`, `--glow-gold`, `--glow-danger`.
- Fondos locales: branding global, grimorio para spells e inventario de aventurero.
- Estados: disponible cyan/verde, pendiente con pulso, gastado apagado, error rojo/naranja magico y destacado DM dorado.
- Accesibilidad: focus visible, contraste alto, `prefers-reduced-motion` y boton local de `Modo menos estimulos` en controles de audio.

Para cambiar un fondo, sustituye el asset en `public/assets/...` o actualiza `spellbookVisualTheme` / `inventoryVisualTheme`. Para anadir iconos o badges visuales, reutiliza `LineIcon`, `StatIcon`, `RarityBadge`, `AbilityScoreCard`, `ArmorClassShield`, `HitPointOrb`, `CurrencyBar`, `SkillBadge` y las clases de chip/glow ya definidas.

## Ficha de personaje

La ficha incluye cards visuales para atributos:

- Fuerza, Destreza, Constitucion, Inteligencia, Sabiduria y Carisma con iconos SVG propios.
- Valor editable, modificador calculado, borde luminoso, hover y estado de guardado.
- Filas uniformes: Ability Scores, Combat Core, Passive Scores y Survival / Rest / Death.
- AC como escudo, HP como orb/barra de vida, HP temporal, iniciativa, velocidad y competencia como badges.
- Passive Investigation y Passive Insight junto a Passive Perception. El DM puede editar overrides de pasivas sin perder el recalculo de skills.
- Death Saves tiene successes/failures marcables y reset.
- Saving throws y skills tienen paneles paralelos con altura equivalente, scroll interno e iconografia asociada al atributo. Los toggles P/E recalculan bonus y pasivas inmediatamente.
- Resumen incluye toggle claro de `Spellcasting enabled`; si esta apagado no se muestra Libro, slots, Cast Spell ni campos magicos vacios.
- Subpestanas internas con iconos: `Resumen`, `Acciones`, `Libro de magia` si es spellcaster, `Detalles`, `Inventario`, `Features & Traits` e `Historia`.
- `Detalles` separa Languages y Senses de Tools, Weapons y Armor proficiencies. Conditions, Resistances, Immunities y Vulnerabilities usan chips visuales.
- `Inventario` contiene contenedores y objetos reales con imagen por item; `Historia` usa una pagina tipo wiki con retrato opcional, infobox y secciones largas.
- Vista DM: editor completo con inputs tematizados, presets para listas comunes y boton de guardar.
- Vista DM: puede marcar una ficha como visible para el jugador, crear fichas nuevas desde el sidebar y asignar la ficha activa a un player.
- Vista player: interfaz principalmente visual/read-only, con detalles compactos, sin formularios administrativos ni controles deshabilitados masivos.

Componentes principales:

- `StatIcon`
- `LineIcon`
- `AbilityScoreCard`
- `CharacterStatBadge`
- `ArmorClassShield`
- `HitPointOrb`
- `SkillBadge`
- `CurrencyBar`
- `RarityBadge`

## Acciones

La pestana `Acciones` esta pensada para principiantes y jugadores con TDAH:

- Panel superior con recursos de turno: Action, Movement, Bonus Action, Spell Slots si es spellcaster y Reaction.
- Disponible se ve iluminado; pendiente pulsa con glow; gastado se apaga.
- Paso 1 separa opciones por coste: Consume Action, Consume Bonus Action, Consume Reaction y Movement.
- No se muestran Free Actions, Hablar, Dodge, Help, Ready ni Search por defecto.
- Movement incluye Move, Climb, Swim, Jump y Stand up.
- Cast Spell solo aparece si `spellcasting.isSpellcaster` esta activo y hay spells conocidos/preparados con coste compatible.
- Las acciones no se gastan al seleccionarlas: se anaden a `Plan del turno`.
- `Computar turno` valida Actions, Bonus Actions, Reactions, movimiento, ataques por Action, spell slots y usos de features.
- Si el plan no es valido, no gasta nada y explica el motivo.
- Si el plan es valido, descuenta recursos, spell slots y marca ataques/features/triggers.
- `Undo last computed turn` restaura el estado anterior del ultimo turno computado.
- `Reset Turn` restaura recursos, ataques usados y triggers activos.
- Ataques y spells se eligen desde listas visuales y se anaden al plan.
- Los dados siguen siendo fisicos: el plan muestra `Roll d20 + bonus`, input de d20, hit/miss, dano/curacion y total.
- Dash, Disengage, Hide y Use an Object consumen Action. Dash no puede computarse junto a Attack si solo queda una Action.
- Features activables y traits relevantes aparecen en Acciones automaticamente; las destacadas por el DM se muestran como `Recuerda esto` con brillo dorado.
- El DM puede crear, editar, duplicar y borrar acciones/ataques configurados. Si borra una accion o ataque, tambien se limpia del plan actual para no dejar referencias rotas.

Casos de uso principales:

- `ListCharacterActionsUseCase`
- `CreateTurnPlanUseCase`
- `ListTurnActionOptionsByCostUseCase`
- `SelectTurnActionUseCase`
- `RemoveTurnActionUseCase`
- `ValidateTurnPlanUseCase`
- `ComputeTurnPlanUseCase`
- `UndoLastComputedTurnUseCase`
- `UseCharacterActionUseCase`
- `ResetTurnResourcesUseCase`
- `CreateCharacterAttackUseCase`
- `UpdateCharacterAttackUseCase`
- `CreateCharacterActionUseCase`
- `UpdateCharacterActionUseCase`
- `DeleteCharacterActionUseCase`
- `RemoveTurnPlanItemsForDeletedActionUseCase`
- `ActivateCharacterTriggerUseCase`
- `DeactivateCharacterTriggerUseCase`

## Libro de magia

Los spellcasters tienen `Libro de magia`, una vista tipo grimorio:

- Fondo visual local: `public/assets/spellbook/bioluminescent-impressionist-grimoire.png`.
- El fondo se inyecta desde `spellbookVisualTheme` y se oscurece con overlays CSS para mantener contraste.
- Spell slots como orbes magicos por nivel.
- Orbes encendidos = slots disponibles; orbes apagados = gastados.
- En Acciones tambien se ven slots pendientes antes de computar.
- DM/editor puede gastar/restaurar slots desde el grimorio. Player ve el estado visual y lanza desde Acciones.
- Panel `Foco arcano`: Spellcasting Ability, Spell Save DC, Spell Attack Bonus, Known Spells, Can Prepare y Prepared Now. El DM edita los valores base y el jugador ve un resumen visual claro.
- Indice, busqueda, filtro por nivel, categoria y preparados.
- DM puede marcar known/prepared, duplicar, borrar y editar coste, escuela, efecto, icono, rango, hit/DC, dano/curacion, componentes, duracion, concentracion, resumen, ejemplos y fuente.
- Paginas anterior/siguiente.
- Cada spell tiene categoria visual, icono seleccionable y acento por efecto.
- Detalle del spell con consumo, rango, hit o DC, duracion, concentracion, resumen, dano/curacion y ejemplos de uso.
- Ejemplos breves tipo “Usalo para proteger a un aliado”.

Casos de uso principales:

- `SpendSpellSlotUseCase`
- `MarkSpellSlotPendingUseCase`
- `RestoreSpellSlotsUseCase`
- `ListAvailableSpellsForActionUseCase`
- `ListCharacterSpellsUseCase`
- `CreateCharacterSpellUseCase`
- `UpdateCharacterSpellUseCase`
- `DuplicateCharacterSpellUseCase`
- `DeleteCharacterSpellUseCase`

## Features & Traits

La pestana `Features & Traits` es una lista vertical scrolleable y editable:

- Class, subclass, species, background, feats y custom traits.
- Fuente, clase/source, tipo funcional, icono, coste, usos, recuperacion, resumen, explicacion para principiantes, efecto mecanico, tags y activacion visual.
- Duplicar, borrar y destacar para jugadores con `Recuerda esto`.
- DM puede configurar todo; players ven cards visuales, resumen, usos, tags y destacados sin editor administrativo.

Casos de uso:

- `CreateCharacterFeatureUseCase`
- `UpdateCharacterFeatureUseCase`
- `DuplicateCharacterFeatureUseCase`
- `DeleteCharacterFeatureUseCase`
- `HighlightFeatureForPlayerUseCase`

## Inventario

La pestana `Inventario` usa una escena local de equipo bioluminiscente como fondo:

- Fondo visual local: `public/assets/inventory/bioluminescent-adventuring-gear.png`.
- El fondo se inyecta desde `inventoryVisualTheme` y se oscurece con overlays CSS para mantener contraste.
- Cada objeto puede tener imagen, preview en card, cambio y retirada desde el inspector.
- Barra superior de monedas con Platinum, Gold, Electrum, Silver y Copper. El DM edita cantidades; el jugador las ve como chips compactos con iconos lineales.
- Cada objeto muestra badge de rareza con glow: Common, Uncommon, Rare, Very Rare, Legendary y Artifact.
- Campos preparados: `imageUrl`, `imagePath`, `imageAlt`.
- Bucket Supabase Storage preparado: `inventory-item-images`.

## Tools, Weapons y Armor

La ficha separa proficiencies de inventario:

- Tools: nombre, proficiency, bonus y notas.
- Weapons: proficiencies de arma, tipo y propiedades.
- Armor: proficiencies de armadura, tipo y notas.

Los objetos concretos van en la pestana `Inventario`.

## Cronograma con memoria holo

Cada entrada de cronograma puede tener foto de grupo:

- Upload local de imagen desde el editor de sesion.
- Preview en el formulario.
- Imagen visible en la card de sesion.
- Campos Supabase preparados: `sessionImageUrl`, `sessionImagePath` y `sessionImageHoloEnabled`.
- Bucket Supabase Storage: `timeline-session-photos`.
- Filtro holo por defecto con scanlines, brillo cyan/morado y borde luminoso.

Casos de uso:

- `UploadTimelineSessionPhotoUseCase`
- `ApplyHologramSessionPhotoStyleUseCase`

## Notas

La pestaña `Notas` permite:

- Notas personales privadas.
- Notas compartidas con la party.
- Notas de DM visibles solo para DM.
- Titulo, contenido, tags, tipo, autor, fechas, fijado y enlaces preparados a personajes, lore y mapas.
- Busqueda, filtros por tipo, lista, editor, guardado, borrado y empty states.

Supabase usa la tabla `notes` con RLS por autor, party y DM.

## Battlemap

Incluye:

- Multiples mapas.
- Imagen de fondo local por mapa.
- Grid tactico limpio de 5 ft.
- Pan y zoom.
- Medicion persistente y areas persistentes: circulo, cono, cubo/cuadrado y linea.
- DM layer panel: Players, Monstruos, NPCs/custom, Areas, Mediciones, Assets y Hidden / DM only.
- Inspector DM completo para monstruos, NPCs y tokens de players: HP, HP temporal, AC, iniciativa, velocidad, tamano, posicion, rotacion, escala, color, imagen, condiciones, notas visibles y notas secretas.
- Players tienen vista limitada del token, pueden mover solo su propia ficha desbloqueada y guardar su iniciativa con input de d20 fisico + bonus + total.
- Players pueden crear, editar y borrar sus propias areas publicas si tienen permiso de dibujo.
- Assets tacticos ampliados, solo editables por DM.
- Visibilidad `public`, `dm_only` y compatibilidad legacy `dm`.
- Elementos DM-only no se listan/renderizan para players; para DM se muestran translucidos con aura y etiqueta.
- Turn order con iniciativa, tokenId, turno actual, rondas y limpieza automatica al borrar monstruos.
- Boton DM `Borrar mapa` con confirmacion y cascada sobre tokens, areas, assets, dibujos legacy y turn order.

Al borrar el mapa activo, la app selecciona automaticamente otro mapa disponible o muestra el empty state si no queda ninguno.

Casos de uso principales:

- `CreateMonsterTokenUseCase`
- `UpdateMonsterTokenUseCase`
- `DeleteMonsterTokenUseCase`
- `UpdatePlayerTokenUseCase`
- `MoveOwnPlayerTokenUseCase`
- `SetOwnInitiativeUseCase`
- `SetTokenVisibilityUseCase`
- `ListVisibleMapElementsUseCase`
- `ListDmMapElementsUseCase`
- `CreatePlayerAreaUseCase`
- `UpdatePlayerAreaUseCase`
- `DeleteOwnPlayerAreaUseCase`
- `MeasureDistanceUseCase`
- `ValidateBattlemapPermissionsUseCase`

## Sonido

La barra lateral incluye control global de sonido:

- Toggle on/off.
- Slider de volumen.
- Efecto UI breve al activar o ajustar volumen.
- Sin autoplay antes de interaccion del usuario.
- Arquitectura preparada con `AudioSettingsRepository` y casos de uso `ToggleSoundUseCase` y `SetVolumeUseCase`.

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Copia `Project URL` y `anon public key` a `.env`.
3. Ejecuta las migraciones en orden:
   - `0001_initial_schema.sql`
   - `0002_seed_demo.sql`
   - `0003_battle_areas_inventory_realtime.sql`
   - `0004_seed_advanced_features.sql`
   - `0005_notes_branding_audio.sql`
   - `0006_character_actions_spellbook_timeline_photos.sql`
   - `0007_turn_plans_spell_icons.sql`
   - `0008_spellcasting_inventory_feature_visuals.sql`
   - `0009_battlemap_dm_editor_permissions.sql`
   - `0010_character_visibility_currency_passive_overrides.sql`
4. Sustituye `REPLACE_WITH_DM_USER_ID` y `REPLACE_WITH_PLAYER_USER_ID` en los seeds antes de ejecutarlos.

La migracion crea RLS para perfiles, campanas, miembros, fichas, timeline, quests, lore, mapas, tokens, areas, assets, turn order, inventario, notas, acciones, ataques, features, traits, triggers, recursos, spell slots, spells, conditions, turn plans, turn plan items, turn history, tools, weapons y armor.

## Auth y roles

- `dm`: administra campana, crea/asigna fichas, edita todos los campos de personaje, timeline, lore, notas DM, mapas, monstruos/NPCs, tokens de players, assets, visibilidad, turn order e inventario.
- `player`: consulta su ficha visible, usa vistas visuales/compactas, gestiona sus notas personales, ve notas party, mueve solo su token, guarda su iniciativa y dibuja areas publicas si tiene permiso.

RLS impide que players lean secretos, notas DM, assets/tokens/areas `dm_only`, misiones ocultas o fichas ajenas. La migracion `0009` anade triggers para limitar updates de player a movimiento de su token e iniciativa propia.

## Realtime

`SupabaseRealtimeRepository` se suscribe a:

- `maps`
- `notes`
- `characters`
- `timeline_sessions`
- `character_actions`
- `character_attacks`
- `character_features`
- `character_traits`
- `character_triggers`
- `character_resources`
- `character_spell_slots`
- `character_spells`
- `character_resistances`
- `character_conditions`
- `character_tools`
- `character_weapons`
- `character_armor`
- `character_turn_plans`
- `character_turn_plan_items`
- `character_turn_history`
- `battlemap_areas`
- `map_assets`
- `tokens`
- `turn_orders`
- `inventory_containers`
- `inventory_items`

Cuando Supabase emite cambios, la app recarga el workspace. En modo demo local se usa un repositorio realtime no-op.

## Testing

Los tests cubren permisos, notas, acciones de turno por coste, gasto de Action/Bonus/Reaction, reset de turno, triggers/features, highlight de features, spellcasting condicional, spell slots, roll fisico manual, imagenes de inventario, foto holo de cronograma, pasivas, weapons/armor/tools, borrado de mapas con cascada, branding assets, audio sin autoplay por defecto, render visual de ficha, battlemap, inventario, geometria y realtime.

```bash
npm run test
```

## Limitaciones conocidas

- Realtime recarga workspace completo; queda pendiente reconciliacion granular por entidad.
- El storage real esta preparado en SQL, pero la UI demo guarda imagenes como data URL.
- La creacion/invitacion de campanas y miembros no tiene pantalla dedicada.
- Battlemap no implementa fog of war avanzado ni paredes con bloqueo de vision.
- Las reglas de D&D son campos editables; no hay compendio ni textos oficiales.
