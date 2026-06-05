export const CIUDADANIA = {
  surveyType: 'ciudadania',
  dimensiones: [
    {
      id: 'confianza',
      nombre: 'Confianza e Integridad',
      color: '#1a3c5e',
      preguntas: [
        {
          label: 'Transparencia y rendición de cuentas',
          texto: '¿Qué tan abierta y clara es la entidad con su información (más allá del cumplimiento de ley)?',
        },
        {
          label: 'Ética y lucha contra la corrupción',
          texto: '¿Qué tan honesta percibes a la entidad?',
        },
        {
          label: 'Justicia y equidad',
          texto: '¿Qué trato da la entidad a los ciudadanos, sin sesgos ni favoritismos?',
        },
      ],
    },
    {
      id: 'gestion',
      nombre: 'Gestión e Impacto Social',
      color: '#0f766e',
      preguntas: [
        {
          label: 'Trámites y resolutividad',
          texto: '¿La entidad soluciona el problema o es un laberinto burocrático?',
        },
        {
          label: 'Canales digitales vs. presenciales',
          texto: '¿La página web o los puntos de atención física son dignos, de fácil accesibilidad y funcionales?',
        },
        {
          label: 'Inclusión',
          texto: '¿Qué tan adaptada está la entidad para atender a poblaciones vulnerables, adultos mayores o minorías?',
        },
      ],
    },
    {
      id: 'transparencia',
      nombre: 'Transparencia Percibida',
      color: '#7c3aed',
      preguntas: [
        {
          label: 'Destinación del gasto visible',
          texto: '¿Ves los impuestos invertidos en obras y programas tangibles, o sientes que el dinero desaparece?',
        },
        {
          label: 'Meritocracia percibida',
          texto: '¿Sientes que para acceder a un servicio o empleo se requiere «palanca» o es un proceso justo?',
        },
        {
          label: 'Acceso a la información',
          texto: '¿Qué tan fácil de entender es la información presupuestal para cualquier tipo de persona?',
        },
      ],
    },
    {
      id: 'comunicacion',
      nombre: 'Comunicación, Escucha y Pedagogía',
      color: '#b45309',
      preguntas: [
        {
          label: 'Capacidad de respuesta y escucha',
          texto: '¿La entidad responde de fondo las PQRS o usa respuestas automáticas?',
        },
        {
          label: 'Pedagogía social',
          texto: '¿La entidad explica claramente para qué sirve y cuáles son sus proyectos estratégicos?',
        },
        {
          label: 'Gestión de crisis y veracidad',
          texto: 'Ante un escándalo, ¿la entidad sale a dar la cara con datos verídicos o se esconde?',
        },
      ],
    },
    {
      id: 'identidad',
      nombre: 'Identidad, Orgullo y Conexión Emocional',
      color: '#be185d',
      preguntas: [
        {
          label: 'Aporte a la identidad común',
          texto: '¿La entidad representa los valores del territorio? ¿Hace sentir orgulloso al ciudadano?',
        },
        {
          label: 'Confianza en el liderazgo visible',
          texto: '¿Percibes al/la directivo/a como un líder idóneo y empático, o como figura puramente política?',
        },
      ],
    },
    {
      id: 'estrategica',
      nombre: 'Estratégica — Activos Intangibles',
      color: '#047857',
      preguntas: [
        {
          label: 'Compromiso con la sostenibilidad',
          texto: '¿Qué tan comprometida está la entidad con un impacto real en lo social, ambiental y gobernanza?',
        },
        {
          label: 'Generación de valor público',
          texto: '¿Ha logrado la entidad impacto real y visible en el bienestar de la comunidad?',
        },
      ],
    },
  ],
}

export const FUNCIONARIO = {
  surveyType: 'funcionario',
  dimensiones: [
    {
      id: 'compensacion',
      nombre: 'Compensación, Estabilidad y Equidad Laboral',
      color: '#1a3c5e',
      preguntas: [
        {
          label: 'Competitividad Salarial',
          texto: 'Califique el nivel de competitividad y justicia de la escala salarial frente a las responsabilidades del cargo y el mercado laboral.',
        },
        {
          label: 'Dignidad al Contratista (OPS)',
          texto: 'Califique el nivel de respeto, equidad en cargas laborales y puntualidad en los pagos a colaboradores bajo Prestación de Servicios.',
        },
        {
          label: 'Disponibilidad de Herramientas',
          texto: 'Califique la suficiencia y calidad de las herramientas técnicas, tecnológicas y de infraestructura para desempeñar sus funciones.',
        },
      ],
    },
    {
      id: 'desarrollo',
      nombre: 'Desarrollo Profesional y Meritocracia',
      color: '#0f766e',
      preguntas: [
        {
          label: 'Oportunidades de Ascenso',
          texto: 'Califique el nivel de transparencia, justicia y viabilidad para crecer profesionalmente o ascender mediante el mérito.',
        },
        {
          label: 'Impacto de Bienestar y Capacitación',
          texto: 'Califique la calidad y utilidad de los planes de estímulos, capacitación y programas de bienestar.',
        },
        {
          label: 'Objetividad en la Evaluación',
          texto: 'Califique el nivel de objetividad y transparencia de las evaluaciones de desempeño internas.',
        },
      ],
    },
    {
      id: 'gobernanza',
      nombre: 'Gobernanza, Liderazgo e Idoneidad Directiva',
      color: '#7c3aed',
      preguntas: [
        {
          label: 'Calidad del Liderazgo',
          texto: 'Califique la capacidad de jefes y directivos para guiar equipos con empatía, instrucciones claras y coherencia ética.',
        },
        {
          label: 'Idoneidad Técnica de la Gerencia',
          texto: 'Califique el nivel de preparación profesional y conocimiento técnico de los altos directivos.',
        },
      ],
    },
    {
      id: 'innovacion',
      nombre: 'Innovación Pública y Modernización Organizacional',
      color: '#b45309',
      preguntas: [
        {
          label: 'Apertura a la Innovación',
          texto: 'Califique el nivel de apertura para escuchar, valorar e implementar ideas nuevas propuestas por los colaboradores.',
        },
        {
          label: 'Madurez Digital',
          texto: 'Califique la eficiencia de la entidad en digitalización de procesos internos y automatización de trámites.',
        },
      ],
    },
    {
      id: 'blindaje',
      nombre: 'Blindaje Institucional y Politización',
      color: '#be185d',
      invertida: true,
      aviso: 'En esta dimensión: 1 = alta politización (malo) · 5 = entidad técnica e independiente (bueno)',
      preguntas: [
        {
          label: 'Independencia del Criterio Técnico',
          texto: 'Califique el nivel de independencia frente a presiones políticas o cuotas partidistas en decisiones operativas.',
        },
        {
          label: 'Transparencia en la Contratación de Personal',
          texto: 'Califique la rigurosidad técnica con la que se contrata personal, garantizando que prima el perfil profesional.',
        },
        {
          label: 'Continuidad Institucional en Transiciones',
          texto: 'Califique el respeto por la memoria institucional y la continuidad de procesos técnicos ante cambios de gobierno.',
        },
      ],
    },
  ],
}

export function getCuestionario(surveyType) {
  return surveyType === 'funcionario' ? FUNCIONARIO : CIUDADANIA
}

export function flattenAnswers(cuestionario, answers2d) {
  const flat = []
  cuestionario.dimensiones.forEach((dim, di) => {
    dim.preguntas.forEach((_, qi) => {
      flat.push(answers2d[di]?.[qi] ?? null)
    })
  })
  return flat
}
