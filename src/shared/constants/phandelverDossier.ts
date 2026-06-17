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

export interface DossierDiscoveryCategory {
  id: string
  label: string
  detail: string
}

export interface DossierDiscovery {
  id: string
  category: string
  title: string
  trigger: string
  setup: string
  challengeKind: string
  difficulty: string
  goal: string
  fields?: DossierFact[]
  checks?: string[]
  contents?: string[]
  security?: string[]
  puzzle?: string[]
  combat?: string[]
  clues?: string[]
  rewards?: DossierFact[]
  complications?: string[]
  nextLeads?: string[]
  dmNotes?: string[]
}

export interface DossierDailyOperation {
  roll: string
  title: string
  routine: string
  signs: string[]
  counterplay: string[]
  consequences: string[]
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
      id: 'bhaal-system',
      title: 'Sistema de Bhaal',
      detail: 'Lo que el grupo entiende sobre la red real: informantes, marcas, alijos, tapaderas y núcleo de la mansión.',
      max: 5,
      initial: 0,
      segments: [
        'Hay niños de recados y vagabundos observando.',
        'Las marcas de tiza coordinan vigilancia y rutas.',
        'Los alijos tienen funciones separadas: identidad, combate, asesinato.',
        'Taberna y carnicería sostienen dinero, cuerpos y coartadas.',
        'La mayoría de operativos reales se concentran bajo la mansión.',
      ],
    },
    {
      id: 'cipher-system',
      title: 'Sistema de cifrado',
      detail: 'Avance del grupo descifrando palomas, palabras de oficio, colores de tiza y notas musicales.',
      max: 5,
      initial: 0,
      segments: [
        'Colores de tiza indican acción: observar, limpiar, mover, peligro.',
        'Mensajes cifrados usan palabras de comercio y carnicería.',
        'Anillas de paloma indican prioridad y célula.',
        'Iniciales musicales esconden Fa-Mi-Fa-Re-Mi-Do-Re-Re.',
        'Pueden leer una orden operativa completa sin ayuda.',
      ],
    },
    {
      id: 'permit-trail',
      title: 'Rastro del permiso',
      detail: 'Lo que han deducido sobre dónde está el registro de propiedad de la mina y cómo se mueve.',
      max: 6,
      initial: 0,
      segments: [
        'Boris trae un documento, no solo un contrato.',
        'El documento puede validar legalmente la mina.',
        'La secta intenta provocar traslados, no solo robar.',
        'Existe una copia falsa preparada.',
        'El destino final está bajo la mansión.',
        'El archivo se abre con el piano de Dies Irae.',
      ],
    },
    {
      id: 'mansion-access',
      title: 'Acceso a la base',
      detail: 'Pistas acumuladas sobre la entrada oculta bajo la mansión y el motivo musical que la abre.',
      max: 4,
      initial: 0,
      segments: [
        'Oyen o encuentran el motivo funerario repetido.',
        'Relacionan Dies Irae con Bhaal y la muerte racional.',
        'Aprenden la secuencia Fa-Mi-Fa-Re-Mi-Do-Re-Re.',
        'Saben que debe tocarse en el piano de la mansión.',
      ],
    },
  ] satisfies DossierClock[],
  discoveryCategories: [
    { id: 'informants', label: 'Informantes', detail: 'Niños de recados y vagabundos usados como ojos baratos.' },
    { id: 'communications', label: 'Comunicación', detail: 'Palomares, mensajes cifrados y marcas de tiza de colores.' },
    { id: 'caches', label: 'Alijos', detail: 'Identidad, combate y asesinato; separados para que una caída no revele todo.' },
    { id: 'safehouses', label: 'Pisos francos', detail: 'Casas discretas con equipo, comida y coartadas para ocultarse días.' },
    { id: 'fronts', label: 'Tapaderas', detail: 'Taberna para blanquear y carnicería para deshacerse de cuerpos.' },
    { id: 'agents', label: 'Operativos', detail: 'Espías, asesinos, infiltrado de Tymora y núcleo concentrado bajo la mansión.' },
    { id: 'routes', label: 'Rutas', detail: 'Horno sobornado, trastiendas abiertas y parkour por patios y cajas.' },
    { id: 'mansion', label: 'Mansión', detail: 'Pistas finales hacia el permiso, la base y el piano de Dies Irae.' },
  ] satisfies DossierDiscoveryCategory[],
  discoveries: [
    {
      id: 'errand-kid-watching',
      category: 'informants',
      title: 'Niño de recados mirando demasiado',
      trigger: 'Un niño aparece en dos escenas distintas, siempre cerca del grupo o de Boris.',
      setup:
        'El niño cree que trabaja para una red de contrabando. Le pagan con comida, una moneda y la promesa de que nadie molestará a su familia.',
      challengeKind: 'Social / persecución corta',
      difficulty: 'DC 13-15',
      goal: 'Que el grupo entienda que hay ojos baratos por la ciudad sin revelar aún la secta.',
      fields: [
        { label: 'No sabe', value: 'Bhaal, Nezznar, mansión' },
        { label: 'Sí sabe', value: 'Quién le paga, dónde deja marcas' },
        { label: 'Riesgo', value: 'Si lo asustan, corre hacia una ruta preparada' },
      ],
      checks: [
        'Perception DC 13 para darse cuenta de que repite ruta sin hacer recados reales.',
        'Athletics o Acrobatics DC 13 para alcanzarlo sin armar escándalo.',
        'Persuasion DC 14 con comida/protección; Intimidation DC 15 funciona, pero sube presión y lo vuelve menos fiable.',
      ],
      clues: [
        'Describe una marca de tiza azul como "la señal de mirar".',
        'Sabe que una campanada del horno significa que la puerta trasera estará abierta.',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: usan niños de recados como vigilancia periférica.' },
        { label: 'Rutas', value: 'Desbloquea el horno sobornado.' },
      ],
      complications: [
        'Un asesino menor lo observa desde una esquina; si el grupo se pasa, el niño desaparece dos días.',
      ],
      nextLeads: ['Horno de la calle baja', 'Marca de tiza azul', 'Vagabundo del pozo'],
    },
    {
      id: 'beggar-mark-network',
      category: 'informants',
      title: 'Vagabundo marcando piedras junto al pozo',
      trigger: 'Un vagabundo mueve tres piedras cada vez que una persona concreta entra o sale de una calle.',
      setup:
        'No sabe leer. Comunica conteos y dirección con piedras, tiza y cordeles. Es víctima de presión económica, no devoto.',
      challengeKind: 'Empatía / investigación',
      difficulty: 'DC 12-15',
      goal: 'Permitir una escena humana que revele el sistema sin convertir a todos los pobres del pueblo en enemigos.',
      checks: [
        'Insight DC 12 para notar miedo real, no fanatismo.',
        'Investigation DC 14 para reconstruir el patrón de piedras.',
        'Persuasion DC 15 si le ofrecen techo seguro; baja a DC 12 si ya protegieron al niño de recados.',
      ],
      clues: [
        'Rojo significa peligro; azul significa observar; blanco significa mover paquete; negro significa limpiar.',
        'Ha visto paquetes salir de la carnicería sin olor a carne.',
      ],
      rewards: [
        { label: 'Cifrado', value: '+1: colores básicos de tiza.' },
        { label: 'Tapaderas', value: 'Abre pista hacia la carnicería.' },
      ],
      complications: [
        'Si hablan con él en público, un recadero pone tiza negra cerca del pozo y la célula borra un alijo menor.',
      ],
      nextLeads: ['Carnicería de Murn', 'Tiza negra', 'Alijo de identidad'],
    },
    {
      id: 'dovecote-roof',
      category: 'communications',
      title: 'Palomar en un tejado discreto',
      trigger: 'Ven una paloma con anilla azul volver a un tejado que nadie usa oficialmente.',
      setup:
        'El palomar interior manda mensajes dentro de Phandalin. Las anillas indican prioridad; el texto parece inventario aburrido.',
      challengeKind: 'Infiltración / puzzle de mensajes',
      difficulty: 'DC 14-16',
      goal: 'Que consigan un mensaje cifrado sin entenderlo completo aún.',
      fields: [
        { label: 'Guardia', value: 'Ninguno fijo; alarma de cuerda' },
        { label: 'Botín de pista', value: '2 mensajes, 3 anillas, grano teñido' },
        { label: 'Fallo', value: 'La paloma marcada no vuelve al día siguiente' },
      ],
      checks: [
        'Athletics DC 12 para subir; Acrobatics DC 15 para no romper tejas.',
        'Perception DC 14 para detectar la cuerda con campanilla.',
        'Investigation DC 15 para ver que "costillas limpias" no habla de comida, sino de cadáveres.',
      ],
      clues: [
        'Anilla azul: vigilancia. Roja: acción violenta. Blanca: traslado. Negra: limpieza de pruebas.',
        'Un mensaje menciona "ocho notas antes de bajar".',
      ],
      rewards: [
        { label: 'Cifrado', value: '+1: sistema de anillas.' },
        { label: 'Acceso mansión', value: '+1 si conectan las ocho notas con el piano.' },
      ],
      complications: ['Si fallan por 5+, un operativo mueve el palomar exterior durante 24 horas.'],
      nextLeads: ['Mensaje cifrado', 'Carnicería', 'Sala de música de la mansión'],
    },
    {
      id: 'chalk-color-crossing',
      category: 'communications',
      title: 'Marcas de tiza de colores por la calle',
      trigger: 'Tras una escena social, aparece una marca de tiza donde antes no había nada.',
      setup:
        'La red usa marcas simples porque son rápidas y negables. Cada marca dura poco: lluvia, escoba o niño pagado.',
      challengeKind: 'Observación / deducción',
      difficulty: 'DC 12-16',
      goal: 'Dar un puzzle urbano repetible que el grupo pueda empezar a leer por patrones.',
      checks: [
        'Perception DC 12 para notar la marca antes de que la borren.',
        'Investigation DC 14 para asociar color con acción.',
        'Survival DC 15 para seguir una cadena de marcas sin perderse entre calles.',
      ],
      puzzle: [
        'Azul = observar. Blanco = mover. Negro = limpiar. Rojo = herir o matar. Verde = ruta abierta.',
        'Una flecha incompleta no apunta a un lugar; apunta a la siguiente marca visible desde una esquina concreta.',
      ],
      clues: [
        'Verde aparece cerca del horno cuando la trastienda está abierta.',
        'Negro aparece cerca de la carnicería después de una desaparición.',
      ],
      rewards: [
        { label: 'Cifrado', value: '+1: tabla de colores.' },
        { label: 'Sistema de Bhaal', value: '+1: la red coordina vigilancia sin hablar.' },
      ],
      complications: ['Si el grupo marca tiza falsa y falla Deception DC 14, la secta responde con una marca roja al día siguiente.'],
      nextLeads: ['Horno sobornado', 'Carnicería', 'Ruta de parkour'],
    },
    {
      id: 'ciphered-butcher-note',
      category: 'communications',
      title: 'Mensaje cifrado con jerga de carnicería',
      trigger: 'Encuentran una nota con pedidos de carne que no cuadran con cantidades reales.',
      setup:
        'El cifrado mezcla oficio y acción. No busca resistir a expertos; busca parecer aburrido para todos los demás.',
      challengeKind: 'Acertijo / herramientas',
      difficulty: 'DC 15',
      goal: 'Dar la primera puerta real al sistema de cifrado.',
      checks: [
        'Investigation DC 15 para detectar que los números son posiciones de palabras.',
        'Insight DC 13 si ya conocen la carnicería como tapadera.',
        'Thieves Tools, Calligrapher Tools o Cook Utensils DC 14 para reconstruir una parte del código.',
      ],
      puzzle: [
        'Costillas = cuerpos o testigos.',
        'Grasa = dinero blanqueado.',
        'Corte limpio = asesinato sin ruido.',
        'Pieza al frío = esconder a alguien en piso franco.',
      ],
      clues: [
        'La nota dice: "ocho cortes antes de bajar", frase espejo de las ocho notas del piano.',
        'Menciona "la casa grande" sin decir mansión.',
      ],
      rewards: [
        { label: 'Cifrado', value: '+1: palabras de oficio.' },
        { label: 'Permiso', value: '+1 si relacionan "pieza al frío" con mover el documento.' },
      ],
      complications: ['Si copian la nota mal, descifran una orden falsa que apunta a la taberna.'],
      nextLeads: ['Carnicería', 'Piso franco frío', 'Piano de la mansión'],
    },
    {
      id: 'identity-cache',
      category: 'caches',
      title: 'Alijo de identidad',
      trigger: 'Tras seguir tiza blanca o un recadero, encuentran una caja seca detrás de un falso zócalo.',
      setup:
        'Este alijo permite mover un agente o testigo sin que parezca huida: ropa común, nombres limpios y documentos baratos.',
      challengeKind: 'Registro / trampa menor',
      difficulty: 'DC 13-15',
      goal: 'Revelar que la secta puede borrar personas sin magia espectacular.',
      checks: [
        'Investigation DC 13 para encontrar doble fondo.',
        'Sleight of Hand DC 14 para abrir sin romper el sello de aviso.',
        'History DC 15 para detectar que una carta de recomendación usa un cargo municipal inexistente.',
      ],
      clues: [
        'Una identidad falsa repite iniciales F-M-F-R-M-D-R-R como clave de orden.',
        'Hay una identidad preparada para un "custodio de archivo".',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: alijos por función, no por tesoro.' },
        { label: 'Acceso mansión', value: '+1 si detectan las iniciales musicales.' },
      ],
      complications: ['Abrirlo torpemente deja polvo rojo en los dedos; un informante puede reconocer al intruso después.'],
      nextLeads: ['Custodio de archivo', 'Mansión', 'Mensaje de ocho iniciales'],
    },
    {
      id: 'combat-cache',
      category: 'caches',
      title: 'Alijo de equipamiento de combate',
      trigger: 'El grupo encuentra armas envueltas en paño aceitado cerca de una ruta rápida.',
      setup:
        'No es arsenal militar. Es equipo para armar a dos operativos y que una agresión parezca bronca local.',
      challengeKind: 'Emboscada opcional / investigación',
      difficulty: 'DC 14 o combate fácil-medio',
      goal: 'Dar una amenaza tangible sin revelar aún al núcleo.',
      checks: [
        'Investigation DC 14 para ver que las armas están numeradas con puntos de tiza.',
        'Perception DC 15 para notar a un asesino esperando a ver quién toca el alijo.',
      ],
      combat: [
        '1 asesino menor y 1 matón si quieres combate rápido.',
        'Si el grupo va tocado, usa solo persecución: el asesino intenta huir hacia la ruta de parkour.',
      ],
      clues: [
        'Las armas tienen grasa de carnicería, no aceite de herrero.',
        'Una daga lleva tiza roja en el pomo: señal de "corte limpio".',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: separan equipo por misión.' },
        { label: 'Tapaderas', value: 'Conecta carnicería con violencia encubierta.' },
      ],
      complications: ['Si lo dejan intacto, al día siguiente se usa contra un testigo menor.'],
      nextLeads: ['Carnicería', 'Asesino de la ruta', 'Tiza roja'],
    },
    {
      id: 'assassination-cache',
      category: 'caches',
      title: 'Alijo de asesinato',
      trigger: 'Encuentran una caja muy pequeña donde esperaban armas grandes.',
      setup:
        'Este alijo es quirúrgico: veneno, cuerda fina, aguja, ficha de objetivo y una frase ritualizada.',
      challengeKind: 'Horror investigativo / desarme',
      difficulty: 'DC 15-17',
      goal: 'Subir el tono: no son solo contrabandistas, alguien está eliminando sospechosos.',
      checks: [
        'Medicine DC 15 para identificar veneno anticoagulante.',
        'Investigation DC 16 para encontrar la ficha de objetivo bajo el forro.',
        'Religion DC 17 para conectar la frase "menos pensamiento, menos dolor" con Bhaal.',
      ],
      clues: [
        'El objetivo actual es alguien que ha preguntado por la caja municipal.',
        'La frase filosófica apunta a exterminio de racionales, no simple crimen.',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: aparece la ideología real.' },
        { label: 'Permiso', value: '+1: alguien sospecha de la custodia municipal.' },
      ],
      complications: ['Si tardan, el objetivo aparece herido o muerto fuera de escena y queda una marca roja.'],
      nextLeads: ['Caja municipal', 'Infiltrado de Tymora', 'Asesino filosófico'],
    },
    {
      id: 'safehouse-two-days',
      category: 'safehouses',
      title: 'Piso franco preparado para varios días',
      trigger: 'Una puerta normal abre a una habitación demasiado ordenada para una casa abandonada.',
      setup:
        'Hay cama, comida seca, ropa, agua, brasero sin humo, documentos de coartada y una salida estrecha. No está pensado para luchar, sino para desaparecer.',
      challengeKind: 'Exploración / seguridad',
      difficulty: 'DC 14-16',
      goal: 'Mostrar que la célula puede esconder agentes y testigos sin llamar la atención.',
      checks: [
        'Investigation DC 14 para detectar inventario por días.',
        'Perception DC 15 para ver el hilo de alarma en la salida trasera.',
        'Survival DC 13 para saber que alguien durmió ahí hace menos de 24 horas.',
      ],
      contents: [
        'Ropa de trabajador, pan seco, cantimplora, brasero, manta, cera negra, cuerda, dos nombres falsos.',
        'Una lista de horarios de la iglesia de Tymora y la taberna.',
      ],
      clues: [
        'La lista de horarios conecta iglesia y taberna como puntos de control.',
        'Hay una nota: "si el papel se mueve, casa grande".',
      ],
      rewards: [
        { label: 'Permiso', value: '+1: si el papel corre peligro, lo llevan a la mansión.' },
        { label: 'Sistema de Bhaal', value: '+1: pisos para ocultarse días.' },
      ],
      complications: ['Si se quedan demasiado, llega un recadero con comida y puede huir hacia el horno.'],
      nextLeads: ['Iglesia de Tymora', 'Taberna', 'Horno sobornado'],
    },
    {
      id: 'laundering-tavern',
      category: 'fronts',
      title: 'Taberna usada para blanquear dinero',
      trigger: 'Las ganancias de una noche no cuadran con la cantidad de clientes.',
      setup:
        'La taberna no es la base. Es la lavandería: caja, mesas de juego falsas, deudas inventadas y pagos por protección.',
      challengeKind: 'Social / contabilidad',
      difficulty: 'DC 14-16',
      goal: 'Que parezca crimen local hasta que el grupo enlace dinero, alijos y mansión.',
      checks: [
        'Investigation DC 15 en caja para ver ganancias infladas.',
        'Insight DC 14 con camarero para notar miedo a una persona que no está presente.',
        'Deception DC 16 para hacerse pasar por cobrador y provocar un contacto.',
      ],
      clues: [
        'Los pagos grandes coinciden con noches en que se movieron palomas.',
        'Un recibo marca "cena para la casa grande" aunque nadie entregó comida allí.',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: hay negocio tapadera para lavar dinero.' },
        { label: 'Permiso', value: '+1 si conectan pagos con traslado a mansión.' },
      ],
      complications: ['El dueño no es cultista; si lo exponen sin protegerlo, la secta lo usa como ejemplo.'],
      nextLeads: ['Carnicería', 'Casa grande', 'Palomar'],
    },
    {
      id: 'butcher-cleanup',
      category: 'fronts',
      title: 'Carnicería para deshacerse de cuerpos',
      trigger: 'Un olor metálico fuerte llega de una carnicería que dice no haber recibido ganado.',
      setup:
        'La carnicería limpia rastros, destruye cuerpos y codifica órdenes con lenguaje de cortes. Es una de las pistas más oscuras.',
      challengeKind: 'Infiltración / horror sobrio',
      difficulty: 'DC 15-17',
      goal: 'Revelar que la secta elimina sospechosos y tiene logística de ocultación.',
      checks: [
        'Perception DC 15 para distinguir olor de sangre humanoide bajo especias.',
        'Investigation DC 16 para encontrar una mesa con ranura de drenaje no comercial.',
        'Stealth DC 15 para registrar la trastienda sin que el carnicero cierre la calle.',
      ],
      clues: [
        'Los pedidos cifrados usan cortes como verbos operativos.',
        'Hay un nombre tachado: posible sospechoso eliminado por preguntar por el permiso.',
      ],
      rewards: [
        { label: 'Cifrado', value: '+1: jerga de carnicería.' },
        { label: 'Sistema de Bhaal', value: '+1: tapadera para limpieza de cuerpos.' },
      ],
      complications: ['Puede disparar combate con 1 carnicero matón y 1 asesino si el grupo entra sin plan.'],
      nextLeads: ['Alijo de asesinato', 'Mensaje cifrado', 'Taberna'],
    },
    {
      id: 'caught-spy',
      category: 'agents',
      title: 'Pillan a alguien espiándolos',
      trigger: 'Un mismo rostro aparece tras tres cambios de calle o escucha detrás de una puerta.',
      setup:
        'Es un observador menor, no un fanático. Tiene instrucciones de huir hacia una ruta rápida y soltar tiza negra si lo atrapan.',
      challengeKind: 'Persecución / interrogatorio no gráfico',
      difficulty: 'DC 13-16',
      goal: 'Dar una escena reactiva cuando los players notan vigilancia.',
      checks: [
        'Perception DC 13 para confirmar seguimiento.',
        'Athletics/Acrobatics DC 14 para cortar la huida.',
        'Insight DC 15 para separar miedo de mentira preparada.',
      ],
      clues: [
        'Sabe de niños, vagabundos y marcas de tiza, pero no de la mansión.',
        'Si lo tratan con protección, revela que la mayoría de operativos "de verdad" entran por la casa grande.',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: jerarquía entre observadores y operativos reales.' },
        { label: 'Mansión', value: 'Pista débil hacia la casa grande.' },
      ],
      complications: ['Si falla el interrogatorio, activa tiza negra y un piso franco se vacía.'],
      nextLeads: ['Ruta de parkour', 'Casa grande', 'Piso franco'],
    },
    {
      id: 'two-assassins',
      category: 'agents',
      title: 'Los dos asesinos de la facción',
      trigger: 'Cuando el grupo expone dos piezas de la red, Nezznar autoriza una eliminación limpia.',
      setup:
        'No hay muchos asesinos en la ciudad: solo dos. Son cuidadosos, filosóficos y prefieren aislar antes que pelear contra todo el grupo.',
      challengeKind: 'Combate / contraemboscada',
      difficulty: 'Combate medio o skill challenge DC 15',
      goal: 'Hacer sentir que la red responde de forma quirúrgica, no con oleadas infinitas.',
      fields: [
        { label: 'Asesino 1', value: 'Voryn "Soga Roja": cuerda, caídas, silencios' },
        { label: 'Asesino 2', value: 'Maela "Diente Frío": veneno, aguja, coartadas' },
      ],
      combat: [
        'Usa 2 asesinos si el grupo va fuerte; si no, 1 asesino + huida + rehén social.',
        'Objetivo prioritario: testigo, informante protegido o portador de prueba.',
      ],
      clues: [
        'Uno lleva una nota con tres iniciales musicales.',
        'El otro sabe que la iglesia tiene un infiltrado, pero no su nombre real.',
      ],
      rewards: [
        { label: 'Acceso mansión', value: '+1: iniciales musicales hacia Dies Irae.' },
        { label: 'Operativos', value: 'Confirma que casi todo el núcleo está en la mansión.' },
      ],
      complications: ['Si ambos mueren demasiado pronto, la mansión entra en modo cierre y acelera el reloj de permiso.'],
      nextLeads: ['Iglesia de Tymora', 'Piano', 'Mansión'],
    },
    {
      id: 'tymora-infiltrator',
      category: 'agents',
      title: 'Infiltrado en la iglesia de Tymora',
      trigger: 'Una ayuda religiosa llega demasiado tarde o una confesión privada aparece resumida en una nota cifrada.',
      setup:
        'El infiltrado no dirige la iglesia. Hace tareas pequeñas: escuchar, retrasar ayuda, mover llaves y sembrar culpabilidad.',
      challengeKind: 'Misterio social',
      difficulty: 'DC 14-17',
      goal: 'Que la iglesia deje de ser zona completamente segura sin convertirla en enemiga.',
      checks: [
        'Insight DC 15 para notar falsa devoción al hablar de sufrimiento.',
        'Religion DC 14 para detectar una frase incompatible con Tymora.',
        'Investigation DC 16 para hallar una nota escondida en un libro de donaciones.',
      ],
      clues: [
        'La nota menciona "el réquiem abre abajo".',
        'El infiltrado informa sobre quién protege a Boris y quién pregunta por el permiso.',
      ],
      rewards: [
        { label: 'Acceso mansión', value: '+1: el réquiem abre algo bajo tierra.' },
        { label: 'Permiso', value: '+1: la secta vigila a quien protege a Boris.' },
      ],
      complications: ['Si lo acusan sin prueba, la comunidad se divide y la secta gana cobertura social un día.'],
      nextLeads: ['Dies Irae', 'Piano', 'Registro de protección de Boris'],
    },
    {
      id: 'bribed-oven-route',
      category: 'routes',
      title: 'Horno sobornado y puerta de trastienda',
      trigger: 'Un informante dice que, tras una campanada concreta, siempre hay una puerta abierta.',
      setup:
        'El panadero no es sectario. Está sobornado para dejar abierta la trastienda durante pocos minutos después de una campanada.',
      challengeKind: 'Sigilo cronometrado',
      difficulty: 'DC 13-15',
      goal: 'Crear una ruta urbana tangible que puedan usar o vigilar.',
      checks: [
        'Perception DC 13 para identificar qué campana activa la ruta.',
        'Stealth DC 14 para cruzar sin mancharse de harina o hollín.',
        'Persuasion DC 15 para romper el soborno del panadero sin exponerlo.',
      ],
      clues: [
        'La ruta conecta tiza verde con un piso franco.',
        'Una bandeja tiene marcadas ocho muescas: ritmo de aviso usado por recaderos.',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: rutas rápidas por negocios sobornados.' },
        { label: 'Acceso mansión', value: '+1 si conectan las ocho muescas con el motivo musical.' },
      ],
      complications: ['Si la usan repetidamente, la secta cambia la campanada y coloca un observador.'],
      nextLeads: ['Piso franco', 'Ruta de parkour', 'Ocho muescas'],
    },
    {
      id: 'parkour-shortcut',
      category: 'routes',
      title: 'Ruta de parkour entre casas y cajas',
      trigger: 'Durante una persecución, un operativo cruza patios como si el camino estuviera preparado.',
      setup:
        'Cajas, barriles, toldos y tablones están dispuestos para acortar dos calles. Parece desorden urbano hasta que se usa.',
      challengeKind: 'Persecución física',
      difficulty: 'DC 13-16',
      goal: 'Dar una ruta memorable que haga la ciudad jugable, no solo descriptiva.',
      checks: [
        'Acrobatics DC 14 para seguir sin perder velocidad.',
        'Athletics DC 13 para saltar un muro bajo.',
        'Perception DC 15 para ver que los elementos fueron colocados a propósito.',
      ],
      clues: [
        'La ruta termina cerca de la taberna y un callejón hacia la mansión.',
        'Un tablón tiene tiza verde en la cara inferior.',
      ],
      rewards: [
        { label: 'Sistema de Bhaal', value: '+1: infraestructura urbana preparada.' },
        { label: 'Mansión', value: 'Pista de flujo: la ruta empuja hacia la casa grande.' },
      ],
      complications: ['Si fallan por 5+, caen en una zona visible y la secta identifica quién les persigue.'],
      nextLeads: ['Taberna', 'Mansión', 'Tiza verde'],
    },
    {
      id: 'daily-random-operation',
      category: 'mansion',
      title: 'Operación diaria de la secta',
      trigger: 'Al empezar cada día en Phandalin, tira o elige una operación.',
      setup:
        'La ciudad debe sentirse viva. La secta no espera quieta: chequea, mueve, limpia, infiltra o elimina lentamente.',
      challengeKind: 'Reloj / evento urbano',
      difficulty: 'Variable',
      goal: 'Mantener presión y dar oportunidades de investigación sin railroading.',
      checks: [
        'Si los players vigilan una zona correcta, dales un encuentro de esa categoría.',
        'Si vigilan una zona equivocada, dales una señal parcial y avanza un reloj enemigo.',
        'Si no investigan, ejecuta una operación y muestra la consecuencia al día siguiente.',
      ],
      clues: [
        'Cada operación deja una marca mínima: tiza, paloma, recibo, olor de carnicería, campanada o música.',
      ],
      rewards: [
        { label: 'Mesa', value: 'Usar la tabla diaria de operaciones como motor de misterio.' },
      ],
      nextLeads: ['Tabla diaria', 'Relojes', 'Categoría del hallazgo'],
    },
    {
      id: 'mansion-piano-final',
      category: 'mansion',
      title: 'Piano de Dies Irae bajo la mansión',
      trigger: 'Cuando tengan suficientes pistas: ocho notas, réquiem, casa grande, archivo bajo tierra.',
      setup:
        'El piano no es un acertijo gratuito. Es la suma de palomas, iniciales, ritmos, infiltrado de Tymora y obsesión funeraria de Bhaal.',
      challengeKind: 'Acertijo final / infiltración',
      difficulty: 'DC 15 si faltan pistas; automático si reunieron 4 pistas musicales',
      goal: 'Abrir la base oculta y llegar al destino final del permiso.',
      checks: [
        'Performance DC 13 si conocen la melodía.',
        'Religion DC 15 para reconocer Dies Irae como clave de muerte y juicio.',
        'Investigation DC 16 para ordenar pistas F-M-F-R-M-D-R-R.',
      ],
      puzzle: [
        'Secuencia: Fa-Mi-Fa-Re-Mi-Do-Re-Re.',
        'Si quieres traducir a letras anglosajonas: F-E-F-D-E-C-D-D.',
        'Tres errores activan cierre: se quema copia señuelo y aparece custodio.',
      ],
      clues: [
        'La escalera bajo el piano conduce al archivo donde está el permiso o la copia final.',
      ],
      rewards: [
        { label: 'Acceso mansión', value: 'Completa el track: entrada abierta.' },
        { label: 'Permiso', value: 'Revela el destino final del registro de propiedad.' },
      ],
      complications: [
        'Si llegan sin desmontar red suficiente, la mansión está poblada por operativos y el permiso puede ser copia falsa.',
      ],
      nextLeads: ['Archivo bajo la mansión', 'Custodio de sangre', 'Registro auténtico'],
    },
  ] satisfies DossierDiscovery[],
  dailyOperations: [
    {
      roll: '1',
      title: 'Chequeo rutinario',
      routine: 'Niños y vagabundos confirman marcas de tiza, palomar y rutas verdes.',
      signs: ['Una marca azul aparece cerca del grupo.', 'Un niño cambia de acera al verlos mirar.'],
      counterplay: ['Vigilar una marca: Perception DC 13.', 'Convencer a un informante: Persuasion DC 14.'],
      consequences: ['Si nadie interviene, la secta sabe dónde duermen o a quién visitan.'],
    },
    {
      roll: '2',
      title: 'Movimiento de alijo',
      routine: 'Un recadero mueve parte de un alijo a otro punto tras una campanada.',
      signs: ['Tiza blanca en una esquina.', 'Bolsa pequeña bajo delantal de panadero o mozo.'],
      counterplay: ['Seguir sin ser visto: Stealth DC 14.', 'Intercambiar paquete: Sleight of Hand DC 15.'],
      consequences: ['Si fallan, se pierde un alijo menor y aparece tiza negra.'],
    },
    {
      roll: '3',
      title: 'Blanqueo en taberna',
      routine: 'La taberna infla caja y crea una deuda falsa para pagar a un operativo.',
      signs: ['Clientes de mentira.', 'Recibo sin consumo real.', 'Monedas con olor a especias de carnicería.'],
      counterplay: ['Investigation DC 15 en caja.', 'Deception DC 16 fingiendo ser cobrador.'],
      consequences: ['Si no intervienen, un asesino recibe pago esa noche.'],
    },
    {
      roll: '4',
      title: 'Limpieza de sospechoso',
      routine: 'La secta amenaza, secuestra o elimina discretamente a alguien que vio demasiado.',
      signs: ['Tiza roja cerca del objetivo.', 'Paloma con anilla roja.', 'Pedido de "corte limpio".'],
      counterplay: ['Identificar objetivo: Investigation DC 15.', 'Protegerlo sin revelar plan: Stealth o Persuasion DC 14.'],
      consequences: ['Si fallan, al día siguiente hay desaparición y pista hacia la carnicería.'],
    },
    {
      roll: '5',
      title: 'Infiltración social',
      routine: 'Un colaborador intenta entrar en una rutina de los players o de Boris: iglesia, posada, escolta o suministros.',
      signs: ['Oferta demasiado conveniente.', 'Ayuda que llega justo a tiempo.', 'Pregunta amable sobre el equipaje.'],
      counterplay: ['Insight DC 15.', 'Background check con Investigation DC 14.'],
      consequences: ['Si entra, la secta avanza el rastro del permiso o descubre una protección.'],
    },
    {
      roll: '6',
      title: 'Orden desde la mansión',
      routine: 'Un operativo real baja de la mansión para corregir errores de la red periférica.',
      signs: ['Marcas borradas demasiado rápido.', 'Silencio repentino de informantes.', 'Música lejana o iniciales F-E-F-D.'],
      counterplay: ['Seguir al operativo: Stealth DC 16.', 'Capturar mensaje: Perception DC 15 + Investigation DC 15.'],
      consequences: ['Si escapa, acelera el cierre de la base y mueve el permiso hacia el archivo.'],
    },
  ] satisfies DossierDailyOperation[],
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
