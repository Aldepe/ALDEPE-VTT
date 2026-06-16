# Arquitectura

Mystic VTT usa una estructura hexagonal ligera:

- `src/domain`: entidades, puertos de repositorio y servicios puros.
- `src/application`: fabricas, DTOs y mutaciones de workspace.
- `src/infrastructure`: adaptadores para Supabase y modo demo local.
- `src/ui`: componentes React, paginas, layout y estilos.
- `supabase/migrations`: SQL versionable para tablas, RLS y storage.

La UI no decide permisos ni calcula reglas de ficha o distancias. Esas decisiones viven en servicios de dominio como `permissions`, `characterStats` y `battlemapGeometry`.

La segunda iteracion agrega:

- `BattleArea` para areas persistentes, editables y borrables del battlemap.
- `InventoryContainer` e `InventoryItem` para inventario no plano.
- Puertos `BattleAreaRepository`, `InventoryRepository` y `RealtimeRepository`.
- Casos de uso nombrados en `battleAreas.ts` e `inventory.ts`.
- `SupabaseRealtimeRepository` para escuchar cambios de areas, assets, tokens, turn order e inventario.
- `mapAssetDefinitions` como catalogo tactico extensible de assets de mapa.
