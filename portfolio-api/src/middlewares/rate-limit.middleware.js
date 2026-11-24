import { env } from '../config/env.js';
import { getVisitorKey } from '../utils/visitor.util.js';

/**
 * Fábrica de middlewares de límite de mensajes por visitante.
 *
 * Concepto: "factory function" + closure.
 * - Una función que DEVUELVE otra función (el middleware de Express).
 * - El middleware devuelto "recuerda" (closure) las variables de la fábrica:
 *   `limit`, `limitMessage` y, sobre todo, su propio `Map` de contadores.
 *
 * Ventajas:
 * - Cada asistente (chat del CV, chat de reservas…) tiene su límite, su mensaje
 *   y su contador independientes, sin variables globales compartidas.
 * - Se puede reutilizar sin copiar y pegar código.
 *
 * Inconvenientes:
 * - Los contadores viven en memoria del proceso: se pierden al reiniciar el
 *   servidor (Render lo duerme/reinicia) y no se comparten si hubiera varias
 *   instancias. Para una demo de portfolio es suficiente; en producción real
 *   se usaría Redis o similar.
 */
export const createRateLimitMiddleware = ({ limit, limitMessage }) => {
  // Un Map por instancia: clave = visitante (hash), valor = mensajes consumidos.
  const visitorMessageCounts = new Map();

  return (req, res, next) => {
    const visitorKey = getVisitorKey(req);
    const currentCount = visitorMessageCounts.get(visitorKey) || 0;

    if (currentCount >= limit) {
      return res.status(429).json({
        error: limitMessage,
        remaining: 0,
        limit,
      });
    }

    req.rateLimit = {
      limit,
      remaining: Math.max(limit - currentCount, 0),
      visitorKey,
    };

    // El controlador la llama solo cuando la petición ha ido bien,
    // así un error del proveedor no le gasta mensajes al visitante.
    req.consumeRateLimit = () => {
      const latestCount = visitorMessageCounts.get(visitorKey) || 0;
      const nextCount = latestCount + 1;
      visitorMessageCounts.set(visitorKey, nextCount);
      req.rateLimit.remaining = Math.max(limit - nextCount, 0);
    };

    return next();
  };
};

// Instancia para el chat del CV: mismo comportamiento y mismo mensaje que antes,
// por eso chat.routes.js no necesita cambios.
export const rateLimitMiddleware = createRateLimitMiddleware({
  limit: env.maxMessagesPerVisitor,
  limitMessage: 'Has alcanzado el límite de 10 preguntas para este asistente.',
});
