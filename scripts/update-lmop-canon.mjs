import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const dotEnv = readDotEnv('.env.local')

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? dotEnv.VITE_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  dotEnv.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL and a Supabase key.')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

const now = new Date().toISOString()

const text = (...paragraphs) => paragraphs.join('\n\n')

const loreDefinitions = [
  {
    key: 'borisKamenov',
    fallbackId: 'lmop_person_boris_kamenov',
    aliases: ['Gundren Rockseeker', 'Gundrenn Rockseeker', 'Gundren', 'Gundrenn', 'Rockseeker'],
    type: 'person',
    name: 'Boris Kamenov',
    publicFields: {
      descripcion:
        'Enano de las montañas de apellido antiguo, práctico y con olfato para el beneficio. Boris viaja hacia Phandalin con documentos heredados que lo señalan como propietario legítimo de las tierras mineras donde se oculta la Cueva del Eco.',
      traitsMotivations:
        'Oportunista, ambicioso y rápido para vender una idea si huele oro. Quiere demostrar su derecho legal ante Phandalin y convertir unos papeles familiares en una fortuna, aunque sabe que no todos aceptarán su reclamación en silencio.',
      routine:
        'Se mueve con escolta, guarda sus papeles cerca del cuerpo y evita explicar todos los detalles del trato. Confía en sus hermanos Kamenov, pero no en los funcionarios que aparecieron de pronto cuando las minas volvieron a tener valor.',
    },
    secret:
      'Boris desciende de los enanos de las montañas que firmaron el Pacto de Phandelver. Su familia conservó durante generaciones los papeles de propiedad de las tierras de minería de la Cueva del Eco. La Alianza de los Lores lo ha contactado porque perdió sus propios permisos y necesita su documento para recuperar control legal sobre la zona. Le han ofrecido una gran suma y un porcentaje de lo extraído.',
  },
  {
    key: 'kamenovBrothers',
    fallbackId: 'lmop_person_hermanos_kamenov',
    aliases: ['Nundro Rockseeker', 'Tharden Rockseeker', 'Rockseeker brothers', 'hermanos Rockseeker'],
    type: 'person',
    name: 'Los hermanos Kamenov',
    publicFields: {
      descripcion:
        'Dimitri Kamenov e Ivan Kamenov, hermanos de Boris, comparten la herencia familiar y el derecho sobre los documentos mineros.',
      traitsMotivations:
        'Son menos diplomáticos que Boris y más directos con la idea de reclamar lo que consideran suyo. Ven la mina como una restitución histórica y como una oportunidad irrepetible.',
      routine:
        'Operan cerca de las rutas mineras y de los contactos de Boris. Sus movimientos son discretos porque demasiadas facciones han empezado a interesarse por la Cueva del Eco.',
    },
    secret:
      'Los tres hermanos recibieron los papeles al mismo tiempo. Si Boris cae, Dimitri e Ivan aún pueden reclamar el derecho familiar, algo que varias facciones no han calculado bien.',
  },
  {
    key: 'phandelverPact',
    fallbackId: 'lmop_event_pacto_de_phandelver',
    aliases: ['Pacto de Phandelver', "Phandelver's Pact", 'Phandelver Pact', 'pacto de la mina', 'pacto de las minas'],
    type: 'event',
    name: 'Pacto de Phandelver',
    publicFields: {
      descripcion:
        'Antiguo acuerdo minero y arcano firmado entre humanos, altos elfos y enanos de las montañas. El pacto legitimaba la explotación de las tierras de la Cueva del Eco y repartía derechos, deberes y beneficios.',
      significance:
        'La Alianza de los Lores se presenta como heredera política de aquel acuerdo, pero perdió los permisos de las tierras. Los documentos de la familia Kamenov son ahora la pieza legal que puede devolver valor al pacto.',
      aftermath:
        'La pérdida de permisos empujó a representantes de la Alianza a volver a Phandalin. El documento de Boris puede reactivar viejas reclamaciones, viejas deudas y viejos odios.',
    },
    secret:
      'No hubo gnomos en el pacto original. La versión correcta implica a humanos, altos elfos y enanos de las montañas. Cualquier registro que incluya gnomos es una copia contaminada, propaganda o un error útil para esconder la línea legal real.',
  },
  {
    key: 'waveEchoCave',
    fallbackId: 'lmop_zone_cueva_del_eco',
    aliases: ['Cueva del Eco', 'Wave Echo Cave', 'Wave Echo', 'Mina de Phandelver'],
    type: 'zone',
    name: 'Cueva del Eco',
    publicFields: {
      historia:
        'Complejo minero legendario bajo tierras reclamadas por la familia Kamenov. Su valor no está solo en el mineral: los relatos hablan de resonancias arcanas, forjas antiguas y pactos que unieron a humanos, altos elfos y enanos de las montañas.',
      cultura:
        'Para Phandalin es una promesa de prosperidad y una amenaza. Quien controle la cueva podría reconstruir el pueblo o convertirlo en un tablero de facciones.',
    },
    secret:
      'La Sangre de Bhaal no busca solo riqueza. Si Nezznar controla la cueva, puede usar sus recursos para financiar una purga filosófica contra toda vida racional.',
  },
  {
    key: 'lordsAlliance',
    fallbackId: 'lmop_organization_alianza_de_los_lores',
    aliases: ['Lord Alliance', "Lord's Alliance", "Lords' Alliance", 'Lords Alliance', 'Alianza de Lords', 'Alianza de los Lores'],
    type: 'organization',
    name: 'Alianza de los Lores',
    publicFields: {
      description:
        'Coalición política que intenta recuperar influencia en Phandalin y sobre las tierras de la Cueva del Eco. Sus enviados actúan con barniz legal, bolsas de oro y contratos cuidadosamente redactados.',
      historyStructure:
        'La Alianza afirma descender institucionalmente de quienes respaldaron el Pacto de Phandelver. Como perdió los permisos originales de esas tierras, ahora necesita los papeles de la familia Kamenov. Ha ofrecido a Boris una gran cantidad de dinero y un porcentaje de lo recolectado.',
    },
    secret:
      'Hace años enviaron a Iarno Albrek para encontrar los papeles perdidos. Nadie en la Alianza sabe que terminó corrupto, manipulado por la Sangre de Bhaal y muerto antes de poder rendir cuentas.',
  },
  {
    key: 'bronzeRings',
    fallbackId: 'lmop_organization_anillos_de_bronce',
    aliases: ['Cragmaw', 'Cragmaw Goblins', 'Cragmaw tribe', 'Tribu Cragmaw', 'Castillo Cragmaw'],
    type: 'organization',
    name: 'Anillos de Bronce',
    publicFields: {
      description:
        'Red dispersa de bandidos, ladrones, saqueadores y matones de poca monta que opera por la Costa de la Espada. Sus miembros incluyen humanos, goblins, orcos y humanoides hiena.',
      historyStructure:
        'No son una gran potencia, pero sí una herramienta útil: baratos, violentos y fáciles de negar. Los lidera Rey Gral, un etin de dos cabezas cuya brutalidad mantiene unida a la banda más por miedo que por lealtad.',
    },
    secret:
      'Los Anillos de Bronce fueron contratados por la Sangre de Bhaal para impedir que Boris Kamenov llegue a Phandalin. La subcontratación existe para que nadie pueda relacionar directamente el ataque con la secta.',
  },
  {
    key: 'kingGral',
    fallbackId: 'lmop_creature_rey_gral',
    aliases: ['King Grol', 'King Gral', 'Rey Grol', 'Rey Gral'],
    type: 'creature',
    name: 'Rey Gral',
    publicFields: {
      descripcion:
        'Etin de dos cabezas y líder visible de los Anillos de Bronce. Una cabeza negocia con gruñidos calculados; la otra prefiere romper huesos para ahorrar tiempo.',
      comportamiento:
        'Dirige por intimidación y reparte botín de forma caprichosa. Entiende que sus patronos son peligrosos, pero cree que puede cobrar sin convertirse en pieza sacrificable.',
      habilidades:
        'Fuerza enorme, vigilancia constante gracias a sus dos cabezas y una resistencia absurda para un jefe de bandidos.',
    },
    secret:
      'Rey Gral no conoce toda la filosofía de la Sangre de Bhaal. Cree que le pagan por secuestrar a un enano y cortar una ruta, no por participar en una purga religiosa de largo alcance.',
  },
  {
    key: 'hogger',
    fallbackId: 'lmop_creature_hogger',
    aliases: ['Klarg', 'Hogger'],
    type: 'creature',
    name: 'Hogger',
    publicFields: {
      descripcion:
        'Matón brutal de los Anillos de Bronce, famoso por emboscar viajeros y presumir de fuerza delante de subordinados más asustados que leales.',
      comportamiento:
        'Prefiere ataques simples, ruido, intimidación y trofeos arrancados a sus víctimas. Es el tipo de enemigo que convierte una emboscada menor en una escena sangrienta.',
      habilidades:
        'Carga salvaje, olfato de depredador y una capacidad irritante para sobrevivir a golpes que tumbarían a un bandido normal.',
    },
    secret:
      'Hogger sustituye a Klarg como responsable operativo de las primeras emboscadas contra la caravana de Boris.',
  },
  {
    key: 'bloodOfBhaal',
    fallbackId: 'lmop_organization_sangre_de_bhaal',
    aliases: ['Redbrand', 'Redbrands', 'Red Brand', 'Red Brands', 'Ruffians', 'Sangre de Bhaal'],
    type: 'organization',
    name: 'Sangre de Bhaal',
    publicFields: {
      description:
        'Facción secreta de seguidores de Bhaal que actúa desde las sombras. Donde otros cultos buscan poder, la Sangre de Bhaal busca una conclusión: el fin de toda criatura racional.',
      historyStructure:
        'Su doctrina afirma que las especies racionales han corrompido la existencia con egoísmo, memoria, deseo de dominio y justificaciones morales. Para ellos, asesinar no es solo violencia: es una cirugía metafísica para reiniciar el mundo. Animales y seres no inteligentes quedan fuera de su condena.',
    },
    secret:
      'Detestan a paladines, sanadores y cualquiera que prolongue el sufrimiento de una existencia que consideran fallida. Aceptan una paradoja terrible: cuando la purga termine, los propios seguidores de Bhaal también deberán morir. Nezznar lidera la facción desde las sombras.',
  },
  {
    key: 'nezznar',
    fallbackId: 'lmop_person_nezznar',
    aliases: ['Nezznar', 'Black Spider', 'Araña Negra', 'The Black Spider'],
    type: 'person',
    name: 'Nezznar',
    publicFields: {
      descripcion:
        'Figura paciente, culta y peligrosa que prefiere mover símbolos, contratos y miedo antes que aparecer en persona. Su nombre circula como rumor, no como rostro.',
      traitsMotivations:
        'Lidera la Sangre de Bhaal y cree que la razón es la enfermedad original del mundo. Quiere la Cueva del Eco para convertir riqueza, magia y desesperación en una maquinaria de exterminio selectivo.',
      routine:
        'Opera mediante intermediarios, documentos falsos, bandas subcontratadas y agentes corrompidos. Cuando alguien descubre una capa de la conspiración, Nezznar ya suele haber preparado otra encima.',
    },
    secret:
      'Nezznar es el líder en las sombras de la Sangre de Bhaal. Los Anillos de Bronce, la corrupción de Iarno y los movimientos contra Boris forman parte de una misma cadena de negación plausible.',
  },
  {
    key: 'iarno',
    fallbackId: 'lmop_person_iarno_albrek',
    aliases: ['Iarno', 'Iarno Albrek', 'Glasstaff', 'Vara de Cristal'],
    type: 'person',
    name: 'Iarno Albrek',
    publicFields: {
      descripcion:
        'Antiguo agente de la Alianza de los Lores enviado a Phandalin para investigar los papeles perdidos de las tierras mineras.',
      traitsMotivations:
        'Fue escogido por su discreción y su capacidad para moverse entre archivos, tabernas y ruinas sin levantar demasiada sospecha.',
      routine:
        'No responde a mensajes recientes. Para la Alianza, eso significa retraso o incompetencia; para quienes conocen la verdad, significa algo mucho peor.',
    },
    secret:
      'Iarno fue corrompido por la Sangre de Bhaal y convertido en un títere útil. Murió hace poco, pero nadie de la Alianza lo sabe todavía. Su corrupción debe permanecer oculta hasta que la investigación de los jugadores la descubra.',
  },
  {
    key: 'sildar',
    fallbackId: 'lmop_person_sildar_hallwinter',
    aliases: ['Sildar', 'Sildar Hallwinter'],
    type: 'person',
    name: 'Sildar Hallwinter',
    publicFields: {
      descripcion:
        'Alto elfo de la Orden del Guantelete, devoto de Tyr, contratado por la Alianza de los Lores para escoltar a Boris Kamenov y contactar con Iarno Albrek en Phandalin.',
      traitsMotivations:
        'Cree en justicia, deber y verdad documentada. No trabaja para la Alianza por ambición política, sino porque ve en el encargo una forma de impedir abusos sobre Phandalin.',
      routine:
        'Viaja como escolta y enviado. Busca a Iarno sin saber que está corrupto ni que ha muerto recientemente.',
    },
    secret:
      'Sildar será especialmente vulnerable a la filosofía de la Sangre de Bhaal porque esta detesta a quienes, como él, creen que el sufrimiento puede redimirse con justicia.',
  },
  {
    key: 'reidoth',
    fallbackId: 'lmop_person_reidoth',
    aliases: ['Reidoth'],
    type: 'person',
    name: 'Reidoth',
    publicFields: {
      descripcion:
        'Druida del Enclave Esmeralda que observa los movimientos de la región desde bosques, ruinas y senderos poco usados.',
      traitsMotivations:
        'Investiga la posibilidad de que Venomfang esté planeando algo peligroso. No quiere matar al dragón por impulso; quiere entender si su presencia amenaza el equilibrio natural.',
      routine:
        'Se mueve sin anunciarse, habla con animales, escucha rumores de frontera y evita las ciudades salvo cuando una amenaza exige intervención.',
    },
    secret:
      'Reidoth sospecha que los movimientos de Venomfang podrían conectarse con el caos político alrededor de Phandalin, aunque todavía no tiene pruebas claras.',
  },
  {
    key: 'sisterGaraele',
    fallbackId: 'lmop_person_sister_garaele',
    aliases: ['Sister Garaele', 'Hermana Garaele', 'Garaele'],
    type: 'person',
    name: 'Sister Garaele',
    publicFields: {
      descripcion:
        'Acólita discreta y observadora que parece más preocupada por pequeños gestos del pueblo que por grandes discursos religiosos.',
      traitsMotivations:
        'Investiga la posibilidad de que haya una secta peligrosa operando en Phandalin. Sabe que una amenaza así no empieza con altares de sangre, sino con silencios, desapariciones y cambios de conducta.',
      routine:
        'Pregunta poco, escucha mucho y compara rumores. Busca patrones en actos que otros descartan como violencia común.',
    },
    secret:
      'Sus sospechas apuntan hacia una estructura más profunda que simples matones. Si conecta las piezas, puede descubrir que la Sangre de Bhaal usa a otros grupos como pantalla.',
  },
  {
    key: 'phandalin',
    fallbackId: 'lmop_zone_phandalin',
    aliases: ['Phandalin'],
    type: 'zone',
    name: 'Phandalin',
    publicFields: {
      historia:
        'Pueblo fronterizo reconstruido sobre viejas oportunidades mineras. La llegada de la Alianza de los Lores, los papeles de Boris Kamenov y los rumores sobre la Cueva del Eco han convertido sus calles en un punto de presión política.',
      cultura:
        'Sus vecinos quieren prosperidad, pero también temen que los nuevos contratos atraigan violencia. Entre tabernas, almacenes y caminos embarrados, todos saben algo y casi nadie sabe bastante.',
    },
    secret:
      'La Sangre de Bhaal opera en Phandalin bajo capas de intimidación y filosofía torcida. No todos sus colaboradores entienden que la facción planea matar incluso a sus propios creyentes al final.',
  },
  {
    key: 'venomfang',
    fallbackId: 'lmop_creature_venomfang',
    aliases: ['Venomfang', 'Colmillo Venenoso'],
    type: 'creature',
    name: 'Venomfang',
    publicFields: {
      descripcion:
        'Dragón cuya presencia inquieta al Enclave Esmeralda. Su inteligencia, paciencia y apetito territorial lo vuelven más peligroso que una simple bestia.',
      comportamiento:
        'Observa antes de actuar. Si está planeando algo, probablemente usará el miedo y la ambición de otros antes que exponerse.',
      habilidades:
        'Veneno, vuelo, manipulación y una lectura instintiva de cuándo una región está demasiado dividida para defenderse bien.',
    },
    secret:
      'Reidoth investiga si Venomfang está aprovechando la inestabilidad de Phandalin o si prepara una jugada propia alrededor de la Cueva del Eco.',
  },
]

