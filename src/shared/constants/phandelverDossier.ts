export interface DossierMetric {
  label: string
  value: string
  detail: string
}

export interface DossierFact {
  label: string
  value: string
}

export interface DossierItem {
  title: string
  detail: string
  fields?: DossierFact[]
  checks?: string[]
  contents?: string[]
  security?: string[]
  clues?: string[]
  consequences?: string[]
  dmNotes?: string[]
}

export interface DossierView {
  id: string
  label: string
  title: string
  eyebrow: string
  summary: string
  items: DossierItem[]
}

export interface DossierCell {
  name: string
  role: string
  members: string
  pressure: string
  fields?: DossierFact[]
}

export interface DossierClock {
  id: string
  title: string
  detail: string
  max: number
  initial: number
  segments: string[]
}

export const bloodOfBhaalDossier = {
  title: 'Operativo Sangre de Bhaal',
  subtitle: 'Red secreta de Phandalin',
  premise:
    'La Sangre de Bhaal no controla Phandalin como un ejército. Lo controla como una infección pequeña, paciente y bien escondida: favores, miedo, rutas discretas, negocios tapadera y gente vulnerable usada como ojos.',
  doctrine:
    'Su filosofía sostiene que la vida racional ha convertido el mundo en una fábrica de sufrimiento consciente. No buscan gobernar el pueblo; quieren mantenerlo estable, medible y dócil hasta que Nezznar termine de extraer materiales y fabricar artefactos en la Cueva del Eco.',
  metrics: [
    { label: 'Núcleo real', value: '5-7', detail: 'Rogues con magia de sangre y juramento directo a Bhaal.' },
    { label: 'Colaboradores', value: '10-14', detail: 'Deudores, matones, informantes pagados y gente chantajeada.' },
    { label: 'Pisos francos', value: '3', detail: 'Principal, emergencia y sala limpia para reuniones cortas.' },
    { label: 'Alijos', value: '6', detail: 'Separados por función: combate, fuga, identidad, cifra, ritual y chantaje.' },
    { label: 'Palomares', value: '2', detail: 'Comunicación lenta con códigos de cinta, grano y cera.' },
    { label: 'Exposición', value: 'Baja', detail: 'Cada pieza sabe poco. La red cae por acumulación, no por una confesión.' },
    { label: 'Objetivo real', value: '1 papel', detail: 'Localizar, copiar, desacreditar o robar el registro de propiedad Kamenov.' },
  ],
  clocks: [
    {
      id: 'document-location',
      title: 'Rastro del documento',
      detail: 'Mide cuánto ha avanzado la Sangre de Bhaal hacia la ubicación exacta del registro de propiedad.',
      max: 6,
      initial: 1,
      segments: [
        'Saben que Boris trae papeles.',
        'Identifican que no es una carta ordinaria.',
        'Aíslan quién lo ha visto.',
        'Detectan el primer escondite.',
        'Preparan sustitución o robo.',
        'Fuerzan traslado al archivo bajo Tresendar.',
      ],
    },
    {
      id: 'player-pressure',
      title: 'Presión de los players',
      detail: 'Sube cuando investigan, protegen testigos o rompen alijos. A más presión, la secta comete errores.',
      max: 5,
      initial: 0,
      segments: [
        'Preguntas incómodas.',
        'Un informante cambia de bando.',
        'Un alijo queda expuesto.',
        'La célula mueve una reunión.',
        'Nezznar exige una acción arriesgada.',
      ],
    },
    {
      id: 'vault-lockdown',
      title: 'Cierre de la bóveda',
      detail: 'Mide cuánto se ha blindado el destino final bajo la mansión. Si llega al máximo, el acceso requiere resolver el piano.',
      max: 4,
      initial: 0,
      segments: [
        'Archivo limpio preparado.',
        'Piano afinado con sigilo de sangre.',
        'Custodio asignado a la sala de música.',
        'Documento sellado bajo Tresendar.',
      ],
    },
  ] satisfies DossierClock[],
  cells: [
    {
      name: 'Cuchillos de Medianoche',
      role: 'Ejecución discreta',
      members: '2 asesinos menores y 1 aprendiz de magia de sangre.',
      pressure: 'Matan poco; prefieren accidentes, intimidación y desapariciones de una noche.',
      fields: [
        { label: 'Jefe visible', value: 'Voryn "Soga Roja"' },
        { label: 'Señal', value: 'Nudo doble en cuero negro' },
        { label: 'Fallo típico', value: 'Dejan olor metálico en cerraduras' },
      ],
    },
    {
      name: 'Manos Limpias',
      role: 'Negocios tapadera',
      members: '2 comerciantes comprados, 1 escribano y varios recaderos.',
      pressure: 'Mueven dinero, justifican cargamentos y esconden pagos como deudas comerciales.',
      fields: [
        { label: 'Cobertura', value: 'Facturas, portes y reclamaciones' },
        { label: 'Objetivo', value: 'Borrar vínculos con Nezznar' },
        { label: 'Punto débil', value: 'Libros contables demasiado perfectos' },
      ],
    },
    {
      name: 'Ojos del Barro',
      role: 'Información callejera',
      members: 'Vagabundos, borrachos habituales y niños de recados usados sin revelarles el culto.',
      pressure: 'No son cultistas. Venden rumores por comida, cobre, techo o protección.',
      fields: [
        { label: 'Cobertura', value: 'Pedir limosna y mirar caballos' },
        { label: 'Información', value: 'Nombres, heridas, rutas y horarios' },
        { label: 'Señal', value: 'Tiza roja bajo un cubo' },
      ],
    },
    {
      name: 'Venas del Pueblo',
      role: 'Magia de sangre',
      members: '3 iniciados capaces de marcar puertas, sellar heridas falsas y activar sigilos de alarma.',
      pressure: 'Su magia deja pistas físicas: costras negras, olor metálico, hilo rojo seco.',
      fields: [
        { label: 'Recurso', value: 'Rituales cortos de alarma y silencio' },
        { label: 'Limitación', value: 'No sostienen combates largos' },
        { label: 'Rastro', value: 'Gota partida, costra negra, vena fría' },
      ],
    },
  ],
  views: [
    {
      id: 'document-hunt',
      label: 'Documento',
      title: 'Caza del registro de propiedad',
      eyebrow: 'Cadena de custodia, presión y traslado',
      summary:
        'El documento no empieza en una fortaleza. Empieza como un papel valioso en manos de un oportunista nervioso. La gracia del misterio es que cada día alguien lo mueve, lo mira, lo copia o pregunta por él sin decir su nombre real.',
      items: [
        {
          title: 'Estado inicial: escondite vulnerable',
          detail:
            'Boris conserva el registro en una carpeta impermeable dentro de su equipaje reforzado. El cofre duerme en una habitación alquilada y solo parece importante si alguien sabe leer sellos antiguos.',
          fields: [
            { label: 'Ubicación inicial', value: 'Habitación de Boris / cofre de viaje' },
            { label: 'Protección', value: 'Llave simple, orgullo de Boris, escolta distraída' },
            { label: 'Error de Boris', value: 'Mira el cofre cuando se habla de la mina' },
            { label: 'Riesgo', value: 'Robo fácil, copia mala o mancha legal' },
          ],
          checks: [
            'Insight DC 13 para notar que Boris protege un bulto concreto, no todo el equipaje.',
            'Investigation DC 14 para distinguir sello antiguo auténtico de papeles comerciales.',
            'Perception DC 15 para ver a un recadero marcar la puerta con tiza roja tras una conversación.',
          ],
          clues: [
            'Boris toca el cierre del cofre cuando alguien menciona a la Alianza de los Lores.',
            'Un mozo pregunta demasiadas veces si el equipaje debe subirse o bajarse.',
          ],
          dmNotes: [
            'Si los players ofrecen custodia inteligente, el documento salta a una ubicación intermedia antes de lo previsto.',
          ],
        },
        {
          title: 'Ubicaciones intermedias',
          detail:
            'La red no necesita robarlo al primer intento. Puede provocar que Boris lo mueva y así revelar quién lo custodia realmente.',
          fields: [
            { label: 'Paso 1', value: 'Cofre de viaje de Boris' },
            { label: 'Paso 2', value: 'Caja municipal del ayuntamiento' },
            { label: 'Paso 3', value: 'Custodia falsa de Manos Limpias' },
            { label: 'Destino final', value: 'Archivo bajo la mansión Tresendar' },
          ],
          consequences: [
            'Si el grupo falla dos escenas de vigilancia, el documento pasa al ayuntamiento.',
            'Si la Sangre de Bhaal consigue una copia parcial, prepara una falsificación para sembrar disputa legal.',
            'Si los players capturan a un informante, el traslado final ocurre de noche y deja rastro en el piano.',
          ],
          clues: [
            'Sello de cera rehecho con demasiada limpieza.',
            'Factura de mensajería sin peso declarado.',
            'Un testigo recuerda oír tres notas de piano desde una casa que debería estar abandonada.',
          ],
        },
        {
          title: 'Qué hace la secta cada día',
          detail:
            'Cada amanecer asignan una tarea pequeña: observar, contrastar, presionar, ensuciar una prueba o preparar una salida. Nunca hacen dos acciones ruidosas seguidas.',
          fields: [
            { label: 'Día tranquilo', value: 'Vigilar y confirmar' },
            { label: 'Día tenso', value: 'Mover informante y quemar pista' },
            { label: 'Día crítico', value: 'Forzar traslado o robo indirecto' },
          ],
          checks: [
            'Cada día, el DM elige una acción de célula y los players pueden contrarrestarla con una escena urbana.',
            'Tres éxitos acumulados de players congelan el reloj del documento durante un día.',
            'Dos fallos seguidos permiten a la secta avanzar el reloj de cierre de la bóveda.',
          ],
          dmNotes: [
            'Esto convierte Phandalin en tablero vivo: no hace falta combate diario; basta con señales, presión social y cambios de custodia.',
          ],
        },
      ],
    },
    {
      id: 'daily-intelligence',
      label: 'Día a día',
      title: 'Ciclo diario de inteligencia',
      eyebrow: 'Observación, contraste y acción mínima',
      summary:
        'La Sangre de Bhaal opera como una célula profesional en miniatura: observa mucho, actúa poco y jamás revela todo por una sola pieza. Cada día deja una huella pequeña que los players pueden convertir en escena.',
      items: [
        {
          title: 'Fase 1: recogida',
          detail:
            'Ojos del Barro recoge rumores, entradas y salidas. No sabe qué busca. Solo marca quién se acercó a Boris, quién preguntó por la mina y quién duerme con armas cerca.',
          fields: [
            { label: 'Ventana', value: 'Amanecer y mediodía' },
            { label: 'Cobertura', value: 'Limosna, establo, recados' },
            { label: 'Salida visible', value: 'Marcas de tiza o piedras' },
          ],
          checks: [
            'Perception DC 13 para ver una marca repetida en dos calles.',
            'Insight DC 14 para detectar que el mismo borracho escucha más que bebe.',
            'Persuasion DC 13 para que un informante menor admita qué le pagan por mirar.',
          ],
        },
        {
          title: 'Fase 2: contraste',
          detail:
            'Manos Limpias compara rumores con libros contables, habitaciones alquiladas y horarios de mensajería. Buscan contradicciones, no certezas.',
          fields: [
            { label: 'Ventana', value: 'Mediodía y tarde' },
            { label: 'Cobertura', value: 'Facturas, portes, permisos' },
            { label: 'Error', value: 'Columnas demasiado limpias' },
          ],
          checks: [
            'Investigation DC 15 en libros para ver que una factura existe solo para justificar movimiento de una caja.',
            'History DC 13 para reconocer que el sello de Phandelver está copiado de una versión posterior.',
          ],
          clues: [
            'Un porte menciona "papel mojado" aunque no llovió.',
            'El mismo número de recibo aparece en dos negocios tapadera.',
          ],
        },
        {
          title: 'Fase 3: acción mínima',
          detail:
            'Si tienen una hipótesis, no atacan: hacen que otra persona mueva la pieza. Un susto, una carta falsa, una pregunta legal o un ruido nocturno bastan.',
          fields: [
            { label: 'Ventana', value: 'Atardecer o noche' },
            { label: 'Objetivo', value: 'Provocar traslado' },
            { label: 'Regla', value: 'Una acción visible por día' },
          ],
          consequences: [
            'Carta falsa de la Alianza: Boris consulta el cofre.',
            'Robo menor en la posada: Sildar recomienda custodia municipal.',
            'Rumor sobre Iarno: el grupo mira hacia Tresendar antes de saber por qué.',
          ],
        },
      ],
    },
    {
      id: 'tresendar-vault',
      label: 'Bóveda',
      title: 'Archivo bajo la mansión Tresendar',
      eyebrow: 'Piano, réquiem y destino final',
      summary:
        'El destino final del documento es un archivo sellado bajo la mansión. La entrada no se abre con una llave normal: hay que tocar el motivo de Dies Irae en el piano roto de la sala de música.',
      items: [
        {
          title: 'La sala del piano',
          detail:
            'La mansión conserva un piano ennegrecido, cubierto de polvo excepto por ocho teclas. No parece un puzzle hasta que los players relacionan música, funeral, Bhaal y las notas repetidas en mensajes cifrados.',
          fields: [
            { label: 'Lugar', value: 'Sala de música, ala oeste de Tresendar' },
            { label: 'Señal', value: 'Ocho teclas menos polvorientas' },
            { label: 'Motivo', value: 'Fa-Mi-Fa-Re-Mi-Do-Re-Re' },
            { label: 'Tema', value: 'Dies Irae, muerte y juicio' },
          ],
          checks: [
            'Perception DC 14 para ver polvo desplazado en teclas concretas.',
            'Performance DC 13 para reproducir el motivo si alguien ya lo oyó.',
            'Religion DC 15 para conectar el réquiem con Bhaal y el archivo de muerte.',
            'Investigation DC 16 para descubrir que las notas aparecen como iniciales en tres mensajes cifrados.',
          ],
          consequences: [
            'Éxito limpio: se abre una escalera estrecha bajo el piano.',
            'Una nota errónea: el mecanismo no abre y sube el reloj de cierre de la bóveda.',
            'Tres errores: aparece un custodio menor y se quema un documento señuelo.',
          ],
        },
        {
          title: 'Archivo del Réquiem',
          detail:
            'No es una mazmorra enorme. Es una cámara administrativa siniestra: estanterías, sellos, copias, identidades y una caja de hierro con el registro o su falsificación.',
          fields: [
            { label: 'Contenido clave', value: 'Registro, copia parcial, sello falso' },
            { label: 'Custodio', value: 'Iniciado de Venas del Pueblo' },
            { label: 'Trampa', value: 'Tinta férrica que revela intrusos' },
            { label: 'Salida', value: 'Pasillo al antiguo almacén' },
          ],
          contents: [
            'Caja de hierro con compartimento doble: registro auténtico si el reloj llegó al máximo, copia si aún está en tránsito.',
            'Libro de observación con nombres de players, rutas, heridas y preguntas hechas en Phandalin.',
            'Tres identidades limpias para mover a un agente fuera del pueblo.',
            'Plano incompleto de la Cueva del Eco con marcas de extracción de Nezznar.',
          ],
          security: [
            'Arcana DC 15 para notar que la tinta del escritorio se oscurece cerca de sangre reciente.',
            'Thieves Tools DC 16 para abrir la caja sin activar la mancha de prueba.',
            'Stealth DC 14 para moverse sin hacer sonar tubos de vidrio colgados tras una cortina.',
          ],
          clues: [
            'La copia falsa cambia un nombre de alto elfo por un testigo inexistente.',
            'El libro de observación revela que la secta todavía no conoce toda la ruta de la mina.',
          ],
        },
        {
          title: 'Cómo sembrar el puzzle antes de la mansión',
          detail:
            'No debe parecer un acertijo caído del cielo. Repite el motivo como rumor, canción, código y obsesión antes de que el grupo vea el piano.',
          clues: [
            'Un niño tararea cuatro notas después de escuchar al mozo de establo.',
            'Una carta cifrada usa las iniciales F-M-F-R-M-D-R-R como columnas de contabilidad.',
            'Sister Garaele reconoce la melodía como una secuencia funeraria antigua.',
            'Un iniciado de sangre golpea la mesa con el ritmo cuando está nervioso.',
          ],
          dmNotes: [
            'Si nadie sabe música, deja que Religion, History o Investigation descubran el orden. El puzzle debe premiar atención, no bloquear la campaña.',
          ],
        },
      ],
    },
    {
      id: 'communications',
      label: 'Comunicaciones',
      title: 'Rutina diaria de mensajes',
      eyebrow: 'Palomares, cifra y disciplina',
      summary:
        'La red comunica poco, siempre con excusa mundana y con redundancia. Si los players interceptan una nota, debe parecer comercio local hasta que crucen tres pistas.',
      items: [
        {
          title: 'Ciclo diario',
          detail:
            'Cada día tiene cuatro ventanas. Amanecer: revisión de marcas y alijos. Mediodía: recados comerciales. Atardecer: palomar interior. Medianoche: solo crisis o mensaje de Nezznar.',
          fields: [
            { label: 'Amanecer', value: 'Tiza y cierres revisados' },
            { label: 'Mediodía', value: 'Recados con facturas falsas' },
            { label: 'Atardecer', value: 'Palomar del almacén' },
            { label: 'Medianoche', value: 'Solo emergencia' },
          ],
          checks: [
            'Percepción DC 13 para notar que el mismo recadero pasa dos veces por rutas distintas.',
            'Investigación DC 14 en facturas para detectar cantidades redondeadas que no cuadran con el peso.',
            'Insight DC 15 para notar que un colaborador responde con frases memorizadas.',
          ],
          clues: [
            'Cinta azul en una pata de paloma: retraso de objetivo.',
            'Cera negra sin sello: mensaje de la célula, no de un comerciante.',
            'Grano teñido con ceniza: aviso de vigilancia sobre el ayuntamiento.',
          ],
        },
        {
          title: 'Cifra de la Sangre Fría',
          detail:
            'La cifra usa lenguaje de herramientas y mercado. No es criptografía perfecta; es una capa para que una nota parezca aburrida si no se sabe el contexto.',
          fields: [
            { label: 'Martillo', value: 'Eliminar o neutralizar' },
            { label: 'Clavo', value: 'Vigilar a una persona' },
            { label: 'Aceite', value: 'Sobornar o calmar' },
            { label: 'Sierra', value: 'Separar un grupo' },
            { label: 'Tela blanca', value: 'Identidad limpia' },
            { label: 'Carbón', value: 'Quemar prueba' },
          ],
          checks: [
            'Investigation DC 13 si tienen dos mensajes cifrados.',
            'History DC 14 para recordar jerga mercantil falsa o poco natural.',
            'Thieves Tools o Calligrapher Tools DC 15 para reconstruir una tabla parcial.',
          ],
          consequences: [
            '1 éxito: entienden una palabra clave.',
            '2 éxitos: detectan objetivo o lugar aproximado.',
            '3 éxitos: identifican la célula que escribió el mensaje.',
          ],
        },
        {
          title: 'Palomares encubiertos',
          detail:
            'Hay dos palomares. Uno interior para Phandalin y otro exterior para rutas de la Costa de la Espada. Los vecinos creen que pertenecen a mensajería mercantil.',
          fields: [
            { label: 'Interior', value: 'Tejado de almacén' },
            { label: 'Exterior', value: 'Granero oeste' },
            { label: 'Responsable', value: 'Mozo de establo chantajeado' },
          ],
          contents: [
            'Anillas de color, grano tintado, cera negra, tres tubos de mensaje y una lista de nombres incompleta.',
            'Una nota quemada a medias con las palabras "clavo alto" y "carro norte".',
          ],
          security: [
            'Campanilla de hilo fino: Percepción DC 14 para verla, Sleight of Hand DC 13 para desarmarla.',
            'Paloma marcada con polvo azul; si vuelve alterada, la célula asume que el palomar está comprometido.',
          ],
        },
      ],
    },
    {
      id: 'operations',
      label: 'Operaciones',
      title: 'Qué hacen realmente cada semana',
      eyebrow: 'Negocio, miedo y sabotaje',
      summary:
        'El operativo no es una banda ruidosa. Funciona como una oficina criminal pequeña: recopila información, protege rutas, elimina riesgos y fabrica coartadas.',
      items: [
        {
          title: 'Control de recién llegados',
          detail:
            'Cualquier grupo armado que llegue a Phandalin entra en observación durante 24 horas. No atacan primero salvo que el grupo busque a Iarno, Gundren o la Cueva del Eco.',
          fields: [
            { label: 'Primer contacto', value: 'Mozo o posadera' },
            { label: 'Informe mínimo', value: 'Nombres, heridas, símbolos, monturas' },
            { label: 'Riesgo alto', value: 'Paladines, Tyr, Alianza de los Lores' },
          ],
          checks: [
            'Insight DC 14 en conversación casual para notar preguntas demasiado concretas.',
            'Perception DC 15 para ver una marca de tiza aparecer después de hospedarse.',
          ],
          consequences: [
            'Si los players no se esconden: la célula sabe dónde duermen esa noche.',
            'Si mienten bien: Deception DC 15 reduce el informe a rumores contradictorios.',
          ],
        },
        {
          title: 'Sabotaje de documentos',
          detail:
            'Su prioridad es impedir que el documento de propiedad de Gundren llegue limpio al pueblo. Prefieren mancharlo, robar una página, crear una copia falsa o sembrar dudas legales.',
          fields: [
            { label: 'Objetivo', value: 'Papeles de la familia Rockseeker' },
            { label: 'Método favorito', value: 'Robo parcial y copia mala' },
            { label: 'Coartada', value: 'Disputa minera ordinaria' },
          ],
          contents: [
            'Sello falso de la Alianza de los Lores.',
            'Pergamino envejecido con sales.',
            'Lista de testigos que pueden ser sobornados o asustados.',
          ],
          dmNotes: [
            'Si el grupo protege muy bien el documento, cambia el plan a desacreditar a Gundren como oportunista.',
          ],
        },
        {
          title: 'Pantalla de violencia local',
          detail:
            'La Sangre de Bhaal usa a los Anillos de Bronce y pequeños matones para que todo parezca bandolerismo, deudas o broncas del Sleeping Giant.',
          fields: [
            { label: 'Cara pública', value: 'Anillos de Bronce' },
            { label: 'Orden real', value: 'Nezznar por intermediarios' },
            { label: 'Fallo visible', value: 'Los pagos no siguen patrón local' },
          ],
          clues: [
            'Un bandido lleva una moneda marcada con gota partida y no sabe qué significa.',
            'Los Anillos de Bronce reciben órdenes escritas con jerga de herramientas.',
          ],
        },
      ],
    },
    {
      id: 'routes',
      label: 'Rutas',
      title: 'Rutas discretas de Phandalin',
      eyebrow: 'Movimiento interno',
      summary:
        'Phandalin no tiene una red subterránea inmensa. Tiene patios, cercas, horarios, barro, tejados bajos y gente que mira hacia otro lado.',
      items: [
        {
          title: 'Ruta del arroyo',
          detail:
            'Cruza detrás de viviendas y evita la calle principal. Perfecta con niebla; mala con lluvia fuerte porque deja huellas profundas.',
          fields: [
            { label: 'Uso', value: 'Entrada y fuga nocturna' },
            { label: 'Tiempo', value: '8-12 minutos' },
            { label: 'Riesgo', value: 'Huellas y perros' },
          ],
          checks: [
            'Stealth DC 13 para cruzar sin ser visto.',
            'Survival DC 12 para seguir huellas si llovió.',
            'Perception DC 15 para ver cuerda húmeda escondida bajo el puente.',
          ],
        },
        {
          title: 'Ruta de patios',
          detail:
            'Encadena tres patios privados. Los dueños creen que ayudan a contrabandistas menores, no a una secta de Bhaal.',
          fields: [
            { label: 'Uso', value: 'Mover paquetes pequeños' },
            { label: 'Llave', value: 'Gancho bajo maceta rota' },
            { label: 'Riesgo', value: 'Vecino madrugador' },
          ],
          checks: [
            'Acrobatics DC 14 para saltar verja sin ruido.',
            'Investigation DC 13 para encontrar el gancho.',
            'Persuasion DC 14 para convencer a un dueño asustado.',
          ],
        },
        {
          title: 'Ruta del tejado y palomar',
          detail:
            'Sirve para llegar al palomar interior y observar la calle principal. Solo la usan miembros ligeros o jóvenes recaderos.',
          fields: [
            { label: 'Uso', value: 'Observación y mensajes' },
            { label: 'Tiempo', value: '5 minutos' },
            { label: 'Riesgo', value: 'Tejas sueltas' },
          ],
          checks: [
            'Athletics DC 12 para subir.',
            'Acrobatics DC 15 para cruzar sin romper tejas.',
            'Perception DC 14 desde la calle para notar sombra en el alero.',
          ],
        },
        {
          title: 'Ruta del carro roto',
          detail:
            'Un carro abandonado tapa una marca de tiza que indica si el camino hacia el piso de emergencia está limpio.',
          fields: [
            { label: 'Uso', value: 'Señal y cobertura' },
            { label: 'Marca limpia', value: 'Media luna' },
            { label: 'Marca peligrosa', value: 'Tres rayas' },
          ],
          clues: [
            'La rueda tiene barro fresco aunque el carro no se mueve.',
            'La marca cambia después de que los players pregunten por Gundren.',
          ],
        },
      ],
    },
    {
      id: 'informants',
      label: 'Aliados',
      title: 'Informantes y colaboradores',
      eyebrow: 'Qué sabe cada pieza',
      summary:
        'La mayoría no sabe que sirve a Bhaal. Eso hace la red más resistente y más trágica: muchos son culpables, pocos entienden el tamaño del mal.',
      items: [
        {
          title: 'Mozo de establo',
          detail:
            'Informa de monturas nuevas, heridas, rutas previstas y si alguien compra pienso para más días de los declarados.',
          fields: [
            { label: 'Motivo', value: 'Chantaje por deuda familiar' },
            { label: 'Sabe', value: 'Palomar interior y dos recaderos' },
            { label: 'No sabe', value: 'Nezznar, Bhaal, Cueva del Eco' },
          ],
          clues: [
            'Tiene las uñas manchadas de cera negra.',
            'Evita mirar a paladines o símbolos de Tyr.',
          ],
        },
        {
          title: 'Escribano de media jornada',
          detail:
            'Cambia registros menores, retrasa permisos y copia firmas. Cree trabajar para una red de contrabando de mineral.',
          fields: [
            { label: 'Motivo', value: 'Dinero y miedo a perder cargo' },
            { label: 'Sabe', value: 'Nombres de Manos Limpias' },
            { label: 'Prueba', value: 'Libro de tasas con columnas duplicadas' },
          ],
          checks: [
            'Investigation DC 14 para ver que sus correcciones usan dos tintas.',
            'Insight DC 13 si se menciona a Iarno.',
          ],
        },
        {
          title: 'Vagabundo del pozo',
          detail:
            'Recolecta horarios, nombres y discusiones. No sabe leer; comunica con marcas de tiza y piedras apiladas.',
          fields: [
            { label: 'Motivo', value: 'Comida, techo y protección' },
            { label: 'Sabe', value: 'Tres señales de tiza' },
            { label: 'Riesgo moral', value: 'Es víctima y cómplice menor' },
          ],
          dmNotes: [
            'Funciona bien como escena de compasión: puede ayudar si los players le ofrecen seguridad real.',
          ],
        },
        {
          title: 'Comerciante endeudado',
          detail:
            'Permite usar su desván como sala limpia y firma portes falsos. Tiene pánico de que su familia sea usada como garantía.',
          fields: [
            { label: 'Motivo', value: 'Deuda y amenaza indirecta' },
            { label: 'Sabe', value: 'Piso limpio, ruta de patios' },
            { label: 'Prueba', value: 'Recibos con la misma mancha circular' },
          ],
          consequences: [
            'Si lo presionan en público, avisa a la red por miedo.',
            'Si lo aíslan y protegen, revela el desván y un horario de reunión.',
          ],
        },
      ],
    },
    {
      id: 'safehouses',
      label: 'Pisos francos',
      title: 'Pisos francos, contenido y seguridad',
      eyebrow: 'Lugares útiles durante diez minutos',
      summary:
        'No son fortalezas. Son espacios de paso: esconder a alguien, cambiar ropa, destruir una nota, aguantar una noche o preparar una emboscada pequeña.',
      items: [
        {
          title: 'Cuarto trasero del Sleeping Giant',
          detail:
            'El más usado y el más arriesgado. Está pensado para cerrar una conversación violenta, no para resistir un asedio.',
          fields: [
            { label: 'Uso', value: 'Intimidación y cambio de ropa' },
            { label: 'Salida', value: 'Patio estrecho' },
            { label: 'Ocupación', value: '1-3 personas' },
          ],
          contents: [
            'Manta oscura, jarra de agua, dos capas reversibles, kit de ganzúas sencillo, una daga sin marca.',
            'Caja bajo tabla: 18 gp, vendas, cera negra, tres notas cifradas de baja importancia.',
          ],
          security: [
            'Trampilla falsa con polvo de carbón: Investigation DC 14 para detectarla.',
            'Cuerda con campanilla detrás de barriles: Perception DC 13, Sleight of Hand DC 12.',
          ],
          clues: [
            'La mesa tiene marcas de cuchillo que forman una gota partida si se calcan.',
          ],
        },
        {
          title: 'Desván del comerciante endeudado',
          detail:
            'Sala limpia para reuniones con colaboradores no iniciados. No hay símbolos de Bhaal; todo parece contrabando vulgar.',
          fields: [
            { label: 'Uso', value: 'Reuniones y pagos' },
            { label: 'Salida', value: 'Escalera exterior' },
            { label: 'Ocupación', value: '2-5 personas' },
          ],
          contents: [
            'Facturas, ropa de trabajo, saco con mineral barato, dos identidades de carretero, mapas incompletos.',
            'Caja de doble fondo con sello falso de transportista y lista de deudores.',
          ],
          security: [
            'Escalón que cruje a propósito: Stealth DC 15 para evitarlo.',
            'Vecino cómplice menor que avisa si ve armas largas: Deception DC 14 para engañarlo.',
          ],
        },
        {
          title: 'Bodega bajo casa abandonada',
          detail:
            'Punto de emergencia. Es el único con símbolos reales de Bhaal, porque se usa cuando la célula ya asume que la cobertura está rota.',
          fields: [
            { label: 'Uso', value: 'Fuga, ocultación y ritual menor' },
            { label: 'Salida', value: 'Zanja hacia afueras' },
            { label: 'Ocupación', value: '1-2 personas' },
          ],
          contents: [
            'Agua, pan duro, tinta férrica, cuchillo ritual, cuerda, capa con barro seco y un pequeño foco de sangre coagulada.',
            'Bolsa sellada: tres nombres de infiltrados parciales, todos con apodos.',
          ],
          security: [
            'Sigilo de alarma de sangre: Arcana DC 15 para reconocerlo, Dispel Magic o Arcana DC 16 para apagarlo.',
            'Tabla con clavos bajo alfombra: Perception DC 13; si se pisa, daño menor y ruido suficiente para alertar.',
          ],
          dmNotes: [
            'Si los players encuentran este lugar, la campaña puede pasar de "crimen local" a "secta oculta".',
          ],
        },
      ],
    },
    {
      id: 'caches',
      label: 'Alijos',
      title: 'Alijos interactuables',
      eyebrow: 'Recursos ocultos',
      summary:
        'Cada alijo resuelve una necesidad concreta. Ninguno contiene bastante información para comprometer toda la red, pero varios juntos dibujan el mapa del operativo.',
      items: [
        {
          title: 'Barril falso del Sleeping Giant',
          detail:
            'Alijo de respuesta rápida para una pelea que debe parecer tabernaria. Está preparado para armar a dos personas y borrar marcas superficiales.',
          fields: [
            { label: 'Función', value: 'Combate corto' },
            { label: 'Acceso', value: 'Marca de uña en aro inferior' },
            { label: 'Riesgo', value: 'Muy expuesto' },
          ],
          contents: [
            '2 dagas curvas, blackjack, vendas, 12 gp, ampolla de sangre coagulada, capa reversible.',
          ],
          checks: [
            'Investigation DC 13 para detectar peso falso.',
            'Sleight of Hand DC 12 para abrir sin romper el aro.',
          ],
        },
        {
          title: 'Piedra hueca junto al ayuntamiento',
          detail:
            'Alijo de cifra. Sirve para dejar mensajes cuando el palomar está vigilado.',
          fields: [
            { label: 'Función', value: 'Mensajes y sellos' },
            { label: 'Acceso', value: 'Girar piedra al norte' },
            { label: 'Riesgo', value: 'Visible de día' },
          ],
          contents: [
            'Tres notas cifradas, cera negra, sello falso de paso, carbón, aguja fina.',
          ],
          security: [
            'Polvo rojo en grieta: si se mueve mal, mancha los dedos y marca al intruso.',
          ],
        },
        {
          title: 'Bolsa impermeable del arroyo',
          detail:
            'Alijo de fuga para alguien que sale del pueblo mojado, herido o perseguido.',
          fields: [
            { label: 'Función', value: 'Escape' },
            { label: 'Acceso', value: 'Cuerda bajo piedra plana' },
            { label: 'Riesgo', value: 'Huellas en barro' },
          ],
          contents: [
            'Ropa común, mapa de dos rutas, 6 sp, pan seco, vial que oculta olor de sangre durante una escena.',
          ],
        },
        {
          title: 'Caja de identidades',
          detail:
            'Oculta en un doble fondo de suministros. Contiene vidas falsas, no tesoro.',
          fields: [
            { label: 'Función', value: 'Coartadas' },
            { label: 'Acceso', value: 'Llave oxidada de alijo viejo' },
            { label: 'Riesgo', value: 'Compromete Manos Limpias' },
          ],
          contents: [
            '3 nombres falsos, 2 cartas de recomendación, tinta, anillos baratos, recibos de posada, capa noble gastada.',
          ],
          clues: [
            'Una identidad aparece también en registros del escribano.',
          ],
        },
        {
          title: 'Sepultura sin nombre',
          detail:
            'Alijo ritual de último recurso. Solo el núcleo sabe que existe.',
          fields: [
            { label: 'Función', value: 'Ritual y silencio' },
            { label: 'Acceso', value: 'Tres piedras negras alineadas' },
            { label: 'Riesgo', value: 'Alta señal religiosa' },
          ],
          contents: [
            'Foco ritual envuelto en lino, cuchillo ceremonial, ceniza fría, lista de nombres sin contexto.',
          ],
          security: [
            'La tierra está compactada con sal y sangre seca: Religion DC 15 para entender el símbolo.',
          ],
        },
      ],
    },
    {
      id: 'capture',
      label: 'Captura',
      title: 'Si capturan a un agente',
      eyebrow: 'Interrogatorio narrativo no gráfico',
      summary:
        'Usa este sistema para sacar información sin describir violencia explícita. La tensión viene de lealtad, miedo, pruebas, promesas y contradicciones, no de recrearse en daño físico.',
      items: [
        {
          title: 'Reloj de resistencia',
          detail:
            'Cada agente tiene un reloj de 6 segmentos. Los éxitos llenan el reloj de revelación; los fallos llenan el reloj de pánico. Si pánico se completa primero, el agente miente, se bloquea o intenta activar una señal.',
          fields: [
            { label: 'Segmentos', value: '6 revelación / 4 pánico' },
            { label: 'Duración', value: 'Una escena' },
            { label: 'Tono', value: 'Presión narrativa' },
          ],
          checks: [
            'Insight DC 13 para detectar qué teme realmente.',
            'Persuasion DC 14 si ofrecen protección creíble.',
            'Intimidation DC 15 para romper una coartada, con riesgo de pánico.',
            'Investigation DC 14 usando pruebas físicas del alijo o la cifra.',
            'Medicine DC 12 si está herido: estabilizarlo reduce pánico y mejora cooperación.',
          ],
          consequences: [
            '2 segmentos: revela un apodo o ruta menor.',
            '4 segmentos: revela un alijo o colaborador no iniciado.',
            '6 segmentos: revela célula, palomar o piso franco según su nivel.',
            'Pánico completo: activa una mentira preparada o intenta dejar una marca de aviso.',
          ],
        },
        {
          title: 'Niveles de conocimiento',
          detail:
            'Nadie debe saber todo. Incluso un iniciado real solo conoce su célula, una ruta y un punto de emergencia.',
          fields: [
            { label: 'Colaborador', value: '1 señal, 1 contacto' },
            { label: 'Recadero', value: '2 rutas, 1 alijo menor' },
            { label: 'Iniciado', value: 'Célula, palomar, piso de emergencia' },
            { label: 'Núcleo', value: 'Nezznar por símbolo, no por rostro' },
          ],
          dmNotes: [
            'Si un player pregunta algo que el agente no sabe, responde con miedo real y detalles erróneos, no con silencio artificial.',
            'Una confesión limpia debe costar pruebas, protección o una escena de confianza.',
          ],
        },
        {
          title: 'Señales de contrainteligencia',
          detail:
            'La red asume capturas. Sus agentes tienen frases de seguridad, mentiras parciales y marcas para avisar de que hablaron bajo presión.',
          fields: [
            { label: 'Frase segura', value: 'La madera llegó húmeda' },
            { label: 'Marca de aviso', value: 'Tiza vertical bajo puerta' },
            { label: 'Mentira común', value: 'Culpar a contrabandistas' },
          ],
          checks: [
            'Insight DC 15 para notar que una frase se repite como contraseña.',
            'Perception DC 14 para ver que intenta mancharse un dedo con polvo rojo.',
          ],
          consequences: [
            'Si la red recibe señal de captura, abandona un alijo menor y mueve una reunión al desván.',
          ],
        },
      ],
    },
    {
      id: 'clues',
      label: 'Pistas',
      title: 'Escalada de pistas para la mesa',
      eyebrow: 'De crimen local a secta filosófica',
      summary:
        'La revelación funciona mejor si primero parece bandolerismo, luego corrupción, luego culto. Cada escena debe ofrecer una pista útil aunque los players no resuelvan todo.',
      items: [
        {
          title: 'Pistas suaves',
          detail:
            'Úsalas en sesiones tempranas. No prueban la secta; solo crean patrón.',
          clues: [
            'Cera negra sin sello.',
            'La misma palabra comercial repetida en documentos sin relación.',
            'Tiza roja en esquinas donde no hay obras.',
            'Un informante mira más a los símbolos religiosos que a las armas.',
          ],
        },
        {
          title: 'Pistas medias',
          detail:
            'Empiezan a romper la coartada de crimen ordinario.',
          clues: [
            'Un alijo contiene equipo de batalla y una identidad falsa.',
            'Un mensaje usa "clavos" para referirse claramente a personas.',
            'Un bandido de los Anillos de Bronce cobró de alguien que no conoce.',
            'Una costra negra aparece en una cerradura abierta sin herramientas.',
          ],
        },
        {
          title: 'Pistas fuertes',
          detail:
            'Con estas ya pueden sospechar de una estructura filosófica y ritual.',
          clues: [
            'El símbolo de gota partida aparece en un foco ritual.',
            'Un iniciado habla de "terminar el sufrimiento racional".',
            'Un palomar conecta a Phandalin con rutas externas y Nezznar.',
            'Un documento muestra que Iarno fue buscado por la Alianza, pero alguien borró su rastro.',
          ],
          consequences: [
            'Cuando los players unan tres pistas fuertes, activa una reacción: mudanza de piso franco, presión contra un testigo o emboscada indirecta.',
          ],
        },
      ],
    },
  ] satisfies DossierView[],
}
