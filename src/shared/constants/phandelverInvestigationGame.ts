export type DossierIconId =
  | 'alert'
  | 'book'
  | 'calendar'
  | 'cipher'
  | 'eye'
  | 'flame'
  | 'footprints'
  | 'network'
  | 'shield'
  | 'skull'
  | 'spark'
  | 'swords'
  | 'target'

export type CultStatId = 'trace' | 'intent' | 'neutralize' | 'cover'

export interface CultStatDefinition {
  id: CultStatId
  label: string
  max: number
  icon: DossierIconId
  dangerAt: number
  detail: string
}

export interface StatDelta {
  stat: CultStatId
  delta: number
}

export interface InvestigationMove {
  id: string
  title: string
  icon: DossierIconId
  challenge: string
  tells: string[]
  success: string
  failure: string
  playerBuff?: string
  cultBuff?: string
  discoveryId?: string
  progress?: Array<{ clockId: string; delta: number }>
  cultStatsOnSuccess?: StatDelta[]
  cultStatsOnFailure?: StatDelta[]
}

export interface CultMove extends InvestigationMove {
  objective: string
  ifUnopposed: string
}

export interface StreetEvent extends InvestigationMove {
  kind: 'random'
}

export interface LocationInvestigation extends InvestigationMove {
  location: string
  kind: 'location'
}

export interface UnderworldSignal {
  id: string
  label: string
  icon: DossierIconId
  detail: string
}

export const cultStatDefinitions = [
  {
    id: 'trace',
    label: 'Rastro del grupo',
    max: 6,
    icon: 'footprints',
    dangerAt: 4,
    detail: 'Saben dónde duermen, qué rutas usan y quién les habla.',
  },
  {
    id: 'intent',
    label: 'Intenciones leídas',
    max: 6,
    icon: 'eye',
    dangerAt: 4,
    detail: 'Entienden si protegen a Boris, siguen el permiso o buscan la mansión.',
  },
  {
    id: 'neutralize',
    label: 'Neutralización',
    max: 6,
    icon: 'skull',
    dangerAt: 4,
    detail: 'Preparan accidente, descrédito, chantaje, veneno o emboscada limpia.',
  },
  {
    id: 'cover',
    label: 'Cobertura de la red',
    max: 6,
    icon: 'shield',
    dangerAt: 5,
    detail: 'Coartadas, negocios tapadera, testigos falsos y rutas limpias.',
  },
] satisfies CultStatDefinition[]

export const initialCultStats: Record<CultStatId, number> = {
  trace: 1,
  intent: 0,
  neutralize: 0,
  cover: 4,
}