const definitionByKey = new Map(loreDefinitions.map((definition) => [definition.key, definition]))

overrideDefinition('borisKamenov', {
  publicFields: {
    descripcion: text(
      'Enano de las montañas, heredero de un apellido venido a menos y de una carpeta de documentos que parecia inutil hasta que la Cueva del Eco volvio a tener valor politico.',
      'Boris Kamenov no es un heroe accidental: es un oportunista inteligente. Entiende que la historia, cuando esta firmada y sellada, puede convertirse en propiedad, credito y poder.',
    ),
    traitsMotivations: text(
      'Quiere demostrar ante Phandalin que su familia es propietaria legitima de las tierras mineras. No lo mueve solo la codicia; tambien lo mueve el resentimiento de generaciones que conservaron unos papeles mientras otros se reian de ellos.',
      'Su defecto central es confundir legitimidad con derecho moral. Para Boris, si el documento es verdadero, el mundo debe doblarse ante el documento. Esa rigidez lo vuelve vulnerable a trampas legales, orgullo familiar y promesas de la Alianza de los Lores.',
    ),
    routine: text(
      'Viaja con escolta y guarda los papeles cerca del cuerpo. Habla demasiado cuando cree estar ganando una negociacion y calla demasiado cuando teme que alguien entienda el valor real de su herencia.',
      'Sus hermanos Dimitri e Ivan son su red de confianza. Si Boris cae, la reclamacion no muere con el.',
    ),
  },
  secret: text(
    'Boris desciende de los enanos de las montañas que firmaron el Pacto de Phandelver. Su familia heredo los papeles de propiedad de las tierras mineras donde se oculta la Cueva del Eco.',
    'La Alianza de los Lores perdio sus permisos originales y ahora necesita el documento Kamenov para recuperar control legal. Ha ofrecido a Boris una gran suma y un porcentaje de lo extraido, pero no le ha contado cuanto riesgo politico y religioso rodea la mina.',
    'Nezznar quiere eliminar a Boris y a sus hermanos porque los papeles pueden atraer inspecciones, soldados, juristas y curiosos hacia unas tierras que lleva años usando en secreto.',
  ),
})

