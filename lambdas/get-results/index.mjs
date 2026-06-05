import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const RESPONSES_TABLE = process.env.RESPONSES_TABLE || 'irp-responses';
const MIN_RESPONSES = parseInt(process.env.MIN_RESPONSES || '5', 10);

// Estructura de dimensiones y preguntas por tipo de encuesta
const DIMS = {
  ciudadania: [
    { id: 'confianza',      nombre: 'Confianza e Integridad',            count: 3, invertida: false },
    { id: 'gestion',        nombre: 'Gestión e Impacto Social',           count: 3, invertida: false },
    { id: 'transparencia',  nombre: 'Transparencia Percibida',            count: 3, invertida: false },
    { id: 'comunicacion',   nombre: 'Comunicación y Pedagogía',           count: 3, invertida: false },
    { id: 'identidad',      nombre: 'Identidad y Conexión Emocional',     count: 2, invertida: false },
    { id: 'estrategica',    nombre: 'Estratégica',                        count: 2, invertida: false },
  ],
  funcionario: [
    { id: 'compensacion',   nombre: 'Compensación y Equidad',             count: 3, invertida: false },
    { id: 'desarrollo',     nombre: 'Desarrollo Profesional',             count: 3, invertida: false },
    { id: 'gobernanza',     nombre: 'Gobernanza y Liderazgo',             count: 2, invertida: false },
    { id: 'innovacion',     nombre: 'Innovación Pública',                 count: 2, invertida: false },
    { id: 'blindaje',       nombre: 'Blindaje Institucional',             count: 3, invertida: true  },
  ],
};

function calcDimScores(surveyType, answers) {
  const scores = {};
  let offset = 0;
  for (const dim of DIMS[surveyType]) {
    const slice = answers.slice(offset, offset + dim.count);
    const vals = dim.invertida ? slice.map((v) => 6 - v) : slice;
    scores[dim.id] = vals.reduce((a, b) => a + b, 0) / vals.length;
    offset += dim.count;
  }
  return scores;
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function round2(n) {
  return n == null ? null : Math.round(n * 100) / 100;
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  const entityIdFilter = event.queryStringParameters?.entityId ?? null;

  // Paginar el Scan completo
  const items = [];
  let lastKey;
  do {
    const res = await ddb.send(new ScanCommand({
      TableName: RESPONSES_TABLE,
      ...(entityIdFilter && {
        FilterExpression: 'entityId = :eid',
        ExpressionAttributeValues: { ':eid': { S: entityIdFilter } },
      }),
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }));
    items.push(...(res.Items ?? []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  // Agrupar respuestas por entidad/tipo y contar por día
  const grouped = {};
  const dayCounts = {};
  for (const item of items) {
    const entityId   = item.entityId?.S;
    const surveyType = item.surveyType?.S;
    const raw        = item.answers?.S;
    const createdAt  = item.createdAt?.N ? Number(item.createdAt.N) : null;
    if (!entityId || !surveyType || !raw || !DIMS[surveyType]) continue;
    let answers;
    try { answers = JSON.parse(raw); } catch { continue; }
    if (!Array.isArray(answers)) continue;
    if (!grouped[entityId]) grouped[entityId] = { ciudadania: [], funcionario: [] };
    grouped[entityId][surveyType].push(answers);
    if (createdAt) {
      const day = new Date(createdAt * 1000).toLocaleDateString('sv', { timeZone: 'America/Bogota' });
      dayCounts[day] = (dayCounts[day] ?? 0) + 1;
    }
  }

  // Calcular puntajes
  const entities = [];
  for (const [entityId, byType] of Object.entries(grouped)) {
    const entry = { entityId };

    for (const surveyType of ['ciudadania', 'funcionario']) {
      const responses = byType[surveyType];
      if (responses.length < MIN_RESPONSES) continue;

      // Acumular puntajes por dimensión
      const dimAccum = {};
      for (const answers of responses) {
        for (const [dimId, score] of Object.entries(calcDimScores(surveyType, answers))) {
          (dimAccum[dimId] ??= []).push(score);
        }
      }

      const dims = {};
      const dimTotals = [];
      for (const [dimId, vals] of Object.entries(dimAccum)) {
        const a = round2(avg(vals));
        dims[dimId] = a;
        dimTotals.push(a);
      }

      entry[surveyType] = { total: round2(avg(dimTotals)), n: responses.length, dims };
    }

    if (!entry.ciudadania && !entry.funcionario) continue;

    const totals = [entry.ciudadania?.total, entry.funcionario?.total].filter(Boolean);
    entry.irpGlobal = round2(avg(totals));
    entities.push(entry);
  }

  entities.sort((a, b) => b.irpGlobal - a.irpGlobal);

  const dailyCounts = Object.entries(dayCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return response(200, { entities, total: entities.length, dailyCounts, updatedAt: new Date().toISOString() });
};
