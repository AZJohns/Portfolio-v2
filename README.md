# Portfolio Assistant API

Backend y adaptación frontend para integrar un asistente conversacional en mi portfolio personal.
El asistente permite a los visitantes preguntar sobre mi perfil profesional, experiencia, proyectos, tecnologías, formación, CV y formas de contacto, usando un backend propio conectado de forma segura con la API de OpenAI.

El objetivo del proyecto es mejorar la experiencia del portfolio y demostrar una integración real entre frontend, backend, API externa, variables de entorno, control de acceso y despliegue.

## Descripción del proyecto

Este proyecto añade un asistente conversacional al portfolio de **John Sebastian Andrade**, orientado a responder preguntas relacionadas únicamente con la información profesional disponible en el portfolio y el CV.

El asistente no funciona como un chatbot genérico. Está limitado por diseño para responder sobre:

* perfil profesional;
* experiencia en prácticas;
* proyectos;
* tecnologías;
* formación;
* CV;
* disponibilidad laboral;
* GitHub, LinkedIn y contacto.

Si el usuario pregunta algo fuera de ese contexto, el asistente debe rechazar la consulta de forma controlada y redirigir al contacto profesional.

## Arquitectura

El proyecto está dividido en dos partes:

```txt
Frontend del portfolio
GitHub Pages
        ↓
Backend Node.js / Express
Render
        ↓
OpenAI API
```

El frontend del portfolio está alojado en **GitHub Pages** y consume el backend mediante `fetch`.

El backend está desplegado como servicio web en **Render** y se encarga de:

* recibir las preguntas del usuario;
* validar la entrada;
* identificar al visitante;
* aplicar límite de interacciones;
* construir el contexto del asistente;
* llamar de forma segura a OpenAI;
* devolver la respuesta al frontend.

La API key de OpenAI nunca se expone en el frontend.

## Tecnologías utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript
* GitHub Pages

### Backend

* Node.js
* Express
* CORS
* dotenv
* OpenAI SDK

### Despliegue

* GitHub Pages para el frontend
* Render para el backend
* Variables de entorno para configuración segura

## Funcionalidades principales

* Chat integrado en el portfolio.
* Preguntas sugeridas para orientar al visitante.
* Conexión del frontend con backend propio.
* Integración con OpenAI API desde servidor.
* Contexto cerrado basado en CV y portfolio.
* Respuestas limitadas al perfil profesional.
* Validación de mensajes vacíos, inválidos o demasiado largos.
* Límite de 10 interacciones por visitante.
* Identificación básica mediante `visitorId`, IP y user-agent hasheados.
* Control de CORS para permitir solo el origen autorizado.
* Manejo seguro de errores.
* Variables de entorno para no exponer claves.
* Mensajes de error controlados si el backend no está disponible.
* Despliegue funcional en producción.

## Seguridad y control de uso

El proyecto incluye varias medidas para evitar abuso o exposición de información sensible:

* La API key de OpenAI se almacena únicamente en variables de entorno del backend.
* El frontend no llama directamente a OpenAI.
* El backend limita el número de preguntas por visitante.
* Las respuestas están restringidas al contexto profesional del portfolio.
* CORS permite únicamente el dominio autorizado del portfolio.
* Los errores internos no se exponen directamente al usuario.
* El archivo `.env` está excluido del control de versiones.
* Se incluye `.env.example` como plantilla segura sin claves reales.

## Variables de entorno

El backend necesita las siguientes variables:

```env
NODE_ENV=production
FRONTEND_ORIGIN=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
MAX_MESSAGES_PER_VISITOR=10
```

En desarrollo local puede usarse:

```env
PORT=3000
FRONTEND_ORIGIN=http://127.0.0.1:5500
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
MAX_MESSAGES_PER_VISITOR=10
```

El valor de `OPENAI_API_KEY` debe configurarse solo en local o en el panel del proveedor de despliegue. No debe subirse nunca al repositorio.

## Endpoint principal

### POST `/api/chat`

Recibe una pregunta del usuario y devuelve una respuesta del asistente.

#### Request

```json
{
  "message": "¿Qué experiencia tiene John?",
  "visitorId": "visitor-id"
}
```

#### Response

```json
{
  "answer": "John tiene experiencia práctica como desarrollador web junior...",
  "remaining": 9,
  "limit": 10
}
```

#### Límite alcanzado

```json
{
  "error": "Has alcanzado el límite de 10 preguntas para este asistente.",
  "remaining": 0,
  "limit": 10
}
```

## Instalación local

Clonar el repositorio:

```bash
git clone https://github.com/AZJohns/Portfolio-v2.git
cd Portfolio-v2/portfolio-api
```

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

El backend se ejecutará por defecto en:

```txt
http://localhost:3000
```

## Pruebas locales

Para probar sin gastar tokens, dejar `OPENAI_API_KEY` vacío en `.env`.

En ese caso, el backend debe devolver un error controlado indicando que el asistente no está configurado temporalmente.

Para probar el frontend en local, abrir el portfolio con Live Server y configurar:

```env
FRONTEND_ORIGIN=http://127.0.0.1:5500
```

o el origin exacto que use el navegador.

## Despliegue

El frontend está preparado para funcionar desde GitHub Pages.

El backend se despliega en Render como Web Service con:

```txt
Root Directory: portfolio-api
Build Command: npm install
Start Command: npm start
```

Las variables de entorno se configuran directamente en Render, no en archivos públicos.

## Nota sobre Render Free

Si el backend está desplegado en el plan gratuito de Render, el servicio puede entrar en reposo tras un periodo de inactividad. En ese caso, la primera petición puede tardar más en responder mientras el servicio vuelve a arrancar.

## Objetivo profesional

Este proyecto demuestra una integración full stack real aplicada a mi propio portfolio:

* desarrollo frontend;
* backend con Node.js y Express;
* consumo seguro de API externa;
* gestión de variables de entorno;
* control de CORS;
* validaciones;
* limitación de uso;
* despliegue en producción;
* separación entre frontend estático y backend dinámico.

Forma parte de mi portfolio como desarrollador web junior / full stack junior.