overrideDefinition('kamenovBrothers', {
  publicFields: {
    descripcion: text(
      'Dimitri Kamenov e Ivan Kamenov son los hermanos de Boris. Comparten la sangre, el apellido y la reclamacion legal sobre la Cueva del Eco.',
      'Para el pueblo pueden parecer parientes secundarios, pero para cualquier faccion que entienda derecho hereditario son objetivos tan importantes como Boris.',
    ),
    traitsMotivations: text(
      'Dimitri es mas pragmatico: quiere vender caro, cobrar pronto y salir vivo. Ivan es mas orgulloso: habla de restitucion, honor familiar y deudas historicas.',
      'Juntos encarnan la tension de la familia Kamenov: una parte quiere convertir la historia en dinero; otra quiere que el mundo reconozca que nunca debieron perderlo todo.',
    ),
    routine: text(
      'Se mueven cerca de rutas mineras, escribaños y contactos de la Alianza. Separarlos de Boris es una forma de debilitar la reclamacion sin destruirla del todo.',
    ),
  },
  secret:
    'La Sangre de Bhaal y Nezznar no solo quieren detener a Boris. Necesitan borrar o controlar a todos los Kamenov que puedan activar la reclamacion legal.',
})

overrideDefinition('phandelverPact', {
  publicFields: {
    descripcion: text(
      'Antiguo acuerdo minero y arcano firmado entre humanos, altos elfos y enanos de las montañas. No hubo gnomos en el pacto original: cualquier version que los incluya procede de copias defectuosas, propaganda o documentos alterados.',
      'El pacto no era solo un contrato de explotacion. Era una filosofia de cooperacion: fuerza minera enana, administracion humana y sensibilidad arcana de los altos elfos, unidos por la idea de que la riqueza subterranea debia sostener una civilizacion compartida.',
    ),
    significance: text(
      'Su importancia actual es legal, simbolica y moral. Legal, porque los documentos Kamenov pueden devolver validez a reclamaciones perdidas. Simbolica, porque Phandalin necesita creer que su prosperidad tiene raices nobles. Moral, porque todas las facciones reinterpretan el pacto para justificar sus propios fines.',
      'La Alianza de los Lores lo ve como continuidad institucional. La Sangre de Bhaal lo ve como prueba de que las especies racionales siempre convierten la tierra en herramienta. El Culto de Tiamat lo ve como la primera palabra elegante de una contaminacion antigua.',
    ),
    aftermath: text(
      'La perdida de permisos empujo a representantes de la Alianza a volver a Phandalin. El documento de Boris puede reactivar viejas reclamaciones, viejas deudas y viejos odios.',
      'El pacto tambien atrae violencia porque obliga a todos a definirse: quien cree en la ley, quien cree en la sangre, quien cree en la tierra y quien cree en el beneficio.',
    ),
  },
  secret:
    'Nezznar ha estudiado el Pacto de Phandelver durante años. Sabe que una reclamacion legal bien presentada puede arruinar su red secreta sin necesidad de una batalla.',
})

