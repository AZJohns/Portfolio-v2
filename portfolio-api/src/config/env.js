import 'dotenv/config';

// Convierte un texto a número; si no es válido, usa el valor por defecto.
const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  // Común a los dos asistentes
  port: toNumber(process.env.PORT, 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'https://azjohns.github.io',

  // Asistente del portfolio (OpenAI)
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxMessagesPerVisitor: toNumber(process.env.MAX_MESSAGES_PER_VISITOR, 10),

  // Asistente de reservas Casa John (Dialogflow CX)
  dialogflow: {
    projectId: process.env.CX_PROJECT_ID || '',
    agentId: process.env.CX_AGENT_ID || '',
    // El agente está en 'global'; no es secreto, por eso lleva valor por defecto.
    location: process.env.CX_LOCATION || 'global',
    // Credencial de la cuenta de servicio como texto JSON (para Render, donde no hay archivo).
    // Si está vacía, la librería usa GOOGLE_APPLICATION_CREDENTIALS como siempre.
    credentialsJson: process.env.GOOGLE_CREDENTIALS_JSON || '',
    // Variable propia: no se mezcla con el límite del chat del CV.
    maxMessagesPerVisitor: toNumber(process.env.MAX_RESERVAS_MESSAGES_PER_VISITOR, 30),
  },
};