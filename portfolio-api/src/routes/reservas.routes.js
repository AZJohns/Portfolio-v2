import { Router } from 'express';
import { env } from '../config/env.js';
import { handleReservasMessage } from '../controllers/reservas.controller.js';
import { createRateLimitMiddleware } from '../middlewares/rate-limit.middleware.js';

const router = Router();

// Límite propio de la demo de reservas: su Map de contadores es independiente del chat del CV.
const reservasRateLimit = createRateLimitMiddleware({
  limit: env.dialogflow.maxMessagesPerVisitor,
  limitMessage: 'Has alcanzado el límite de mensajes de la demo de reservas.',
});

router.post('/', reservasRateLimit, handleReservasMessage);

export default router;