overrideDefinition('waveEchoCave', {
  publicFields: {
    historia: text(
      'Complejo minero legendario bajo tierras reclamadas por la familia Kamenov. Su valor no esta solo en el mineral: los relatos hablan de resonancias arcanas, forjas antiguas y pactos que unieron a humanos, altos elfos y enanos de las montañas.',
      'Durante años, Nezznar ha usado estas tierras como cantera secreta y taller oculto. Extrae materiales raros, canaliza energia vieja y fabrica artefactos de poder creciente mediante una red de negocios tapadera, rutas falsas e intermediarios que no siempre saben para quien trabajan.',
    ),
    cultura: text(
      'Para Phandalin es una promesa de prosperidad y una amenaza. Quien controle la cueva podria reconstruir el pueblo o convertirlo en un tablero de facciones.',
      'Para la Alianza de los Lores, la Cueva del Eco es continuidad legal y riqueza recuperada. Para la Sangre de Bhaal, es una fuente de herramientas para acelerar el colapso de la vida racional. Para el Culto de Tiamat, es una herida abierta en la tierra que debe cerrarse antes de que la codicia humanoide la convierta en una cicatriz permanente.',
    ),
  },
  secret:
    'Nezznar no quiere que la Alianza de los Lores merodee por la zona porque sus excavaciones, artefactos y redes de extraccion quedarian expuestos. Venomfang y el Culto de Tiamat quieren acabar con la mina por razones opuestas: no para poseerla, sino para destruir el daño ecologico y simbolico que representa.',
})

overrideDefinition('lordsAlliance', {
  publicFields: {
    description: text(
      'Coalicion politica que cree que la civilizacion sobrevive cuando la ley, el comercio y la autoridad se imponen al caos local. Sus miembros se ven a si mismos como administradores de continuidad: archivos, permisos, impuestos, rutas seguras y acuerdos que duran mas que una generacion.',
      'Su filosofia no es malvada, pero si peligrosa. La Alianza tiende a confundir estabilidad con legitimidad y legitimidad con control. Donde otros ven un pueblo, ellos ven un nodo; donde otros ven ruinas, ellos ven activos recuperables.',
    ),
    historyStructure: text(
      'La Alianza afirma descender institucionalmente de quienes respaldaron el Pacto de Phandelver. Como perdio los permisos originales de esas tierras, ahora necesita los papeles de la familia Kamenov. Ha ofrecido a Boris una gran cantidad de dinero y un porcentaje de lo recolectado.',
      'Opera mediante patronos, escribaños, escoltas contratados, acuerdos con ordenes religiosas y presion economica. Prefiere no ensuciarse las maños, pero su hambre de orden puede abrir la puerta a abusos muy limpios: desalojos, monopolios, contratos asimetricos y silencios comprados.',
      'Su conflicto interno es claro: algunos agentes quieren proteger Phandalin; otros solo quieren que la mina vuelva a producir. Esa ambiguedad permite que villaños inteligentes usen la bandera de la ley como cobertura.',
    ),
  },
  secret: text(
    'Hace años enviaron a Iarno Albrek para encontrar los papeles perdidos. Nadie en la Alianza sabe que termino corrupto, manipulado por la Sangre de Bhaal y muerto antes de poder rendir cuentas.',
    'La Alianza contrato a Sildar Hallwinter, alto elfo de la Orden del Guantelete, para escoltar a Boris y contactar con Iarno. Creen que estan resolviendo un problema administrativo. En realidad estan entrando en una guerra de sectas, minas, espionaje y filosofia asesina.',
  ),
})

overrideDefinition('bronzeRings', {
  publicFields: {
    description: text(
      'Red dispersa de bandidos, ladrones, saqueadores y matones de poca monta que opera por la Costa de la Espada. Sus miembros incluyen humanos, goblins, orcos y humanoides hiena.',
      'Los Anillos de Bronce no tienen una gran doctrina, y precisamente por eso son utiles. Son la violencia sin manifiesto: hambre, resentimiento, oportunidad y miedo organizados bajo un simbolo barato.',
    ),
    historyStructure: text(
      'Los lidera Rey Gral, un etin de dos cabezas cuya brutalidad mantiene unida a la banda mas por miedo que por lealtad. Las celulas locales se reconocen por favores debidos, botin compartido y pequenas marcas de bronce que funcionan como deuda y amenaza.',
      'Filosoficamente son el reverso vulgar de las grandes facciones. La Alianza habla de ley, la Sangre de Bhaal de purificacion, el Culto de Tiamat de tierra herida; los Anillos solo preguntan quien paga y a quien hay que romper.',
      'Esa falta de causa los vuelve desechables. Tambien los vuelve impredecibles: un bandido que no cree en nada puede vender a cualquiera si el precio o el miedo cambian.',
    ),
  },
  secret:
    'Fueron contratados por la Sangre de Bhaal para impedir que Boris llegue a Phandalin. La subcontratacion existe para que nadie pueda relacionar directamente el ataque con la secta ni con la red de Nezznar.',
})

