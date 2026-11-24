# Portfolio Assistant API

Backend en Node.js y Express para el asistente del portfolio de John Andrade. La API key de OpenAI se usa solo desde el backend mediante variables de entorno.

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Produccion/local

```bash
npm start
```

## Variables de entorno


MAX_MESSAGES_PER_VISITOR=10
Es la cantidad de mensajes permitidos por visitantes

El modelo de `OPENAI_MODEL` es `gpt-4o-mini` como modelo por defecto

### Asistente de reservas (Dialogflow CX)

Solo nombres; los valores van en el `.env` local o en el panel del hosting, nunca en el repositorio.

| Variable | Para que sirve |
| --- | --- |
| `CX_PROJECT_ID` | Id del proyecto de Google Cloud donde esta el agente. |
| `CX_AGENT_ID` | Id del agente de Dialogflow CX. |
| `CX_LOCATION` | Ubicacion del agente. Opcional: el codigo trae un valor por defecto (ver `src/config/env.js`). |
| `MAX_RESERVAS_MESSAGES_PER_VISITOR` | Mensajes permitidos por visitante en la demo de reservas. Opcional, con valor por defecto en `src/config/env.js`. Es independiente de `MAX_MESSAGES_PER_VISITOR`. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ruta al archivo JSON de la cuenta de servicio. La libreria de Google la lee sola; no pasa por `env.js`. Ese archivo nunca se sube al repositorio. |

La cuenta de servicio solo necesita poder enviar mensajes al agente (detectIntent). Con ese permiso minimo funciona; no necesita leer ni editar el diseno del agente.

Si falta `CX_PROJECT_ID` o `CX_AGENT_ID`, la ruta de reservas responde 503 y el resto de la API sigue funcionando.



## POST `/api/chat`

Endpoint para enviar una pregunta al asistente del portfolio.

Ejemplo de request:

```bash
curl -X POST https://portfolio-v2-ne7x.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Que tecnologias maneja John?\",\"visitorId\":\"demo-visitor\"}"
___________________
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Que tecnologias maneja John?\",\"visitorId\":\"demo-visitor\"}"
```
Body esperado:

```json
{
  "message": "Que tecnologias maneja John?",
  "visitorId": "demo-visitor"
}
```

Ejemplo de response:

```json
{
  "answer": "John maneja JavaScript, React, Node.js, Express, PostgreSQL, MySQL, PHP, HTML, CSS, Tailwind y Git. Tambien tiene experiencia practica con APIs REST, validaciones, modulos internos, roles, Postman y Git/GitLab.",
  "remaining": 9,
  "limit": 10
}
```

El asistente responde solo sobre el portfolio, CV, experiencia, proyectos, tecnologias, formacion, disponibilidad laboral y contacto de John. No responde preguntas generales fuera del portfolio ni inventa datos fuera del contexto cerrado.

## POST `/api/reservas/chat`

Endpoint del chat «Casa John · Reservas». Reenvia el mensaje al agente de Dialogflow CX y devuelve sus respuestas junto con el flow y la pagina en que va la conversacion (el widget los usa para iluminar el diagrama).

Body esperado:

```json
{
  "sessionId": "4936ef06-16bc-41c1-a6b7-89432774cc41",
  "text": "quiero hacer una reserva",
  "visitorId": "demo-visitor"
}
```

| Campo | Obligatorio | Reglas |
| --- | --- | --- |
| `sessionId` | Si | Texto con formato UUID. Mismo `sessionId` = misma conversacion: CX recuerda en que paso va. El navegador lo genera con `crypto.randomUUID()`. |
| `text` | Si | Texto sin vacios, maximo 256 caracteres. |
| `visitorId` | No | Solo se usa para el limite de mensajes. |

Ejemplo de response:

```json
{
  "messages": ["¿Para que dia quieres la mesa?"],
  "flow": "Reservar",
  "page": "Datos de la reserva",
  "ended": false,
  "remaining": 28,
  "limit": 30
}
```

- `messages`: puede traer varios textos por turno.
- `flow` y `page`: `displayName` actuales en CX; pueden ser `null` si CX no los informa.
- `ended`: `true` cuando CX llega a `End Session`. Si se sigue escribiendo con el mismo `sessionId`, CX reinicia desde la pagina de inicio, por eso el widget bloquea la entrada.
- `remaining` y `limit`: mensajes restantes y limite del visitante.

Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/api/reservas/chat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"4936ef06-16bc-41c1-a6b7-89432774cc41\",\"text\":\"hola\",\"visitorId\":\"demo-visitor\"}"
```

Errores:

| Codigo | Cuando | Mensaje |
| --- | --- | --- |
| 400 | `sessionId` o `text` ausentes, mal formados o fuera de limites. | Descripcion del campo en concreto. |
| 429 | Se supero el limite de la demo. | «Has alcanzado el límite de mensajes de la demo de reservas.» |
| 502 | Fallo al hablar con Dialogflow CX (red, credencial, permisos). | «El asistente de reservas no responde ahora mismo.» |
| 503 | Falta `CX_PROJECT_ID` o `CX_AGENT_ID`. | «El asistente no está configurado temporalmente.» |

Los detalles del fallo de Google solo van al log del servidor, saneados (rutas, ids de proyecto, emails de cuenta de servicio y tokens se enmascaran). Nunca se devuelven al cliente ni se registra el texto del usuario.

El cupo de mensajes solo se gasta cuando CX responde bien: un 400 o un 502 no cuentan.

## Limite temporal

El limite actual es de 10 preguntas por visitante y se guarda en memoria con `Map`. Si el body incluye `visitorId`, se usa como base de identificacion; si no, se genera una clave basica con IP y user-agent usando un hash simple.

Este limite se reinicia cuando se reinicia el servidor. Todavia no usa Redis ni base de datos.

El chat de reservas usa el mismo mecanismo (`createRateLimitMiddleware` en `src/middlewares/rate-limit.middleware.js`) pero con su propio contador y su propio limite (`MAX_RESERVAS_MESSAGES_PER_VISITOR`), asi que gastar mensajes en un chat no afecta al otro.

Respuesta cuando se supera el limite:

```json
{
  "error": "Has alcanzado el límite de 10 preguntas para este asistente."
}
```

## Errores controlados

Si falta `OPENAI_API_KEY`, el backend devuelve un error controlado y no intenta llamar a OpenAI:

```json
{
  "error": "OPENAI_API_KEY no está configurada en el servidor."
}
```

Un fallo de la libreria de Google que quede sin capturar se registra como `[unhandledRejection]` (saneado) en `src/server.js` y no cierra el proceso, para que no tumbe tambien el chat del CV. Conviene vigilar esa linea en los logs: este manejador tambien podria ocultar otros errores no capturados.

## Pendiente para la siguiente fase

- Persistir limites y conversaciones con Redis o base de datos.
- Preparar despliegue del backend.
- Conectar el frontend con este endpoint.
