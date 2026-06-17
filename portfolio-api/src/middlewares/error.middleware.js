const publicErrorMessages = {
  400: 'Solicitud no válida.',
  429: 'Has alcanzado el límite de 10 preguntas para este asistente.',
  503: 'El asistente no está configurado temporalmente.',
};

const controlledStatusCodes = new Set([400, 429, 503]);

const getStatusCode = (err) => {
  const statusCode = Number(err.statusCode || err.status);

  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500;
};

const getPublicMessage = (err, statusCode) => {
  if (controlledStatusCodes.has(statusCode) && err.publicMessage) {
    return err.publicMessage;
  }

  return publicErrorMessages[statusCode] || 'Error interno del servidor.';
};

const sanitizeLogValue = (value) =>
  String(value)
    .replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/(OPENAI_API_KEY\s*[=:]\s*)\S+/gi, '$1[redacted]')
    .replace(/(api[_-]?key\s*[=:]\s*)\S+/gi, '$1[redacted]');

const logError = (err, statusCode) => {
  const logPayload = {
    statusCode,
    name: sanitizeLogValue(err.name || 'Error'),
    message: sanitizeLogValue(err.message || 'Error sin mensaje.'),
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    logPayload.stack = sanitizeLogValue(err.stack);
  }

  console.error('[error]', logPayload);
};

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = getStatusCode(err);

  logError(err, statusCode);

  return res.status(statusCode).json({
    error: getPublicMessage(err, statusCode),
  });
};