overrideDefinition('bloodOfBhaal', {
  publicFields: {
    description: text(
      'Faccion secreta de seguidores de Bhaal que actua desde las sombras. Donde otros cultos buscan poder, la Sangre de Bhaal busca una conclusion: el fin de toda criatura racional.',
      'Su filosofia parte de una acusacion radical: la razon no salvo al mundo, lo infecto. La memoria crea venganza, el lenguaje crea mentira, la ley crea hipocresia, la tecnica crea explotacion y la moral crea excusas para prolongar el daño.',
      'Para ellos, los humanoides racionales han convertido la existencia en una maquinaria de sufrimiento consciente. Animales y seres no inteligentes quedan fuera de su condena porque no fabrican imperios, contratos, minas ni doctrinas para justificar su crueldad.',
    ),
    historyStructure: text(
      'No actuan como una banda publica. Funcionan como capas: negocios tapadera, devotos filosoficos, matones subcontratados, informantes, archivos falsos e infiltrados en oficios modestos del pueblo.',
      'Su culto no predica caos inmediato, sino una forma fria de apocalipsis moral. Primero se debilitan instituciones, luego se eliminan figuras de proteccion, despues se fabrican crisis y al final se presenta la muerte como unica salida coherente.',
      'Detestan a paladines, sanadores y jueces porque representan la idea de que el sufrimiento puede repararse. Para la Sangre de Bhaal, curar una herida en un mundo condenado solo prolonga la crueldad total.',
      'Aceptan su paradoja final: cuando toda criatura racional haya sido extinguida, los propios seguidores de Bhaal tambien deberan morir. No se ven como elegidos para gobernar, sino como los ultimos culpables que cerraran la puerta desde dentro.',
    ),
  },
  secret: text(
    'Nezznar lidera la Sangre de Bhaal desde las sombras. Usa la Cueva del Eco para crear artefactos, financiar agentes y acelerar su proyecto sin revelar todavia la escala de su doctrina.',
    'La faccion coincide parcialmente con el Culto de Tiamat en su desprecio hacia la civilizacion humanoide, pero difiere en la raiz: Tiamat habla de tierra contaminada y dominio draconico-natural; Bhaal habla de culpa metafisica y exterminio racional completo.',
  ),
})

overrideDefinition('nezznar', {
  publicFields: {
    descripcion: text(
      'Figura paciente, culta y peligrosa que prefiere mover simbolos, contratos y miedo antes que aparecer en persona. Su nombre circula como rumor, no como rostro.',
      'Nezznar no es un simple jefe criminal. Es un arquitecto de sistemas: crea dependencia economica, compra silencios, coloca infiltrados y deja que otros crean que las decisiones son suyas.',
    ),
    traitsMotivations: text(
      'Lidera la Sangre de Bhaal y cree que la razon es la enfermedad original del mundo. Quiere la Cueva del Eco porque sus materiales y resonancias permiten fabricar artefactos capaces de multiplicar influencia, asesinato y control.',
      'Lleva años extrayendo recursos de esas tierras. La llegada de la Alianza de los Lores amenaza con auditorias, escoltas, escribaños, reclamaciones legales y ojos externos. Por eso quiere eliminar a Sildar, Boris y los hermanos Kamenov antes de que el conflicto se vuelva oficial.',
    ),
    routine: text(
      'Opera mediante negocios tapadera, rutas de suministros falsas, informantes en tabernas, deudores, escribaños comprados, bandidos subcontratados y agentes que no conocen la estructura completa.',
      'Su red en Phandalin no parece una secta desde fuera. Parece economia: alguien compra madera, otro alquila un almacen, otro paga por silencio, otro contrata seguridad. Solo al unir las piezas aparece el patron.',
    ),
  },
  secret: text(
    'Nezznar es el lider en las sombras de la Sangre de Bhaal. Los Anillos de Bronce, la corrupcion de Iarno y los movimientos contra Boris forman parte de una misma cadena de negacion plausible.',
    'No quiere simplemente matar a los Kamenov; quiere que su desaparicion parezca bandolerismo, accidente de ruta o disputa local. Si la Alianza entiende que hay una red cultista detras, enviara mas recursos y pondra en riesgo años de trabajo secreto.',
  ),
})

overrideDefinition('sildar', {
  publicFields: {
    descripcion: text(
      'Alto elfo de la Orden del Guantelete, devoto de Tyr, contratado por la Alianza de los Lores para escoltar a Boris Kamenov y contactar con Iarno Albrek en Phandalin.',
      'Su presencia une tres mundos: la ley secular de la Alianza, la justicia sagrada de Tyr y el viejo linaje alto elfo asociado al Pacto de Phandelver.',
    ),
    traitsMotivations: text(
      'Cree en justicia, deber y verdad documentada. No trabaja para la Alianza por ambicion politica, sino porque ve en el encargo una forma de impedir abusos sobre Phandalin.',
      'Su tragedia potencial es que la ley que defiende puede ser usada por oportunistas, y aun asi el sigue creyendo que abandonar la ley solo deja espacio a depredadores.',
    ),
    routine:
      'Viaja como escolta y enviado. Busca a Iarno sin saber que esta corrupto ni que ha muerto recientemente.',
  },
  secret:
    'Nezznar quiere eliminarlo porque Sildar puede conectar la desaparicion de Iarno con la red de la Sangre de Bhaal. Ademas, la doctrina de Bhaal odia especialmente a quienes creen que justicia y curacion pueden redimir el sufrimiento.',
})

overrideDefinition('reidoth', {
  publicFields: {
    descripcion:
      'Druida del Enclave Esmeralda que observa los movimientos de la region desde bosques, ruinas y senderos poco usados.',
    traitsMotivations: text(
      'Investiga la posibilidad de que Venomfang este planeando algo peligroso. No quiere matar al dragon por impulso; quiere entender si su presencia amenaza el equilibrio natural o si esta reaccionando ante una herida real causada por la mina.',
      'Reidoth sabe que el ecologismo fanatico del Culto de Tiamat puede nacer de una observacion cierta: los humanoides contaminan, excavan y agotan. Su deber es separar la verdad del remedio monstruoso que propone el culto.',
    ),
    routine:
      'Se mueve sin anunciarse, habla con animales, escucha rumores de frontera y evita las ciudades salvo cuando una amenaza exige intervencion.',
  },
  secret:
    'Reidoth sospecha que Venomfang no solo busca territorio. Puede estar actuando como pieza del Culto de Tiamat para destruir la mina antes de que su explotacion contamine mas tierra.',
})

overrideDefinition('venomfang', {
  publicFields: {
    descripcion: text(
      'Dragon vinculado al Culto de Tiamat. Su amenaza no es solo territorial: se presenta como una fuerza de correccion ecologica contra la expansion humanoide.',
      'Venomfang ve la Cueva del Eco como una infeccion abierta. No le interesa explotarla, sino impedir que humanos, altos elfos, enanos, mercaderes y señores conviertan la montaña en otra maquina de extraccion.',
    ),
    comportamiento: text(
      'Observa antes de actuar. Usa miedo, pactos ambiguos, presion sobre druidas, rumores de contaminacion y ataques calculados contra rutas o instrumentos mineros.',
      'No se considera un villano, sino una respuesta. Para el, la violencia contra humanoides racionales es defensa de la tierra a una escala que los mortales se niegan a comprender.',
    ),
    habilidades:
      'Veneno, vuelo, manipulacion, paciencia depredadora y una lectura instintiva de cuando una region esta demasiado dividida para defenderse bien.',
  },
  secret: text(
    'Venomfang forma parte de una corriente ecoterrorista del Culto de Tiamat que quiere acabar con humanoides porque los considera contaminadores sistemicos de la tierra.',
    'Quiere destruir o inutilizar la Cueva del Eco por las consecuencias negativas de la mineria sobre el territorio. Eso lo enfrenta a la Alianza, a Boris y tambien a Nezznar, aunque por motivos completamente distintos.',
  ),
})

