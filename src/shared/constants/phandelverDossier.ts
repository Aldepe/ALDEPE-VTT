export interface DossierMetric {
  label: string
  value: string
  detail: string
}

export interface DossierItem {
  title: string
  detail: string
}

export interface DossierSection {
  title: string
  eyebrow: string
  body: string
  items: DossierItem[]
}

export interface DossierCell {
  name: string
  role: string
  members: string
  pressure: string
}

export const bloodOfBhaalDossier = {
  title: 'Operativo Sangre de Bhaal',
  subtitle: 'Red secreta de Phandalin',
  premise:
    'La Sangre de Bhaal no controla Phandalin como un ejercito. Lo controla como una infeccion pequena, paciente y bien escondida: favores, miedo, rutas discretas, negocios tapadera y gente vulnerable usada como ojos.',
  doctrine:
    'Su filosofia sostiene que la vida racional ha convertido el mundo en una fabrica de sufrimiento consciente. No buscan gobernar el pueblo; quieren mantenerlo lo bastante estable para extraer informacion, sabotear la llegada de la Alianza de los Lores y proteger el trabajo de Nezznar en la Cueva del Eco.',
  metrics: [
    { label: 'Nucleo real', value: '5-7', detail: 'Rogues con magia de sangre y juramento directo a Bhaal.' },
    { label: 'Colaboradores', value: '10-14', detail: 'Deudores, matones, informantes pagados y gente chantajeada.' },
    { label: 'Pisos francos', value: '3', detail: 'Uno principal, uno de emergencia y uno limpio para reuniones cortas.' },
    { label: 'Alijos', value: '6', detail: 'Pequenos, separados y con material suficiente para una accion concreta.' },
    { label: 'Palomares', value: '2', detail: 'Comunicacion lenta pero segura con codigos de color y cinta.' },
    { label: 'Exposicion', value: 'Baja', detail: 'Si una pieza cae, no revela toda la red.' },
  ],
  cells: [
    {
      name: 'Cuchillos de Medianoche',
      role: 'Ejecucion discreta',
      members: '2 asesinos menores y 1 aprendiz de magia de sangre.',
      pressure: 'Matan poco; prefieren accidentes, intimidacion y desapariciones de una noche.',
    },
    {
      name: 'Manos Limpias',
      role: 'Negocios tapadera',
      members: '2 comerciantes comprados, 1 escribano y varios recaderos.',
      pressure: 'Mueven dinero, justifican cargamentos y esconden pagos como deudas comerciales.',
    },
    {
      name: 'Ojos del Barro',
      role: 'Informacion callejera',
      members: 'Vagabundos, borrachos habituales y ninos de recados usados sin revelarles el culto.',
      pressure: 'No son cultistas. Venden rumores por comida, cobre, techo o proteccion.',
    },
    {
      name: 'Venas del Pueblo',
      role: 'Magia de sangre',
      members: '3 iniciados capaces de marcar puertas, sellar heridas falsas y activar sigilos de alarma.',
      pressure: 'Su magia deja pistas fisicas: costras negras, olor metalico, hilo rojo seco.',
    },
  ],
  sections: [
    {
      title: 'Alijos',
      eyebrow: 'Recursos ocultos',
      body:
        'Cada alijo resuelve una necesidad concreta. Ninguno contiene bastante informacion para comprometer toda la red.',
      items: [
        {
          title: 'Barril falso del Sleeping Giant',
          detail: 'Dos dagas curvas, vendas, monedas manchadas y una ampolla de sangre coagulada para rituales menores.',
        },
        {
          title: 'Piedra hueca cerca del Ayuntamiento',
          detail: 'Mensajes cifrados, cera negra y un sello falso para documentos de paso.',
        },
        {
          title: 'Caja doble en Lionshield Coster',
          detail: 'Material marcado como recambio de bisagras; en realidad contiene ganzuas y hojas finas.',
        },
        {
          title: 'Bolsa impermeable junto al arroyo',
          detail: 'Ruta de escape, ropa sencilla y un vial que borra rastros de sangre durante unos minutos.',
        },
        {
          title: 'Hueco bajo la vieja calzada',
          detail: 'Cuerda, clavos, tiza roja, una llave oxidada y una lista de nombres tachados.',
        },
        {
          title: 'Sepultura sin nombre',
          detail: 'Alijo de emergencia. Solo el nucleo sabe que contiene un foco ritual envuelto en lino.',
        },
      ],
    },
    {
      title: 'Comunicaciones',
      eyebrow: 'Palomares y cifra',
      body:
        'La red comunica poco y con redundancia. Un mensaje interceptado debe parecer comercio aburrido o supersticion local.',
      items: [
        {
          title: 'Palomar del granero oeste',
          detail: 'Usado para avisos hacia rutas externas. Cinta roja significa peligro; azul, retraso; negra, objetivo movido.',
        },
        {
          title: 'Palomar del tejado del almacén',
          detail: 'Usado dentro del pueblo. Nadie lo llama palomar: figura en cuentas como jaula de mensajeria mercantil.',
        },
        {
          title: 'Cifra de la Sangre Fria',
          detail: 'Sustitucion simple con nombres de herramientas. Martillo es matar, clavo es vigilar, aceite es sobornar.',
        },
        {
          title: 'Tinta ferrica',
          detail: 'Mensajes escritos con mezcla ferrosa que se oscurece al calentar el papel cerca de una vela.',
        },
      ],
    },
    {
      title: 'Pisos francos',
      eyebrow: 'Lugares seguros',
      body:
        'Los pisos no son fortalezas. Son habitaciones utiles durante diez minutos: esconder a alguien, cambiar ropa, quemar una nota.',
      items: [
        {
          title: 'Cuarto trasero de la taberna',
          detail: 'El mas usado y el mas arriesgado. Tiene salida a un patio estrecho y una trampilla falsa.',
        },
        {
          title: 'Desvan del comerciante endeudado',
          detail: 'Piso limpio para reuniones con colaboradores que no deben ver simbolos de Bhaal.',
        },
        {
          title: 'Bodega bajo casa abandonada',
          detail: 'Punto de emergencia. Contiene manta, agua, cuchillo, tinta y una ruta hacia las afueras.',
        },
      ],
    },
    {
      title: 'Rutas alternativas',
      eyebrow: 'Movimiento interno',
      body:
        'Phandalin es pequeno, asi que no hay una red subterranea inmensa. Hay atajos, patios, cercas bajas y horarios estudiados.',
      items: [
        {
          title: 'Ruta del arroyo',
          detail: 'Sirve para cruzar de noche sin pisar la calle principal. Mala con lluvia, perfecta con niebla.',
        },
        {
          title: 'Ruta de patios',
          detail: 'Encadena tres patios privados cuyos duenos creen que solo ayudan a contrabandistas menores.',
        },
        {
          title: 'Ruta del carro roto',
          detail: 'Un carro abandonado tapa una marca de tiza que indica si el camino hacia la guarida esta limpio.',
        },
        {
          title: 'Ruta de campanas',
          detail: 'Depende de los horarios del templo y la taberna. Si ambos suenan o gritan, se cubren pasos y puertas.',
        },
      ],
    },
    {
      title: 'Infiltrados',
      eyebrow: 'Control social',
      body:
        'La red no necesita controlar a todos. Le basta con saber antes que nadie quien llega, quien pregunta y quien tiene miedo.',
      items: [
        {
          title: 'Escribano de media jornada',
          detail: 'No es devoto. Cambia registros menores por dinero y cree trabajar para contrabandistas.',
        },
        {
          title: 'Mozo de establo',
          detail: 'Avisa de caballos nuevos, rutas de salida y heridas sospechosas.',
        },
        {
          title: 'Vagabundo del pozo',
          detail: 'Ve reuniones, escucha nombres y recibe comida. No sabe que sus marcas alimentan una secta.',
        },
        {
          title: 'Comerciante endeudado',
          detail: 'Presta almacen, cambia paquetes y teme que su familia pague su deuda.',
        },
      ],
    },
    {
      title: 'Pistas para jugadores',
      eyebrow: 'Mesa',
      body:
        'Las pistas deben parecer crimen local hasta que se acumulen. La revelacion funciona mejor si primero parece bandolerismo.',
      items: [
        {
          title: 'Pista suave',
          detail: 'Cera negra en cartas sin sello, o la misma palabra comercial repetida en documentos sin relacion.',
        },
        {
          title: 'Pista media',
          detail: 'Un alijo con tiza roja, una daga ritual y una nota que habla de clavos cuando claramente se refiere a personas.',
        },
        {
          title: 'Pista fuerte',
          detail: 'Un iniciado de magia de sangre deja una costra negra con forma de gota partida.',
        },
        {
          title: 'Revelacion',
          detail: 'Los jugadores descubren que los matones visibles eran pantalla; el pueblo lleva semanas siendo medido desde dentro.',
        },
      ],
    },
  ],
}
