import 'dotenv/config';

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'https://azjohns.github.io',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxMessagesPerVisitor: toNumber(process.env.MAX_MESSAGES_PER_VISITOR, 10),
};