addDefinition({
  key: 'orderGauntlet',
  fallbackId: 'lmop_organization_orden_del_guantelete',
  aliases: ['Order of the Gauntlet', 'Orden del Guantelete'],
  type: 'organization',
  name: 'Orden del Guantelete',
  publicFields: {
    description: text(
      'Orden militante de fe, disciplina y accion directa contra el mal. Su filosofia sostiene que la neutralidad ante la crueldad es una forma de complicidad.',
      'No cree que todas las heridas del mundo puedan resolverse con diplomacia. Cree en testimonio, juicio, proteccion del inocente y espada levantada cuando la ley ha sido capturada por cobardes o corruptos.',
    ),
    historyStructure: text(
      'La Orden funciona por juramentos personales mas que por burocracia. Un miembro como Sildar Hallwinter puede aceptar un contrato de la Alianza de los Lores, pero su lealtad ultima no pertenece a la Alianza: pertenece a Tyr, a la justicia y a la defensa de los vulnerables.',
      'Su tension filosofica con la Sangre de Bhaal es absoluta. La Orden cree que el sufrimiento exige respuesta moral; la Sangre de Bhaal cree que toda respuesta moral solo prolonga la enfermedad de la razon.',
    ),
  },
  secret:
    'Si la Orden descubre que la Sangre de Bhaal opera en Phandalin, el conflicto dejara de ser un problema local y se convertira en cruzada judicial.',
})

addDefinition({
  key: 'emeraldEnclave',
  fallbackId: 'lmop_organization_enclave_esmeralda',
  aliases: ['Emerald Enclave', 'Enclave Esmeralda'],
  type: 'organization',
  name: 'Enclave Esmeralda',
  publicFields: {
    description: text(
      'Red de druidas, exploradores y guardianes que defiende el equilibrio natural frente a civilizaciones que avanzan sin medir consecuencias.',
      'Su filosofia no es anti-humanoide por defecto. Acepta aldeas, caminos y cultivos cuando pueden existir dentro de limites. Lo que rechaza es la expansion que convierte toda tierra en recurso y toda criatura en obstaculo.',
    ),
    historyStructure: text(
      'El Enclave actua mediante vigilancia, consejo, sabotaje menor, pactos con comunidades locales y, en casos extremos, intervencion directa. Reidoth es una de sus miradas en la region.',
      'Su conflicto con el Culto de Tiamat es delicado porque ambos hablan de daño ecologico. La diferencia esta en el remedio: el Enclave busca equilibrio; el Culto de Tiamat convierte el equilibrio en purga y dominio draconico.',
    ),
  },
  secret:
    'Reidoth teme que Venomfang use verdades ecologicas para reclutar simpatia antes de ejecutar una violencia mucho mas amplia contra humanoides.',
})

addDefinition({
  key: 'cultTiamat',
  fallbackId: 'lmop_organization_culto_de_tiamat',
  aliases: ['Culto de Tiamat', 'Cult of Tiamat', 'Tiamat'],
  type: 'organization',
  name: 'Culto de Tiamat',
  publicFields: {
    description: text(
      'Faccion draconica con una rama ecoterrorista activa alrededor de la Cueva del Eco. Esta corriente afirma que los humanoides racionales han contaminado la tierra con minas, caminos, humo, fronteras y codicia acumulativa.',
      'A diferencia de la Sangre de Bhaal, no cree que la razon sea una culpa metafisica que deba extinguirse por completo. Cree que la civilizacion humanoide es una plaga ecologica y que la dominacion draconica puede devolver jerarquia natural al mundo.',
    ),
    historyStructure: text(
      'Sus agentes mezclan culto religioso, superioridad draconica y lenguaje de defensa natural. Pueden presentarse como guardianes de bosques, vengadores de rios contaminados o profetas de una tierra que ya no puede respirar.',
      'Su contradiccion central es brutal: denuncian la explotacion humanoide, pero sustituyen el abuso de las ciudades por el dominio de dragones. No liberan la naturaleza; la subordinan a una vision donde Tiamat y sus elegidos deciden que merece vivir.',
      'Venomfang actua como pieza carismatica y terrorifica de esta corriente. La mina no debe ser recuperada, regulada ni conquistada: debe ser cerrada, arruinada o convertida en advertencia.',
    ),
  },
  secret: text(
    'El Culto de Tiamat puede chocar con Nezznar aunque ambos sean enemigos de la Alianza. Nezznar necesita la Cueva del Eco funcionando en secreto; Venomfang quiere acabar con ella por el daño a la tierra.',
    'Esta tension permite alianzas temporales, traiciones y escenas donde dos villaños se oponen a los heroes por razones incompatibles entre si.',
  ),
})

function overrideDefinition(key, partial) {
  const definition = definitionByKey.get(key)
  if (!definition) {
    throw new Error(`Unknown lore definition "${key}".`)
  }

  Object.assign(definition, partial)
}

function addDefinition(definition) {
  if (definitionByKey.has(definition.key)) {
    overrideDefinition(definition.key, definition)
    return
  }

  loreDefinitions.push(definition)
  definitionByKey.set(definition.key, definition)
}

