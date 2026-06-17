import OpenAI from 'openai';
import { env } from '../config/env.js';
import { getPortfolioContext } from './portfolio-context.service.js';

const OUT_OF_SCOPE_RESPONSE =
  'Solo puedo responder preguntas sobre el portfolio, CV, experiencia, proyectos y tecnologías de John. Para otra información, puedes contactarlo directamente por LinkedIn o email.';

const SYSTEM_PROMPT = `
Eres el asistente del portfolio de John Andrade.
Responde únicamente sobre su portfolio, CV, experiencia, proyectos, tecnologías, formación, disponibilidad laboral y contacto.
No inventes experiencia, empresas, años de experiencia, certificaciones ni tecnologías.
No respondas preguntas generales de programación.
Si la pregunta está fuera de alcance, responde exactamente:
'${OUT_OF_SCOPE_RESPONSE}'
Responde en español, de forma breve, profesional y clara.
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

  const completion = await client.chat.completions.create({
    model: env.openaiModel,
    temperature: 0.2,
    max_tokens: 260,
    messages: [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nContexto cerrado del portfolio:\n${portfolioContext}`,
      },
      {
        role: 'user',
        content: userMessage,
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
