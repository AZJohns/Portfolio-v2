const portfolioContext = `
John Sebastian Andrade es Desarrollador Web Junior / Full Stack Junior. Vive en Madrid y busca trabajo en modalidad híbrida o remota en España.
Su prioridad es el desarrollo web y full stack, con React, Node.js, Express y PostgreSQL.

Experiencia principal:
Desarrollador Web Full Stack Junior (prácticas) en Apphera Solutions S.L., de marzo a mayo de 2026.
En las prácticas trabajó en el proyecto SAAMI/Kaprichos: una plataforma de gestión para una empresa del sector vending, con web pública y backoffice administrativo. Se desarrolló en equipo (no se indica el número de personas) y está publicada en https://kaprichosrd.com/.
John trabajó en frontend y backend con React, Tailwind CSS, Node.js, Express y PostgreSQL.
Sus tareas fueron: módulos CRUD de usuarios, productos, ubicaciones e inventario, validaciones, endpoints REST, control de acceso por roles, pruebas de endpoints con Postman y colaboración en GitLab.
El código de este proyecto es confidencial y no es público.

Experiencia complementaria:
Auxiliar de Control de Accesos en Teliman Servicios Complementarios (Madrid), de abril de 2023 a la actualidad. Incluye gestión de incidencias, aplicación de protocolos, atención a personas y coordinación con personal interno.

Proyectos (en el orden en que aparecen en el portfolio):
1. Plataforma de gestión para el sector vending: el proyecto de las prácticas descrito arriba.
2. Casa John · Asistente de reservas: asistente conversacional para hacer y cancelar reservas de un restaurante ficticio. Usa un agente de Dialogflow CX con flows y páginas, un webhook en Node.js/Express desplegado en Google Cloud Run, PostgreSQL en Neon y una API intermedia con validación y límite de mensajes. El widget está hecho en JavaScript sin framework e incluye un diagrama SVG del flujo que marca el paso actual de la conversación. La demo se puede probar en el portfolio.
3. Asistente del portfolio (este mismo chat): backend en Node.js/Express desplegado en Render que usa la API de OpenAI. Responde solo con un contexto cerrado sobre el perfil de John, valida las entradas, limita el número de preguntas por visitante y restringe el origen con CORS. El frontend está en GitHub Pages.
4. AutoMocion Manager: gestión de un concesionario con PHP y MySQL, con usuarios, roles y operaciones CRUD. El código está en GitHub.
5. Google Translate Clone: frontend en JavaScript que consume una API de traducción, con diseño responsive.

Formación:
- Técnico Superior en Desarrollo de Aplicaciones Web (DAVANTE MEDAC).
- Máster Profesional en Ciberseguridad (DAVANTE MEDAC). Es un máster profesional, no un máster universitario.
  Su TFM fue un laboratorio virtual aislado (KVM/libvirt) para analizar vulnerabilidades y responder a incidentes, con Kali Linux contra Metasploitable2 y revisión de logs.
  También hizo una práctica formativa con Nmap, Wireshark y SIEM, y estudió la normativa ISO 27001 y ENS.

Tecnologías:
- Frontend: React, JavaScript, React Router, Context API, Vite, Tailwind CSS, HTML5 y CSS3.
- Backend: Node.js, Express, APIs REST, JWT, PHP, Java y Python.
- Bases de datos: PostgreSQL, MySQL y Oracle SQL.
- Despliegue e IA conversacional: Dialogflow CX, OpenAI API, Google Cloud Run, Render, Neon y GitHub Pages.
- Herramientas: Git, GitHub, GitLab, Postman, npm, Linux/terminal y Jira (Scrum).

Idiomas:
Inglés nivel A2: lee documentación técnica y lo está mejorando activamente.

Contacto:
Portfolio: https://azjohns.github.io/Portfolio-v2/
GitHub: https://github.com/AZJohns
LinkedIn: https://www.linkedin.com/in/john-sebastian-andrade-zapata
Email: andradezapatajohn@gmail.com
CV: disponible para descargar desde el portfolio.

Limitaciones:
John tiene perfil junior. No debe presentarse como senior, experto ni arquitecto.
No se debe inventar experiencia, certificaciones, empresas, años de experiencia ni tecnologías que no estén en este contexto.
La ciberseguridad es formación práctica, no experiencia profesional: no debe presentarse como analista SOC ni como profesional de ciberseguridad.
No se debe mencionar Docker.
No se deben inventar fechas de incorporación, salario ni disponibilidad horaria: en esos casos se debe indicar que no hay información y recomendar contactar directamente con John por LinkedIn o email.
Lo mismo se aplica a cualquier otra información que no esté incluida en este contexto.
`.trim();

export const getPortfolioContext = () => portfolioContext;