const directReplacements = [
  [/Gundrenn Rockseeker/g, 'Boris Kamenov'],
  [/Gundren Rockseeker/g, 'Boris Kamenov'],
  [/\bGundrenn\b/g, 'Boris'],
  [/\bGundren\b/g, 'Boris'],
  [/\bNundro Rockseeker\b/g, 'Dimitri Kamenov'],
  [/\bTharden Rockseeker\b/g, 'Ivan Kamenov'],
  [/hermanos Rockseeker/gi, 'hermanos Kamenov'],
  [/Rockseeker/gi, 'Kamenov'],
  [/Cragmaw Goblins/g, 'Anillos de Bronce'],
  [/Cragmaw/gi, 'Anillos de Bronce'],
  [/Redbrands/g, 'Sangre de Bhaal'],
  [/Redbrand/g, 'Sangre de Bhaal'],
  [/King Grol/g, 'Rey Gral'],
  [/Rey Grol/g, 'Rey Gral'],
  [/Klarg/g, 'Hogger'],
  [/Wave Echo Cave/g, 'Cueva del Eco'],
  [/Lord'?s Alliance/g, 'Alianza de los Lores'],
  [/Lords Alliance/g, 'Alianza de los Lores'],
  [/Lord of Alliance/g, 'Alianza de los Lores'],
  [/Cult of Tiamat/g, 'Culto de Tiamat'],
  [/Emerald Enclave/g, 'Enclave Esmeralda'],
  [/Order of the Gauntlet/g, 'Orden del Guantelete'],
]

if (process.argv.includes('--dry-run')) {
  validateLoreDefinitions()
  console.log(`LMOP canon package is valid: ${loreDefinitions.length} lore entries.`)
  console.log(loreDefinitions.map((definition) => `${definition.type}: ${definition.name}`).join('\n'))
} else {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}

async function main() {
  await signInIfNeeded()
  const campaign = await resolveCampaign()
  const existingLore = await listLore(campaign.id)
  const idByKey = resolveEntryIds(existingLore)
  const entries = loreDefinitions.map((definition) => toLoreRow(campaign.id, definition, idByKey.get(definition.key)))
  validateResolvedEntries(entries)

  await saveLoreEntries(entries, existingLore)
  await rewriteExistingLoreText(campaign.id, new Set(entries.map((entry) => entry.id)))
  await upsertLoreLinks(idByKey)
  await rewriteQuests(campaign.id)
  await rewriteTimeline(campaign.id)

  console.log(`Updated LMOP canon in campaign "${campaign.name}" (${campaign.id}).`)
  console.log(`Saved ${entries.length} lore entries and refreshed links/references.`)
}

function readDotEnv(path) {
  if (!existsSync(path)) {
    return {}
  }

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      }),
  )
}

async function signInIfNeeded() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return
  }

  const email = process.env.ALDEPE_DM_EMAIL
  const password = process.env.ALDEPE_DM_PASSWORD ?? readPasswordFile()

  if (!email || !password) {
    throw new Error('Set ALDEPE_DM_EMAIL and ALDEPE_DM_PASSWORD, or use SUPABASE_SERVICE_ROLE_KEY.')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(`Could not sign in as DM: ${error.message}`)
  }
}

function readPasswordFile() {
  const path = process.env.ALDEPE_DM_PASSWORD_FILE
  if (!path || !existsSync(path)) {
    return undefined
  }

  return readFileSync(path, 'utf8').trim()
}

