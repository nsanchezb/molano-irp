export const ESCALA = [
  { value: 1, label: 'Muy en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Muy de acuerdo' },
]

export const CIUDADANIA = {
  surveyType: 'ciudadania',
  dimensiones: [
    {
      id: 'confianza',
      nombre: 'Confianza',
      color: '#1a3c5e',
      preguntas: [
        'Esta entidad actúa con honestidad y transparencia.',
        'Confío en que esta entidad cumple sus compromisos con los ciudadanos.',
        'Esta entidad toma decisiones pensando en el bien común.',
      ],
    },
    {
      id: 'calidad',
      nombre: 'Calidad del servicio',
      color: '#0f766e',
      preguntas: [
        'Los trámites y servicios de esta entidad son fáciles de realizar.',
        'El personal atiende a los ciudadanos con respeto y amabilidad.',
        'Los tiempos de respuesta de esta entidad son adecuados.',
      ],
    },
    {
      id: 'transparencia',
      nombre: 'Transparencia',
      color: '#7c3aed',
      preguntas: [
        'Esta entidad informa claramente sobre sus actividades y decisiones.',
        'Es fácil acceder a información sobre el uso de recursos públicos.',
        'Esta entidad rinde cuentas de manera comprensible para los ciudadanos.',
      ],
    },
    {
      id: 'efectividad',
      nombre: 'Efectividad',
      color: '#b45309',
      preguntas: [
        'Los programas y servicios de esta entidad resuelven problemas reales.',
        'Esta entidad logra los resultados que promete.',
      ],
    },
    {
      id: 'participacion',
      nombre: 'Participación ciudadana',
      color: '#be185d',
      preguntas: [
        'Esta entidad facilita la participación activa de los ciudadanos.',
        'Es fácil presentar quejas, sugerencias o peticiones a esta entidad.',
        'Esta entidad responde oportunamente a las solicitudes ciudadanas.',
      ],
    },
    {
      id: 'impacto',
      nombre: 'Impacto social',
      color: '#047857',
      preguntas: [
        'Esta entidad contribuye al bienestar de la comunidad.',
        'Las acciones de esta entidad generan cambios positivos en mi vida cotidiana.',
      ],
    },
  ],
}

export const FUNCIONARIO = {
  surveyType: 'funcionario',
  dimensiones: [
    {
      id: 'liderazgo',
      nombre: 'Liderazgo y gestión',
      color: '#1a3c5e',
      preguntas: [
        'Los directivos de esta entidad demuestran un liderazgo efectivo.',
        'Existe una visión clara y compartida dentro de la entidad.',
        'Las decisiones directivas son coherentes con los valores institucionales.',
      ],
    },
    {
      id: 'clima',
      nombre: 'Clima organizacional',
      color: '#0f766e',
      preguntas: [
        'El ambiente de trabajo promueve la colaboración entre servidores públicos.',
        'Me siento valorado/a como servidor/a público/a en esta entidad.',
        'La comunicación interna es fluida y transparente.',
      ],
    },
    {
      id: 'capacidad',
      nombre: 'Capacidad institucional',
      color: '#7c3aed',
      preguntas: [
        'La entidad cuenta con los recursos necesarios para cumplir su misión.',
        'Los procesos internos son eficientes y están bien definidos.',
        'La tecnología disponible facilita el desempeño de mi trabajo.',
      ],
    },
    {
      id: 'integridad',
      nombre: 'Integridad',
      color: '#b45309',
      preguntas: [
        'En esta entidad se actúa con ética e integridad.',
        'Existen mecanismos efectivos para prevenir la corrupción interna.',
      ],
    },
    {
      id: 'satisfaccion',
      nombre: 'Satisfacción laboral',
      color: '#be185d',
      invertida: true,
      preguntas: [
        'Trabajar en esta entidad es frustrante y desmotivante.',
        'Consideraría dejar esta entidad si tuviera otra oportunidad laboral.',
      ],
    },
  ],
}

export function getCuestionario(surveyType) {
  return surveyType === 'funcionario' ? FUNCIONARIO : CIUDADANIA
}

export function flattenPreguntas(cuestionario) {
  const result = []
  for (const dim of cuestionario.dimensiones) {
    for (let i = 0; i < dim.preguntas.length; i++) {
      result.push({
        dimId: dim.id,
        dimNombre: dim.nombre,
        dimColor: dim.color,
        invertida: dim.invertida ?? false,
        texto: dim.preguntas[i],
      })
    }
  }
  return result
}
