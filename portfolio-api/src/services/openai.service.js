import OpenAI from 'openai';
import { env } from '../config/env.js';
import { getPortfolioContext } from './portfolio-context.service.js';

const OUT_OF_SCOPE_RESPONSE =
  'Solo puedo responder preguntas sobre el portfolio, CV, experiencia, proyectos y tecnologías de John. Para otra información, puedes contactarlo directamente por LinkedIn o email.';

const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const SYSTEM_PROMPT = `
Eres el asistente del portfolio de John Andrade.

Responde únicamente sobre:
- su portfolio;
- CV;
- experiencia;
- prácticas profesionales;
- funciones realizadas;
- proyectos;
- tecnologías;
- formación;
- disponibilidad laboral;
- GitHub;
- LinkedIn;
- contacto.

Considera dentro del alcance preguntas escritas con tildes, sin tildes, mayúsculas, minúsculas o signos de interrogación.
Por ejemplo, estas preguntas son equivalentes y están dentro del alcance:
- "¿Qué hizo John en sus prácticas?"
- "que hizo john en sus practicas"
- "qué funciones hizo en SAAMI"
- "cuáles fueron sus responsabilidades en las prácticas"

No inventes experiencia, empresas, años de experiencia, certificaciones ni tecnologías.
No respondas preguntas generales de programación.

Si la pregunta está claramente fuera de alcance, responde exactamente:
'${OUT_OF_SCOPE_RESPONSE}'

Responde en el idioma que te pida el usuario, de forma breve, profesional y clara.
Máximo 900 caracteres.
`.trim();

let openaiClient;

const getOpenAIClient = () => {
  if (!env.openaiApiKey) {
    const error = new Error('OPENAI_API_KEY no está configurada en el servidor.');
    error.statusCode = 503;
    throw error;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.openaiApiKey,
    });
  }

  return openaiClient;
};

export const generatePortfolioAnswer = async (userMessage) => {
  const client = getOpenAIClient();
  const portfolioContext = getPortfolioContext();
  const normalizedUserMessage = normalizeText(userMessage);

  const completion = await client.chat.completions.create({
    model: env.openaiModel,
    temperature: 0.2,
    max_tokens: 260,
    messages: [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}

Contexto cerrado del portfolio:
${portfolioContext}`,
      },
      {
        role: 'user',
        content: `
Pregunta original del usuario:
${userMessage}

Pregunta normalizada para interpretar intención:
${normalizedUserMessage}

Responde usando únicamente el contexto cerrado del portfolio.
`.trim(),
      },
    ],
  });

  const answer = completion.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    const error = new Error('No se pudo generar una respuesta del asistente.');
    error.statusCode = 502;
    throw error;
  }

  return answer.slice(0, 900);
};