export const cultMoves = [
  {
    id: 'map-party-routine',
    title: 'Mapear rutina del grupo',
    icon: 'eye',
    objective: 'Encontrarlos sin exponerse',
    challenge: 'Players lo detectan con Perception o Insight DC 14',
    tells: ['Un mismo vecino aparece cerca de dos escenas.', 'Un niño pregunta dónde cenarán sin motivo real.'],
    success: 'La secta pierde el seguimiento de ese día y los players ganan +1 a la próxima escena de calle.',
    failure: 'La red registra posada, aliados visitados y horario probable.',
    ifUnopposed: 'Sube Rastro del grupo. Si llega a 4, cada evento social empieza con alguien mirando.',
    playerBuff: 'Ventaja narrativa: una escena de vigilancia empieza con pista visible.',
    cultBuff: 'La próxima DC social sube +1 porque ya conocen rutinas.',
    cultStatsOnSuccess: [{ stat: 'trace', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'read-intentions',
    title: 'Leer intenciones',
    icon: 'book',
    objective: 'Averiguar qué buscan realmente',
    challenge: 'Engañarlos exige Deception DC 15 o una coartada sólida',
    tells: ['Preguntas amables sobre Gundren/Boris.', 'Un escribano insiste en saber qué documentos custodian.'],
    success: 'Los players plantan una intención falsa y pueden atraer un contacto menor.',
    failure: 'El Mata Osos deduce qué pista siguen y refuerza esa localización.',
    ifUnopposed: 'Sube Intenciones leídas. A 4, los alijos se mueven antes de que lleguen.',
    playerBuff: 'Cebo activo: puedes convertir una futura escena random en persecución de un agente.',
    cultBuff: 'La secta prepara una falsa pista en el lugar que más investiguen.',
    cultStatsOnSuccess: [{ stat: 'intent', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'intent', delta: 1 }],
  },
  {
    id: 'soft-neutralization',
    title: 'Neutralización discreta',
    icon: 'skull',
    objective: 'Sacarlos del tablero sin parecer culto',
    challenge: 'Detectar el plan exige Investigation DC 15 o proteger a un testigo',
    tells: ['Oferta demasiado cómoda.', 'Accidente preparado con cuerdas, barro o lámparas.'],
    success: 'Los players exponen un método y reducen la cobertura de la red.',
    failure: 'La secta gana material para chantaje, veneno o descrédito social.',
    ifUnopposed: 'Sube Neutralización. A 6, dispara una escena de asesinato, arresto falso o accidente grave.',
    playerBuff: 'Método expuesto: -1 cobertura de la red.',
    cultBuff: 'Amenaza preparada: el siguiente fallo player tiene una complicación extra.',
    cultStatsOnSuccess: [{ stat: 'cover', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'neutralize', delta: 1 }],
  },
  {
    id: 'move-evidence',
    title: 'Mover pruebas y alijos',
    icon: 'network',
    objective: 'Que una investigación buena llegue tarde',
    challenge: 'Interceptarlo exige Stealth/Survival DC 14 o vigilar la zona correcta',
    tells: ['Tiza blanca nueva.', 'Carro pequeño que no transporta nada visible.', 'Campanada fuera de hora.'],
    success: 'Conservan el alijo o interceptan una nota de movimiento.',
    failure: 'El alijo se vacía y una pista queda convertida en señuelo.',
    ifUnopposed: 'Sube Cobertura de la red o Rastro si el movimiento revela quién mira.',
    playerBuff: 'Nota interceptada: +1 al sistema de cifrado si la descifran.',
    cultBuff: 'Señuelo colocado: una investigación de lugar empieza con desventaja narrativa.',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnSuccess: [{ stat: 'cover', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
] satisfies CultMove[]

export const randomStreetEvents = [
  {
    id: 'street-spy',
    kind: 'random',
    title: 'Alguien los está siguiendo',
    icon: 'eye',
    challenge: 'Perception DC 13; persecución con Athletics/Acrobatics DC 14',
    tells: ['El mismo rostro pasa dos veces.', 'Una puerta se cierra cuando el último player gira la cabeza.'],
    success: 'Pillan a un observador menor o descubren hacia dónde corre.',
    failure: 'El observador marca tiza negra y la secta actualiza rutas del grupo.',
    playerBuff: 'Si lo capturan, +1 Sistema de Bhaal.',
    cultBuff: 'Si escapa, +1 Rastro del grupo.',
    discoveryId: 'caught-spy',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'pigeon-overhead',
    kind: 'random',
    title: 'Paloma con anilla de color',
    icon: 'cipher',
    challenge: 'Perception DC 14 para verla; Animal Handling o Survival DC 15 para seguirla',
    tells: ['Anilla azul o blanca.', 'No vuela a un tejado común, sino a una chimenea discreta.'],
    success: 'Descubren un tramo del sistema de palomares o una orden parcial.',
    failure: 'La paloma llega y la red recibe información sin oposición.',
    playerBuff: '+1 Sistema de cifrado si recuperan la anilla o copian el mensaje.',
    cultBuff: '+1 Intenciones leídas si la paloma informa de sus preguntas.',
    discoveryId: 'dovecote-roof',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'intent', delta: 1 }],
  },
  {
    id: 'chalk-change',
    kind: 'random',
    title: 'Marca de tiza cambia durante una conversación',
    icon: 'target',
    challenge: 'Perception DC 12 para verla; Investigation DC 14 para interpretar color y dirección',
    tells: ['Tiza azul antes de hablar.', 'Tiza roja si mencionan al permiso en público.'],
    success: 'Leen la señal y pueden saber si los observan, mueven paquete o limpian pruebas.',
    failure: 'Interpretan mal el color y siguen una pista señuelo.',
    playerBuff: '+1 Sistema de Bhaal o +1 Cifrado, a elección del DM.',
    cultBuff: 'La secta gana cobertura porque confirma qué tema les interesa.',
    discoveryId: 'chalk-color-crossing',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'false-help',
    kind: 'random',
    title: 'Ayuda demasiado conveniente',
    icon: 'spark',
    challenge: 'Insight DC 15 o Religion/History DC 14 según el disfraz',
    tells: ['Sabe demasiado sobre sus necesidades.', 'Evita nombres propios y ofrece justo lo que falta.'],
    success: 'Convierten la ayuda falsa en una pista hacia tapadera o agente.',
    failure: 'Aceptan una ruta, comida o información contaminada.',
    playerBuff: 'La próxima investigación de lugar empieza con una pista de entrada.',
    cultBuff: '+1 Neutralización si aceptan el recurso sin revisarlo.',
    cultStatsOnFailure: [{ stat: 'neutralize', delta: 1 }],
  },
  {
    id: 'cut-thread',
    kind: 'random',
    title: 'Hilo casi invisible en un callejón',
    icon: 'alert',
    challenge: 'Perception DC 15 o Thieves Tools DC 14',
    tells: ['Un hilo con polvo de carbón cruza una puerta baja.', 'Una campanilla no suena: avisa por vibración a otra casa.'],
    success: 'Detectan un sistema de alarma entre casas y ganan ruta inversa.',
    failure: 'El hilo se rompe y una sala se vacía antes de que lleguen.',
    playerBuff: 'Ruta inversa: +1 en una futura persecución urbana.',
    cultBuff: '+1 Cobertura de la red por evacuación limpia.',
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
] satisfies StreetEvent[]

export const locationInvestigations = [
  {
    id: 'investigate-tavern',
    kind: 'location',
    location: 'Taberna',
    title: 'Revisar caja, deudas y mesas de juego',
    icon: 'flame',
    challenge: 'Investigation DC 15 o Deception DC 16 fingiendo ser cobrador',
    tells: ['Clientes de mentira.', 'Recibos sin consumo real.', 'Monedas con olor a especias de carnicería.'],
    success: 'Descubren blanqueo, pagos a operativos y un recibo hacia la casa grande.',
    failure: 'El dueño avisa por miedo y la secta fabrica una deuda contra un aliado.',
    playerBuff: '+1 Sistema de Bhaal y pista hacia carnicería/casa grande.',
    cultBuff: '+1 Intenciones si preguntan sin tapadera.',
    discoveryId: 'laundering-tavern',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnSuccess: [{ stat: 'cover', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'intent', delta: 1 }],
  },
  {
    id: 'investigate-butcher',
    kind: 'location',
    location: 'Carnicería',
    title: 'Buscar limpieza de cuerpos y jerga de cortes',
    icon: 'skull',
    challenge: 'Perception DC 15, Investigation DC 16 o Stealth DC 15',
    tells: ['Olor metálico bajo especias.', 'Mesa con drenaje no comercial.', 'Pedido de “costillas limpias”.'],
    success: 'Encuentran la logística para desapariciones y una pieza del cifrado de oficio.',
    failure: 'El carnicero activa cierre de calle y mueve pruebas al frío.',
    playerBuff: '+1 Cifrado y +1 Sistema de Bhaal si documentan la sala.',
    cultBuff: '+1 Neutralización: saben que el grupo vio demasiado.',
    discoveryId: 'butcher-cleanup',
    progress: [
      { clockId: 'cipher-system', delta: 1 },
      { clockId: 'bhaal-system', delta: 1 },
    ],
    cultStatsOnFailure: [{ stat: 'neutralize', delta: 1 }],
  },
  {
    id: 'investigate-church',
    kind: 'location',
    location: 'Iglesia de Tymora',
    title: 'Detectar infiltrado y confesiones filtradas',
    icon: 'shield',
    challenge: 'Insight DC 15, Religion DC 14 o Investigation DC 16',
    tells: ['Ayuda que llega tarde.', 'Donaciones anotadas con frases raras.', 'Un devoto evita hablar de azar.'],
    success: 'Aíslan al infiltrado sin romper la confianza del pueblo.',
    failure: 'Acusan sin prueba y la secta gana cobertura social.',
    playerBuff: '+1 Acceso mansión si aparece “el réquiem abre abajo”.',
    cultBuff: '+1 Cobertura si dividen a la comunidad.',
    discoveryId: 'tymora-infiltrator',
    progress: [{ clockId: 'mansion-access', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'investigate-market',
    kind: 'location',
    location: 'Mercado',
    title: 'Observar pesos falsos, puestos y recaderos',
    icon: 'network',
    challenge: 'Investigation DC 14, Insight DC 13 o Sleight of Hand DC 15',
    tells: ['Pesas huecas con notas enrolladas.', 'Vendedores que repiten precios como claves.', 'Niños de recados cambiando cestas.'],
    success: 'Encuentran dead drops comerciales y una ruta de recaderos.',
    failure: 'Un paquete señuelo marca al player con polvo rojo.',
    playerBuff: '+1 Sistema de Bhaal; desbloquea alijo de identidad.',
    cultBuff: '+1 Rastro si el polvo rojo queda en ropa o manos.',
    discoveryId: 'identity-cache',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'investigate-roofs',
    kind: 'location',
    location: 'Tejados',
    title: 'Seguir espejos, palomar y ruta alta',
    icon: 'footprints',
    challenge: 'Acrobatics DC 14, Perception DC 14 o Survival DC 15',
    tells: ['Espejo pequeño junto a una chimenea.', 'Tejas sueltas colocadas como aviso.', 'Tiza verde bajo un tablón.'],
    success: 'Toman control temporal de una ruta de vigilancia.',
    failure: 'Rompen tejas, hacen ruido y la red aprende su ruta de entrada.',
    playerBuff: '+1 Cifrado si ven anillas o +1 Sistema si leen tiza verde.',
    cultBuff: '+1 Rastro por ruta comprometida.',
    discoveryId: 'parkour-shortcut',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'investigate-records',
    kind: 'location',
    location: 'Archivo / escribano',
    title: 'Auditar permisos, sellos y copias falsas',
    icon: 'book',
    challenge: 'Investigation DC 15, History DC 15 o Forgery Kit DC 14',
    tells: ['Dos tintas en una misma línea.', 'Sello demasiado perfecto.', 'Cargo municipal inexistente.'],
    success: 'Deducen cómo quieren desacreditar el permiso y dónde acabarán moviéndolo.',
    failure: 'El escribano avisa y una copia falsa entra en circulación.',
    playerBuff: '+1 Rastro del permiso.',
    cultBuff: '+1 Cobertura por documento señuelo.',
    discoveryId: 'assassination-cache',
    progress: [{ clockId: 'permit-trail', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'investigate-mansion',
    kind: 'location',
    location: 'Mansión',
    title: 'Vigilar piano, entradas y núcleo real',
    icon: 'target',
    challenge: 'Stealth DC 16, Investigation DC 16 o Religion DC 15',
    tells: ['Ocho notas repetidas.', 'Ventanas apagadas demasiado pronto.', 'Operativos que entran sin llamar.'],
    success: 'Confirman que el permiso termina debajo y que el piano abre la base.',
    failure: 'La mansión entra en cierre suave y mueve el archivo a versión señuelo.',
    playerBuff: '+1 Acceso mansión y +1 Rastro del permiso.',
    cultBuff: '+1 Neutralización: ya saben que el grupo mira la casa grande.',
    discoveryId: 'mansion-piano-final',
    progress: [
      { clockId: 'mansion-access', delta: 1 },
      { clockId: 'permit-trail', delta: 1 },
    ],
    cultStatsOnFailure: [{ stat: 'neutralize', delta: 1 }],
  },
] satisfies LocationInvestigation[]

export const underworldSignals = [
  { id: 'pigeons', label: 'Palomares', icon: 'cipher', detail: 'Anillas de color, grano teñido y órdenes que parecen inventario.' },
  { id: 'chalk', label: 'Tizas', icon: 'target', detail: 'Azul observa, blanco mueve, negro limpia, rojo hiere, verde abre ruta.' },
  { id: 'threads', label: 'Hilos', icon: 'alert', detail: 'Alarmas mudas entre callejones, puertas y pisos de paso.' },
  { id: 'stones', label: 'Piedras', icon: 'eye', detail: 'Vagabundos y niños comunican conteos sin saber leer.' },
  { id: 'butcher', label: 'Carnicería', icon: 'skull', detail: 'Lenguaje de cortes para cadáveres, pagos y desapariciones.' },
  { id: 'weights', label: 'Pesas huecas', icon: 'network', detail: 'Notas enrolladas dentro de pesos de mercado o medidas de grano.' },
  { id: 'candles', label: 'Velas de templo', icon: 'spark', detail: 'Color y altura de cera indican quién preguntó por ayuda.' },
  { id: 'wax-keys', label: 'Llaves de cera', icon: 'book', detail: 'Impresiones rápidas para entrar una noche sin forzar cerraduras.' },
  { id: 'mirrors', label: 'Espejos de tejado', icon: 'eye', detail: 'Destellos cortos entre chimeneas para avisar sin palomas.' },
  { id: 'laundry', label: 'Lavandería cifrada', icon: 'shield', detail: 'Ropa tendida como mapa de movimiento, peligro o reunión.' },
  { id: 'funeral-cart', label: 'Carro funerario', icon: 'skull', detail: 'Traslada cuerpos, armas o documentos bajo coartada de duelo.' },
  { id: 'loaded-dice', label: 'Dados marcados', icon: 'swords', detail: 'Mesas de juego como pagos, apuestas falsas y citas discretas.' },
] satisfies UnderworldSignal[]