async function resolveCampaign() {
  const explicitCampaignId = process.env.ALDEPE_CAMPAIGN_ID
  let query = supabase.from('campaigns').select('*').order('name')

  if (explicitCampaignId) {
    query = query.eq('id', explicitCampaignId)
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  if (!data?.length) {
    throw new Error('No campaign found for the current credentials.')
  }

  if (data.length > 1 && !explicitCampaignId) {
    console.warn(`Multiple campaigns found. Using "${data[0].name}". Set ALDEPE_CAMPAIGN_ID to target another one.`)
  }

  return data[0]
}

async function listLore(campaignId) {
  const { data, error } = await supabase
    .from('lore_entries')
    .select('id,type,name,publicFields,secret,isVisibleToPlayers,visibleToPlayerIds')
    .eq('campaignId', campaignId)

  if (error) {
    throw error
  }

  return data ?? []
}

function resolveEntryIds(existingLore) {
  const idByKey = new Map()
  const usedIds = new Set()

  for (const definition of loreDefinitions) {
    const match = findBestLoreMatch(definition, existingLore, usedIds)
    idByKey.set(definition.key, match?.id ?? definition.fallbackId)
    if (match) {
      usedIds.add(match.id)
    }
  }

  return idByKey
}

function findBestLoreMatch(definition, existingLore, usedIds) {
  const aliases = [definition.name, ...definition.aliases]

  const candidates = existingLore
    .filter((entry) => !usedIds.has(entry.id))
    .map((entry) => ({ entry, score: scoreLoreMatch(entry, definition, aliases) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.name.localeCompare(right.entry.name, 'es'))

  return candidates[0]?.entry
}

function scoreLoreMatch(entry, definition, aliases) {
  const normalizedName = normalize(entry.name)
  const normalizedAliases = aliases.map(normalize)
  const typeScore = entry.type === definition.type ? 100 : 0

  if (normalizedAliases.some((alias) => normalizedName === alias)) {
    return 10000 + typeScore
  }

  if (normalizedAliases.some((alias) => normalizedName.startsWith(alias) || alias.startsWith(normalizedName))) {
    return 1000 + typeScore
  }

  if (matchesAnyAlias(entry.name, aliases)) {
    return 100 + typeScore
  }

  return 0
}

function matchesAnyAlias(value, aliases) {
  const normalizedValue = normalize(value)
  return aliases.some((alias) => normalizedValue.includes(normalize(alias)))
}

function normalize(value) {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function toLoreRow(campaignId, definition, id) {
  return {
    id,
    campaignId,
    type: definition.type,
    name: definition.name,
    image: {},
    publicFields: definition.publicFields,
    secret: definition.secret,
    isVisibleToPlayers: false,
    visibleToPlayerIds: [],
    updatedAt: now,
  }
}

function validateResolvedEntries(entries) {
  const entryById = new Map()

  for (const entry of entries) {
    const previous = entryById.get(entry.id)
    if (previous) {
      throw new Error(`Duplicate resolved lore id "${entry.id}" for "${previous.name}" and "${entry.name}".`)
    }

    entryById.set(entry.id, entry)
  }
}

async function saveLoreEntries(entries, existingLore) {
  const existingIds = new Set(existingLore.map((entry) => entry.id))
  const rowsToUpdate = entries.filter((entry) => existingIds.has(entry.id))
  const rowsToInsert = entries.filter((entry) => !existingIds.has(entry.id))

  for (const row of rowsToUpdate) {
    const { error } = await supabase.from('lore_entries').update(row).eq('id', row.id)
    if (error) {
      throw error
    }
  }

  for (const row of rowsToInsert) {
    const { error } = await supabase.from('lore_entries').insert(row)
    if (error) {
      throw new Error(`Could not insert lore entry "${row.name}" (${row.id}): ${error.message}`)
    }
  }
}

async function rewriteExistingLoreText(campaignId, canonicalIds) {
  const existingLore = await listLore(campaignId)
  const rowsToUpdate = existingLore
    .filter((entry) => !canonicalIds.has(entry.id))
    .map((entry) => rewriteLoreRow(entry))
    .filter(Boolean)

  if (!rowsToUpdate.length) {
    return
  }

  for (const row of rowsToUpdate) {
    const { error } = await supabase.from('lore_entries').update(row).eq('id', row.id)
    if (error) {
      throw new Error(`Could not rewrite old lore entry "${row.name}" (${row.id}): ${error.message}`)
    }
  }
}

function rewriteLoreRow(entry) {
  const nextName = applyTextReplacements(entry.name)
  const nextPublicFields = applyTextReplacementsDeep(entry.publicFields ?? {})
  const nextSecret = applyTextReplacements(entry.secret ?? '')

  const changed =
    nextName !== entry.name ||
    JSON.stringify(nextPublicFields) !== JSON.stringify(entry.publicFields ?? {}) ||
    nextSecret !== (entry.secret ?? '')

  if (!changed) {
    return undefined
  }

  return {
    id: entry.id,
    name: nextName,
    publicFields: nextPublicFields,
    secret: nextSecret,
    updatedAt: now,
  }
}

function createLoreLinkMap() {
  return {
    borisKamenov: ['kamenovBrothers', 'phandelverPact', 'waveEchoCave', 'lordsAlliance', 'sildar', 'bronzeRings', 'nezznar'],
    kamenovBrothers: ['borisKamenov', 'waveEchoCave', 'phandelverPact', 'nezznar'],
    phandelverPact: ['borisKamenov', 'kamenovBrothers', 'waveEchoCave', 'lordsAlliance', 'phandalin', 'cultTiamat'],
    waveEchoCave: ['phandelverPact', 'borisKamenov', 'lordsAlliance', 'nezznar', 'bloodOfBhaal', 'venomfang', 'cultTiamat', 'emeraldEnclave'],
    lordsAlliance: ['borisKamenov', 'phandelverPact', 'sildar', 'iarno', 'phandalin', 'orderGauntlet', 'nezznar'],
    bronzeRings: ['kingGral', 'hogger', 'bloodOfBhaal', 'borisKamenov'],
    kingGral: ['bronzeRings', 'bloodOfBhaal'],
    hogger: ['bronzeRings', 'borisKamenov'],
    bloodOfBhaal: ['nezznar', 'iarno', 'bronzeRings', 'sisterGaraele', 'phandalin', 'waveEchoCave', 'orderGauntlet', 'cultTiamat'],
    nezznar: ['bloodOfBhaal', 'waveEchoCave', 'bronzeRings', 'iarno', 'lordsAlliance', 'borisKamenov', 'kamenovBrothers', 'cultTiamat'],
    iarno: ['lordsAlliance', 'bloodOfBhaal', 'sildar', 'phandalin'],
    sildar: ['lordsAlliance', 'iarno', 'borisKamenov', 'bloodOfBhaal', 'orderGauntlet'],
    reidoth: ['venomfang', 'emeraldEnclave', 'cultTiamat'],
    sisterGaraele: ['bloodOfBhaal', 'phandalin', 'nezznar'],
    phandalin: ['lordsAlliance', 'bloodOfBhaal', 'borisKamenov', 'sisterGaraele', 'nezznar', 'bronzeRings'],
    venomfang: ['reidoth', 'waveEchoCave', 'cultTiamat', 'emeraldEnclave', 'nezznar'],
    orderGauntlet: ['sildar', 'bloodOfBhaal', 'lordsAlliance'],
    emeraldEnclave: ['reidoth', 'venomfang', 'cultTiamat', 'waveEchoCave'],
    cultTiamat: ['venomfang', 'emeraldEnclave', 'waveEchoCave', 'bloodOfBhaal', 'nezznar', 'phandelverPact'],
  }
}

function validateLoreDefinitions() {
  const keys = new Set()
  const ids = new Set()

  for (const definition of loreDefinitions) {
    if (keys.has(definition.key)) {
      throw new Error(`Duplicate lore key "${definition.key}".`)
    }

    if (ids.has(definition.fallbackId)) {
      throw new Error(`Duplicate fallback id "${definition.fallbackId}".`)
    }

    keys.add(definition.key)
    ids.add(definition.fallbackId)
  }

  for (const [sourceKey, targetKeys] of Object.entries(createLoreLinkMap())) {
    if (!keys.has(sourceKey)) {
      throw new Error(`Unknown lore link source "${sourceKey}".`)
    }

    for (const targetKey of targetKeys) {
      if (!keys.has(targetKey)) {
        throw new Error(`Unknown lore link target "${targetKey}" from "${sourceKey}".`)
      }
    }
  }
}

async function upsertLoreLinks(idByKey) {
  const linkMap = createLoreLinkMap()

  const sourceIds = Object.keys(linkMap).map((key) => idByKey.get(key))
  const links = Object.entries(linkMap).flatMap(([sourceKey, targetKeys]) =>
    targetKeys.map((targetKey) => ({
      source_id: idByKey.get(sourceKey),
      target_id: idByKey.get(targetKey),
    })),
  )

  const { error: deleteError } = await supabase.from('lore_links').delete().in('source_id', sourceIds)
  if (deleteError) {
    throw deleteError
  }

  const { error: insertError } = await supabase.from('lore_links').upsert(links, { onConflict: 'source_id,target_id' })
  if (insertError) {
    throw insertError
  }
}

async function rewriteQuests(campaignId) {
  const { data, error } = await supabase
    .from('quests')
    .select('id,title,description,steps,challenges,secret')
    .eq('campaignId', campaignId)

  if (error) {
    throw error
  }

  const updates = (data ?? [])
    .map((quest) => {
      const next = {
        id: quest.id,
        title: applyTextReplacements(quest.title ?? ''),
        description: applyTextReplacements(quest.description ?? ''),
        steps: applyTextReplacementsDeep(quest.steps ?? []),
        challenges: applyTextReplacements(quest.challenges ?? ''),
        secret: applyTextReplacements(quest.secret ?? ''),
      }

      return hasChanged(quest, next) ? next : undefined
    })
    .filter(Boolean)

  if (!updates.length) {
    return
  }

  for (const row of updates) {
    const { error: updateError } = await supabase.from('quests').update(row).eq('id', row.id)
    if (updateError) {
      throw new Error(`Could not rewrite quest "${row.title}" (${row.id}): ${updateError.message}`)
    }
  }
}

async function rewriteTimeline(campaignId) {
  const { data, error } = await supabase
    .from('timeline_sessions')
    .select('id,title,summary,visibleNotes')
    .eq('campaignId', campaignId)

  if (error) {
    throw error
  }

  const updates = (data ?? [])
    .map((session) => {
      const next = {
        id: session.id,
        title: applyTextReplacements(session.title ?? ''),
        summary: applyTextReplacements(session.summary ?? ''),
        visibleNotes: applyTextReplacements(session.visibleNotes ?? ''),
      }

      return hasChanged(session, next) ? next : undefined
    })
    .filter(Boolean)

  if (!updates.length) {
    return
  }

  for (const row of updates) {
    const { error: updateError } = await supabase.from('timeline_sessions').update(row).eq('id', row.id)
    if (updateError) {
      throw new Error(`Could not rewrite timeline entry "${row.title}" (${row.id}): ${updateError.message}`)
    }
  }
}

function hasChanged(previous, next) {
  return Object.keys(next).some((key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key]))
}

function applyTextReplacementsDeep(value) {
  if (typeof value === 'string') {
    return applyTextReplacements(value)
  }

  if (Array.isArray(value)) {
    return value.map(applyTextReplacementsDeep)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, applyTextReplacementsDeep(nested)]))
  }

  return value
}

function applyTextReplacements(value) {
  return directReplacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), value)
}
