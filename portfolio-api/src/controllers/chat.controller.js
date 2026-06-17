import { generatePortfolioAnswer } from '../services/openai.service.js';

export const handleChatMessage = async (req, res, next) => {
  const { message, visitorId } = req.body;

  if (message === undefined) {
    return res.status(400).json({
      error: 'El campo message es obligatorio.',
    });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({
      error: 'El campo message debe ser un texto.',
    });
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return res.status(400).json({
      error: 'El campo message no puede estar vacío.',
    });
  }

  if (trimmedMessage.length > 300) {
    return res.status(400).json({
      error: 'El campo message no puede superar los 300 caracteres.',
    });
  }

  void visitorId;

  try {
    const answer = await generatePortfolioAnswer(trimmedMessage);
    req.consumeRateLimit?.();

    return res.json({
      answer,
      remaining: req.rateLimit?.remaining ?? null,
      limit: req.rateLimit?.limit ?? null,
    });
  } catch (error) {
    return next(error);
  }
};
