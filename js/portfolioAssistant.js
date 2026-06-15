(function () {
    const data = window.portfolioAssistantData;

    if (!data) {
        return;
    }

    const fallbackMessage =
        "Solo puedo responder preguntas sobre el portfolio, CV, experiencia, proyectos y tecnologías de Jonh. Para otra información, puedes contactarlo directamente por LinkedIn o email.";

    const suggestedQuestions = [
        "¿Qué experiencia tiene Jonh?",
        "¿Qué hizo en sus prácticas?",
        "¿Qué tecnologías utiliza?",
        "¿Tiene experiencia con React y Node.js?",
        "¿Qué proyectos tiene?",
        "¿Dónde puedo ver su CV?",
        "¿Está abierto a oportunidades?",
        "¿Cómo puedo contactarlo?"
    ];

    const internshipNote =
        data.experience &&
            data.experience.internship &&
            data.experience.internship.note
            ? data.experience.internship.note
            : "El código no es público por confidencialidad del proyecto empresarial.";

    const professionalProject =
        "El proyecto profesional principal fue una plataforma web con backoffice administrativo para una empresa real. " +
        "Jonh participó en frontend y backend, desarrollo de módulos CRUD, validaciones, APIs REST, control de roles, conexión con base de datos y pruebas con Postman. " +
        internshipNote;

    const answers = [
        {
            keywords: [
                "experiencia", "trabajo", "trabajos", "laboral", "profesional",
                "practica", "practicas", "empresa", "saami", "puesto",
                "ha trabajado", "donde trabajo", "curriculum laboral"
            ],
            response:
                "Jonh tiene experiencia práctica como Desarrollador Web Full Stack Junior en SAAMI, participando en una plataforma web real con web pública y backoffice administrativo. Trabajó en frontend, backend, APIs REST, validaciones, módulos internos, roles, pruebas con Postman y control de versiones con Git/GitLab."
        },
        {
            keywords: [
                "practicas", "practica", "saami", "becario", "fct",
                "que hizo", "funciones", "responsabilidades", "tareas",
                "modulos", "modulo", "kaprichos"
            ],
            response:
                "En sus prácticas en SAAMI, Jonh participó en el desarrollo y mantenimiento de una plataforma web de gestión operativa. Trabajó en módulos internos como usuarios, productos, ubicaciones, inventario, solicitudes de contacto y configuración del sitio, aplicando CRUDs, validaciones, APIs REST y pruebas con Postman."
        },
        {
            keywords: [
                "tecnologia", "tecnologias", "stack", "herramientas",
                "lenguajes", "programacion", "usa", "utiliza", "maneja",
                "skills", "habilidades"
            ],
            response:
                "Jonh utiliza " + data.technologies.join(", ") + ". Su perfil está orientado a desarrollo web junior/full stack junior, especialmente en frontend, backend, APIs REST, bases de datos relacionales y backoffice administrativo."
        },
        {
            keywords: [
                "frontend", "front", "react", "javascript", "html", "css",
                "tailwind", "interfaz", "ui", "responsive", "diseño web",
                "maquetacion", "maquetación"
            ],
            response:
                "En frontend, Jonh ha trabajado con React, JavaScript, HTML5, CSS3 y Tailwind CSS. Tiene experiencia creando interfaces, formularios, vistas administrativas, consumo de APIs REST y diseño responsive."
        },
        {
            keywords: [
                "backend", "back", "node", "nodejs", "node.js",
                "express", "api", "apis", "rest", "servidor",
                "php", "java", "python"
            ],
            response:
                "En backend, Jonh ha trabajado principalmente con Node.js, Express, APIs REST y PostgreSQL en su proyecto profesional. También tiene conocimientos de PHP, Java, Python y MySQL por formación y proyectos."
        },
        {
            keywords: [
                "base de datos", "bases de datos", "bbdd", "sql",
                "postgresql", "mysql", "oracle", "relacional",
                "consultas", "tablas"
            ],
            response:
                "Jonh tiene experiencia con bases de datos relacionales, especialmente PostgreSQL y MySQL. Ha trabajado con conexión entre backend y base de datos, gestión de datos, operaciones CRUD y consultas SQL."
        },
        {
            keywords: [
                "react", "node", "nodejs", "node.js", "express",
                "full stack", "fullstack", "front y back", "frontend y backend"
            ],
            response:
                "Sí. Jonh ha trabajado con React en frontend y con Node.js y Express en backend, conectando funcionalidades mediante APIs REST y bases de datos como PostgreSQL."
        },
        {
            keywords: [
                "crud", "crear", "editar", "eliminar", "actualizar",
                "validaciones", "validacion", "formularios", "roles",
                "permisos", "autenticacion", "autenticación", "login"
            ],
            response:
                "Jonh ha trabajado con operaciones CRUD, validaciones, formularios, control de roles, módulos administrativos y lógica de negocio en una plataforma web real con backoffice."
        },
        {
            keywords: [
                "postman", "endpoints", "endpoint", "pruebas",
                "test", "testing", "api rest", "apis rest"
            ],
            response:
                "Jonh ha usado Postman para probar endpoints y validar el funcionamiento de APIs REST durante el desarrollo de funcionalidades backend."
        },
        {
            keywords: [
                "git", "github", "gitlab", "versiones", "control de versiones",
                "repositorio", "repositorios", "codigo", "código"
            ],
            response:
                'Jonh trabaja con Git, GitHub y GitLab. Puedes revisar su GitHub aquí: <a href="' +
                data.links.github +
                '" target="_blank" rel="noopener noreferrer">ver GitHub</a>. El código de su proyecto profesional no es público por confidencialidad empresarial.'
        },
        {
            keywords: [
                "proyecto", "proyectos", "portfolio", "portafolio",
                "trabajos", "demos", "demo", "repositorio", "repositorios"
            ],
            response:
                "En el portfolio de Jonh destacan varios proyectos: una plataforma web profesional con backoffice administrativo, AutoMocion Manager, Google Translate Clone y Pong Galáctico. El proyecto más relevante es la plataforma web con backoffice, porque demuestra frontend, backend, APIs REST, CRUDs, roles, validaciones y base de datos."
        },
        {
            keywords: [
                "backoffice", "kaprichos", "profesional", "proyecto profesional",
                "empresa real", "web publica", "web pública", "panel administrativo",
                "administrativo", "confidencial", "codigo no publico", "código no público"
            ],
            response: professionalProject
        },
        {
            keywords: [
                "automocion", "automoción", "coches", "concesionario",
                "vehiculos", "vehículos", "usuarios", "permisos"
            ],
            response:
                'AutoMocion Manager es un proyecto de gestión para concesionarios con usuarios, roles y operaciones CRUD. Está desarrollado con PHP, MySQL y CSS. Puedes ver el código en GitHub: <a href="https://github.com/AZJohns/GestionDeAutomoviles_y_Usuarios.git" target="_blank" rel="noopener noreferrer">ver repositorio</a>.'
        },
        {
            keywords: [
                "google translate", "traductor", "translate",
                "api traduccion", "api traducción"
            ],
            response:
                'Google Translate Clone es un proyecto frontend que recrea un traductor web con consumo de API, manipulación del DOM y diseño responsive usando HTML, CSS y JavaScript. Puedes ver la demo desde el portfolio.'
        },
        {
            keywords: [
                "pong", "juego", "galactico", "galáctico",
                "arcade", "javascript juego"
            ],
            response:
                "Pong Galáctico es un juego arcade desarrollado con JavaScript y CSS3. Trabaja lógica de movimiento, puntuación, colisiones básicas, eventos de teclado y feedback visual."
        },
        {
            keywords: [
                "cv", "curriculum", "currículo", "curriculo",
                "resume", "descargar cv", "ver cv", "pdf"
            ],
            response:
                'Puedes ver o descargar su CV desde el botón "CV" del portfolio o desde este enlace: <a href="' +
                data.links.cv +
                '" download>Descargar CV</a>.'
        },
        {
            keywords: [
                "contacto", "contactar", "email", "correo",
                "linkedin", "github", "mensaje", "hablar",
                "telefono", "teléfono"
            ],
            response:
                'Puedes contactar con Jonh por email en <a href="mailto:' +
                data.links.email +
                '">' +
                data.links.email +
                '</a> o por LinkedIn: <a href="' +
                data.links.linkedin +
                '" target="_blank" rel="noopener noreferrer">ver LinkedIn</a>. También puedes revisar su GitHub: <a href="' +
                data.links.github +
                '" target="_blank" rel="noopener noreferrer">ver GitHub</a>.'
        },
        {
            keywords: [
                "formacion", "formación", "estudios", "titulacion",
                "titulación", "educacion", "educación", "daw",
                "grado superior", "medac", "davante", "master", "máster",
                "ciberseguridad"
            ],
            response:
                "Jonh está formado como Técnico Superior en Desarrollo de Aplicaciones Web y también cuenta con formación en ciberseguridad. Su perfil se centra en desarrollo web frontend, backend, bases de datos, APIs REST y buenas prácticas de seguridad aplicadas al desarrollo."
        },
        {
            keywords: [
                "ciberseguridad", "seguridad", "seguridad web",
                "buenas practicas", "buenas prácticas", "vulnerabilidades"
            ],
            response:
                "Jonh tiene interés y formación en ciberseguridad, especialmente aplicada al desarrollo web y buenas prácticas. Su perfil principal sigue siendo desarrollo web junior/full stack junior, no un perfil senior de ciberseguridad."
        },
        {
            keywords: [
                "disponible", "disponibilidad", "oportunidades",
                "busca trabajo", "buscando trabajo", "open to work",
                "contratar", "contratacion", "contratación",
                "junior", "frontend junior", "backend junior", "full stack junior"
            ],
            response:
                "Sí. Jonh está abierto a oportunidades como Desarrollador Web Junior, Frontend Junior, Backend Junior o Full Stack Junior, especialmente en posiciones relacionadas con React, Node.js, Express, SQL, APIs REST, CRUDs y backoffice administrativo."
        },
        {
            keywords: [
                "ubicacion", "ubicación", "donde vive", "madrid",
                "españa", "presencial", "remoto", "hibrido", "híbrido"
            ],
            response:
                "Jonh está ubicado en Madrid, España. Para condiciones concretas como presencial, remoto o híbrido, lo mejor es contactarlo directamente por LinkedIn o email."
        },
        {
            keywords: [
                "perfil", "quien", "quién", "sobre", "nombre",
                "llama", "resumen", "presentacion", "presentación"
            ],
            response:
                data.profile.name +
                " es " +
                data.profile.role +
                ", formado en Desarrollo de Aplicaciones Web y con experiencia práctica en proyectos full stack, backoffice administrativo, APIs REST, CRUDs, roles, validaciones y bases de datos relacionales."
        },
        {
            keywords: [
                "senior", "experto", "años de experiencia", "5 años",
                "muchos años", "arquitecto", "lider tecnico", "líder técnico"
            ],
            response:
                "Jonh tiene un perfil junior con experiencia práctica real en desarrollo web. No se presenta como senior ni como experto; su propuesta de valor está en su base full stack, prácticas profesionales, aprendizaje rápido y capacidad para trabajar con frontend, backend, APIs REST y bases de datos."
        },

    ];

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getAnswer(question) {
        const normalizedQuestion = normalizeText(question);

        if (!normalizedQuestion) {
            return "Escribe una pregunta sobre la experiencia, proyectos, tecnologías, CV o contacto de Jonh.";
        }

        let bestMatch = null;
        let bestScore = 0;

        answers.forEach((answer) => {
            const score = answer.keywords.reduce((total, keyword) => {
                const normalizedKeyword = normalizeText(keyword);
                return normalizedQuestion.includes(normalizedKeyword) ? total + 1 : total;
            }, 0);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = answer;
            }
        });

        return bestMatch ? bestMatch.response : fallbackMessage;
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (text) {
            element.textContent = text;
        }
        return element;
    }

    function addMessage(messages, content, type) {
        const message = createElement("div", "portfolio-assistant-message portfolio-assistant-message--" + type);

        if (type === "bot") {
            message.innerHTML = content;
        } else {
            message.textContent = content;
        }

        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function buildAssistant() {
        const widget = createElement("section", "portfolio-assistant");
        widget.setAttribute("aria-label", "Asistente del portfolio");

        const toggle = createElement("button", "portfolio-assistant-toggle");
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "portfolio-assistant-panel");
        toggle.innerHTML = '<i class="fa-solid fa-message" aria-hidden="true"></i><span>Pregúntame</span>';

        const panel = createElement("div", "portfolio-assistant-panel");
        panel.id = "portfolio-assistant-panel";
        panel.setAttribute("hidden", "");

        const header = createElement("div", "portfolio-assistant-header");
        const title = createElement("div", "portfolio-assistant-title", "Asistente del Portfolio");
        const closeButton = createElement("button", "portfolio-assistant-close");
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Cerrar asistente");
        closeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        header.append(title, closeButton);

        const messages = createElement("div", "portfolio-assistant-messages");
        messages.setAttribute("aria-live", "polite");

        const suggestions = createElement("div", "portfolio-assistant-suggestions");
        suggestedQuestions.forEach((question) => {
            const button = createElement("button", "portfolio-assistant-suggestion", question);
            button.type = "button";
            button.addEventListener("click", () => submitQuestion(question));
            suggestions.appendChild(button);
        });

        const form = createElement("form", "portfolio-assistant-form");
        const input = createElement("input", "portfolio-assistant-input");
        input.type = "text";
        input.placeholder = "Pregunta sobre Jonh...";
        input.setAttribute("aria-label", "Escribe tu pregunta");
        const submit = createElement("button", "portfolio-assistant-submit");
        submit.type = "submit";
        submit.setAttribute("aria-label", "Enviar pregunta");
        submit.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
        form.append(input, submit);

        function setPanelState(isOpen) {
            panel.toggleAttribute("hidden", !isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
            widget.classList.toggle("is-open", isOpen);

            if (isOpen) {
                input.focus();
            }
        }

        function submitQuestion(question) {
            const cleanQuestion = question.trim();
            if (!cleanQuestion) {
                return;
            }

            addMessage(messages, cleanQuestion, "user");
            addMessage(messages, getAnswer(cleanQuestion), "bot");
            input.value = "";
        }

        toggle.addEventListener("click", () => {
            setPanelState(panel.hasAttribute("hidden"));
        });

        closeButton.addEventListener("click", () => setPanelState(false));

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            submitQuestion(input.value);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !panel.hasAttribute("hidden")) {
                setPanelState(false);
            }
        });

        panel.append(header, messages, suggestions, form);
        widget.append(panel, toggle);
        document.body.appendChild(widget);

        addMessage(
            messages,
            "Hola, soy el asistente del portfolio de Jonh. Puedo responder preguntas sobre su experiencia, proyectos, tecnologías, CV y contacto.",
            "bot"
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildAssistant);
    } else {
        buildAssistant();
    }
})();
