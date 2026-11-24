import { sendMessageToAgent } from '../services/dialogflow.service.js';

// Formato UUID (8-4-4-4-12 hex). Es lo que genera crypto.randomUUID() en el navegador.
// Validarlo evita que alguien use como sessionId un texto arbitrario (CX limita el id a 36 caracteres,
// y un UUID mide exactamente 36).
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Límite de texto por mensaje. 256 es el máximo de texto de entrada de Dialogflow CX según su
// documentación de cuotas (en el código de la librería no aparece, así que no se puede comprobar ahí).
const MAX_TEXT_LENGTH = 256;

export const handleReservasMessage = async (req, res, next) => {
  const { sessionId, text, visitorId } = req.body;

  // --- Validación de sessionId ---
  if (sessionId === undefined) {
    return res.status(400).json({
      error: 'El campo sessionId es obligatorio.',
    });
  }

  if (typeof sessionId !== 'string') {
    return res.status(400).json({
      error: 'El campo sessionId debe ser un texto.',
    });
  }

  if (!UUID_REGEX.test(sessionId)) {
    return res.status(400).json({
      error: 'El campo sessionId debe tener formato UUID.',
    });
  }

  // --- Validación de text ---
  if (text === undefined) {
    return res.status(400).json({
      error: 'El campo text es obligatorio.',
    });
  }

  if (typeof text !== 'string') {
    return res.status(400).json({
      error: 'El campo text debe ser un texto.',
    });
  }

  const trimmedText = text.trim();

  if (!trimmedText) {
    return res.status(400).json({
      error: 'El campo text no puede estar vacío.',
    });
  }

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: `El campo text no puede superar los ${MAX_TEXT_LENGTH} caracteres.`,
    });
  }

  // visitorId es opcional: no se usa aquí, lo lee el middleware de límite (getVisitorKey) desde req.body.
  void visitorId;

  try {
    const { messages, flow, page, ended } = await sendMessageToAgent(sessionId, trimmedText);

    // Solo se gasta un mensaje del cupo si CX ha respondido bien (igual que el chat del CV).
    req.consumeRateLimit?.();

    return res.json({
      messages,
      flow,
      page,
      ended,
      remaining: req.rateLimit?.remaining ?? null,
      limit: req.rateLimit?.limit ?? null,
    });
  } catch (error) {
    return next(error);
  }
};
