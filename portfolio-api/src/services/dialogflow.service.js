import { SessionsClient } from '@google-cloud/dialogflow-cx';
import { env } from '../config/env.js';
import { sanitizeLogValue } from '../utils/log-sanitizer.util.js';

// Se guarda aquí para crear el cliente UNA sola vez y reutilizarlo en cada petición
// (crear uno nuevo en cada mensaje sería más lento).
let sessionsClient;

// Devuelve el cliente de CX; si falta configuración, lanza un 503 («no configurado»).
const getSessionsClient = () => {
  if (!env.dialogflow.projectId || !env.dialogflow.agentId) {
    const error = new Error('Dialogflow CX no está configurado en el servidor (falta CX_PROJECT_ID o CX_AGENT_ID).');
    error.statusCode = 503;
    throw error;
  }

  if (!sessionsClient) {
    // Agente en 'global': endpoint por defecto, sin opciones.
    // La credencial la busca sola en GOOGLE_APPLICATION_CREDENTIALS.
    sessionsClient = new SessionsClient();
  }

  return sessionsClient;
};

// Envía un mensaje del usuario al agente y devuelve lo que necesita el widget.
export const sendMessageToAgent = async (sessionId, text) => {
  // 1) Cliente (fuera del try: si falta configuración, su 503 debe llegar tal cual).
  const client = getSessionsClient();

  // 2) Dirección de la conversación: projects/.../locations/.../agents/.../sessions/<sessionId>
  //    Mismo sessionId = misma conversación: CX recuerda en qué paso va.
  const sessionPath = client.projectLocationAgentSessionPath(
    env.dialogflow.projectId,
    env.dialogflow.location,
    env.dialogflow.agentId,
    sessionId,
  );

  // 3) Datos de la petición (un objeto normal: la librería hace la llamada HTTP).
  const request = {
    session: sessionPath,          // a qué conversación pertenece
    queryInput: {
      text: { text },              // qué ha dicho el usuario (tipo de entrada: texto)
      languageCode: 'es',          // en qué idioma
    },
  };

  // 4) Llamada a Google: lo único que puede fallar por causas externas (red, credencial, CX).
  //    'let' fuera del try porque el valor se asigna dentro y se usa después.
  let response;
  try {
    [response] = await client.detectIntent(request); // devuelve un array; la respuesta es el 1.º
  } catch (error) {
    // A los logs: solo código y mensaje de Google (nunca el texto del usuario: puede llevar datos personales).
    // sanitizeLogValue enmascara rutas, ids de proyecto, emails de cuenta de servicio y tokens que Google pueda incluir.
    console.error('[dialogflow]', error.code, sanitizeLogValue(error.message));

    // Al usuario: error genérico; el middleware lo convierte en respuesta sin detalles internos.
    const publicError = new Error('No se pudo obtener respuesta del asistente de reservas.');
    publicError.statusCode = 502;
    // Mensaje que verá el usuario: el middleware de errores lo usa en lugar del genérico del 502.
    publicError.publicMessage = 'El asistente de reservas no responde ahora mismo.';
    throw publicError;
  }

  const result = response.queryResult;

  // 5) De todos los mensajes que devuelve CX, quedarse solo con los textos.
  //    Llegan así: [{ text: { text: ['…'] } }, { liveAgentHandoff: {…} }, …]
  const messages = (result.responseMessages ?? []) // si no viene nada, array vacío (filter no falla)
    .filter((m) => m.text)                          // solo los mensajes de texto
    .flatMap((m) => m.text.text);                   // sus textos, juntos en un solo array

  // 6) ¿Ha terminado la conversación? (comprobado con una prueba real contra el agente)
  //    Al llegar a «End Session», CX devuelve a la vez:
  //      - currentPage.displayName === 'End Session'
  //      - currentPage.name acabado en '/pages/END_SESSION' (id fijo de página del sistema)
  //      - un responseMessage { endInteraction: {} }
  //    Uso el id de página y endInteraction en vez del displayName: el nombre se puede renombrar
  //    o traducir, el id de las páginas del sistema no.
  //    OJO: si después se manda otro mensaje con el mismo sessionId, CX NO se queda terminado:
  //    reinicia en «Start Page». Por eso el widget debe bloquear la entrada cuando ended = true.
  const ended =
    (result.currentPage?.name ?? '').endsWith('/pages/END_SESSION') ||
    (result.responseMessages ?? []).some((m) => m.endInteraction != null);

  // 7) Lo que recibe el controlador (y luego el widget).
  //    ?? null: si falta un dato, la clave sigue en el JSON (undefined desaparecería).
  return {
    messages,                                      // p. ej. ['Un momento, lo miro.', 'Tengo mesa a las 21:00.']
    flow: result.currentFlow?.displayName ?? null, // flow actual (para el diagrama)
    page: result.currentPage?.displayName ?? null, // página actual (para el diagrama)
    ended,                                         // true si la sesión ha terminado
  };
};