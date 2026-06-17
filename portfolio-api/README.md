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



## POST `/api/chat`

Endpoint para enviar una pregunta al asistente del portfolio.

Ejemplo de request:

```bash
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

## Limite temporal

El limite actual es de 10 preguntas por visitante y se guarda en memoria con `Map`. Si el body incluye `visitorId`, se usa como base de identificacion; si no, se genera una clave basica con IP y user-agent usando un hash simple.

Este limite se reinicia cuando se reinicia el servidor. Todavia no usa Redis ni base de datos.

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

## Pendiente para la siguiente fase

- Persistir limites y conversaciones con Redis o base de datos.
- Preparar despliegue del backend.
- Conectar el frontend con este endpoint.
