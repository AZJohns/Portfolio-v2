// Limpia un texto antes de escribirlo en los logs, para que no se cuelen secretos.
//
// Antes vivía dentro de error.middleware.js; lo muevo aquí porque ahora lo necesitan
// dos sitios (el middleware de errores y el servicio de Dialogflow), y así no se duplica.
//
// Por qué hace falta con Google: los errores de @google-cloud/* a veces incluyen en
// el mensaje datos de la cuenta de servicio, rutas locales a la clave o tokens OAuth.
// Los logs de Render los puede ver cualquiera con acceso al panel, así que se enmascaran.
//
// Limitación: son expresiones regulares sobre patrones conocidos; no garantizan cazar
// cualquier secreto. Por eso además NUNCA se loguea el texto del usuario ni la petición entera.
const REDACTED = '[redacted]';

export const sanitizeLogValue = (value) =>
  String(value)
    // OpenAI (ya existente)
    .replace(/sk-[A-Za-z0-9_-]+/g, REDACTED)
    .replace(/(OPENAI_API_KEY\s*[=:]\s*)\S+/gi, `$1${REDACTED}`)
    .replace(/(api[_-]?key\s*[=:]\s*)\S+/gi, `$1${REDACTED}`)
    // Google: bloque PEM de una clave privada (contenido de la clave JSON de la cuenta de servicio)
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(-----END [A-Z ]*PRIVATE KEY-----|$)/g, REDACTED)
    .replace(/("?private_key(?:_id)?"?\s*[=:]\s*)"?[^",\s]+"?/gi, `$1${REDACTED}`)
    // Google: email de la cuenta de servicio y tokens de acceso OAuth
    .replace(/[A-Za-z0-9._-]+@[A-Za-z0-9-]+\.iam\.gserviceaccount\.com/g, REDACTED)
    .replace(/\bya29\.[A-Za-z0-9._-]+/g, REDACTED)
    .replace(/(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, `$1${REDACTED}`)
    // Rutas a archivos .json (típico: «ENOENT … open 'C:\…\clave.json'»)
    .replace(/(?:[A-Za-z]:)?[\\/][^\s'"]*\.json/g, '[redacted-path]')
    // Rutas entre comillas tras una llamada de sistema de archivos («lstat 'C:\…'», «open '/…'»)
    .replace(/\b(lstat|stat|open|access|readFile|realpath|scandir)\s+'[^']*'/gi, "$1 '[redacted-path]'")
    // Ruta del recurso de CX: projects/<id-del-proyecto>/...
    .replace(/projects\/[^/\s'"]+/g, 'projects/[redacted]');
