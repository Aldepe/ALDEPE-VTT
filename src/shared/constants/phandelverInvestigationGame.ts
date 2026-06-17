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
    label: 'Rastro',
    max: 6,
    icon: 'footprints',
    dangerAt: 4,
    detail: 'Saben dónde duermen, con quién hablan y qué rutas repiten.',
  },
  {
    id: 'intent',
    label: 'Intención',
    max: 6,
    icon: 'eye',
    dangerAt: 4,
    detail: 'Entienden qué buscan los players y qué quieren proteger.',
  },
  {
    id: 'neutralize',
    label: 'Amenaza',
    max: 6,
    icon: 'skull',
    dangerAt: 4,
    detail: 'Preparan chantaje, descrédito, accidente o ataque indirecto.',
  },
  {
    id: 'cover',
    label: 'Cobertura',
    max: 6,
    icon: 'shield',
    dangerAt: 5,
    detail: 'Coartadas, testigos falsos, rutas limpias y negocios tapadera.',
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
    id: 'watch-party',
    title: 'Vigilar al grupo',
    icon: 'eye',
    objective: 'Saber dónde están sin llamar la atención.',
    challenge: 'Perception o Insight DC 14 para detectar vigilancia.',
    tells: ['Un mismo vecino cruza dos escenas.', 'Un recadero se para cuando los players se giran.'],
    success: 'Los players detectan la vigilancia y pueden seguir al observador.',
    failure: 'La célula aprende dónde duermen o qué ruta repiten.',
    ifUnopposed: '+1 Rastro. A 4, cualquier escena social puede empezar con alguien mirando.',
    playerBuff: 'Próxima vigilancia: empiezan con una pista clara.',
    cultBuff: '+1 Rastro del grupo.',
    cultStatsOnSuccess: [{ stat: 'trace', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'test-intentions',
    title: 'Probar sus intenciones',
    icon: 'book',
    objective: 'Saber si investigan el permiso, la secta o solo a bandidos.',
    challenge: 'Deception DC 15 para mentir bien; Insight DC 14 para notar la trampa.',
    tells: ['Un vecino pregunta demasiado por Gundren/Boris.', 'Una ayuda casual intenta sacar nombres y planes.'],
    success: 'Los players dan una pista falsa o detectan qué les están preguntando.',
    failure: 'La célula refuerza el lugar que los players piensan visitar.',
    ifUnopposed: '+1 Intención. A 4, los alijos se mueven antes de que lleguen.',
    playerBuff: 'Pueden plantar un cebo en una localización.',
    cultBuff: '+1 Intención leída.',
    cultStatsOnSuccess: [{ stat: 'intent', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'intent', delta: 1 }],
  },
  {
    id: 'move-cache',
    title: 'Mover alijo',
    icon: 'network',
    objective: 'Vaciar una prueba antes de que la encuentren.',
    challenge: 'Vigilar la zona correcta o seguir un recadero: Stealth/Survival DC 14.',
    tells: ['Marca blanca nueva.', 'Dos personas cambian una caja pequeña sin mirarse.', 'Un mensaje corto pasa de mano en mano.'],
    success: 'Interceptan el traslado o llegan antes de que limpien el alijo.',
    failure: 'El alijo queda vacío y deja una pista señuelo.',
    ifUnopposed: '+1 Cobertura. Una localización tendrá una pista falsa.',
    playerBuff: 'Traslado interceptado: +1 Cifrado si guardan el mensaje.',
    cultBuff: '+1 Cobertura de la red.',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnSuccess: [{ stat: 'cover', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'isolate-witness',
    title: 'Aislar testigo',
    icon: 'skull',
    objective: 'Silenciar a alguien sin que parezca una operación criminal.',
    challenge: 'Identificar el objetivo: Investigation DC 15; protegerlo: Persuasion/Stealth DC 14.',
    tells: ['Un testigo deja de aparecer.', 'Un familiar recibe una amenaza educada.', 'Un negocio cierra antes de hora.'],
    success: 'El testigo queda protegido y revela una pieza menor de la red.',
    failure: 'El testigo desaparece, se calla o cambia su versión.',
    ifUnopposed: '+1 Amenaza. A 6, ocurre un accidente o ataque indirecto.',
    playerBuff: 'Testigo protegido: +1 Sistema de Bhaal.',
    cultBuff: '+1 Amenaza preparada.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnSuccess: [{ stat: 'neutralize', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'neutralize', delta: 1 }],
  },
  {
    id: 'burn-cover',
    title: 'Cerrar una ruta',
    icon: 'footprints',
    objective: 'Cambiar puertas, horarios y señales si una ruta parece comprometida.',
    challenge: 'Llegar antes del cierre: Acrobatics/Stealth DC 15.',
    tells: ['Un tablón desaparece.', 'Una puerta que siempre abría ahora tiene dos cerrojos.', 'Un recadero avisa sin hablar.'],
    success: 'Los players mantienen abierta la ruta y descubren quién la usa.',
    failure: 'La ruta se pierde hasta que encuentren otro acceso.',
    ifUnopposed: '+1 Cobertura y +1 Rastro si los players usaban esa ruta.',
    playerBuff: 'Ruta conservada: ventaja narrativa en persecución urbana.',
    cultBuff: '+1 Cobertura.',
    cultStatsOnSuccess: [{ stat: 'cover', delta: -1 }],
    cultStatsOnFailure: [
      { stat: 'cover', delta: 1 },
      { stat: 'trace', delta: 1 },
    ],
  },
  {
    id: 'plant-rumor',
    title: 'Plantar rumor',
    icon: 'spark',
    objective: 'Desviar sospechas hacia bandidos, deudas o conflictos mineros.',
    challenge: 'Investigation o Insight DC 14 para seguir de dónde sale el rumor.',
    tells: ['Tres personas repiten la misma frase.', 'La historia tiene detalles demasiado limpios.', 'Un rumor empieza justo tras una pregunta incómoda.'],
    success: 'Los players localizan el punto donde nació el rumor.',
    failure: 'La reputación del grupo o de un aliado queda tocada.',
    ifUnopposed: '+1 Cobertura. La próxima escena social empieza con desconfianza.',
    playerBuff: 'Rumor rastreado: acceso a un informante menor.',
    cultBuff: '+1 Cobertura social.',
    cultStatsOnSuccess: [{ stat: 'cover', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
] satisfies CultMove[]

export const randomStreetEvents = [
  {
    id: 'street-spy',
    kind: 'random',
    title: 'Los espían',
    icon: 'eye',
    challenge: 'Perception DC 13; si huye, Athletics/Acrobatics DC 14.',
    tells: ['El mismo rostro aparece dos veces.', 'Alguien deja de hablar cuando se acercan.'],
    success: 'Pillan a un observador menor o descubren hacia dónde corre.',
    failure: 'El observador informa de ruta y compañía.',
    playerBuff: '+1 Sistema de Bhaal si lo capturan vivo.',
    cultBuff: '+1 Rastro.',
    discoveryId: 'caught-spy',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'pigeon-overhead',
    kind: 'random',
    title: 'Ven una paloma marcada',
    icon: 'cipher',
    challenge: 'Perception DC 14 para verla; Survival DC 15 para seguirla.',
    tells: ['Anilla de color oscuro.', 'Vuela hacia un tejado que no parece palomar público.'],
    success: 'Encuentran una ruta de mensajes o copian una orden parcial.',
    failure: 'El mensaje llega y la célula actualiza instrucciones.',
    playerBuff: '+1 Cifrado. Desbloquea intento de interceptar una comunicación futura.',
    cultBuff: '+1 Intención si el mensaje habla de ellos.',
    discoveryId: 'dovecote-roof',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'intent', delta: 1 }],
  },
  {
    id: 'chalk-change',
    kind: 'random',
    title: 'Cambia una marca de tiza',
    icon: 'target',
    challenge: 'Perception DC 12 para verla; Investigation DC 14 para entender color y dirección.',
    tells: ['La marca aparece tras hacer preguntas.', 'Un niño pasa cerca con la mano manchada.'],
    success: 'Leen si los observan, mueven algo o limpian una prueba.',
    failure: 'Siguen una marca equivocada o llegan tarde.',
    playerBuff: '+1 Sistema de Bhaal o +1 Cifrado.',
    cultBuff: '+1 Cobertura.',
    discoveryId: 'chalk-color-crossing',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'runner-relay',
    kind: 'random',
    title: 'Relevo de recaderos',
    icon: 'footprints',
    challenge: 'Insight DC 13 para notar el relevo; Stealth DC 14 para seguirlos.',
    tells: ['Dos recaderos no se miran, pero cambian de dirección a la vez.', 'Uno toca el marco de una puerta antes de correr.'],
    success: 'Siguen la cadena hasta una puerta, una ruta o un dead drop.',
    failure: 'La cadena se corta y alguien marca al grupo como curioso.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Rastro.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'silent-signal',
    kind: 'random',
    title: 'Señal muda en tejado',
    icon: 'network',
    challenge: 'Perception DC 15 o Investigation DC 15.',
    tells: ['Un paño oscuro aparece y desaparece en una ventana alta.', 'Alguien responde con dos golpes secos desde otra calle.'],
    success: 'Descubren un sistema de señales corto y pueden interceptarlo otro día.',
    failure: 'La señal se completa y una ruta se cierra.',
    playerBuff: '+1 Cifrado. Desbloquea interceptar una comunicación.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
] satisfies StreetEvent[]

export const locationInvestigations = [
  {
    id: 'stonehill-inn',
    kind: 'location',
    location: 'Stonehill Inn',
    title: 'Escuchar rumores y clientes repetidos',
    icon: 'eye',
    challenge: 'Insight DC 13 o Persuasion DC 14.',
    tells: ['Un parroquiano cambia de mesa para oír mejor.', 'Alguien pregunta por la ruta del grupo sin disimular bien.'],
    success: 'Encuentran qué rumores son plantados y quién los repite.',
    failure: 'La célula sabe con quién han hablado.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Rastro.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'barthen-provisions',
    kind: 'location',
    location: 'Barthen Provisions',
    title: 'Revisar suministros y encargos',
    icon: 'book',
    challenge: 'Investigation DC 14 o Persuasion DC 13.',
    tells: ['Pedidos pequeños repetidos.', 'Cuerda, cera y papel comprados por gente distinta.'],
    success: 'Deducen qué materiales usa la red para mensajes y alijos.',
    failure: 'Un comprador falso se entera de que revisan suministros.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Intención.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'intent', delta: 1 }],
  },
  {
    id: 'lionshield-coster',
    kind: 'location',
    location: 'Lionshield Coster',
    title: 'Comprobar armas, cajas y rutas de carga',
    icon: 'swords',
    challenge: 'Investigation DC 15 o Intimidation/Persuasion DC 14.',
    tells: ['Caja con marcas raspadas.', 'Inventario que no coincide con lo entregado.'],
    success: 'Ubican un movimiento de armas o equipo de pelea.',
    failure: 'Una caja comprometida desaparece esa noche.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'miners-exchange',
    kind: 'location',
    location: 'Miner Exchange',
    title: 'Seguir pagos y deudas mineras',
    icon: 'network',
    challenge: 'Investigation DC 15 o Insight DC 14.',
    tells: ['Deuda pagada por un desconocido.', 'Un minero cambia de versión al hablar del permiso.'],
    success: 'Encuentran dinero usado para comprar silencios.',
    failure: 'La célula planta una deuda falsa contra un aliado.',
    playerBuff: '+1 Rastro del permiso.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'permit-trail', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'townmaster-hall',
    kind: 'location',
    location: 'Ayuntamiento',
    title: 'Auditar permisos y registros',
    icon: 'book',
    challenge: 'Investigation DC 15, History DC 15 o Forgery Kit DC 14.',
    tells: ['Dos tintas en una misma línea.', 'Una copia no coincide con el orden del archivo.'],
    success: 'Descubren cómo quieren retrasar, copiar o desacreditar el permiso.',
    failure: 'Un registro señuelo entra en circulación.',
    playerBuff: '+1 Rastro del permiso.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'permit-trail', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'shrine-luck',
    kind: 'location',
    location: 'Santuario de Tymora',
    title: 'Buscar filtraciones y confesiones repetidas',
    icon: 'shield',
    challenge: 'Insight DC 15, Religion DC 14 o Investigation DC 16.',
    tells: ['Una ayuda llega tarde.', 'Un devoto recuerda demasiados detalles de confesiones ajenas.'],
    success: 'Aíslan al infiltrado sin romper la confianza del pueblo.',
    failure: 'La comunidad se divide y la red gana cobertura social.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'alderleaf-farm',
    kind: 'location',
    location: 'Alderleaf Farm',
    title: 'Preguntar por recaderos y rutas pequeñas',
    icon: 'footprints',
    challenge: 'Persuasion DC 13 o Survival DC 14.',
    tells: ['Niños que saben demasiados atajos.', 'Huellas pequeñas hacia una cerca rota.'],
    success: 'Consiguen mapa de recaderos sin criminalizar a los niños.',
    failure: 'Un recadero avisa de que están haciendo preguntas.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Rastro.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'edermath-orchard',
    kind: 'location',
    location: 'Edermath Orchard',
    title: 'Vigilar caminos laterales y viejos contactos',
    icon: 'eye',
    challenge: 'Survival DC 14 o Perception DC 14.',
    tells: ['Ramas cortadas como referencia de ruta.', 'Un sendero se pisa solo de noche.'],
    success: 'Encuentran una ruta de entrada/salida del pueblo.',
    failure: 'La ruta cambia antes de que puedan usarla.',
    playerBuff: 'Ventaja narrativa en persecución urbana.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'sleeping-giant',
    kind: 'location',
    location: 'Sleeping Giant',
    title: 'Revisar blanqueo y pagos violentos',
    icon: 'flame',
    challenge: 'Investigation DC 15 o Deception DC 16 fingiendo ser cobrador.',
    tells: ['Clientes que no beben.', 'Recibos sin comida.', 'Un pago coincide con una desaparición.'],
    success: 'Conectan dinero, matones y una tapadera de la red.',
    failure: 'El dueño avisa por miedo y prepara una coartada falsa.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Intención.',
    discoveryId: 'laundering-tavern',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnSuccess: [{ stat: 'cover', delta: -1 }],
    cultStatsOnFailure: [{ stat: 'intent', delta: 1 }],
  },
  {
    id: 'tresendar-manor',
    kind: 'location',
    location: 'Mansión Tresendar',
    title: 'Vigilar entradas, guardias y horarios',
    icon: 'target',
    challenge: 'Stealth DC 17 o Investigation DC 17. Mejor usarla cuando ya tengan pistas.',
    tells: ['Luces apagadas por turnos.', 'Guardias que no patrullan como bandidos.', 'Una ruta evita la puerta principal.'],
    success: 'Confirman que hay una base bajo la mansión o una zona sellada.',
    failure: 'La mansión entra en alerta suave y cambia horarios.',
    playerBuff: '+1 Acceso a la base o +1 Rastro del permiso.',
    cultBuff: '+1 Amenaza.',
    progress: [{ clockId: 'mansion-access', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'neutralize', delta: 1 }],
  },
  {
    id: 'phandalin-streets',
    kind: 'location',
    location: 'Calles y plaza',
    title: 'Leer patrones de vigilancia',
    icon: 'eye',
    challenge: 'Perception DC 13 o Investigation DC 14.',
    tells: ['El mismo vendedor mira siempre al mismo callejón.', 'Un barril cambia de sitio sin motivo.'],
    success: 'Identifican un patrón de observadores y rutas cortas.',
    failure: 'La red nota que están mirando demasiado.',
    playerBuff: '+1 Sistema de Bhaal.',
    cultBuff: '+1 Rastro.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
  {
    id: 'dovecotes',
    kind: 'location',
    location: 'Palomares',
    title: 'Localizar mensajes y anillas',
    icon: 'cipher',
    challenge: 'Perception DC 14, Survival DC 15 o Thieves Tools DC 14.',
    tells: ['Palomas con anillas discretas.', 'Grano teñido en una bolsa pequeña.', 'Una trampilla con cuerda de alarma.'],
    success: 'Copian un mensaje y aprenden cómo interceptar el siguiente.',
    failure: 'El palomar se mueve o cambia sus rutas durante un día.',
    playerBuff: '+1 Cifrado. Desbloquea interceptar comunicación.',
    cultBuff: '+1 Cobertura.',
    discoveryId: 'dovecote-roof',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'butcher-shop',
    kind: 'location',
    location: 'Carnicería',
    title: 'Buscar limpieza de cuerpos y pedidos cifrados',
    icon: 'skull',
    challenge: 'Perception DC 15, Investigation DC 16 o Stealth DC 15.',
    tells: ['Olor metálico bajo especias.', 'Mesa con drenaje no comercial.', 'Pedido de “costillas limpias”.'],
    success: 'Encuentran logística de desapariciones y una clave de jerga.',
    failure: 'El carnicero limpia pruebas y avisa a la red.',
    playerBuff: '+1 Cifrado y +1 Sistema de Bhaal.',
    cultBuff: '+1 Amenaza.',
    discoveryId: 'butcher-cleanup',
    progress: [
      { clockId: 'cipher-system', delta: 1 },
      { clockId: 'bhaal-system', delta: 1 },
    ],
    cultStatsOnFailure: [{ stat: 'neutralize', delta: 1 }],
  },
  {
    id: 'laundry',
    kind: 'location',
    location: 'Lavandería',
    title: 'Revisar bolsas, turnos y ropa marcada',
    icon: 'shield',
    challenge: 'Investigation DC 14 o Sleight of Hand DC 15.',
    tells: ['Ropa de varias casas entregada por una sola persona.', 'Bolsas atadas con nudos repetidos.', 'Manchas lavadas con demasiada prisa.'],
    success: 'Descubren una ruta para mover ropa, identidades y mensajes pequeños.',
    failure: 'La lavandería cambia nudos y deja de usar esa ruta.',
    playerBuff: '+1 Cifrado o +1 Sistema de Bhaal.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'bakery',
    kind: 'location',
    location: 'Horno',
    title: 'Comprobar trastienda y campanadas',
    icon: 'footprints',
    challenge: 'Perception DC 13 o Stealth DC 14.',
    tells: ['Una campanada abre una puerta trasera.', 'Harina en botas de alguien que no trabaja allí.'],
    success: 'Confirman una ruta rápida entre calles.',
    failure: 'La ruta cambia de horario.',
    playerBuff: 'Ventaja narrativa en persecución o entrada discreta.',
    cultBuff: '+1 Cobertura.',
    progress: [{ clockId: 'bhaal-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'cover', delta: 1 }],
  },
  {
    id: 'rooftops-alleys',
    kind: 'location',
    location: 'Tejados y callejones',
    title: 'Seguir rutas altas y señales cortas',
    icon: 'network',
    challenge: 'Acrobatics DC 14, Perception DC 15 o Survival DC 14.',
    tells: ['Tejas limpias en un punto concreto.', 'Golpes cortos entre dos casas.', 'Marcas pequeñas en postes.'],
    success: 'Toman control temporal de una ruta de observadores.',
    failure: 'Hacen ruido y la red aprende su ruta.',
    playerBuff: '+1 Sistema de Bhaal o +1 Cifrado.',
    cultBuff: '+1 Rastro.',
    progress: [{ clockId: 'cipher-system', delta: 1 }],
    cultStatsOnFailure: [{ stat: 'trace', delta: 1 }],
  },
] satisfies LocationInvestigation[]

export const underworldSignals = [
  { id: 'pigeons', label: 'Palomares', icon: 'cipher', detail: 'Anillas, grano teñido y mensajes cortos que parecen pedidos.' },
  { id: 'chalk', label: 'Tiza', icon: 'target', detail: 'Marcas pequeñas en esquinas: observar, mover, limpiar o peligro.' },
  { id: 'knots', label: 'Nudos', icon: 'network', detail: 'Cordeles en bolsas o cestas indican ruta, prioridad y contacto.' },
  { id: 'door-nicks', label: 'Muescas', icon: 'book', detail: 'Rayas en marcos y postes; duran más que la tiza y parecen desgaste.' },
  { id: 'runner-chain', label: 'Relevos', icon: 'footprints', detail: 'Niños, mozos y vagabundos pasan frases de una sola línea.' },
  { id: 'roof-cloth', label: 'Paños altos', icon: 'eye', detail: 'Ventanas y tendederos comunican seguro, peligro o reunión.' },
  { id: 'tap-code', label: 'Golpes', icon: 'alert', detail: 'Dos o tres golpes en puertas, barriles o paredes para aviso inmediato.' },
  { id: 'dead-drops', label: 'Dead drops', icon: 'shield', detail: 'Huecos en leña, zócalos, cubos y piedras junto a rutas reales.' },
  { id: 'laundry-tags', label: 'Etiquetas de ropa', icon: 'spark', detail: 'Iniciales falsas y nudos para mover mensajes sin palomar.' },
  { id: 'route-phrases', label: 'Frases de paso', icon: 'swords', detail: 'Frases inocentes que abren trastiendas o cambian turnos.' },
] satisfies UnderworldSignal[]
