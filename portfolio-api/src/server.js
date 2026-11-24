import app from './app.js';
import { env } from './config/env.js';
import { sanitizeLogValue } from './utils/log-sanitizer.util.js';

// Red de seguridad para promesas rechazadas que nadie ha capturado.
//
// Por qué existe: la librería de Google (google-gax) deja a veces una promesa rechazada
// "suelta" (p. ej. si el archivo de credenciales no se puede leer). Desde Node 15, el
// comportamiento por defecto ante eso es cerrar el proceso entero, y con él también
// caería el chat del CV, que comparte servidor. Con este manejador, el fallo se registra
// y el servidor sigue vivo. La petición afectada ya responde por su propio try/catch (502).
//
// Inconveniente: puede ocultar OTROS errores no capturados (un bug nuestro, por ejemplo),
// que antes habrían tirado el proceso y se habrían notado enseguida. Por eso siempre se
// escribe en el log (saneado, para no filtrar rutas ni claves): hay que vigilar esa línea.
process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : reason;
  console.error('[unhandledRejection]', sanitizeLogValue(message));
});

app.listen(env.port, () => {
  console.log(`Portfolio Assistant API escuchando en el puerto ${env.port}`);
});
